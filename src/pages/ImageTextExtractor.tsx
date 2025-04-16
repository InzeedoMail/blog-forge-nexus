import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { createWorker } from "tesseract.js";
import { Copy, ImageDown, Upload, Loader2, X, Download } from "lucide-react";

const ImageTextExtractor = () => {
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTab, setCurrentTab] = useState("upload");
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(
      (file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024
    );

    if (validFiles.length !== selectedFiles.length) {
      toast({
        title: "Invalid files detected",
        description: "Only images up to 5MB are allowed.",
        variant: "destructive",
      });
    }

    if (validFiles.length > 0) {
      setImages([...images, ...validFiles]);

      // Create URLs for the new images
      const newUrls = validFiles.map((file) => URL.createObjectURL(file));
      setImageUrls([...imageUrls, ...newUrls]);
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Remove an image
  const removeImage = (index: number) => {
    const newImages = [...images];
    const newImageUrls = [...imageUrls];

    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newImageUrls[index]);

    newImages.splice(index, 1);
    newImageUrls.splice(index, 1);

    setImages(newImages);
    setImageUrls(newImageUrls);

    if (activeImageIndex === index) {
      setActiveImageIndex(null);
    } else if (activeImageIndex !== null && activeImageIndex > index) {
      setActiveImageIndex(activeImageIndex - 1);
    }
  };

  // Extract text from images
  const extractText = async () => {
    if (images.length === 0) {
      toast({
        title: "No images selected",
        description: "Please select at least one image to extract text from.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setExtractedText("");

    try {
      const worker = await createWorker("eng");

      let combinedText = "";

      for (let i = 0; i < images.length; i++) {
        const image = images[i];
        await worker.load();

        const {
          data: { text },
        } = await worker.recognize(image);

        combinedText += `--- Image ${i + 1} ---\n${text}\n\n`;
      }

      await worker.terminate();

      setExtractedText(combinedText.trim());
      setCurrentTab("results");

      toast({
        title: "Text extraction complete",
        description: `Successfully extracted text from ${images.length} image(s).`,
      });
    } catch (error) {
      console.error("Error extracting text:", error);
      toast({
        title: "Text extraction failed",
        description:
          "An error occurred during text extraction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Copy text to clipboard
  const copyToClipboard = () => {
    if (!extractedText) return;

    navigator.clipboard
      .writeText(extractedText)
      .then(() => {
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

  // Download text as file
  const downloadText = () => {
    if (!extractedText) return;

    const blob = new Blob([extractedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "extracted-text.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-3xl font-bold">Image Text Extractor</h1>
        <p className="text-muted-foreground mt-2">
          Upload images to extract text content with OCR technology
        </p>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Images</TabsTrigger>
          <TabsTrigger value="results">Extracted Text</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col space-y-4">
                <div
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition"
                  onClick={triggerFileInput}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Upload Images</h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Click to browse or drag and drop images here
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Maximum file size: 5MB per image
                  </p>
                </div>

                {images.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">
                        Selected Images ({images.length})
                      </h3>
                      <Button
                        variant="outline"
                        onClick={extractText}
                        disabled={isProcessing}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <ImageDown className="mr-2 h-4 w-4" />
                            Extract Text
                          </>
                        )}
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {imageUrls.map((url, index) => (
                        <div
                          key={index}
                          className={`relative group rounded-md overflow-hidden border ${
                            activeImageIndex === index
                              ? "ring-2 ring-primary"
                              : ""
                          }`}
                          onClick={() => setActiveImageIndex(index)}
                        >
                          <img
                            src={url}
                            alt={`Selected image ${index + 1}`}
                            className="w-full h-32 object-cover"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(index);
                              }}
                              className="bg-white rounded-full p-1 hover:bg-red-100"
                            >
                              <X className="h-4 w-4 text-red-500" />
                            </button>
                          </div>
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs p-1 truncate">
                            {images[index].name}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between">
                <span>Extracted Text</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyToClipboard}
                    disabled={!extractedText}
                  >
                    <Copy className="h-4 w-4 mr-1" /> Copy
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={downloadText}
                    disabled={!extractedText}
                  >
                    <Download className="h-4 w-4 mr-1" /> Download
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                {activeImageIndex !== null && (
                  <div className="w-full md:w-1/3">
                    <Label className="mb-2 block">Selected Image</Label>
                    <div className="border rounded-md overflow-hidden">
                      <img
                        src={imageUrls[activeImageIndex]}
                        alt="Selected image"
                        className="w-full object-contain max-h-96"
                      />
                    </div>
                  </div>
                )}

                <div
                  className={`w-full ${
                    activeImageIndex !== null ? "md:w-2/3" : ""
                  }`}
                >
                  <Label htmlFor="extractedText" className="mb-2 block">
                    Text Content
                  </Label>
                  <Textarea
                    id="extractedText"
                    value={extractedText}
                    onChange={(e) => setExtractedText(e.target.value)}
                    className="h-96 font-mono"
                    placeholder={
                      extractedText ? "" : "Extracted text will appear here..."
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default ImageTextExtractor;
