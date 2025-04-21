// src/components/news/NewsCard.jsx
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Pin, ExternalLink, Languages } from "lucide-react";
import { format } from "date-fns";

export const NewsCard = ({ item, onTranslate, selectedLanguage, onPin }) => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedTitle, setTranslatedTitle] = useState("");
  const [translatedDescription, setTranslatedDescription] = useState("");

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM dd, yyyy • h:mm a");
    } catch (e) {
      return dateString;
    }
  };

  const handleTranslate = async () => {
    if (selectedLanguage === "en" || isTranslating) return;

    setIsTranslating(true);

    try {
      const translatedTitleText = await onTranslate(item.title);
      const translatedDescText = await onTranslate(item.description);

      setTranslatedTitle(translatedTitleText);
      setTranslatedDescription(translatedDescText);
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsTranslating(false);
    }
  };

  const isPinned = item.pinned;
  const title = translatedTitle || item.title;
  const description = translatedDescription || item.description;

  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow duration-200">
      {item.urlToImage && (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={item.urlToImage}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/600x400?text=No+Image";
            }}
          />
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => onPin(item)}
          >
            <Pin className={`h-4 w-4 ${isPinned ? "fill-primary" : ""}`} />
          </Button>
        </div>

        <div className="flex items-center text-xs text-gray-500 mt-1">
          <Calendar className="h-3 w-3 mr-1" />
          <span>{formatDate(item.publishedAt)}</span>
        </div>
      </CardHeader>

      <CardContent className="pb-2 flex-grow">
        <p className="text-sm text-gray-600 line-clamp-3">{description}</p>
      </CardContent>

      <CardFooter className="pt-0 flex flex-wrap justify-between gap-2">
        <div className="flex gap-1">
          {item.source?.name && (
            <Badge variant="outline" className="text-xs">
              {item.source.name}
            </Badge>
          )}
        </div>

        <div className="flex gap-2">
          {selectedLanguage !== "en" && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs"
              onClick={handleTranslate}
              disabled={isTranslating}
            >
              <Languages className="h-3 w-3 mr-1" />
              {isTranslating ? "Translating..." : "Translate"}
            </Button>
          )}

          <Button variant="outline" size="sm" className="h-8 text-xs" asChild>
            <a href={item.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3 mr-1" />
              Read
            </a>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
