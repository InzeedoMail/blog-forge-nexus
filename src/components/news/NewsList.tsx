
import React from 'react';
import { NewsCard } from './NewsCard';
import { NewsItem } from '@/types/news';
import { TabsContent } from "@/components/ui/tabs";

interface NewsListProps {
  category: string;
  news: NewsItem[] | undefined;
  isLoading: boolean;
  onTranslate: (text: string) => Promise<string>;
  selectedLanguage: string;
}

export const NewsList = ({ category, news, isLoading, onTranslate, selectedLanguage }: NewsListProps) => {
  if (isLoading) {
    return <p>Loading {category} news...</p>;
  }

  return (
    <TabsContent value={category}>
      {news?.map((item: NewsItem, index: number) => (
        <NewsCard 
          key={index} 
          item={item} 
          onTranslate={onTranslate}
          selectedLanguage={selectedLanguage}
        />
      ))}
    </TabsContent>
  );
};
