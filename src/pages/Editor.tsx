
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useCredentials } from "@/contexts/CredentialsContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AIServiceFactory } from "@/services/serviceFactory";
import { Loader2, FileText, ImageIcon, Upload, Send } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Editor = () => {
  const { credentials } = useCredentials();
  const { toast } = useToast();
  
  const [topic, setTopic] = useState("");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [model, setModel] = useState("openai");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState({
    title: "",
    body: "",
    imageUrl: "",
  });
  
  const generateContent = async () => {
    if (!topic) {
      toast({
        title: "Topic required",
        description: "Please enter a topic for your blog post.",
        variant: "destructive",
      });
      return;
    }
    
    if (!credentials.openaiApiKey) {
      toast({
        title: "API key missing",
        description: "Please add your OpenAI API key in Settings.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const aiFactory = new AIServiceFactory(
        credentials.openaiApiKey,
        credentials.geminiApiKey
      );
      
      const contentService = aiFactory.getContentGenerationService();
      const result = await contentService.generateBlogPost(topic, length);
      
      setGeneratedContent({
        ...generatedContent,
        title: result.title,
        body: result.body,
      });
      
      toast({
        title: "Content generated",
        description: "Blog post content has been generated successfully!",
      });
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const generateImage = async () => {
    if (!generatedContent.title) {
      toast({
        title: "Title required",
        description: "Please generate content first or enter a title.",
        variant: "destructive",
      });
      return;
    }
    
    if (!credentials.openaiApiKey) {
      toast({
        title: "API key missing",
        description: "Please add your OpenAI API key in Settings.",
        variant: "destructive",
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const aiFactory = new AIServiceFactory(credentials.openaiApiKey);
      const imageService = aiFactory.getImageGenerationService();
      
      const prompt = `Create a professional, high-quality blog image for an article titled "${generatedContent.title}". The image should be clear, engaging, and suitable for a professional blog.`;
      
      const imageUrl = await imageService.generateImage(prompt);
      
      setGeneratedContent({
        ...generatedContent,
        imageUrl,
      });
      
      toast({
        title: "Image generated",
        description: "Blog post image has been generated successfully!",
      });
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Image generation failed",
        description: error instanceof Error ? error.message : "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const saveToSheets = async () => {
    // This will be implemented when we build the full Google Sheets integration
    toast({
      title: "Save to Sheets",
      description: "This feature will be implemented in the next version.",
    });
  };
  
  const publishToBlogger = async () => {
    // This will be implemented when we build the full Blogger integration
    toast({
      title: "Publish to Blogger",
      description: "This feature will be implemented in the next version.",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-6">Content Editor</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">Blog Post Topic</Label>
                <Input
                  id="topic"
                  placeholder="Enter a topic for your blog post"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="model">AI Model</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="gemini" disabled={!credentials.geminiApiKey}>
                      Google Gemini {!credentials.geminiApiKey && "(API key missing)"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="length">Content Length</Label>
                <Select 
                  value={length} 
                  onValueChange={(value) => setLength(value as "short" | "medium" | "long")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select content length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (500-800 words)</SelectItem>
                    <SelectItem value="medium">Medium (800-1200 words)</SelectItem>
                    <SelectItem value="long">Long (1500-2000 words)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                className="w-full" 
                onClick={generateContent} 
                disabled={isGenerating || !topic}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Content
                  </>
                )}
              </Button>
              
              <Button
                className="w-full"
                variant="secondary"
                onClick={generateImage}
                disabled={isGenerating || !generatedContent.title}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating Image...
                  </>
                ) : (
                  <>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Generate Image
                  </>
                )}
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={saveToSheets}
                  disabled={!generatedContent.title || !generatedContent.body}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Save to Sheets
                </Button>
                
                <Button
                  variant="outline"
                  onClick={publishToBlogger}
                  disabled={!generatedContent.title || !generatedContent.body}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Publish
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <Tabs defaultValue="preview">
              <TabsList className="mb-4">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="edit">Edit</TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview" className="space-y-4">
                {generatedContent.imageUrl && (
                  <div className="mb-4">
                    <img
                      src={generatedContent.imageUrl}
                      alt={generatedContent.title}
                      className="w-full h-auto rounded-lg shadow-md object-cover"
                    />
                  </div>
                )}
                
                {generatedContent.title ? (
                  <h2 className="text-2xl font-bold">{generatedContent.title}</h2>
                ) : (
                  <div className="h-8 mb-4 w-3/4 bg-muted/40 rounded animate-pulse"></div>
                )}
                
                {generatedContent.body ? (
                  <div 
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: generatedContent.body.replace(/\n/g, '<br>') }}
                  ></div>
                ) : (
                  <div className="space-y-2">
                    <div className="h-4 bg-muted/40 rounded w-full animate-pulse"></div>
                    <div className="h-4 bg-muted/40 rounded w-5/6 animate-pulse"></div>
                    <div className="h-4 bg-muted/40 rounded w-4/6 animate-pulse"></div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="edit" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={generatedContent.title}
                    onChange={(e) => setGeneratedContent({ ...generatedContent, title: e.target.value })}
                    placeholder="Enter post title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="body">Content</Label>
                  <Textarea
                    id="body"
                    value={generatedContent.body}
                    onChange={(e) => setGeneratedContent({ ...generatedContent, body: e.target.value })}
                    placeholder="Enter post content"
                    rows={15}
                    className="min-h-[300px]"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default Editor;
