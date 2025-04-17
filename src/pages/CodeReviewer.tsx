import React, { useState } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { Credentials } from '@/types/credentials';
import { useCredentials } from '@/contexts/CredentialsContext';
import { AIServiceFactory } from '@/services/serviceFactory';

const CodeReviewer = () => {
  const [inputCode, setInputCode] = useState("");
  const [outputCode, setOutputCode] = useState("");
  const [feedback, setFeedback] = useState("");
  const [language, setLanguage] = useState("JavaScript");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { credentials } = useCredentials();
  
  const languages = ["JavaScript", "Python", "Java", "C++", "C#", "Ruby", "Go", "TypeScript"];

  const handleReviewCode = async () => {
    try {
      setIsLoading(true);
      setOutputCode("");
      setFeedback("");
      
      // Create an AI service instance
      const aiService = new AIServiceFactory(credentials.openaiApiKey).getContentGenerationService();
      
      // Use the service's methods without accessing private properties
      // Instead of using aiService.openai directly, use the public methods
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
              content: "You are a helpful code reviewer. Analyze the provided code and suggest improvements."
            },
            {
              role: "user",
              content: `Review the following ${language.toLowerCase()} code and provide feedback for improvements:\n\n${inputCode}`
            }
          ],
          temperature: 0.7
        })
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      const data = await response.json();
      const codeReview = data.choices[0]?.message?.content;
      
      setFeedback(codeReview || "No feedback generated. Please try again.");
      setOutputCode(inputCode); // Set output code to the original for comparison
      
    } catch (error) {
      console.error("Error reviewing code:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: `Failed to review code: ${error instanceof Error ? error.message : "Unknown error"}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Code Reviewer</CardTitle>
          <CardDescription>
            Get feedback and suggestions for improving your code.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="input">Code to Review</Label>
            <Textarea
              id="input"
              placeholder="Enter your code here..."
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              className="resize-none"
            />
          </div>
          <Button onClick={handleReviewCode} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Review Code
          </Button>
          {feedback && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Code Review Feedback</AlertTitle>
                <AlertDescription className="whitespace-pre-line">
                  {feedback}
                </AlertDescription>
              </Alert>
              <div>
                <Label htmlFor="output">Original Code</Label>
                <Textarea
                  id="output"
                  value={outputCode}
                  readOnly
                  className="resize-none"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CodeReviewer;
