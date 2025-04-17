
import React, { useState, useEffect, FormEvent } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertCircle,
  CheckCircle,
  Plus,
  Save,
  Trash2,
  X
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { NewsCategories } from '@/types/news';

interface TelegramSettings {
  telegramChatId: string;
  notifyOnKeywords: string[];
  notifyOnCategories: string[];
}

interface TelegramSettingsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  settings: TelegramSettings;
  onSaveSettings: (settings: TelegramSettings) => void;
}

export const TelegramSettings: React.FC<TelegramSettingsProps> = ({
  isOpen,
  onOpenChange,
  settings,
  onSaveSettings,
}) => {
  const [telegramChatId, setTelegramChatId] = useState(settings.telegramChatId);
  const [notifyOnKeywords, setNotifyOnKeywords] = useState<string[]>(settings.notifyOnKeywords || []);
  const [notifyOnCategories, setNotifyOnCategories] = useState<string[]>(settings.notifyOnCategories || []);
  const [newKeyword, setNewKeyword] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    setTelegramChatId(settings.telegramChatId);
    setNotifyOnKeywords(settings.notifyOnKeywords || []);
    setNotifyOnCategories(settings.notifyOnCategories || []);
  }, [settings, isOpen]);

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !notifyOnKeywords.includes(newKeyword.trim())) {
      setNotifyOnKeywords([...notifyOnKeywords, newKeyword.trim()]);
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setNotifyOnKeywords(notifyOnKeywords.filter(k => k !== keyword));
  };

  const toggleCategory = (category: string) => {
    if (notifyOnCategories.includes(category)) {
      setNotifyOnCategories(notifyOnCategories.filter(c => c !== category));
    } else {
      setNotifyOnCategories([...notifyOnCategories, category]);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const newSettings: TelegramSettings = {
      telegramChatId,
      notifyOnKeywords,
      notifyOnCategories
    };
    
    onSaveSettings(newSettings);
    
    toast({
      title: "Settings saved",
      description: "Your Telegram notification settings have been updated.",
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <SheetHeader>
            <SheetTitle>Telegram Notifications</SheetTitle>
            <SheetDescription>
              Configure when you want to receive news updates via Telegram.
            </SheetDescription>
          </SheetHeader>
          
          <div className="grid gap-6 py-6">
            <div className="grid gap-2">
              <Label htmlFor="chatId">Telegram Chat ID</Label>
              <div className="flex gap-2">
                <Input
                  id="chatId"
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  placeholder="Enter your Telegram Chat ID"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                You can get your Chat ID from @userinfobot on Telegram.
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label>Notify me about keywords</Label>
              <div className="flex gap-2">
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="Enter keyword"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddKeyword();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon"
                  onClick={handleAddKeyword}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {notifyOnKeywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {notifyOnKeywords.map((keyword) => (
                    <Badge key={keyword} variant="secondary" className="px-2 py-1">
                      {keyword}
                      <X
                        className="ml-1 h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveKeyword(keyword)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            
            <div className="grid gap-2">
              <Label>Notify me about categories</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(NewsCategories).map(([key, label]) => (
                  <Badge
                    key={key}
                    variant={notifyOnCategories.includes(key) ? "default" : "outline"}
                    className="px-3 py-1 cursor-pointer"
                    onClick={() => toggleCategory(key)}
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          
          <SheetFooter>
            <SheetClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </SheetClose>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
};
