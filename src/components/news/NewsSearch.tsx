
import React, { useState, KeyboardEvent } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface NewsSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (keywords: string[]) => void;
}

export const NewsSearch = ({ value, onChange, onSearch }: NewsSearchProps) => {
  const [keywords, setKeywords] = useState<string[]>([]);
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && value.trim()) {
      addKeyword();
    }
  };
  
  const addKeyword = () => {
    if (value.trim() && !keywords.includes(value.trim())) {
      const newKeywords = [...keywords, value.trim()];
      setKeywords(newKeywords);
      onChange('');
      if (onSearch) {
        onSearch(newKeywords);
      }
    }
  };
  
  const removeKeyword = (keyword: string) => {
    const newKeywords = keywords.filter(k => k !== keyword);
    setKeywords(newKeywords);
    if (onSearch) {
      onSearch(newKeywords);
    }
  };
  
  const handleSearch = () => {
    if (value.trim()) {
      addKeyword();
    } else if (keywords.length > 0 && onSearch) {
      onSearch(keywords);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search news keywords..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-8 pr-4"
          />
        </div>
        <Button onClick={handleSearch} className="shrink-0">
          Search
        </Button>
      </div>
      
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {keywords.map((keyword, index) => (
            <Badge key={index} variant="secondary" className="px-3 py-1 text-sm">
              {keyword}
              <X 
                className="ml-2 h-3 w-3 cursor-pointer hover:text-destructive" 
                onClick={() => removeKeyword(keyword)} 
              />
            </Badge>
          ))}
          {keywords.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setKeywords([]);
                if (onSearch) onSearch([]);
              }}
              className="h-6 text-xs"
            >
              Clear All
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
