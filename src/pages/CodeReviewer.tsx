
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useCredentials } from "@/contexts/CredentialsContext";
import { OpenAIService } from "@/services/openaiService";
import { Code, Loader2, Copy, CheckCircle } from "lucide-react";

const CodeReviewer = () => {
  const [code, setCode] = useState<string>("");
  const [language, setLanguage] = useState<string>("javascript");
  const [prompt, setPrompt] = useState<string>("");
  const [analysis, setAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const { toast } = useToast();
  const { credentials } = useCredentials();

  // Programming languages supported for syntax highlighting
  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "c", label: "C" },
    { value: "cpp", label: "C++" },
    { value: "csharp", label: "C#" },
    { value: "ruby", label: "Ruby" },
    { value: "go", label: "Go" },
    { value: "php", label: "PHP" },
    { value: "rust", label: "Rust" },
    { value: "swift", label: "Swift" },
    { value: "kotlin", label: "Kotlin" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
    { value: "sql", label: "SQL" },
    { value: "json", label: "JSON" },
    { value: "yaml", label: "YAML" },
    { value: "bash", label: "Bash/Shell" },
    { value: "markdown", label: "Markdown" },
    { value: "other", label: "Other" },
  ];

  // Code review types
  const reviewTypes = [
    { value: "code-review", label: "Code Review" },
    { value: "security-audit", label: "Security Audit" },
    { value: "performance-optimization", label: "Performance Optimization" },
    { value: "refactoring-suggestions", label: "Refactoring Suggestions" },
    { value: "documentation", label: "Documentation Generation" },
    { value: "bug-hunting", label: "Bug Hunting" },
    { value: "code-explanation", label: "Code Explanation" },
  ];

  const [reviewType, setReviewType] = useState<string>("code-review");

  // Analyze the code
  const analyzeCode = async () => {
    if (!credentials.openaiApiKey) {
      toast({
        title: "API Key Required",
        description: "Please add your OpenAI API key in Settings to use this feature.",
        variant: "destructive",
      });
      return;
    }

    if (!code.trim()) {
      toast({
        title: "No Code Provided",
        description: "Please enter code to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const openaiService = new OpenAIService(credentials.openaiApiKey);
      
      // Prepare prompts based on review type
      const systemPromptMap: Record<string, string> = {
        "code-review": "You are an expert code reviewer. Analyze the provided code for best practices, readability, maintainability, and potential improvements.",
        "security-audit": "You are a security expert. Analyze the code for security vulnerabilities, potential exploits, and security best practices.",
        "performance-optimization": "You are a performance optimization expert. Analyze the code for performance bottlenecks and suggest optimizations.",
        "refactoring-suggestions": "You are a code refactoring expert. Suggest ways to improve the code structure, reduce complexity, and increase maintainability.",
        "documentation": "You are a technical documentation expert. Generate comprehensive documentation for the provided code.",
        "bug-hunting": "You are a bug detection expert. Identify potential bugs, edge cases, and logical errors in the code.",
        "code-explanation": "You are a coding tutor. Explain what the code does in a clear, educational manner suitable for someone learning programming."
      };

      const systemPrompt = systemPromptMap[reviewType] || systemPromptMap["code-review"];
      
      // Default prompt based on review type
      const defaultPromptMap: Record<string, string> = {
        "code-review": "Review this code and provide constructive feedback.",
        "security-audit": "Identify security vulnerabilities in this code.",
        "performance-optimization": "Find performance bottlenecks and suggest optimizations.",
        "refactoring-suggestions": "Suggest refactoring to improve this code.",
        "documentation": "Generate documentation for this code.",
        "bug-hunting": "Find potential bugs and edge cases in this code.",
        "code-explanation": "Explain what this code does in simple terms."
      };
      
      const userPrompt = prompt.trim() || defaultPromptMap[reviewType] || "Review this code";
      
      const completion = await openaiService.openai.createChatCompletion({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `${userPrompt}\n\nLanguage: ${language}\n\nCode:\n\`\`\`${language}\n${code}\n\`\`\``
          }
        ],
        temperature: 0.3,
      });

      setAnalysis(completion.data.choices[0]?.message?.content || "Analysis failed to generate content.");
      
      toast({
        title: "Analysis Complete",
        description: `${reviewType.charAt(0).toUpperCase() + reviewType.slice(1).replace(/-/g, " ")} completed successfully.`,
      });
    } catch (error) {
      console.error("Error analyzing code:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        
        toast({
          title: "Copied to clipboard",
          description: "Text has been copied to clipboard successfully.",
        });
      })
      .catch((err) => {
        console.error("Failed to copy text:", err);
        toast({
          title: "Copy failed",
          description: "Failed to copy text to clipboard.",
          variant: "destructive",
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
      <div>
        <h1 className="text-3xl font-bold">Code Reviewer</h1>
        <p className="text-muted-foreground mt-2">
          Analyze, review, and improve your code with AI assistance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Code Input</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <Select 
                value={language}
                onValueChange={setLanguage}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="reviewType">Review Type</Label>
              <Select 
                value={reviewType}
                onValueChange={setReviewType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select review type" />
                </SelectTrigger>
                <SelectContent>
                  {reviewTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="code">Code</Label>
              <Textarea
                id="code"
                placeholder="Paste your code here..."
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="font-mono h-96 resize-none"
              />
            </div>
            
            <div>
              <Label htmlFor="prompt">Custom Instructions (Optional)</Label>
              <Textarea
                id="prompt"
                placeholder="Any specific aspects you want analyzed?"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="resize-none"
                rows={3}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCode("")}
              disabled={!code || isAnalyzing}
            >
              Clear
            </Button>
            <Button
              onClick={analyzeCode}
              disabled={!code || isAnalyzing || !credentials.openaiApiKey}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Code className="mr-2 h-4 w-4" />
                  Analyze Code
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Analysis Results</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(analysis)}
              disabled={!analysis}
            >
              {copied ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          <CardContent>
            <Textarea
              value={analysis}
              readOnly
              className="h-[calc(100vh-20rem)] resize-none"
              placeholder={isAnalyzing ? "Analyzing code..." : "Analysis results will appear here"}
            />
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default CodeReviewer;
