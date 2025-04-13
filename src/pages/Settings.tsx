
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useCredentials } from "@/contexts/CredentialsContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, KeyRound, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Settings = () => {
  const { credentials, setCredential } = useCredentials();
  const { toast } = useToast();
  
  const [formState, setFormState] = useState({
    openaiApiKey: credentials.openaiApiKey || "",
    googleApiKey: credentials.googleApiKey || "",
    googleSheetId: credentials.googleSheetId || "",
    bloggerBlogId: credentials.bloggerBlogId || "",
    leonardoApiKey: credentials.leonardoApiKey || "",
    geminiApiKey: credentials.geminiApiKey || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveSettings = (section: string) => {
    switch (section) {
      case "ai":
        setCredential("openaiApiKey", formState.openaiApiKey);
        setCredential("geminiApiKey", formState.geminiApiKey);
        setCredential("leonardoApiKey", formState.leonardoApiKey);
        break;
      case "google":
        setCredential("googleApiKey", formState.googleApiKey);
        setCredential("googleSheetId", formState.googleSheetId);
        setCredential("bloggerBlogId", formState.bloggerBlogId);
        break;
    }
    
    toast({
      title: "Settings saved",
      description: `Your ${section} settings have been saved successfully.`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="ai" className="w-full">
        <TabsList>
          <TabsTrigger value="ai">AI Services</TabsTrigger>
          <TabsTrigger value="google">Google Services</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ai" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Services Configuration</CardTitle>
              <CardDescription>
                Configure your API keys for various AI services used in content generation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
                <Input
                  id="openaiApiKey"
                  name="openaiApiKey"
                  type="password"
                  placeholder="sk-..."
                  value={formState.openaiApiKey}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="geminiApiKey">Google Gemini API Key</Label>
                <Input
                  id="geminiApiKey"
                  name="geminiApiKey"
                  type="password"
                  placeholder="YOUR_GEMINI_API_KEY"
                  value={formState.geminiApiKey}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="leonardoApiKey">Leonardo.AI API Key</Label>
                <Input
                  id="leonardoApiKey"
                  name="leonardoApiKey"
                  type="password"
                  placeholder="YOUR_LEONARDO_API_KEY"
                  value={formState.leonardoApiKey}
                  onChange={handleChange}
                />
              </div>
              
              <div className="flex items-center mt-4 p-3 rounded-md bg-muted/50">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                <p className="text-sm text-muted-foreground">
                  Your API keys are stored securely. Never share them with anyone.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => saveSettings("ai")}>
                <Save className="mr-2 h-4 w-4" />
                Save AI Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="google" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Google Services Configuration</CardTitle>
              <CardDescription>
                Configure your Google API keys and service IDs for Sheets and Blogger.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="googleApiKey">Google API Key</Label>
                <Input
                  id="googleApiKey"
                  name="googleApiKey"
                  type="password"
                  placeholder="YOUR_GOOGLE_API_KEY"
                  value={formState.googleApiKey}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="googleSheetId">Google Sheet ID</Label>
                <Input
                  id="googleSheetId"
                  name="googleSheetId"
                  placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                  value={formState.googleSheetId}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground">
                  Found in your Google Sheet URL: https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bloggerBlogId">Blogger Blog ID</Label>
                <Input
                  id="bloggerBlogId"
                  name="bloggerBlogId"
                  placeholder="7986898544778043316"
                  value={formState.bloggerBlogId}
                  onChange={handleChange}
                />
                <p className="text-xs text-muted-foreground">
                  Found in your Blogger dashboard under "Settings"
                </p>
              </div>
              
              <div className="flex items-center mt-4 p-3 rounded-md bg-muted/50">
                <KeyRound className="h-5 w-5 text-amber-500 mr-2" />
                <p className="text-sm text-muted-foreground">
                  Make sure your Google API key has the necessary permissions for Sheets and Blogger APIs.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => saveSettings("google")}>
                <Save className="mr-2 h-4 w-4" />
                Save Google Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Settings;
