
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Loader2, Save, ArrowLeft } from "lucide-react";

interface BloggerPost {
  id?: string;
  title: string;
  content: string;
  labels?: string[];
  url?: string;
  published?: string;
  updated?: string;
}

interface BloggerPostEditorProps {
  post: BloggerPost | null;
  onSave: (post: BloggerPost) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

const BloggerPostEditor: React.FC<BloggerPostEditorProps> = ({
  post,
  onSave,
  onCancel,
  isSubmitting
}) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [labelInput, setLabelInput] = useState("");
  const [labels, setLabels] = useState<string[]>([]);

  useEffect(() => {
    if (post) {
      setTitle(post.title || "");
      setContent(post.content || "");
      setLabels(post.labels || []);
    } else {
      // Reset form for new post
      setTitle("");
      setContent("");
      setLabels([]);
      setLabelInput("");
    }
  }, [post]);

  const handleAddLabel = () => {
    if (labelInput.trim() && !labels.includes(labelInput.trim())) {
      setLabels([...labels, labelInput.trim()]);
      setLabelInput("");
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setLabels(labels.filter(label => label !== labelToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }

    const postData: BloggerPost = {
      ...(post || {}),
      title: title.trim(),
      content: content.trim(),
      labels: labels.length > 0 ? labels : undefined,
    };

    onSave(postData);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && labelInput.trim()) {
      e.preventDefault();
      handleAddLabel();
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">
              {post ? "Edit Blog Post" : "Create New Blog Post"}
            </h2>
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Posts
            </Button>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter post title"
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter post content. HTML formatting is supported."
              rows={15}
              className="min-h-[300px] font-mono"
              disabled={isSubmitting}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="labels">Labels</Label>
            <div className="flex items-center gap-2">
              <Input
                id="labels"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                placeholder="Add label and press Enter"
                disabled={isSubmitting}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={handleAddLabel}
                disabled={!labelInput.trim() || isSubmitting}
              >
                Add
              </Button>
            </div>
            
            {labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {labels.map((label, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {label}
                    <button
                      type="button"
                      className="ml-2 text-muted-foreground hover:text-foreground"
                      onClick={() => handleRemoveLabel(label)}
                      disabled={isSubmitting}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting || !title.trim() || !content.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {post ? "Updating..." : "Publishing..."}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {post ? "Update Post" : "Publish Post"}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default BloggerPostEditor;
