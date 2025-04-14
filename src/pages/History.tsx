
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCredentials } from "@/contexts/CredentialsContext";
import { GoogleServiceFactory } from "@/services/serviceFactory";
import { formatDistanceToNow } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  Eye, 
  Copy, 
  Loader2, 
  ArrowUpDown,
  FileText,
  Search,
  RefreshCw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent,
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";

interface ContentItem {
  title: string;
  body: string;
  imageUrl?: string;
  tags?: string[];
  date?: string;
  status?: string;
}

const History = () => {
  const { credentials } = useCredentials();
  const { toast } = useToast();
  
  const [posts, setPosts] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState<ContentItem[]>([]);
  const [sortField, setSortField] = useState<"date" | "title">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedPost, setSelectedPost] = useState<ContentItem | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Fetch posts on component mount and when credentials change
  useEffect(() => {
    if (credentials.googleApiKey && credentials.googleSheetId) {
      fetchPosts();
    }
  }, [credentials.googleApiKey, credentials.googleSheetId]);
  
  // Apply filtering and sorting when posts, search query, or status filter changes
  useEffect(() => {
    let filtered = [...posts];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(query) || 
        post.body.toLowerCase().includes(query) ||
        post.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(post => post.status === statusFilter);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortField === "date") {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      } else {
        const titleA = a.title.toLowerCase();
        const titleB = b.title.toLowerCase();
        return sortDirection === "asc" 
          ? titleA.localeCompare(titleB)
          : titleB.localeCompare(titleA);
      }
    });
    
    setFilteredPosts(filtered);
  }, [posts, searchQuery, sortField, sortDirection, statusFilter]);
  
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const googleFactory = new GoogleServiceFactory(
        credentials.googleApiKey,
        credentials.googleSheetId
      );
      
      const sheetsService = googleFactory.getGoogleSheetsService();
      const fetchedPosts = await sheetsService.getAllPosts();
      
      setPosts(fetchedPosts);
      toast({
        title: "Content history loaded",
        description: `Successfully loaded ${fetchedPosts.length} items from Google Sheets.`,
      });
    } catch (error) {
      console.error("Error fetching posts from Google Sheets:", error);
      toast({
        title: "Failed to load content history",
        description: error instanceof Error ? error.message : "Check your Google Sheets API settings.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const toggleSort = (field: "date" | "title") => {
    if (sortField === field) {
      // Toggle direction if already sorting by this field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set field and default to descending
      setSortField(field);
      setSortDirection("desc");
    }
  };
  
  const viewPost = (post: ContentItem) => {
    setSelectedPost(post);
    setViewDialogOpen(true);
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Content has been copied to your clipboard.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold">Content History</h1>
        
        <Button onClick={fetchPosts} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </>
          )}
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {!credentials.googleApiKey || !credentials.googleSheetId ? (
        <Card>
          <CardHeader>
            <CardTitle>Setup Required</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              To view your content history, you need to configure Google Sheets integration in Settings.
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/settings'}
            >
              Go to Settings
            </Button>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card>
          <CardContent className="pt-6 flex justify-center items-center py-12">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Loading your content history...</p>
            </div>
          </CardContent>
        </Card>
      ) : filteredPosts.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Content Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {searchQuery || statusFilter !== "all" 
                ? "No content matches your search filters." 
                : "You haven't created any content yet. Go to the Editor to create your first piece of content."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%] cursor-pointer" onClick={() => toggleSort("title")}>
                  <div className="flex items-center">
                    Title
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="cursor-pointer" onClick={() => toggleSort("date")}>
                  <div className="flex items-center">
                    Created
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.map((post, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate max-w-[250px]">{post.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                      {post.tags && post.tags.length > 0 ? (
                        post.tags.slice(0, 2).map((tag, tagIndex) => (
                          <Badge 
                            key={tagIndex} 
                            variant="outline"
                            className="truncate max-w-[70px]"
                          >
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-xs">No tags</span>
                      )}
                      {post.tags && post.tags.length > 2 && (
                        <Badge variant="outline">+{post.tags.length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {post.date ? (
                      <span className="text-sm">
                        {formatDistanceToNow(new Date(post.date), { addSuffix: true })}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-xs">Unknown</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={post.status === "published" ? "default" : "secondary"}
                    >
                      {post.status || "draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline" 
                        size="icon"
                        onClick={() => viewPost(post)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => copyToClipboard(post.body)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPost?.title}</DialogTitle>
            <DialogDescription>
              {selectedPost?.date && (
                <span>Created {formatDistanceToNow(new Date(selectedPost.date), { addSuffix: true })}</span>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {selectedPost?.imageUrl && (
              <img 
                src={selectedPost.imageUrl} 
                alt={selectedPost.title}
                className="w-full rounded-md h-auto object-cover max-h-[300px]"
              />
            )}
            
            <div>
              <h3 className="text-sm font-medium mb-1">Tags:</h3>
              <div className="flex flex-wrap gap-2">
                {selectedPost?.tags && selectedPost.tags.length > 0 ? (
                  selectedPost.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">{tag}</Badge>
                  ))
                ) : (
                  <span className="text-muted-foreground">No tags</span>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-1">Content:</h3>
              <div 
                className="prose prose-invert max-w-none p-4 bg-muted/30 rounded-md"
                dangerouslySetInnerHTML={{ __html: selectedPost?.body?.replace(/\n/g, '<br>') || '' }}
              />
            </div>
            
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button 
                variant="outline"
                onClick={() => copyToClipboard(selectedPost?.body || '')}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Content
              </Button>
              <Button onClick={() => setViewDialogOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default History;
