// src/components/news/TelegramSettings.jsx
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Send, Plus } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const TelegramSettings = ({ onSave }) => {
  const [settings, setSettings] = useState({
    enabled: false,
    chatId: "",
    botToken: "",
    keywords: [],
    categories: [],
    frequency: "daily",
  });
  const [newKeyword, setNewKeyword] = useState("");
  const [expanded, setExpanded] = useState(false);

  // Load saved settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("telegramNotificationSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleToggle = () => {
    setSettings({ ...settings, enabled: !settings.enabled });
  };

  const handleInputChange = (e) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !settings.keywords.includes(newKeyword.trim())) {
      setSettings({
        ...settings,
        keywords: [...settings.keywords, newKeyword.trim()],
      });
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (keyword) => {
    setSettings({
      ...settings,
      keywords: settings.keywords.filter((k) => k !== keyword),
    });
  };

  const handleSave = () => {
    onSave(settings);
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Send className="h-4 w-4" />
            Telegram Notifications
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Hide" : "Configure"}
          </Button>
        </div>
        {!expanded && (
          <CardDescription>
            {settings.enabled
              ? "Notifications enabled"
              : "Notifications disabled"}
          </CardDescription>
        )}
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="telegram-enabled"
              checked={settings.enabled}
              onCheckedChange={handleToggle}
            />
            <Label htmlFor="telegram-enabled">Enable notifications</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telegram-bot-token">Bot Token</Label>
            <Input
              id="telegram-bot-token"
              name="botToken"
              value={settings.botToken}
              onChange={handleInputChange}
              placeholder="Enter your Telegram bot token"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telegram-chat-id">Chat ID</Label>
            <Input
              id="telegram-chat-id"
              name="chatId"
              value={settings.chatId}
              onChange={handleInputChange}
              placeholder="Enter your Telegram chat ID"
            />
          </div>

          <div className="space-y-2">
            <Label>Keywords</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {settings.keywords.map((keyword) => (
                <Badge key={keyword} variant="secondary">
                  {keyword}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-1 h-4 w-4 p-0"
                    onClick={() => handleRemoveKeyword(keyword)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="Add keyword"
                onKeyDown={(e) => e.key === "Enter" && handleAddKeyword()}
              />
              <Button size="sm" onClick={handleAddKeyword}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      )}

      {expanded && (
        <CardFooter>
          <Button onClick={handleSave} className="w-full">
            Save Settings
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
