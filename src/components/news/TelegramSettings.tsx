
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SendHorizontal, Bot, AlertTriangle } from "lucide-react";
import { TelegramNotification } from "@/types/news";

export interface TelegramSettingsProps {
  onSave: (settings: TelegramNotification) => Promise<void>;
}

export const TelegramSettings: React.FC<TelegramSettingsProps> = ({ onSave }) => {
  const [enabled, setEnabled] = useState(false);
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('telegramNotificationSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings) as TelegramNotification;
        setEnabled(parsedSettings.enabled || false);
        setBotToken(parsedSettings.botToken || "");
        setChatId(parsedSettings.chatId || "");
        setKeywords(parsedSettings.keywords || []);
      } catch (error) {
        console.error("Error loading Telegram settings:", error);
      }
    }
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const settings: TelegramNotification = {
        enabled,
        botToken,
        chatId,
        keywords,
      };

      await onSave(settings);
      setIsSaving(false);
    } catch (error) {
      console.error("Error saving Telegram settings:", error);
      setError("Failed to save settings. Please try again.");
      setIsSaving(false);
    }
  };

  const handleAddKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <Bot className="mr-2 h-5 w-5" />
          Telegram Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label htmlFor="telegram-notifications" className="font-medium">Enable Notifications</Label>
            <p className="text-sm text-muted-foreground">Get notified about new articles on Telegram</p>
          </div>
          <Switch
            id="telegram-notifications"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>

        {enabled && (
          <>
            <div className="space-y-2">
              <Label htmlFor="bot-token">Bot Token</Label>
              <Input
                id="bot-token"
                type="password"
                placeholder="123456789:ABCdefGHIjklMNoPQRsTUvwxYZ"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="chat-id">Chat ID</Label>
              <Input
                id="chat-id"
                placeholder="12345678"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Notification Keywords</Label>
              <div className="flex gap-2">
                <Input
                  id="keywords"
                  placeholder="Add keywords for notifications"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddKeyword();
                    }
                  }}
                />
                <Button type="button" onClick={handleAddKeyword} variant="outline">Add</Button>
              </div>
              
              <div className="flex flex-wrap gap-1 mt-2">
                {keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => handleRemoveKeyword(keyword)}>
                    {keyword} ×
                  </Badge>
                ))}
                {keywords.length === 0 && (
                  <p className="text-sm text-muted-foreground">No keywords added</p>
                )}
              </div>
            </div>

            {error && (
              <div className="flex items-center text-red-500 text-sm">
                <AlertTriangle className="h-4 w-4 mr-1" />
                {error}
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSaveSettings} 
          disabled={isSaving || (!enabled && !botToken && !chatId && keywords.length === 0)}
          className="w-full"
        >
          <SendHorizontal className="mr-2 h-4 w-4" />
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </CardFooter>
    </Card>
  );
};
