import React, { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { FileInput } from "@/components/ui/file-input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Credentials } from '@/types/credentials';
import { useCredentials } from '@/contexts/CredentialsContext';
import { AIServiceFactory } from '@/services/serviceFactory';

const FileAnalyzer = () => {
  const [fileText, setFileText] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const { toast } = useToast();
  const { credentials } = useCredentials();

  const handleFileChange = useCallback(async (file: File) => {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      analyzeDocument(text);
    };
    reader.onerror = () => {
      toast({
        variant: "destructive",
        title: "File Reading Error",
        description: "Failed to read the file. Please try again.",
      });
    };
    reader.readAsText(file);
  }, [toast, analyzeDocument]);

  const analyzeDocument = async (text: string) => {
    try {
      setIsAnalyzing(true);
      
      // Create an AI service instance
      const aiService = new AIServiceFactory(credentials.openaiApiKey).getContentGenerationService();
      
      // Use a direct API call instead of accessing the private openai property
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${credentials.openaiApiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an AI assistant that analyzes documents and extracts key information. Provide a thorough analysis with a summary, key topics, sentiment, and any important details."
            },
            {
              role: "user",
              content: `Please analyze the following document and provide a detailed breakdown:\n\n${text.substring(0, 15000)}`
            }
          ],
          temperature: 0.3
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      const analysis = data.choices[0]?.message?.content || "Analysis could not be generated";
      
      setAnalysisResult(analysis);
      setFileText(text);
      
    } catch (error) {
      console.error("Error analyzing document:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="shadow-md">
        <CardHeader className="p-5">
          <CardTitle className="text-2xl">File Analyzer</CardTitle>
          <CardDescription>Upload a document to analyze its content.</CardDescription>
        </CardHeader>
        
        <CardContent className="p-5">
          <FileInput onChange={handleFileChange} />
          
          {fileText && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Document Preview</h3>
              <Textarea 
                value={fileText} 
                readOnly 
                className="bg-muted/50 h-48 resize-none" 
              />
            </div>
          )}
          
          {analysisResult && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Analysis Result</h3>
              {isAnalyzing ? (
                <Skeleton className="h-[200px] w-full" />
              ) : (
                <Textarea 
                  value={analysisResult} 
                  readOnly 
                  className="bg-muted/50 h-48 resize-none" 
                />
              )}
            </div>
          )}
          
          {!credentials.openaiApiKey && (
            <Alert variant="warning" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>API Key Required</AlertTitle>
              <AlertDescription>
                Please set your OpenAI API key in the settings to enable document analysis.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FileAnalyzer;
