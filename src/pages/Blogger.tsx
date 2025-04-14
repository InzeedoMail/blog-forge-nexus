
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCredentials } from "@/contexts/CredentialsContext";
import { GoogleServiceFactory } from "@/services/serviceFactory";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

import BloggerPostEditor from "@/components/blogger/BloggerPostEditor";
import BloggerPostList from "@/components/blogger/BloggerPostList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus } from "lucide-react";

interface BloggerPost {
  id?: string;
  title: string;
  content: string;
  labels?: string[];
  url?: string;
  published?: string;
  updated?: string;
}

const Blogger = () => {
  const { credentials } = useCredentials();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("posts");
  const [currentPost, setCurrentPost] = useState<BloggerPost | null>(null);

  const hasBloggerCredentials = !!(
    credentials.googleApiKey && credentials.bloggerBlogId
  );

  const {
    data: posts,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["blogger-posts"],
    queryFn: async () => {
      if (!hasBloggerCredentials) {
        return [];
      }

      try {
        const serviceFactory = new GoogleServiceFactory(
          credentials.googleApiKey,
          credentials.googleSheetId,
          credentials.bloggerBlogId
        );
        const bloggerService = serviceFactory.getBloggerService();
        const fetchedPosts = await bloggerService.getPosts();
        
        return fetchedPosts.map((post: any) => ({
          id: post.id,
          title: post.title || '',
          content: post.content || '',
          labels: post.labels || [],
          url: post.url,
          published: post.published,
          updated: post.updated,
        }));
      } catch (error) {
        console.error("Error fetching Blogger posts:", error);
        throw new Error("Failed to fetch posts from Blogger");
      }
    },
    enabled: hasBloggerCredentials,
  });

  const createPostMutation = useMutation({
    mutationFn: async (post: BloggerPost) => {
      if (!hasBloggerCredentials) {
        throw new Error("Blogger credentials are missing");
      }

      const serviceFactory = new GoogleServiceFactory(
        credentials.googleApiKey,
        credentials.googleSheetId,
        credentials.bloggerBlogId
      );
      const bloggerService = serviceFactory.getBloggerService();
      return await bloggerService.createPost(post);
    },
    onSuccess: () => {
      toast({
        title: "Post created",
        description: "Your blog post has been published successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["blogger-posts"] });
      setActiveTab("posts");
      setCurrentPost(null);
    },
    onError: (error: any) => {
      // Handle our special OAUTH_REQUIRED error
      if (error.type === "OAUTH_REQUIRED" && error.bloggerEditorUrl) {
        // Save to history first if Google Sheets is configured
        if (credentials.googleApiKey && credentials.googleSheetId && error.post) {
          const serviceFactory = new GoogleServiceFactory(
            credentials.googleApiKey,
            credentials.googleSheetId,
            credentials.bloggerBlogId
          );
          const sheetsService = serviceFactory.getGoogleSheetsService();
          
          // Save the post to sheets
          sheetsService.savePost({
            title: error.post.title,
            body: error.post.content,
            tags: error.post.labels || [],
            date: new Date().toISOString(),
            status: "draft",
          }).then(() => {
            toast({
              title: "Saved to content history",
              description: "Your content has been saved to Google Sheets.",
            });
          });
        }

        // Open Blogger in new tab
        window.open(error.bloggerEditorUrl, "_blank");

        toast({
          title: "Opening Blogger Editor",
          description: "We've opened the Blogger editor in a new tab. Please copy and paste your content there.",
        });
        
        // Reset UI state
        setActiveTab("posts");
        setCurrentPost(null);
      } else {
        toast({
          title: "Failed to create post",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        });
      }
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async (post: BloggerPost) => {
      if (!hasBloggerCredentials) {
        throw new Error("Blogger credentials are missing");
      }

      const serviceFactory = new GoogleServiceFactory(
        credentials.googleApiKey,
        credentials.googleSheetId,
        credentials.bloggerBlogId
      );
      const bloggerService = serviceFactory.getBloggerService();
      return await bloggerService.updatePost(post);
    },
    onSuccess: () => {
      toast({
        title: "Post updated",
        description: "Your blog post has been updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["blogger-posts"] });
      setActiveTab("posts");
      setCurrentPost(null);
    },
    onError: (error: any) => {
      // Handle our special OAUTH_REQUIRED error
      if (error.type === "OAUTH_REQUIRED" && error.bloggerEditorUrl) {
        // Open Blogger in new tab
        window.open(error.bloggerEditorUrl, "_blank");

        toast({
          title: "Opening Blogger Editor",
          description: "We've opened the Blogger editor in a new tab. Please copy and paste your content there.",
        });
        
        // Reset UI state
        setActiveTab("posts");
        setCurrentPost(null);
      } else {
        toast({
          title: "Failed to update post",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        });
      }
    },
  });

  const handleCreatePost = (post: BloggerPost) => {
    createPostMutation.mutate(post);
  };

  const handleUpdatePost = (post: BloggerPost) => {
    updatePostMutation.mutate(post);
  };

  const handleEditPost = (post: BloggerPost) => {
    setCurrentPost(post);
    setActiveTab("editor");
  };

  const handleNewPost = () => {
    setCurrentPost(null);
    setActiveTab("editor");
  };

  useEffect(() => {
    if (!hasBloggerCredentials) {
      toast({
        title: "Blogger credentials missing",
        description: "Please add your Google API key and Blogger Blog ID in Settings.",
        variant: "destructive",
      });
    }
  }, [hasBloggerCredentials, toast]);

  if (!hasBloggerCredentials) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <h1 className="text-3xl font-bold mb-6">Blogger</h1>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-yellow-200">
          <h3 className="font-medium mb-2">Credentials Missing</h3>
          <p>
            Please add your Google API key and Blogger Blog ID in the Settings
            page to use the Blogger integration.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Blogger</h1>
        <Button onClick={handleNewPost} disabled={createPostMutation.isPending}>
          <Plus className="mr-2 h-4 w-4" /> New Post
        </Button>
      </div>

      <Alert variant="warning" className="bg-amber-500/10 border-amber-500/30 text-amber-200">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>About OAuth Authentication</AlertTitle>
        <AlertDescription>
          Creating and updating posts requires OAuth authentication. When you click "Publish" or "Update", 
          we'll attempt to use your Google login token. If that fails, we'll open the Blogger editor in a new tab 
          for you to paste your content.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="posts">All Posts</TabsTrigger>
          <TabsTrigger value="editor">Post Editor</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading posts...</span>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-200">
              <h3 className="font-medium mb-2">Error</h3>
              <p>
                {error instanceof Error
                  ? error.message
                  : "Failed to fetch posts from Blogger"}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </div>
          ) : (
            <BloggerPostList
              posts={posts || []}
              onEditPost={handleEditPost}
              isLoading={isLoading}
            />
          )}
        </TabsContent>

        <TabsContent value="editor">
          <BloggerPostEditor
            post={currentPost}
            onSave={currentPost ? handleUpdatePost : handleCreatePost}
            onCancel={() => {
              setActiveTab("posts");
              setCurrentPost(null);
            }}
            isSubmitting={
              createPostMutation.isPending || updatePostMutation.isPending
            }
          />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Blogger;
