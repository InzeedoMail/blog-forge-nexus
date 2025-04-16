
import React from 'react';
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
import { Pin, Share2, Tags } from 'lucide-react';

interface NewsCardProps {
  item: NewsItem;
  onTranslate: (text: string) => Promise<string>;
  selectedLanguage: string;
  onPin: (item: NewsItem) => void;
}

export const NewsCard = ({ item, onTranslate, selectedLanguage, onPin }: NewsCardProps) => {
  const [translatedTitle, setTranslatedTitle] = React.useState(item.title);
  const [translatedDescription, setTranslatedDescription] = React.useState(item.description);
  const { toast } = useToast();

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
    <Card className={`mb-4 transition-all ${item.pinned ? 'border-primary' : ''}`}>
      {item.imageUrl && (
        <img 
          src={item.imageUrl} 
          alt={item.title} 
          className="w-full h-48 object-cover rounded-t-lg"
        />
      )}
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{translatedTitle}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onPin(item)}
            className={`${item.pinned ? 'text-primary' : ''}`}
          >
            <Pin className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          {item.source} - {item.pubDate}
          {item.tags && item.tags.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              <Tags className="h-4 w-4" />
              {item.tags.map((tag, index) => (
                <span key={index} className="text-xs bg-accent/30 px-2 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{translatedDescription}</p>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" asChild>
            <a href={item.link} target="_blank" rel="noopener noreferrer">
              Read More
            </a>
          </Button>
          <Button onClick={handleTranslateClick}>Translate</Button>
          <Button variant="ghost" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
