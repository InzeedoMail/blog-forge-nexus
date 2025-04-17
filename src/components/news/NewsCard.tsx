
import React, { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Flag, Pin, Globe, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { NewsItem } from "@/types/news";

export interface NewsCardProps {
  item: NewsItem;
  onTranslate: (text: string) => Promise<string>;
  selectedLanguage: string;
  onPin: (item: NewsItem) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  item,
  onTranslate,
  selectedLanguage,
  onPin,
}) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedTitle, setTranslatedTitle] = useState<string | null>(null);
  const [translatedDescription, setTranslatedDescription] = useState<string | null>(null);
  const [showFullContent, setShowFullContent] = useState(false);

  const handleTranslate = async () => {
    if (isTranslating) return;
    
    setIsTranslating(true);
    
    try {
      if (!translatedTitle && item.title) {
        const result = await onTranslate(item.title);
        setTranslatedTitle(result);
      }
      
      if (!translatedDescription && item.description) {
        const result = await onTranslate(item.description);
        setTranslatedDescription(result);
      }
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  const formattedDate = item.publishedAt 
    ? format(new Date(item.publishedAt), 'MMM dd, yyyy')
    : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      layout
    >
      <Card className="h-full flex flex-col overflow-hidden relative group hover:shadow-lg transition-all duration-300">
        {item.pinned && (
          <div className="absolute top-0 right-0 p-2 z-10">
            <Badge className="bg-primary/80 text-white">Pinned</Badge>
          </div>
        )}
        
        {item.urlToImage && (
          <div className="relative w-full h-40 overflow-hidden">
            <img 
              src={item.urlToImage} 
              alt={item.title || "News image"} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.svg";
              }}
            />
            <div className="absolute bottom-0 left-0 p-1">
              <Badge variant="outline" className="bg-background/70 text-foreground backdrop-blur-sm">
                {item.source.name}
              </Badge>
            </div>
          </div>
        )}
        
        <CardContent className="flex-grow p-4 pt-5 space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Calendar className="w-3 h-3" />
            <span>{formattedDate}</span>
          </div>
          
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">
            {translatedTitle || item.title}
          </h3>
          
          {(translatedDescription || item.description) && (
            <p className={`text-muted-foreground text-sm ${showFullContent ? "" : "line-clamp-3"}`}>
              {translatedDescription || item.description}
            </p>
          )}
          
          {((translatedDescription || item.description) && (translatedDescription || item.description)?.length > 150) && (
            <Button variant="link" size="sm" onClick={() => setShowFullContent(!showFullContent)} className="p-0 h-auto">
              {showFullContent ? "Show less" : "Read more"}
            </Button>
          )}
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => window.open(item.url || item.link, '_blank')}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Read
          </Button>
          
          {selectedLanguage !== "en" && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={handleTranslate}
              disabled={isTranslating || (!!translatedTitle && !!translatedDescription)}
            >
              <Globe className="mr-2 h-4 w-4" />
              {isTranslating ? "Translating..." : translatedTitle && translatedDescription ? "Translated" : "Translate"}
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onPin(item)}
            className={item.pinned ? "text-primary" : ""}
          >
            <Pin className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
