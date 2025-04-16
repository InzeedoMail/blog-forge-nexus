
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TelegramNotification } from '@/types/news';
import { useToast } from "@/hooks/use-toast";

interface TelegramSettingsProps {
  onSave: (settings: TelegramNotification) => void;
}

export const TelegramSettings = ({ onSave }: TelegramSettingsProps) => {
  const [chatId, setChatId] = useState('');
  const [keywords, setKeywords] = useState('');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatId) {
      toast({
        title: "Error",
        description: "Please enter your Telegram chat ID",
        variant: "destructive",
      });
      return;
    }

    onSave({
      chatId,
      keywords: keywords.split(',').map(k => k.trim()),
      categories: [],
    });

    toast({
      title: "Success",
      description: "Telegram notifications settings saved",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-accent/20 rounded-lg">
      <div>
        <label htmlFor="chatId" className="block text-sm font-medium mb-1">
          Telegram Chat ID
        </label>
        <Input
          id="chatId"
          value={chatId}
          onChange={(e) => setChatId(e.target.value)}
          placeholder="Enter your Telegram chat ID"
        />
      </div>
      <div>
        <label htmlFor="keywords" className="block text-sm font-medium mb-1">
          Keywords (comma-separated)
        </label>
        <Input
          id="keywords"
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="news, technology, update"
        />
      </div>
      <Button type="submit">Save Telegram Settings</Button>
    </form>
  );
};
