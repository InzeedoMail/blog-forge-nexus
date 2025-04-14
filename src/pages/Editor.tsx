
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useCredentials } from "@/contexts/CredentialsContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AIServiceFactory,
  GoogleServiceFactory,
} from "@/services/serviceFactory";
import {
  Loader2,
  FileText,
  ImageIcon,
  Upload,
  Send,
  Tags,
  Globe2,
  Users,
  MessageSquareQuote,
  Code,
  FileSpreadsheet,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X } from "lucide-react";

const Editor = () => {
  const { credentials } = useCredentials();
  const { toast } = useToast();

  // Basic content options
  const [topic, setTopic] = useState("");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [model, setModel] = useState("openai");

  // Advanced customization options
  const [audience, setAudience] = useState("general");
  const [tone, setTone] = useState("professional");
  const [contentType, setContentType] = useState("blog");
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [seoKeywordInput, setSeoKeywordInput] = useState("");
  const [seoCountry, setSeoCountry] = useState("global");
  const [includeHtml, setIncludeHtml] = useState(false);

  // UI states
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");

  // Generated content
  const [generatedContent, setGeneratedContent] = useState({
    title: "",
    body: "",
    imageUrl: "",
    seoDescription: "",
    seoKeywords: [] as string[],
    targetAudience: "",
    contentType: "",
  });

  const handleAddKeyword = () => {
    if (seoKeywordInput && !seoKeywords.includes(seoKeywordInput)) {
      setSeoKeywords([...seoKeywords, seoKeywordInput]);
      setSeoKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setSeoKeywords(seoKeywords.filter((k) => k !== keyword));
  };

  const handleKeywordKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && seoKeywordInput) {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  const generateContent = async () => {
    if (!topic) {
      toast({
        title: "Topic required",
        description: "Please enter a topic for your content.",
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

      const result = await contentService.generateBlogPost({
        topic,
        length,
        audience,
        tone,
        contentType,
        seoKeywords,
        seoCountry,
        includeHtml,
      });

      setGeneratedContent({
        ...generatedContent,
        // Content is now directly available in result.content
        title: result.content.split("\n")[0].replace(/^#\s*/, ""), // Extract title from first line
        body: result.content, // The entire formatted content
        // SEO metadata is now in result.seoMetadata
        seoDescription: result.seoMetadata.description || "",
        seoKeywords: result.seoMetadata.keywords || [],
        targetAudience: result.seoMetadata.targetAudience || audience,
        contentType: result.seoMetadata.contentType || contentType,
      });

      toast({
        title: "Content generated",
        description: "Content has been generated successfully!",
      });
    } catch (error) {
      console.error("Error generating content:", error);
      toast({
        title: "Generation failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate content. Please try again.",
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

      const prompt = `Create a professional, high-quality ${contentType} image for an article titled "${generatedContent.title}" targeting ${audience} audience. The image should be clear, engaging, and suitable for professional use.`;

      const imageUrl = await imageService.generateImage(prompt);

      setGeneratedContent({
        ...generatedContent,
        imageUrl,
      });

      toast({
        title: "Image generated",
        description: "Content image has been generated successfully!",
      });
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Image generation failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const publishToBlogger = async () => {
    if (!generatedContent.title || !generatedContent.body) {
      toast({
        title: "Content required",
        description: "Please generate or enter content before publishing.",
        variant: "destructive",
      });
      return;
    }

    if (!credentials.googleApiKey || !credentials.bloggerBlogId) {
      toast({
        title: "API credentials missing",
        description:
          "Please add your Google API key and Blogger Blog ID in Settings.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const googleFactory = new GoogleServiceFactory(
        credentials.googleApiKey,
        credentials.googleSheetId,
        credentials.bloggerBlogId
      );

      const bloggerService = googleFactory.getBloggerService();

      try {
        // Check if there's an access token in localStorage
        const accessToken = localStorage.getItem("accessToken");
        if (!accessToken) {
          toast({
            title: "Authentication required",
            description: "Please log in with your Google account first.",
            variant: "destructive",
          });
          throw new Error("Authentication required");
        }

        // Prepare the content with image if available
        const fullContent = generatedContent.imageUrl
          ? `${generatedContent.body}<p><img src="${generatedContent.imageUrl}" alt="${generatedContent.title}" /></p>`
          : generatedContent.body;
            
        // Try to create the post
        await bloggerService.createPost({
          title: generatedContent.title,
          content: fullContent,
          labels: [contentType, ...seoKeywords],
        });

        toast({
          title: "Published to Blogger",
          description:
            "Your post has been published to your Blogger blog successfully!",
        });

        // Save to history in Google Sheets if configured
        if (credentials.googleApiKey && credentials.googleSheetId) {
          saveToSheets();
        }
      } catch (error: any) {
        // Handle our special OAUTH_REQUIRED error
        if (error.type === "OAUTH_REQUIRED" && error.bloggerEditorUrl) {
          // Save to history first
          if (credentials.googleApiKey && credentials.googleSheetId) {
            await saveToSheets();
          }

          // Open Blogger in new tab
          window.open(error.bloggerEditorUrl, "_blank");

          toast({
            title: "Opening Blogger Editor",
            description:
              "We've opened the Blogger editor in a new tab. Please copy and paste your content there.",
          });
        } else {
          throw error; // Re-throw if it's not our special error
        }
      }
    } catch (error) {
      console.error("Error publishing to Blogger:", error);
      toast({
        title: "Publishing failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to publish to Blogger. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const saveToSheets = async () => {
    if (!generatedContent.title || !generatedContent.body) {
      toast({
        title: "Content required",
        description: "Please generate or enter content before saving.",
        variant: "destructive",
      });
      return;
    }

    if (!credentials.googleApiKey || !credentials.googleSheetId) {
      toast({
        title: "API credentials missing",
        description:
          "Please add your Google API key and Google Sheet ID in Settings.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const googleFactory = new GoogleServiceFactory(
        credentials.googleApiKey,
        credentials.googleSheetId,
        credentials.bloggerBlogId
      );

      const sheetsService = googleFactory.getGoogleSheetsService();

      await sheetsService.savePost({
        title: generatedContent.title,
        body: generatedContent.body,
        imageUrl: generatedContent.imageUrl,
        tags: [contentType, ...seoKeywords],
        date: new Date().toISOString(),
        status: "published",
      });

      toast({
        title: "Saved to Google Sheets",
        description:
          "Your content has been saved to Google Sheets successfully!",
      });
    } catch (error) {
      console.error("Error saving to Google Sheets:", error);
      toast({
        title: "Save failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to save to Google Sheets. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Content Creator</h1>
      </div>

      <Alert variant="warning" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>About Blogger Integration</AlertTitle>
        <AlertDescription>
          Creating posts on Blogger requires OAuth authentication. When you click "Publish to Blogger,"
          we'll try to use your login token. If needed, we'll open the Blogger editor in a new tab 
          with your content ready to paste. Your content will also be saved to your content history.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <Tabs defaultValue="basic" onValueChange={setActiveTab}>
              <TabsList className="mb-4 w-full">
                <TabsTrigger value="basic" className="flex-1">
                  Basic
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex-1">
                  Advanced
                </TabsTrigger>
                <TabsTrigger value="seo" className="flex-1">
                  SEO
                </TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="topic">Topic or Title</Label>
                  <Input
                    id="topic"
                    placeholder="Enter your content topic or title"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contentType">Content Type</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blog">Blog Post</SelectItem>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="product">
                        Product Description
                      </SelectItem>
                      <SelectItem value="social">Social Media Post</SelectItem>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                      <SelectItem value="press">Press Release</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="length">Content Length</Label>
                  <Select
                    value={length}
                    onValueChange={(value) =>
                      setLength(value as "short" | "medium" | "long")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select content length" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">
                        Short (500-800 words)
                      </SelectItem>
                      <SelectItem value="medium">
                        Medium (800-1200 words)
                      </SelectItem>
                      <SelectItem value="long">
                        Long (1500-2000 words)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">AI Model</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an AI model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem
                        value="gemini"
                        disabled={!credentials.geminiApiKey}
                      >
                        Google Gemini{" "}
                        {!credentials.geminiApiKey && "(API key missing)"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2" htmlFor="audience">
                    <Users className="h-4 w-4" /> Target Audience
                  </Label>
                  <Select value={audience} onValueChange={setAudience}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="professional">
                        Professionals
                      </SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="beginners">Beginners</SelectItem>
                      <SelectItem value="students">Students</SelectItem>
                      <SelectItem value="seniors">Seniors</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2" htmlFor="tone">
                    <MessageSquareQuote className="h-4 w-4" /> Content Tone
                  </Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select content tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="humorous">Humorous</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="authoritative">
                        Authoritative
                      </SelectItem>
                      <SelectItem value="educational">Educational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    <Label htmlFor="format">Include HTML Formatting</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="includeHtml"
                      checked={includeHtml}
                      onChange={(e) => setIncludeHtml(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="includeHtml">
                      Output with HTML tags (headings, paragraphs, etc.)
                    </Label>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-4">
                <div className="space-y-2">
                  <Label
                    className="flex items-center gap-2"
                    htmlFor="seoKeywords"
                  >
                    <Tags className="h-4 w-4" /> SEO Keywords
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="seoKeywords"
                      placeholder="Add SEO keywords"
                      value={seoKeywordInput}
                      onChange={(e) => setSeoKeywordInput(e.target.value)}
                      onKeyDown={handleKeywordKeyDown}
                    />
                    <Button type="button" onClick={handleAddKeyword}>
                      Add
                    </Button>
                  </div>
                  {seoKeywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {seoKeywords.map((keyword, index) => (
                        <div
                          key={index}
                          className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm flex items-center gap-1"
                        >
                          {keyword}
                          <button
                            type="button"
                            onClick={() => handleRemoveKeyword(keyword)}
                            className="text-secondary-foreground/70 hover:text-secondary-foreground"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    className="flex items-center gap-2"
                    htmlFor="seoCountry"
                  >
                    <Globe2 className="h-4 w-4" /> SEO Country Optimization
                  </Label>
                  <Select value={seoCountry} onValueChange={setSeoCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country for SEO" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">
                        Global (No specific country)
                      </SelectItem>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="Canada">Canada</SelectItem>
                      <SelectItem value="Australia">Australia</SelectItem>
                      <SelectItem value="India">India</SelectItem>
                      <SelectItem value="Germany">Germany</SelectItem>
                      <SelectItem value="France">France</SelectItem>
                      <SelectItem value="Spain">Spain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>

            <div className="mt-6 space-y-4">
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
                  disabled={
                    isGenerating ||
                    !generatedContent.title ||
                    !generatedContent.body
                  }
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Save to Sheets
                </Button>

                <Button
                  variant="outline"
                  onClick={publishToBlogger}
                  disabled={
                    isGenerating ||
                    !generatedContent.title ||
                    !generatedContent.body
                  }
                >
                  <Send className="mr-2 h-4 w-4" />
                  Publish to Blogger
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
                <TabsTrigger value="seo">SEO Data</TabsTrigger>
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
                  <h2 className="text-2xl font-bold">
                    {generatedContent.title}
                  </h2>
                ) : (
                  <div className="h-8 mb-4 w-3/4 bg-muted/40 rounded animate-pulse"></div>
                )}

                {generatedContent.body ? (
                  <div
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: includeHtml
                        ? generatedContent.body
                        : generatedContent.body.replace(/\n/g, "<br>"),
                    }}
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
                    onChange={(e) =>
                      setGeneratedContent({
                        ...generatedContent,
                        title: e.target.value,
                      })
                    }
                    placeholder="Enter post title"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="body">Content</Label>
                  <Textarea
                    id="body"
                    value={generatedContent.body}
                    onChange={(e) =>
                      setGeneratedContent({
                        ...generatedContent,
                        body: e.target.value,
                      })
                    }
                    placeholder="Enter post content"
                    rows={15}
                    className="min-h-[300px] font-mono"
                  />
                </div>
              </TabsContent>

              <TabsContent value="seo" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="seoDescription">SEO Description</Label>
                  <Textarea
                    id="seoDescription"
                    value={generatedContent.seoDescription}
                    onChange={(e) =>
                      setGeneratedContent({
                        ...generatedContent,
                        seoDescription: e.target.value,
                      })
                    }
                    placeholder="Meta description for search engines (150-160 characters)"
                    rows={3}
                    maxLength={160}
                    className="font-mono"
                  />
                  <div className="text-xs text-right text-muted-foreground">
                    {generatedContent.seoDescription.length}/160 characters
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Suggested SEO Keywords</Label>
                  <div className="flex flex-wrap gap-2">
                    {generatedContent.seoKeywords.length > 0 ? (
                      generatedContent.seoKeywords.map((keyword, index) => (
                        <div
                          key={index}
                          className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                        >
                          {keyword}
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">
                        No suggested keywords yet
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Content Metadata</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Target Audience:
                      </span>
                      <p className="font-medium">
                        {generatedContent.targetAudience || audience || "-"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Content Type:
                      </span>
                      <p className="font-medium">
                        {generatedContent.contentType || contentType || "-"}
                      </p>
                    </div>
                  </div>
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
