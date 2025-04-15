
import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useCredentials } from "@/contexts/CredentialsContext";
import { OpenAIService } from "@/services/openaiService";
import { FileUp, Loader2, X, FileText, AlertTriangle } from "lucide-react";

// File types we support analyzing
const SUPPORTED_EXTENSIONS = [
  // Text files
  "txt", "md", "json", "csv", "xml", "html", "css", "js", "jsx", "ts", "tsx",
  // Document files - we'll extract text
  "pdf", "doc", "docx", 
  // Code files
  "py", "java", "c", "cpp", "h", "hpp", "rb", "php", "swift", "kt", "go", "rs",
  // Data files
  "yaml", "yml", "toml", "ini", "config",
];

// Maximum file size in bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface FileInfo {
  file: File;
  content: string | null;
  isLoading: boolean;
  error: string | null;
}

const FileAnalyzer: React.FC = () => {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [activeFileIndex, setActiveFileIndex] = useState<number | null>(null);
  const [prompt, setPrompt] = useState<string>("");
  const [analysis, setAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { credentials } = useCredentials();

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const selectedFiles = Array.from(e.target.files);
    const fileInfoPromises: Promise<FileInfo>[] = selectedFiles.map(async (file) => {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        return {
          file,
          content: null,
          isLoading: false,
          error: "File exceeds the 5MB size limit",
        };
      }
      
      // Check if file extension is supported
      const extension = file.name.split('.').pop()?.toLowerCase() || "";
      if (!SUPPORTED_EXTENSIONS.includes(extension)) {
        return {
          file,
          content: null,
          isLoading: false,
          error: "Unsupported file format",
        };
      }

      // Read file content
      try {
        const content = await readFileContent(file);
        return {
          file,
          content,
          isLoading: false,
          error: null,
        };
      } catch (error) {
        return {
          file,
          content: null,
          isLoading: false,
          error: `Failed to read file: ${error instanceof Error ? error.message : "Unknown error"}`,
        };
      }
    });

    const fileInfos = await Promise.all(fileInfoPromises);
    
    // Display error toasts for invalid files
    const errorFiles = fileInfos.filter(f => f.error);
    if (errorFiles.length > 0) {
      toast({
        title: `${errorFiles.length} file(s) couldn't be processed`,
        description: "Some files were too large or unsupported formats.",
        variant: "destructive",
      });
    }
    
    // Continue with valid files only
    const validFiles = fileInfos.filter(f => !f.error);
    if (validFiles.length > 0) {
      setFiles([...files, ...validFiles]);
      setActiveFileIndex(files.length); // Select the first new valid file
    }
    
    // Clear the file input value to allow the same file to be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Read file content based on type
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === "string") {
          resolve(content);
        } else {
          reject(new Error("Failed to read file content"));
        }
      };
      
      reader.onerror = () => {
        reject(new Error("File read error"));
      };
      
      reader.readAsText(file);
    });
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Remove a file
  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    
    if (activeFileIndex === index) {
      setActiveFileIndex(newFiles.length > 0 ? 0 : null);
    } else if (activeFileIndex !== null && activeFileIndex > index) {
      setActiveFileIndex(activeFileIndex - 1);
    }
  };

  // Analyze the file(s) content
  const analyzeFiles = async () => {
    if (!credentials.openaiApiKey) {
      toast({
        title: "API Key Required",
        description: "Please add your OpenAI API key in Settings to use this feature.",
        variant: "destructive",
      });
      return;
    }

    if (files.length === 0) {
      toast({
        title: "No Files Selected",
        description: "Please upload at least one file to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setAnalysis("");

    try {
      const openaiService = new OpenAIService(credentials.openaiApiKey);
      
      // Prepare content for analysis
      let combinedContent = "";
      let totalChars = 0;
      
      // Calculate total characters for progress tracking
      files.forEach(fileInfo => {
        if (fileInfo.content) {
          totalChars += fileInfo.content.length;
        }
      });
      
      // Prepare the file content information
      for (let i = 0; i < files.length; i++) {
        const fileInfo = files[i];
        if (fileInfo.content) {
          const fileName = fileInfo.file.name;
          const fileExtension = fileName.split('.').pop()?.toLowerCase();
          
          combinedContent += `--- File: ${fileName} ---\n\n`;
          
          // Limit content length per file to avoid exceeding token limits
          const maxChars = 100000;
          const content = fileInfo.content.length > maxChars 
            ? `${fileInfo.content.substring(0, maxChars)}...[truncated]` 
            : fileInfo.content;
            
          combinedContent += `${content}\n\n`;
          
          // Update progress
          setProgress(Math.min(((i + 1) / files.length) * 50, 50));
        }
      }

      // Default prompt if user didn't provide one
      const userPrompt = prompt.trim() || "Analyze the content of the provided files. Identify key patterns, summarize the content, and highlight any important points or issues.";
      
      // Prepare the system prompt
      const systemPrompt = `You are an expert file analyzer. You can extract insights, patterns, and information from various file types including code, text, data, and documents. Return concise, factual information organized in a clear structure.`;
      
      // Analyze the content using OpenAI
      const completion = await openaiService.openai.createChatCompletion({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { 
            role: "user", 
            content: `${userPrompt}\n\nHere are the file(s) to analyze:\n\n${combinedContent}`
          }
        ],
        temperature: 0.3,
      });

      setProgress(100);
      setAnalysis(completion.data.choices[0]?.message?.content || "Analysis failed to generate content.");
      
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${files.length} file(s).`,
      });
    } catch (error) {
      console.error("Error analyzing files:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Failed to analyze files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Get file icon based on extension
  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase() || "";
    return <FileText className="h-4 w-4" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold">File Analyzer</h1>
        <p className="text-muted-foreground mt-2">
          Upload files to analyze their content with AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition"
                onClick={triggerFileInput}
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  multiple 
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <FileUp className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                <h3 className="text-md font-medium">Upload Files</h3>
                <p className="text-xs text-muted-foreground mt-2">
                  Maximum file size: 5MB
                </p>
              </div>
              
              {files.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Files ({files.length})</h3>
                  </div>
                  <ul className="space-y-1 max-h-80 overflow-y-auto pr-2">
                    {files.map((fileInfo, index) => (
                      <li 
                        key={index} 
                        className={`flex items-center justify-between p-2 rounded text-sm ${
                          activeFileIndex === index ? "bg-muted" : "hover:bg-muted/50"
                        } cursor-pointer`}
                        onClick={() => setActiveFileIndex(index)}
                      >
                        <div className="flex items-center overflow-hidden">
                          {getFileIcon(fileInfo.file.name)}
                          <span className="ml-2 truncate">
                            {fileInfo.file.name}
                          </span>
                        </div>
                        <div className="flex items-center">
                          {fileInfo.error && (
                            <AlertTriangle className="h-4 w-4 text-destructive mr-1" />
                          )}
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(index);
                            }}
                            className="p-1 rounded-full hover:bg-muted-foreground/20"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="prompt">Analysis Prompt (Optional)</Label>
                  <Textarea 
                    id="prompt"
                    placeholder="What would you like to know about these files?"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="mt-1"
                    rows={4}
                  />
                </div>
                <Button 
                  onClick={analyzeFiles} 
                  disabled={isAnalyzing || files.length === 0 || !credentials.openaiApiKey}
                  className="w-full"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                      Analyzing...
                    </>
                  ) : (
                    "Analyze Files"
                  )}
                </Button>
                {!credentials.openaiApiKey && (
                  <p className="text-xs text-destructive">
                    Please add your OpenAI API key in Settings to use this feature.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Analysis Results</CardTitle>
              {isAnalyzing && (
                <Progress value={progress} className="h-2" />
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {activeFileIndex !== null && files[activeFileIndex] && (
                <div>
                  <Label className="text-sm">Selected File Content</Label>
                  <div className="mt-1 border rounded-md">
                    <Textarea
                      value={files[activeFileIndex].content || "Cannot display file content"}
                      className="font-mono text-xs h-40 resize-none"
                      readOnly
                    />
                  </div>
                </div>
              )}
              
              <div>
                <Label className="text-sm">Analysis</Label>
                <div className="mt-1 border rounded-md">
                  <Textarea
                    value={analysis || "Analysis results will appear here"}
                    className="h-96 resize-none"
                    readOnly
                    placeholder={isAnalyzing ? "Analyzing files..." : "Upload and analyze files to see results"}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default FileAnalyzer;
