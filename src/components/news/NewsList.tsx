
import React from 'react';
import { NewsCard } from './NewsCard';
import { NewsItem } from '@/types/news';
import { TabsContent } from "@/components/ui/tabs";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface NewsListProps {
  category: string;
  news: NewsItem[] | undefined;
  isLoading: boolean;
  onTranslate: (text: string) => Promise<string>;
  selectedLanguage: string;
  onPinNews: (item: NewsItem) => void;
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
}

export const NewsList = ({ 
  category, 
  news, 
  isLoading, 
  onTranslate, 
  selectedLanguage,
  onPinNews,
  currentPage,
  onPageChange,
  totalPages
}: NewsListProps) => {
  if (isLoading) {
    return <p>Loading {category} news...</p>;
  }

  return (
    <TabsContent value={category}>
      <div className="space-y-4">
        {news?.map((item: NewsItem, index: number) => (
          <NewsCard 
            key={index} 
            item={item} 
            onTranslate={onTranslate}
            selectedLanguage={selectedLanguage}
            onPin={onPinNews}
          />
        ))}
      </div>
      
      <Pagination className="mt-8">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            />
          </PaginationItem>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => onPageChange(page)}
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext 
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </TabsContent>
  );
};
