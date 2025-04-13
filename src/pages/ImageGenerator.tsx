
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
import { Loader2, ImageIcon, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const ImageGenerator = () => {
  const { credentials } = useCredentials();
  const { toast } = useToast();
  
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("dalle");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  
  const generateImage = async () => {
    if (!prompt) {
      toast({
        title: "Prompt required",
        description: "Please enter a prompt for image generation.",
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
      
      const imageUrl = await imageService.generateImage(prompt);
      
      setGeneratedImages([imageUrl, ...generatedImages]);
      
      toast({
        title: "Image generated",
        description: "Your image has been generated successfully!",
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
  
  const downloadImage = (url: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `generated-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-6">Image Generator</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Image Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Describe the image you want to generate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                className="resize-none"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="model">AI Model</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an AI model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dalle">DALL-E (OpenAI)</SelectItem>
                  <SelectItem value="leonardo" disabled={!credentials.leonardoApiKey}>
                    Leonardo.AI {!credentials.leonardoApiKey && "(API key missing)"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              className="w-full" 
              onClick={generateImage} 
              disabled={isGenerating || !prompt}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Generate Image
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        
        <Card className="lg:col-span-2">
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Generated Images</h2>
            
            {generatedImages.length === 0 && !isGenerating ? (
              <div className="flex flex-col items-center justify-center h-60 bg-muted/20 rounded-lg border border-dashed">
                <ImageIcon className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No images generated yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {isGenerating && (
                  <div className="flex flex-col items-center justify-center h-60 bg-muted/20 rounded-lg border border-dashed animate-pulse">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                    <p className="text-sm text-muted-foreground">Generating image...</p>
                  </div>
                )}
                
                {generatedImages.map((imageUrl, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Generated image ${index + 1}`}
                      className="w-full h-60 object-cover rounded-lg shadow-md"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => downloadImage(imageUrl)}
                      >
                        <Download className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default ImageGenerator;
