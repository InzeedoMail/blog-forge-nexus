
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NewsItem } from "@/types/news";
import { useToast } from "@/hooks/use-toast";

interface NewsCardProps {
  item: NewsItem;
  onTranslate: (text: string) => Promise<string>;
  selectedLanguage: string;
}

export const NewsCard = ({ item, onTranslate, selectedLanguage }: NewsCardProps) => {
  const [translatedTitle, setTranslatedTitle] = useState(item.title);
  const [translatedDescription, setTranslatedDescription] = useState(item.description);
  const { toast } = useToast();

  useEffect(() => {
    setTranslatedTitle(item.title);
    setTranslatedDescription(item.description);
  }, [item, selectedLanguage]);

  const handleTranslateClick = async () => {
    try {
      const newTitle = await onTranslate(item.title);
      const newDesc = await onTranslate(item.description);
      setTranslatedTitle(newTitle);
      setTranslatedDescription(newDesc);
    } catch (error) {
      toast({
        title: "Translation Error",
        description: "Failed to translate the text. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-lg">{translatedTitle}</CardTitle>
        <CardDescription>
          {item.source} - {item.pubDate}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{translatedDescription}</p>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" asChild>
            <a href={item.link} target="_blank" rel="noopener noreferrer">
              Read More
            </a>
          </Button>
          <Button onClick={handleTranslateClick}>Translate</Button>
        </div>
      </CardContent>
    </Card>
  );
};
