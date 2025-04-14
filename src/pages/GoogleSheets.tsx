
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCredentials } from "@/contexts/CredentialsContext";
import { GoogleServiceFactory } from "@/services/serviceFactory";
import { useToast } from "@/components/ui/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, FileSpreadsheet, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { format } from "date-fns";

// Define the shape of our content post
interface ContentPost {
  id?: string;
  title: string;
  content?: string;
  date: string;
  tags?: string[];
  status?: string;
}

const GoogleSheets = () => {
  const { credentials } = useCredentials();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const hasSheetsCredentials = !!(
    credentials.googleApiKey && credentials.googleSheetId
  );

  // Query to fetch sheets data
  const {
    data: posts,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["sheets-posts"],
    queryFn: async () => {
      if (!hasSheetsCredentials) {
        return [];
      }

      try {
        const serviceFactory = new GoogleServiceFactory(
          credentials.googleApiKey,
          credentials.googleSheetId,
          credentials.bloggerBlogId
        );
        const sheetsService = serviceFactory.getGoogleSheetsService();
        return await sheetsService.getPosts();
      } catch (error) {
        console.error("Error fetching Google Sheets posts:", error);
        throw new Error("Failed to fetch posts from Google Sheets");
      }
    },
    enabled: hasSheetsCredentials,
  });

  // Function to format date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return dateString;
    }
  };

  // Function to truncate long text
  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return "";
    return text.length > maxLength
      ? text.substring(0, maxLength) + "..."
      : text;
  };

  if (!hasSheetsCredentials) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        <h1 className="text-3xl font-bold mb-6">Google Sheets Integration</h1>
        <Alert variant="warning" className="bg-yellow-500/10 border-yellow-500/30 text-yellow-200">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Credentials Missing</AlertTitle>
          <AlertDescription>
            Please add your Google API key and Google Sheet ID in the Settings
            page to use the Google Sheets integration.
          </AlertDescription>
        </Alert>
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
        <h1 className="text-3xl font-bold">Content History</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2">Refresh</span>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileSpreadsheet className="mr-2 h-5 w-5" />
            Content History
          </CardTitle>
          <CardDescription>
            View all your content history stored in Google Sheets
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading content history...</span>
            </div>
          ) : error ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error instanceof Error
                  ? error.message
                  : "Failed to fetch content history from Google Sheets"}
              </AlertDescription>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => refetch()}
              >
                Retry
              </Button>
            </Alert>
          ) : posts?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No content history found. Create new content in the Editor page to save your history.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>List of your saved content</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts?.map((post, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {post.title}
                      </TableCell>
                      <TableCell className="max-w-[300px]">
                        {truncateText(post.content || "", 100)}
                      </TableCell>
                      <TableCell>
                        {post.tags && post.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {post.tags.slice(0, 3).map((tag, i) => (
                              <span
                                key={i}
                                className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs"
                              >
                                {tag}
                              </span>
                            ))}
                            {post.tags.length > 3 && (
                              <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs">
                                +{post.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>{formatDate(post.date)}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            post.status === "published"
                              ? "bg-green-500/20 text-green-500"
                              : "bg-yellow-500/20 text-yellow-500"
                          }`}
                        >
                          {post.status || "draft"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Total entries: {posts?.length || 0}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default GoogleSheets;
