
import React, { useState, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TelegramNotification, NewsCategories } from '@/types/news';
import { useToast } from "@/hooks/use-toast";
import { Info, Check, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TelegramSettingsProps {
  onSave: (settings: TelegramNotification) => void;
}

export const TelegramSettings = ({ onSave }: TelegramSettingsProps) => {
  const [chatId, setChatId] = useState('');
  const [keyword, setKeyword] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState<string>('');
  const { toast } = useToast();
  
  // Load saved settings on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('telegramNotificationSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings) as TelegramNotification;
        setChatId(settings.chatId);
        setKeywords(settings.keywords || []);
        setCategories(settings.categories || []);
      } catch (error) {
        console.error("Error loading saved settings:", error);
      }
    }
  }, []);

  const addKeyword = () => {
    if (keyword && !keywords.includes(keyword)) {
      setKeywords([...keywords, keyword]);
      setKeyword('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter(k => k !== keywordToRemove));
  };

  const addCategory = () => {
    if (category && !categories.includes(category)) {
      setCategories([...categories, category]);
      setCategory('');
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    setCategories(categories.filter(c => c !== categoryToRemove));
  };

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

    const settings = {
      chatId,
      keywords,
      categories,
    };

    onSave(settings);

    toast({
      title: "Success",
      description: "Telegram notifications settings saved",
      icon: <Check className="h-4 w-4" />,
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          Telegram Notifications
        </CardTitle>
        <CardDescription>
          Get notified when new articles match your keywords or categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="chatId" className="block text-sm font-medium mb-1">
              Telegram Chat ID <span className="text-destructive">*</span>
            </label>
            <div className="flex gap-2">
              <Input
                id="chatId"
                value={chatId}
                onChange={(e) => setChatId(e.target.value)}
                placeholder="Enter your Telegram chat ID"
              />
              <Button 
                variant="outline" 
                size="icon" 
                type="button" 
                title="How to get your chat ID"
                onClick={() => {
                  toast({
                    title: "Getting Your Telegram Chat ID",
                    description: "Send a message to @userinfobot on Telegram to get your chat ID",
                    duration: 5000,
                  });
                }}
              >
                <Info className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div>
            <label htmlFor="keywords" className="block text-sm font-medium mb-1">
              Keywords
            </label>
            <div className="flex gap-2">
              <Input
                id="keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Add keyword for notifications"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addKeyword();
                  }
                }}
              />
              <Button type="button" onClick={addKeyword} variant="secondary">Add</Button>
            </div>
            
            {keywords.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {keywords.map((k, i) => (
                  <Badge key={i} variant="outline" className="px-2 py-1">
                    {k}
                    <Trash 
                      className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={() => removeKeyword(k)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Categories
            </label>
            <div className="flex gap-2">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="flex-grow">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(NewsCategories).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button type="button" onClick={addCategory} variant="secondary">Add</Button>
            </div>
            
            {categories.length > 0 && (
              <div className="flex gap-2 mt-2 flex-wrap">
                {categories.map((c, i) => (
                  <Badge key={i} variant="outline" className="px-2 py-1">
                    {NewsCategories[c as keyof typeof NewsCategories]}
                    <Trash 
                      className="ml-1 h-3 w-3 cursor-pointer hover:text-destructive" 
                      onClick={() => removeCategory(c)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          <Button type="submit" className="w-full">Save Telegram Settings</Button>
        </form>
      </CardContent>
    </Card>
  );
};
