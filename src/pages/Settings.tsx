import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useCredentials } from "@/contexts/CredentialsContext";

const Settings = () => {
  const { toast } = useToast();
  const { credentials, setCredential } = useCredentials();

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      {/* OPENAI API KEY */}
      <div className="bg-white dark:bg-background p-6 rounded-lg shadow space-y-2 border">
        <div className="font-semibold text-xl">OpenAI API Key</div>
        <div className="text-muted-foreground text-sm">
          Provide your OpenAI API key to enable all AI-powered features.
        </div>
        <Input
          type="text"
          value={credentials.openaiApiKey || ""}
          onChange={(e) => setCredential("openaiApiKey", e.target.value)}
          placeholder="Enter your OpenAI API key"
        />
      </div>

      {/* GOOGLE API KEY */}
      <div className="bg-white dark:bg-background p-6 rounded-lg shadow space-y-2 border">
        <div className="font-semibold text-xl">Google API Key</div>
        <div className="text-muted-foreground text-sm">
          Provide your Google API key to enable Google services.
        </div>
        <Input
          type="text"
          value={credentials.googleApiKey || ""}
          onChange={(e) => setCredential("googleApiKey", e.target.value)}
          placeholder="Enter your Google API key"
        />
      </div>

      {/* GOOGLE SHEET ID */}
      <div className="bg-white dark:bg-background p-6 rounded-lg shadow space-y-2 border">
        <div className="font-semibold text-xl">Google Sheet ID</div>
        <div className="text-muted-foreground text-sm">
          Enter your Google Sheet ID to connect to your spreadsheet.
        </div>
        <Input
          type="text"
          value={credentials.googleSheetId || ""}
          onChange={(e) => setCredential("googleSheetId", e.target.value)}
          placeholder="Enter your Google Sheet ID"
        />
      </div>

      {/* BLOGGER BLOG ID */}
      <div className="bg-white dark:bg-background p-6 rounded-lg shadow space-y-2 border">
        <div className="font-semibold text-xl">Blogger Blog ID</div>
        <div className="text-muted-foreground text-sm">
          Enter your Blogger Blog ID to connect to your blog.
        </div>
        <Input
          type="text"
          value={credentials.bloggerBlogId || ""}
          onChange={(e) => setCredential("bloggerBlogId", e.target.value)}
          placeholder="Enter your Blogger Blog ID"
        />
      </div>

      {/* LEONARDO API KEY */}
      <div className="bg-white dark:bg-background p-6 rounded-lg shadow space-y-2 border">
        <div className="font-semibold text-xl">Leonardo AI API Key</div>
        <div className="text-muted-foreground text-sm">
          Provide your Leonardo AI API key to enable image generation features.
        </div>
        <Input
          type="text"
          value={credentials.leonardoApiKey || ""}
          onChange={(e) => setCredential("leonardoApiKey", e.target.value)}
          placeholder="Enter your Leonardo AI API key"
        />
      </div>

      {/* GEMINI API KEY */}
      <div className="bg-white dark:bg-background p-6 rounded-lg shadow space-y-2 border">
        <div className="font-semibold text-xl">Gemini AI API Key</div>
        <div className="text-muted-foreground text-sm">
          Provide your Gemini AI API key to enable Gemini-powered features.
        </div>
        <Input
          type="text"
          value={credentials.geminiApiKey || ""}
          onChange={(e) => setCredential("geminiApiKey", e.target.value)}
          placeholder="Enter your Gemini AI API key"
        />
      </div>

      {/* NEWS API KEY */}
      <div className="bg-white dark:bg-background p-6 rounded-lg shadow space-y-2 border">
        <div className="font-semibold text-xl">News API Key</div>
        <div className="text-muted-foreground text-sm">
          Provide your NewsAPI.org key. This enables fetching news in the News section.
        </div>
        <Input
          type="text"
          value={credentials.newsApikey || ""} // fixed: correct property
          onChange={e => setCredential("newsApikey", e.target.value)}
          placeholder="Enter your NewsAPI API key"
        />
      </div>

      {/* FACEBOOK section */}
      <div className="bg-white dark:bg-background p-6 rounded-lg shadow space-y-2 border">
        <div className="font-semibold text-xl">Facebook Graph API Credentials</div>
        <div className="text-muted-foreground text-sm">
          Enter your Facebook API Key (User Access Token) and the Page IDs you wish to monitor (comma separated).
        </div>
        <Input
          type="text"
          value={credentials.facebookApiKey || ""}
          onChange={e => setCredential("facebookApiKey", e.target.value)}
          placeholder="Enter Facebook API User Access Token"
          className="mb-2"
        />
        <Input
          type="text"
          value={credentials.facebookPageIds || ""}
          onChange={e => setCredential("facebookPageIds", e.target.value)}
          placeholder="Enter comma separated Facebook Page IDs"
        />
        <div className="text-xs text-muted-foreground">
          You can get your long-lived Page Access Token from Facebook Developers dashboard.
        </div>
      </div>
    </div>
  );
};

export default Settings;
