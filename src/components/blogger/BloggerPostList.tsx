
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BloggerPost {
  id?: string;
  title: string;
  content: string;
  labels?: string[];
  url?: string;
  published?: string;
  updated?: string;
}

interface BloggerPostListProps {
  posts: BloggerPost[];
  onEditPost: (post: BloggerPost) => void;
  isLoading: boolean;
}

const BloggerPostList: React.FC<BloggerPostListProps> = ({ 
  posts, 
  onEditPost,
  isLoading
}) => {
  if (posts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No Posts Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {isLoading 
              ? "Loading posts..." 
              : "You haven't created any blog posts yet. Click the 'New Post' button to get started."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[400px]">Title</TableHead>
            <TableHead>Labels</TableHead>
            <TableHead>Published</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {posts.map((post) => (
            <TableRow key={post.id}>
              <TableCell className="font-medium">{post.title}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {post.labels && post.labels.length > 0 ? (
                    post.labels.map((label, index) => (
                      <Badge key={index} variant="outline">
                        {label}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">No labels</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {post.published ? (
                  <span className="text-sm">
                    {formatDistanceToNow(new Date(post.published), { addSuffix: true })}
                  </span>
                ) : (
                  <Badge variant="outline">Draft</Badge>
                )}
              </TableCell>
              <TableCell>
                {post.updated && (
                  <span className="text-sm">
                    {formatDistanceToNow(new Date(post.updated), { addSuffix: true })}
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onEditPost(post)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {post.url && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(post.url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default BloggerPostList;
