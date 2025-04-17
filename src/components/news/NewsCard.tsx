
import React, { useState, useTransition } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, ExternalLink, Bookmark, BookmarkCheck } from 'lucide-react';
import { motion } from "framer-motion";
import { format, parseISO } from 'date-fns';
import { Article } from '@/types/news';
import { Link } from 'react-router-dom';
import { Skeleton } from "@/components/ui/skeleton";

interface NewsCardProps {
  article: Article;
  isPinned: boolean;
  onPin: (article: Article) => void;
  translatedTitle?: string | null;
  translatedDescription?: string | null;
  isTranslating?: boolean;
  index?: number;
}

export const NewsCard = ({
  article,
  isPinned,
  onPin,
  translatedTitle,
  translatedDescription,
  isTranslating,
  index = 0
}: NewsCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isPending, startTransition] = useTransition();
  
  const handlePinClick = () => {
    // Use startTransition without async/await to fix the type error
    startTransition(() => {
      onPin(article);
    });
  };

  // Format the date in a readable format
  const formattedDate = article.publishedAt ? 
    format(parseISO(article.publishedAt), 'MMM dd, yyyy') : 
    'Date unavailable';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Card className="h-full flex flex-col overflow-hidden hover:shadow-md transition-shadow duration-300 border">
        <CardHeader className="p-4 pb-2 relative">
          <div className="absolute top-4 right-4 z-10">
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full ${isPinned ? 'text-primary' : 'text-muted-foreground'}`}
              onClick={handlePinClick}
              disabled={isPending}
            >
              {isPinned ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
            </Button>
          </div>
          <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
            {!imageLoaded && <Skeleton className="absolute inset-0 h-full w-full" />}
            {article.urlToImage ? (
              <img
                src={article.urlToImage}
                alt={article.title || "News image"}
                className={`h-full w-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageLoaded(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <span className="text-muted-foreground">No image available</span>
              </div>
            )}
          </div>
          <div className="mt-3 flex items-center space-x-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>{formattedDate}</span>
            {article.source?.name && (
              <>
                <span>•</span>
                <span>{article.source.name}</span>
              </>
            )}
          </div>
          <CardTitle className="mt-2 line-clamp-2 text-lg font-bold hover:text-primary">
            {isTranslating ? (
              <Skeleton className="h-6 w-full mb-1" />
            ) : translatedTitle || article.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-4 pt-0 flex-grow">
          <p className="line-clamp-3 text-sm text-muted-foreground">
            {isTranslating ? (
              <>
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-[80%]" />
              </>
            ) : translatedDescription || article.description || "No description available."}
          </p>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex flex-col items-start space-y-3">
          <div className="flex flex-wrap gap-2">
            {article.keywords && article.keywords.slice(0, 3).map((keyword, i) => (
              <Badge key={i} variant="secondary" className="px-2 py-0.5 text-xs font-normal">
                {keyword}
              </Badge>
            ))}
          </div>
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            Read more <ExternalLink className="ml-1 h-3.5 w-3.5" />
          </a>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
