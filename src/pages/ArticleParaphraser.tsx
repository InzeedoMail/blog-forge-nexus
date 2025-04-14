
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
import { AIServiceFactory } from "@/services/serviceFactory";
import {
  Loader2,
  FileText,
  ClipboardCopy,
  Download,
  Check,
  Wand2,
  Languages,
  InfoIcon,
  FileSpreadsheet,
  Share2,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

interface ArticleMetadata {
  wordCount: number;
  readingTime: number;
  seoScore: number;
  readabilityScore: number;
  keywordsFrequency: Record<string, number>;
  titleSeoScore: number;
  languageDetected: string;
}

const ArticleParaphraser = () => {
  const { credentials } = useCredentials();
  const { user } = useAuth();
  const { toast } = useToast();

  // Content states
  const [originalText, setOriginalText] = useState("");
  const [paraphrasedText, setParaphrasedText] = useState("");
  const [processedTitle, setProcessedTitle] = useState("");
  const [articleTitle, setArticleTitle] = useState("");

  // Options states
  const [language, setLanguage] = useState<"english" | "tamil">("english");
  const [toneStyle, setToneStyle] = useState("professional");
  const [preserveKeywords, setPreserveKeywords] = useState(true);
  const [outputFormat, setOutputFormat] = useState<"text" | "html">("html");

  // Grammar checking states
  const [grammarIssues, setGrammarIssues] = useState<any[]>([]);
  const [grammarScore, setGrammarScore] = useState<number | null>(null);
  const [correctedText, setCorrectedText] = useState("");

  // Metadata states
  const [metadata, setMetadata] = useState<ArticleMetadata | null>(null);

  // UI states
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState("original");
  const [actionType, setActionType] = useState<"paraphrase" | "grammar" | "analyze">("paraphrase");

  // Process text based on selected action
  const processText = async () => {
    if (!originalText) {
      toast({
        title: "Content required",
        description: "Please enter some text to process.",
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

    setIsProcessing(true);

    try {
      const aiFactory = new AIServiceFactory(credentials.openaiApiKey);
      const service = aiFactory.getContentGenerationService();

      if (actionType === "paraphrase") {
        const result = await service.paraphraseContent({
          text: originalText,
          language,
          toneStyle,
          preserveKeywords,
          outputFormat
        });

        setParaphrasedText(result);
        
        // Extract title from first heading if no title is provided
        if (!articleTitle && outputFormat === "html") {
          const titleMatch = result.match(/<h1[^>]*>(.*?)<\/h1>/i) || 
                             result.match(/<h2[^>]*>(.*?)<\/h2>/i);
          if (titleMatch) {
            setProcessedTitle(titleMatch[1]);
          }
        } else if (!articleTitle) {
          // Extract first line as title
          const firstLine = originalText.split("\n")[0].trim();
          if (firstLine) {
            setProcessedTitle(firstLine);
          }
        }
        
        setActiveTab("paraphrased");
      } 
      else if (actionType === "grammar") {
        const result = await service.checkGrammar({
          text: originalText,
          language,
          detailedFeedback: true
        });

        setCorrectedText(result.correctedText);
        setGrammarIssues(result.issues);
        setGrammarScore(result.score);
        setActiveTab("grammar");
      }
      else if (actionType === "analyze") {
        const title = articleTitle || processedTitle || "Untitled Article";
        const result = await service.analyzeArticleMetadata(
          originalText,
          title
        );
        
        setMetadata(result);
        setActiveTab("metadata");
      }

      toast({
        title: `${actionType === "paraphrase" ? "Paraphrasing" : actionType === "grammar" ? "Grammar check" : "Analysis"} complete`,
        description: `Your content has been ${actionType === "paraphrase" ? "paraphrased" : actionType === "grammar" ? "checked for grammar" : "analyzed"} successfully!`,
      });
    } catch (error) {
      console.error(`Error ${actionType}ing content:`, error);
      toast({
        title: `${actionType === "paraphrase" ? "Paraphrasing" : actionType === "grammar" ? "Grammar check" : "Analysis"} failed`,
        description: error instanceof Error ? error.message : `Failed to ${actionType} content. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: "Copied to clipboard",
          description: "Content has been copied to your clipboard.",
        });
      },
      (err) => {
        console.error("Could not copy text: ", err);
        toast({
          title: "Copy failed",
          description: "Failed to copy content to clipboard.",
          variant: "destructive",
        });
      }
    );
  };

  const downloadAsPdf = () => {
    const element = document.getElementById("content-to-pdf");
    if (!element) {
      toast({
        title: "Export failed",
        description: "Could not find content to export.",
        variant: "destructive",
      });
      return;
    }

    const fileName = articleTitle || processedTitle || "paraphrased-content";
    
    toast({
      title: "Preparing PDF",
      description: "Please wait while we prepare your PDF file...",
    });

    html2canvas(element).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      // Add additional pages if content overflows
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`${fileName}.pdf`);
      
      toast({
        title: "PDF downloaded",
        description: "Your content has been downloaded as PDF.",
      });
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Content Paraphraser</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <Tabs defaultValue="input" className="mb-6">
              <TabsList className="mb-4 w-full">
                <TabsTrigger value="input" className="flex-1">
                  Input
                </TabsTrigger>
                <TabsTrigger value="options" className="flex-1">
                  Options
                </TabsTrigger>
              </TabsList>

              <TabsContent value="input" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="articleTitle">Article Title (Optional)</Label>
                  <Input
                    id="articleTitle"
                    placeholder="Enter article title"
                    value={articleTitle}
                    onChange={(e) => setArticleTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="originalContent">Original Content</Label>
                  <Textarea
                    id="originalContent"
                    placeholder="Paste your content here to paraphrase, check grammar, or analyze"
                    value={originalText}
                    onChange={(e) => setOriginalText(e.target.value)}
                    rows={12}
                    className="min-h-[300px] font-mono"
                  />
                </div>
              </TabsContent>

              <TabsContent value="options" className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2" htmlFor="language">
                    <Languages className="h-4 w-4" /> Language
                  </Label>
                  <Select value={language} onValueChange={(value) => setLanguage(value as "english" | "tamil")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="tamil">Tamil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toneStyle">Tone & Style</Label>
                  <Select value={toneStyle} onValueChange={setToneStyle}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tone and style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="simplified">Simplified</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                      <SelectItem value="conversational">Conversational</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="actionType">Process Action</Label>
                  <Select value={actionType} onValueChange={(value) => setActionType(value as "paraphrase" | "grammar" | "analyze")}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paraphrase">Paraphrase Content</SelectItem>
                      <SelectItem value="grammar">Check Grammar</SelectItem>
                      <SelectItem value="analyze">Analyze Metadata</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {actionType === "paraphrase" && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="outputFormat">Output Format</Label>
                      <Select value={outputFormat} onValueChange={(value) => setOutputFormat(value as "text" | "html")}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select output format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Plain Text</SelectItem>
                          <SelectItem value="html">HTML Formatted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="preserveKeywords"
                        checked={preserveKeywords}
                        onCheckedChange={setPreserveKeywords}
                      />
                      <Label htmlFor="preserveKeywords">
                        Preserve important keywords
                      </Label>
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>

            <div className="mt-6 space-y-4">
              <Button
                className="w-full"
                onClick={processText}
                disabled={isProcessing || !originalText}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : actionType === "paraphrase" ? (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Paraphrase Content
                  </>
                ) : actionType === "grammar" ? (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Check Grammar
                  </>
                ) : (
                  <>
                    <InfoIcon className="mr-2 h-4 w-4" />
                    Analyze Content
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="original">Original</TabsTrigger>
                <TabsTrigger value="paraphrased">Paraphrased</TabsTrigger>
                <TabsTrigger value="grammar">Grammar</TabsTrigger>
                <TabsTrigger value="metadata">Metadata</TabsTrigger>
              </TabsList>

              <TabsContent value="original" className="space-y-4">
                {originalText ? (
                  <div className="prose prose-invert max-w-none">
                    {articleTitle && <h1>{articleTitle}</h1>}
                    <pre className="whitespace-pre-wrap font-sans">{originalText}</pre>
                  </div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground">
                    <FileText className="mx-auto h-16 w-16 mb-4 opacity-50" />
                    <p>Paste your content in the input panel to get started</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="paraphrased" className="space-y-4">
                {paraphrasedText ? (
                  <div id="content-to-pdf" className="prose prose-invert max-w-none">
                    {processedTitle && !paraphrasedText.includes(processedTitle) && <h1>{processedTitle}</h1>}
                    {outputFormat === "html" ? (
                      <div dangerouslySetInnerHTML={{ __html: paraphrasedText }}></div>
                    ) : (
                      <pre className="whitespace-pre-wrap font-sans">{paraphrasedText}</pre>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground">
                    <Wand2 className="mx-auto h-16 w-16 mb-4 opacity-50" />
                    <p>Click "Paraphrase Content" to transform your text</p>
                  </div>
                )}

                {paraphrasedText && (
                  <div className="flex space-x-3 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => copyToClipboard(paraphrasedText)}
                      className="flex-1"
                    >
                      <ClipboardCopy className="mr-2 h-4 w-4" />
                      Copy to Clipboard
                    </Button>
                    <Button
                      variant="outline"
                      onClick={downloadAsPdf}
                      className="flex-1"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download as PDF
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="grammar" className="space-y-4">
                {correctedText ? (
                  <>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium">Grammar Score</h3>
                        <Badge 
                          variant={grammarScore && grammarScore > 80 ? "default" : grammarScore && grammarScore > 50 ? "outline" : "destructive"}
                        >
                          {grammarScore !== null ? `${grammarScore}/100` : 'N/A'}
                        </Badge>
                      </div>
                      {grammarScore !== null && (
                        <Progress 
                          value={grammarScore} 
                          className={`h-2 ${
                            grammarScore > 80 ? "bg-green-500" : 
                            grammarScore > 50 ? "bg-amber-500" : 
                            "bg-red-500"
                          }`} 
                        />
                      )}
                    </div>
                    
                    <div className="prose prose-invert max-w-none">
                      <h3>Corrected Text</h3>
                      <pre className="whitespace-pre-wrap font-sans">{correctedText}</pre>
                    </div>
                    
                    {grammarIssues.length > 0 ? (
                      <div className="mt-6">
                        <h3 className="text-lg font-medium mb-3">Issues Found ({grammarIssues.length})</h3>
                        <div className="space-y-3">
                          {grammarIssues.map((issue, index) => (
                            <Card key={index} className="bg-muted/50 border-muted">
                              <CardContent className="pt-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <Badge variant={
                                      issue.type === "grammar" ? "outline" :
                                      issue.type === "spelling" ? "destructive" :
                                      issue.type === "punctuation" ? "default" : 
                                      "secondary"
                                    }>
                                      {issue.type}
                                    </Badge>
                                    <div className="mt-2">
                                      <p><strong>Original:</strong> <span className="text-red-400">{issue.original}</span></p>
                                      <p><strong>Suggested:</strong> <span className="text-green-400">{issue.suggested}</span></p>
                                    </div>
                                  </div>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <InfoIcon className="h-4 w-4" />
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent>
                                      <p className="text-sm">{issue.reason}</p>
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <Alert>
                        <Check className="h-4 w-4" />
                        <AlertTitle>Perfect!</AlertTitle>
                        <AlertDescription>No grammar issues were found in your text.</AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="flex space-x-3 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(correctedText)}
                        className="flex-1"
                      >
                        <ClipboardCopy className="mr-2 h-4 w-4" />
                        Copy Corrected Text
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-16 text-muted-foreground">
                    <Check className="mx-auto h-16 w-16 mb-4 opacity-50" />
                    <p>Click "Check Grammar" to analyze your text for issues</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="metadata" className="space-y-4">
                {metadata ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <h3 className="text-lg font-medium mb-3">Basic Stats</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Word Count:</span>
                              <Badge variant="outline">{metadata.wordCount}</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Reading Time:</span>
                              <Badge variant="outline">{metadata.readingTime} min</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Language:</span>
                              <Badge>{metadata.languageDetected}</Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <h3 className="text-lg font-medium mb-3">SEO Metrics</h3>
                          <div className="space-y-2">
                            <div>
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">SEO Score:</span>
                                <Badge 
                                  variant={metadata.seoScore > 80 ? "default" : metadata.seoScore > 50 ? "outline" : "destructive"}
                                >
                                  {metadata.seoScore}/100
                                </Badge>
                              </div>
                              <Progress value={metadata.seoScore} className="h-2 mt-1" />
                            </div>
                            <div>
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Title SEO Score:</span>
                                <Badge 
                                  variant={metadata.titleSeoScore > 80 ? "default" : metadata.titleSeoScore > 50 ? "outline" : "destructive"}
                                >
                                  {metadata.titleSeoScore}/100
                                </Badge>
                              </div>
                              <Progress value={metadata.titleSeoScore} className="h-2 mt-1" />
                            </div>
                            <div>
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Readability Score:</span>
                                <Badge 
                                  variant={metadata.readabilityScore > 80 ? "default" : metadata.readabilityScore > 50 ? "outline" : "destructive"}
                                >
                                  {metadata.readabilityScore}/100
                                </Badge>
                              </div>
                              <Progress value={metadata.readabilityScore} className="h-2 mt-1" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardContent className="pt-6">
                        <h3 className="text-lg font-medium mb-3">Keyword Analysis</h3>
                        {Object.keys(metadata.keywordsFrequency).length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(metadata.keywordsFrequency)
                              .sort(([, a], [, b]) => b - a)
                              .map(([keyword, frequency], index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                  {keyword} <span className="bg-primary/20 px-1.5 rounded-full text-xs">{frequency}</span>
                                </Badge>
                              ))
                            }
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No keywords detected</p>
                        )}
                      </CardContent>
                    </Card>

                    <div className="flex space-x-3 mt-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const metadataText = `
Article Metadata:
- Title: ${articleTitle || processedTitle || "Untitled"}
- Word Count: ${metadata.wordCount}
- Reading Time: ${metadata.readingTime} minutes
- Language: ${metadata.languageDetected}
- SEO Score: ${metadata.seoScore}/100
- Title SEO Score: ${metadata.titleSeoScore}/100
- Readability Score: ${metadata.readabilityScore}/100
- Keywords: ${Object.entries(metadata.keywordsFrequency)
  .sort(([, a], [, b]) => b - a)
  .map(([keyword, frequency]) => `${keyword} (${frequency})`)
  .join(", ")}
`;
                          copyToClipboard(metadataText);
                        }}
                        className="flex-1"
                      >
                        <ClipboardCopy className="mr-2 h-4 w-4" />
                        Copy Metadata
                      </Button>
                      {credentials.googleSheetId && user && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            toast({
                              title: "Save to Google Sheets",
                              description: "This feature will be implemented soon!",
                              variant: "default",
                            });
                          }}
                          className="flex-1"
                        >
                          <FileSpreadsheet className="mr-2 h-4 w-4" />
                          Save to Sheets
                        </Button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-muted-foreground">
                    <InfoIcon className="mx-auto h-16 w-16 mb-4 opacity-50" />
                    <p>Click "Analyze Content" to see article metadata</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default ArticleParaphraser;
