
import React, { useState, useTransition } from 'react';
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
import { Badge } from "@/components/ui/badge";
import { Pin, Bookmark, Share2, ExternalLink, Tag, Calendar, Globe } from 'lucide-react';

interface NewsCardProps {
  item: NewsItem;
  onTranslate: (text: string) => Promise<string>;
  selectedLanguage: string;
  onPin: (item: NewsItem) => void;
}

export const NewsCard = ({ item, onTranslate, selectedLanguage, onPin }: NewsCardProps) => {
  const [translatedTitle, setTranslatedTitle] = useState(item.title);
  const [translatedDescription, setTranslatedDescription] = useState(item.description);
  const [isTranslating, startTransition] = useTransition();
  const { toast } = useToast();
  const [isExpanded, setIsExpanded] = useState(false);

  // Format date to be more readable
  const formattedDate = () => {
    try {
      const date = new Date(item.pubDate);
      return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return item.pubDate;
    }
  };

  const handleTranslateClick = () => {
    if (isTranslating) return;
    
    startTransition(async () => {
      try {
        const newTitle = await onTranslate(item.title);
        const newDesc = await onTranslate(item.description);
        setTranslatedTitle(newTitle);
        setTranslatedDescription(newDesc);
        toast({
          title: "Translation Complete",
          description: `Content translated to ${
            selectedLanguage === 'en' ? 'English' :
            selectedLanguage === 'es' ? 'Spanish' :
            selectedLanguage === 'fr' ? 'French' : 
            selectedLanguage === 'ar' ? 'Arabic' :
            selectedLanguage === 'ta' ? 'Tamil' : 
            selectedLanguage === 'si' ? 'Sinhala' : 
            selectedLanguage
          }`,
        });
      } catch (error) {
        console.error("Translation error:", error);
        toast({
          title: "Translation Failed",
          description: "Could not translate the content. Please try again later.",
          variant: "destructive",
        });
      }
    });
  };

  const handleShareClick = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: item.title,
          text: item.description,
          url: item.link,
        });
      } else {
        await navigator.clipboard.writeText(item.link);
        toast({
          title: "Link Copied",
          description: "Article link copied to clipboard",
        });
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  return (
    <Card className={`h-full flex flex-col transition-all duration-300 hover:shadow-md ${
      item.pinned ? 'border-primary border-2' : ''
    }`}>
      {item.imageUrl && (
        <div className="relative w-full h-40 overflow-hidden rounded-t-lg">
          <img 
            src={item.imageUrl || 'https://via.placeholder.com/400x200?text=No+Image'} 
            alt={item.title} 
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).onerror = null;
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=No+Image';
            }}
          />
          <div className="absolute top-2 right-2">
            <Button
              variant={item.pinned ? "default" : "outline"}
              size="icon"
              onClick={() => onPin(item)}
              className={`rounded-full bg-background/80 hover:bg-background ${
                item.pinned ? 'text-background bg-primary' : 'text-muted-foreground'
              }`}
            >
              <Pin className={`h-4 w-4 ${item.pinned ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>
      )}
      
      <CardHeader className={!item.imageUrl ? "rounded-t-lg" : ""}>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Badge variant="outline" className="px-1.5 py-0">
            <Calendar className="h-3 w-3 mr-1" />
            {formattedDate()}
          </Badge>
          {item.source && (
            <Badge variant="secondary" className="px-1.5 py-0">
              {item.source}
            </Badge>
          )}
        </div>
        
        <CardTitle className="text-base sm:text-lg line-clamp-2">
          {translatedTitle}
        </CardTitle>
        
        {item.keywords && item.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1.5">
            {item.keywords.slice(0, 3).map((keyword, idx) => (
              <Badge key={idx} variant="outline" className="text-xs px-1 py-0 bg-accent/10">
                {keyword}
              </Badge>
            ))}
            {item.keywords.length > 3 && (
              <Badge variant="outline" className="text-xs px-1 py-0">
                +{item.keywords.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="flex-grow flex flex-col justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            {isExpanded ? translatedDescription : truncateText(translatedDescription, 150)}
            {translatedDescription && translatedDescription.length > 150 && (
              <Button 
                variant="link" 
                className="p-0 h-auto text-xs"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </Button>
            )}
          </p>
          
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 my-2">
              <Tag className="h-3 w-3 text-muted-foreground" />
              {item.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-secondary/5 px-1.5 py-0">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <Button variant="outline" size="sm" className="flex-grow" asChild>
            <a href={item.link} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              Read
            </a>
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleTranslateClick} 
            disabled={isTranslating} 
            className="flex-grow"
          >
            <Globe className="h-3.5 w-3.5 mr-1" />
            {isTranslating ? 'Translating...' : 'Translate'}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleShareClick} 
            className="flex-grow"
          >
            <Share2 className="h-3.5 w-3.5 mr-1" />
            Share
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onPin(item)} 
            className={`${item.pinned ? 'text-primary' : ''}`}
            title={item.pinned ? 'Unpin article' : 'Pin article'}
          >
            <Bookmark className={`h-3.5 w-3.5 ${item.pinned ? 'fill-primary' : ''}`} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
