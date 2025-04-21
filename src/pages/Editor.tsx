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
  Send,
  Tags,
  Globe2,
  Users,
  MessageSquareQuote,
  Code,
  FileSpreadsheet,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { X } from "lucide-react";

const Editor = () => {
  const { credentials } = useCredentials();
  const { toast } = useToast();

  // Content options
  const [topic, setTopic] = useState("");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [model, setModel] = useState("openai");
  const [audience, setAudience] = useState("general");
  const [tone, setTone] = useState("professional");
  const [contentType, setContentType] = useState("blog");
  const [includeHtml, setIncludeHtml] = useState(false);

  // SEO options
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [seoKeywordInput, setSeoKeywordInput] = useState("");
  const [seoCountry, setSeoCountry] = useState("global");

  // Image options
  const [generateImages, setGenerateImages] = useState(false);
  const [imageCount, setImageCount] = useState(1);
  const [imagePositions, setImagePositions] = useState<number[]>([]);
  const [imagePrompts, setImagePrompts] = useState<string[]>([]);

  // UI states
  const [isGenerating, setIsGenerating] = useState(false);

  // Generated content
  const [generatedContent, setGeneratedContent] = useState({
    title: "",
    body: "",
    images: [] as { url: string; prompt: string }[],
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

  const handleImagePositionChange = (index: number, value: number) => {
    const newPositions = [...imagePositions];
    newPositions[index] = value;
    setImagePositions(newPositions);
  };

  const handleImagePromptChange = (index: number, value: string) => {
    const newPrompts = [...imagePrompts];
    newPrompts[index] = value;
    setImagePrompts(newPrompts);
  };

  const addImageOption = () => {
    setImageCount(imageCount + 1);
    setImagePositions([...imagePositions, Math.floor(Math.random() * 5) + 1]);
    setImagePrompts([...imagePrompts, ""]);
  };

  const removeImageOption = (index: number) => {
    if (imageCount <= 1) return;
    setImageCount(imageCount - 1);
    setImagePositions(imagePositions.filter((_, i) => i !== index));
    setImagePrompts(imagePrompts.filter((_, i) => i !== index));
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
      const imageService = aiFactory.getImageGenerationService(); // Add this line

      // Prepare the content generation request
      const contentRequest = {
        topic,
        length,
        audience,
        tone,
        contentType,
        seoKeywords,
        seoCountry,
        includeHtml,
        generateImages,
        imageCount,
        imagePositions,
        imagePrompts: generateImages ? imagePrompts : [],
      };

      // First generate the content
      const result = await contentService.generateBlogPost(contentRequest);

      // Then generate images if enabled
      let generatedImages: { url: string; prompt: string }[] = [];
      if (generateImages && imagePrompts.some((prompt) => prompt.trim())) {
        const imagePromptsToUse = imagePrompts.map(
          (prompt, index) =>
            prompt.trim() ||
            `Professional ${contentType} image about "${topic}" for position ${
              index + 1
            }`
        );

        // Generate all images in parallel
        const imageGenerationPromises = imagePromptsToUse.map((prompt) =>
          imageService
            .generateImage(prompt, {
              size: "512x512",
              n: 1,
              prompt,
            })
            .then((url) => ({ url, prompt }))
            .catch((error) => {
              console.error(
                `Failed to generate image for prompt: ${prompt}`,
                error
              );
              return null;
            })
        );

        const imageResults = await Promise.all(imageGenerationPromises);
        generatedImages = imageResults.filter(Boolean) as {
          url: string;
          prompt: string;
        }[];
      }

      // Set the generated content
      setGeneratedContent({
        title: result.content.split("\n")[0].replace(/^#\s*/, ""),
        body: result.content,
        images: generatedImages,
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

      // Check for access token
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw {
          type: "OAUTH_REQUIRED",
          message: "Google OAuth authentication required",
        };
      }

      // Prepare content with images if available
      let fullContent = generatedContent.body;

      // Insert images at their specified positions if they exist
      if (generatedContent.images.length > 0) {
        const contentParts = generatedContent.body.split("\n");

        generatedContent.images.forEach((image, index) => {
          const position = imagePositions[index] || 1;
          const insertIndex = Math.min(
            Math.max(0, Math.floor(contentParts.length * (position / 5)) - 1),
            contentParts.length
          );

          const imgTag = `<div class="generated-image">
            <img src="${image.url}" alt="${generatedContent.title} - Image ${
            index + 1
          }" />
            <p class="image-caption">${image.prompt}</p>
          </div>`;

          contentParts.splice(insertIndex, 0, imgTag);
        });

        fullContent = contentParts.join("\n");
      }

      // Create the post
      await bloggerService.createPost({
        title: generatedContent.title,
        content: fullContent,
        labels: [
          contentType,
          ...seoKeywords,
          ...generatedContent.seoKeywords,
        ].slice(0, 20), // Blogger has a limit of 20 labels
      });

      toast({
        title: "Published to Blogger",
        description: "Your post has been published successfully!",
      });

      // Optionally save to sheets as a backup
      // if (credentials.googleSheetId) {
      //   await saveToSheets();
      // }
    } catch (error) {
      console.error("Blogger publishing error:", error);

      if (error.type === "OAUTH_REQUIRED") {
        // Open Blogger editor with pre-filled content in new tab
        const blogUrl = `https://www.blogger.com/blogger.g?blogID=${
          credentials.bloggerBlogId
        }#editor/target=post;postTitle=${encodeURIComponent(
          generatedContent.title
        )};postBody=${encodeURIComponent(generatedContent.body)};`;
        window.open(blogUrl, "_blank");

        toast({
          title: "Authentication Required",
          description:
            "Please authenticate with Google in the new tab and paste your content.",
          variant: "default",
        });
      } else {
        toast({
          title: "Publishing failed",
          description:
            error.message || "Failed to publish to Blogger. Please try again.",
          variant: "destructive",
        });
      }
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
        description: "Please add your Google API key and Sheet ID in Settings.",
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

      // Prepare the data for sheets
      const rowData = {
        date: new Date().toISOString(),
        title: generatedContent.title,
        content: generatedContent.body,
        contentType,
        audience,
        tone,
        keywords: [...seoKeywords, ...generatedContent.seoKeywords].join(", "),
        status: "draft",
        wordCount: generatedContent.body.split(/\s+/).length,
        images: generatedContent.images.length,
        seoDescription: generatedContent.seoDescription,
      };

      await sheetsService.appendRow(rowData);

      toast({
        title: "Saved to Google Sheets",
        description: "Your content has been saved successfully!",
      });
    } catch (error) {
      console.error("Sheets save error:", error);
      toast({
        title: "Save failed",
        description:
          error.message || "Failed to save to Google Sheets. Please try again.",
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
          Creating posts on Blogger requires OAuth authentication. When you
          click "Publish to Blogger," we'll try to use your login token. If
          needed, we'll open the Blogger editor in a new tab with your content
          ready to paste. Your content will also be saved to your content
          history.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6 space-y-6">
            {/* Content Basics Section */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Content Basics
              </h3>

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
                    <SelectItem value="product">Product Description</SelectItem>
                    <SelectItem value="social">Social Media Post</SelectItem>
                    <SelectItem value="newsletter">Newsletter</SelectItem>
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
                    <SelectItem value="short">Short (500-800 words)</SelectItem>
                    <SelectItem value="medium">
                      Medium (800-1200 words)
                    </SelectItem>
                    <SelectItem value="long">Long (1500-2000 words)</SelectItem>
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
            </div>

            {/* Content Customization Section */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Content Customization
              </h3>

              <div className="space-y-2">
                <Label htmlFor="audience">Target Audience</Label>
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="professional">Professionals</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="beginners">Beginners</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">Content Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select content tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="humorous">Humorous</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="includeHtml"
                  checked={includeHtml}
                  onChange={(e) => setIncludeHtml(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="includeHtml">Include HTML formatting</Label>
              </div>
            </div>

            {/* SEO Optimization Section */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <Globe2 className="h-4 w-4" />
                SEO Optimization
              </h3>

              <div className="space-y-2">
                <Label htmlFor="seoKeywords">SEO Keywords</Label>
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
                <Label htmlFor="seoCountry">SEO Country Optimization</Label>
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
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Image Generation Section */}
            <div className="space-y-4">
              <h3 className="font-medium flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Image Generation
              </h3>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="generateImages"
                  checked={generateImages}
                  onChange={(e) => setGenerateImages(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="generateImages">
                  Generate images for this content
                </Label>
              </div>

              {generateImages && (
                <div className="space-y-4 pl-6 border-l-2 border-muted">
                  <div className="space-y-2">
                    <Label>Number of Images</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setImageCount(Math.max(1, imageCount - 1))
                        }
                        disabled={imageCount <= 1}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <span className="px-4 py-2 bg-muted rounded-md">
                        {imageCount}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setImageCount(Math.min(5, imageCount + 1))
                        }
                        disabled={imageCount >= 5}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {Array.from({ length: imageCount }).map((_, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Image {index + 1}</Label>
                        {index > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeImageOption(index)}
                            className="text-destructive"
                          >
                            Remove
                          </Button>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Position in Content</Label>
                        <Select
                          value={imagePositions[index]?.toString() || "1"}
                          onValueChange={(value) =>
                            handleImagePositionChange(index, parseInt(value))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select position" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Beginning</SelectItem>
                            <SelectItem value="2">
                              After first paragraph
                            </SelectItem>
                            <SelectItem value="3">Middle</SelectItem>
                            <SelectItem value="4">Before conclusion</SelectItem>
                            <SelectItem value="5">End</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Custom Prompt (optional)</Label>
                        <Textarea
                          placeholder={`Professional ${contentType} image about "${topic}"`}
                          value={imagePrompts[index] || ""}
                          onChange={(e) =>
                            handleImagePromptChange(index, e.target.value)
                          }
                          rows={2}
                        />
                        <p className="text-xs text-muted-foreground">
                          Leave blank for auto-generated prompt
                        </p>
                      </div>
                    </div>
                  ))}

                  {imageCount < 5 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addImageOption}
                      className="w-full"
                    >
                      Add Another Image
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pt-4">
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

        {/* Preview Panel */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <Tabs defaultValue="preview">
              <TabsList className="mb-4">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="seo">SEO Data</TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="space-y-4">
                {generatedContent.images.length > 0 && (
                  <div className="grid gap-4 mb-6">
                    {generatedContent.images.map((image, index) => (
                      <div
                        key={index}
                        className="border rounded-lg overflow-hidden"
                      >
                        <img
                          src={image.url}
                          alt={`Generated image ${index + 1}`}
                          className="w-full h-auto object-cover"
                        />
                        <div className="p-3 bg-muted text-sm">
                          <p className="font-medium">
                            Image {index + 1} Prompt:
                          </p>
                          <p className="text-muted-foreground">
                            {image.prompt}
                          </p>
                        </div>
                      </div>
                    ))}
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
