import React, { useState } from "react";
import { motion } from "framer-motion";
import { useCredentials } from "@/contexts/CredentialsContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  KeyRound,
  Save,
  ExternalLink,
  FileText,
  FileSpreadsheet,
  PenTool,
  Languages,
  Webhook,
  Check,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Github,
  Figma,
  ArrowRight,
  Waves,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { Textarea } from "@/components/ui/textarea";

interface SupportedApp {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isConnected: boolean;
  authType: "api_key" | "oauth" | "webhook";
  category: "writing" | "social" | "design" | "content" | "other";
}

const Settings = () => {
  const { credentials, setCredential } = useCredentials();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [formState, setFormState] = useState({
    openaiApiKey: credentials.openaiApiKey || "",
    googleApiKey: credentials.googleApiKey || "",
    googleSheetId: credentials.googleSheetId || "",
    bloggerBlogId: credentials.bloggerBlogId || "",
    leonardoApiKey: credentials.leonardoApiKey || "",
    geminiApiKey: credentials.geminiApiKey || "",
    zapierWebhookUrl: "",
    perplexityApiKey: "",
    wordpressApiUrl: "",
    wordpressApiKey: "",
    mediumToken: "",
    embedHtml: "",
  });

  // App integration states
  const [renderHtml, setRenderHtml] = useState(true);
  const [autoSaveContent, setAutoSaveContent] = useState(false);
  const [defaultLanguage, setDefaultLanguage] = useState<"english" | "tamil">(
    "english"
  );

  // Define supported apps
  const supportedApps: SupportedApp[] = [
    {
      id: "openai",
      name: "OpenAI",
      description: "AI content generation and language models",
      icon: <PenTool className="h-5 w-5" />,
      isConnected: !!credentials.openaiApiKey,
      authType: "api_key",
      category: "writing",
    },
    {
      id: "google_sheets",
      name: "Google Sheets",
      description: "Store and manage content data",
      icon: <FileSpreadsheet className="h-5 w-5" />,
      isConnected: !!credentials.googleApiKey && !!credentials.googleSheetId,
      authType: "api_key",
      category: "content",
    },
    {
      id: "blogger",
      name: "Blogger",
      description: "Publish content to Blogger blogs",
      icon: <FileText className="h-5 w-5" />,
      isConnected: isAuthenticated && !!credentials.bloggerBlogId,
      authType: "oauth",
      category: "content",
    },
    {
      id: "gemini",
      name: "Google Gemini",
      description: "AI content generation using Google's models",
      icon: <Languages className="h-5 w-5" />,
      isConnected: !!credentials.geminiApiKey,
      authType: "api_key",
      category: "writing",
    },
    {
      id: "leonardo",
      name: "Leonardo.AI",
      description: "Generate images with Leonardo AI",
      icon: <PenTool className="h-5 w-5" />,
      isConnected: !!credentials.leonardoApiKey,
      authType: "api_key",
      category: "design",
    },
    {
      id: "zapier",
      name: "Zapier",
      description: "Connect to 3000+ apps via webhooks",
      icon: <Webhook className="h-5 w-5" />,
      isConnected: false,
      authType: "webhook",
      category: "other",
    },
    {
      id: "wordpress",
      name: "WordPress",
      description: "Publish to WordPress sites",
      icon: <FileText className="h-5 w-5" />,
      isConnected: false,
      authType: "api_key",
      category: "content",
    },
    {
      id: "medium",
      name: "Medium",
      description: "Publish articles to Medium",
      icon: <FileText className="h-5 w-5" />,
      isConnected: false,
      authType: "api_key",
      category: "content",
    },
    {
      id: "twitter",
      name: "Twitter/X",
      description: "Share content to Twitter/X",
      icon: <Twitter className="h-5 w-5" />,
      isConnected: false,
      authType: "oauth",
      category: "social",
    },
    {
      id: "instagram",
      name: "Instagram",
      description: "Share content to Instagram",
      icon: <Instagram className="h-5 w-5" />,
      isConnected: false,
      authType: "oauth",
      category: "social",
    },
    {
      id: "facebook",
      name: "Facebook",
      description: "Share content to Facebook",
      icon: <Facebook className="h-5 w-5" />,
      isConnected: false,
      authType: "oauth",
      category: "social",
    },
    {
      id: "linkedin",
      name: "LinkedIn",
      description: "Share content to LinkedIn",
      icon: <Linkedin className="h-5 w-5" />,
      isConnected: false,
      authType: "oauth",
      category: "social",
    },
  ];

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
      case "integration":
        // Save integration settings to localStorage
        localStorage.setItem(
          "contentSettings",
          JSON.stringify({
            renderHtml,
            autoSaveContent,
            defaultLanguage,
          })
        );
        break;
    }

    toast({
      title: "Settings saved",
      description: `Your ${section} settings have been saved successfully.`,
    });
  };

  const connectApp = (appId: string) => {
    // This would be expanded with actual connection logic
    toast({
      title: "Connect app",
      description: `Connection to ${appId} will be implemented soon.`,
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
        <TabsList className="mb-4">
          <TabsTrigger value="ai">AI Services</TabsTrigger>
          <TabsTrigger value="google">Google Services</TabsTrigger>
          <TabsTrigger value="integration">Integrations</TabsTrigger>
          <TabsTrigger value="content">Content Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Services Configuration</CardTitle>
              <CardDescription>
                Configure your API keys for various AI services used in content
                generation.
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
                  Your API keys are stored securely. Never share them with
                  anyone.
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
                Configure your Google API keys and service IDs for Sheets and
                Blogger.
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
                  Found in your Google Sheet URL:
                  https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit
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
                  Make sure your Google API key has the necessary permissions
                  for Sheets and Blogger APIs.
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

        <TabsContent value="integration" className="mt-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Connected Applications</CardTitle>
              <CardDescription>
                Connect various applications to enhance your content workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="writing">Writing</TabsTrigger>
                  <TabsTrigger value="content">Content</TabsTrigger>
                  <TabsTrigger value="social">Social</TabsTrigger>
                  <TabsTrigger value="design">Design</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {supportedApps.map((app) => (
                      <Card key={app.id} className="overflow-hidden">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="bg-muted rounded-md p-2">
                              {app.icon}
                            </div>
                            <div>
                              <p className="font-medium">{app.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {app.description}
                              </p>
                            </div>
                          </div>
                          <div>
                            {app.isConnected ? (
                              <Badge className="ml-2 bg-green-600">
                                <Check className="h-3 w-3 mr-1" /> Connected
                              </Badge>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => connectApp(app.id)}
                              >
                                Connect <ArrowRight className="ml-1 h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                {["writing", "content", "social", "design"].map((category) => (
                  <TabsContent
                    key={category}
                    value={category}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {supportedApps
                        .filter((app) => app.category === category)
                        .map((app) => (
                          <Card key={app.id} className="overflow-hidden">
                            <CardContent className="p-4 flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="bg-muted rounded-md p-2">
                                  {app.icon}
                                </div>
                                <div>
                                  <p className="font-medium">{app.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {app.description}
                                  </p>
                                </div>
                              </div>
                              <div>
                                {app.isConnected ? (
                                  <Badge className="ml-2 bg-green-600">
                                    <Check className="h-3 w-3 mr-1" /> Connected
                                  </Badge>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => connectApp(app.id)}
                                  >
                                    Connect{" "}
                                    <ArrowRight className="ml-1 h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sync Settings</CardTitle>
              <CardDescription>
                Configure how your content syncs across platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-Save Content</p>
                    <p className="text-sm text-muted-foreground">
                      Automatically save content to Google Sheets
                    </p>
                  </div>
                  <Switch
                    checked={autoSaveContent}
                    onCheckedChange={setAutoSaveContent}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Social Media Cross-Post</p>
                    <p className="text-sm text-muted-foreground">
                      Post to social media when publishing to blogs
                    </p>
                  </div>
                  <Switch disabled />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Zapier Integration</p>
                    <p className="text-sm text-muted-foreground">
                      Configure webhooks for Zapier automation
                    </p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Configure <ExternalLink className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => saveSettings("integration")}
                className="mr-2"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Sync Settings
              </Button>
              <Button variant="outline" disabled>
                <Waves className="mr-2 h-4 w-4" />
                Test Connections
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Creation Settings</CardTitle>
              <CardDescription>
                Customize your content creation experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Default Language</Label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="lang-english"
                      checked={defaultLanguage === "english"}
                      onChange={() => setDefaultLanguage("english")}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="lang-english">English</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="lang-tamil"
                      checked={defaultLanguage === "tamil"}
                      onChange={() => setDefaultLanguage("tamil")}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="lang-tamil">Tamil</Label>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Render HTML Output</p>
                  <p className="text-sm text-muted-foreground">
                    Display formatted HTML in content previews
                  </p>
                </div>
                <Switch checked={renderHtml} onCheckedChange={setRenderHtml} />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="embedHtml">Custom HTML/CSS for Content</Label>
                <Textarea
                  id="embedHtml"
                  name="embedHtml"
                  placeholder="<style>.custom-heading { color: blue; }</style>"
                  value={formState.embedHtml}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      embedHtml: e.target.value,
                    }))
                  }
                  rows={4}
                />
                <p className="text-sm text-muted-foreground">
                  Add custom HTML and CSS for exported content
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => saveSettings("content")}>
                <Save className="mr-2 h-4 w-4" />
                Save Content Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default Settings;
