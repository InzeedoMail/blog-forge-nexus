
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useCredentials } from "@/contexts/CredentialsContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { 
  FileSpreadsheet, 
  Loader2, 
  ExternalLink,
  Key,
  Copy,
  CheckCircle2,
  Info,
  PlusCircle
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GoogleSheets = () => {
  const { credentials, setCredential } = useCredentials();
  const { toast } = useToast();
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [googleApiKey, setGoogleApiKey] = useState(credentials.googleApiKey || "");
  const [googleSheetId, setGoogleSheetId] = useState(credentials.googleSheetId || "");
  const [activeTab, setActiveTab] = useState<string>("setup");
  
  const handleSaveSettings = () => {
    if (googleApiKey) {
      setCredential("googleApiKey", googleApiKey);
    }
    
    if (googleSheetId) {
      setCredential("googleSheetId", googleSheetId);
    }
    
    toast({
      title: "Google Sheets settings saved",
      description: "Your Google Sheets configuration has been updated.",
    });
  };
  
  const verifyConnection = async () => {
    if (!googleApiKey || !googleSheetId) {
      toast({
        title: "Missing credentials",
        description: "Please enter both Google API key and Sheet ID.",
        variant: "destructive",
      });
      return;
    }
    
    setIsVerifying(true);
    
    try {
      // Import using dynamic import to avoid issues
      const { GoogleServiceFactory } = await import("@/services/serviceFactory");
      
      const googleFactory = new GoogleServiceFactory(googleApiKey, googleSheetId);
      const sheetsService = googleFactory.getGoogleSheetsService();
      
      // Just fetch posts to verify connection
      await sheetsService.getAllPosts();
      
      toast({
        title: "Connection successful",
        description: "Successfully connected to your Google Sheet.",
      });
      
      // Save credentials if verification was successful
      setCredential("googleApiKey", googleApiKey);
      setCredential("googleSheetId", googleSheetId);
      
    } catch (error) {
      console.error("Error verifying Google Sheets connection:", error);
      toast({
        title: "Connection failed",
        description: error instanceof Error ? error.message : "Unable to connect to Google Sheets. Check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };
  
  const generateSheetTemplate = () => {
    const templateUrl = `https://docs.google.com/spreadsheets/d/1-8Kq1IujfHCR-Fjd3asbj8m7h2Wa9zQCgnC8_aOtX3g/template/preview`;
    window.open(templateUrl, '_blank');
    toast({
      title: "Template opened",
      description: "Google Sheets template has been opened in a new tab. Click 'Use Template' to create your own copy.",
    });
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Value has been copied to your clipboard.",
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
        <h1 className="text-3xl font-bold">Google Sheets Integration</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Google Sheets Configuration
          </CardTitle>
          <CardDescription>
            Connect your Google Sheet to store and manage your content history.
          </CardDescription>
        </CardHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <CardContent>
            <TabsList className="mb-4">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger value="usage">Usage</TabsTrigger>
              <TabsTrigger value="help">Help</TabsTrigger>
            </TabsList>
            
            <TabsContent value="setup">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="googleApiKey" className="text-sm font-medium">
                    Google API Key
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="googleApiKey"
                      type="password"
                      value={googleApiKey}
                      onChange={(e) => setGoogleApiKey(e.target.value)}
                      placeholder="Enter your Google API Key"
                      className="flex-1"
                    />
                    {googleApiKey && (
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => copyToClipboard(googleApiKey)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Get a Google API key with Google Sheets API enabled.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="googleSheetId" className="text-sm font-medium">
                    Google Sheet ID
                  </label>
                  <div className="flex gap-2">
                    <Input
                      id="googleSheetId"
                      value={googleSheetId}
                      onChange={(e) => setGoogleSheetId(e.target.value)}
                      placeholder="Enter your Google Sheet ID"
                      className="flex-1"
                    />
                    {googleSheetId && (
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => copyToClipboard(googleSheetId)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Find this in your Google Sheet URL: https://docs.google.com/spreadsheets/d/
                    <span className="font-bold">THIS_IS_YOUR_SHEET_ID</span>/edit
                  </p>
                </div>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Sheet Requirements</AlertTitle>
                  <AlertDescription>
                    Your Google Sheet must have a sheet named "Posts" with these headers:
                    Title, Body, ImageUrl, Tags, Date, Status
                  </AlertDescription>
                </Alert>
                
                <div className="flex gap-2">
                  <Button onClick={generateSheetTemplate} variant="outline">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Sheet Template
                  </Button>
                  <Button onClick={verifyConnection} disabled={isVerifying || !googleApiKey || !googleSheetId}>
                    {isVerifying ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Verify Connection
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="usage">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">How to Use Google Sheets Integration</h3>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li>Create a Google Sheet using our template or with columns: Title, Body, ImageUrl, Tags, Date, Status</li>
                    <li>Get your Google API key with Google Sheets API enabled</li>
                    <li>Enter your API key and Sheet ID in the setup tab</li>
                    <li>Verify the connection to make sure everything works</li>
                    <li>Once connected, all your content will be automatically saved to the sheet</li>
                  </ol>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Capabilities</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Automatically save generated content to your sheet</li>
                    <li>View content history in the History page</li>
                    <li>Track SEO keywords and content metadata</li>
                    <li>Export content in HTML format for your website</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="help">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">How to Get a Google API Key</h3>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Go to the <a href="https://console.cloud.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Google Cloud Console</a></li>
                    <li>Create a new project or select an existing one</li>
                    <li>Go to "APIs & Services" > "Library"</li>
                    <li>Search for and enable "Google Sheets API"</li>
                    <li>Go to "APIs & Services" > "Credentials"</li>
                    <li>Click "Create Credentials" > "API key"</li>
                    <li>Copy the generated API key</li>
                    <li>For security, restrict the API key to Google Sheets API only</li>
                  </ol>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Troubleshooting</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Access Denied errors:</strong> Make sure your Google Sheet is public or shared with "Anyone with the link"</li>
                    <li><strong>API Key errors:</strong> Ensure the Google Sheets API is enabled for your API key</li>
                    <li><strong>Sheet not found:</strong> Verify your Sheet ID is correct</li>
                    <li><strong>Data not saving:</strong> Check that your sheet has the required columns</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
        
        <CardFooter className="flex justify-between border-t pt-4">
          {credentials.googleApiKey && credentials.googleSheetId ? (
            <div className="flex items-center text-sm text-green-500">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Connection configured
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">
              Enter your credentials to connect
            </div>
          )}
          
          <div className="flex gap-2">
            {(googleApiKey !== credentials.googleApiKey || googleSheetId !== credentials.googleSheetId) && (
              <Button onClick={handleSaveSettings}>
                Save Settings
              </Button>
            )}
            
            {credentials.googleSheetId && (
              <Button variant="outline" onClick={() => window.open(`https://docs.google.com/spreadsheets/d/${credentials.googleSheetId}`, '_blank')}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Sheet
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default GoogleSheets;
