
import React from 'react';
import { NewsCard } from './NewsCard';
import { NewsItem } from '@/types/news';
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';

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
  const isMobile = useIsMobile();
  
  // Loading skeletons for news cards
  const LoadingSkeletons = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(6)].map((_, index) => (
        <div key={`skeleton-${index}`} className="flex flex-col space-y-3 bg-card rounded-lg p-4 border">
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex justify-between pt-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
  
  // Empty state when no news is available
  const EmptyState = () => (
    <div className="min-h-[200px] flex flex-col items-center justify-center bg-muted/20 rounded-lg p-6 text-center">
      <h3 className="text-lg font-medium mb-2">No news articles found</h3>
      <p className="text-muted-foreground">Try adjusting your search keywords or filters</p>
    </div>
  );
  
  if (isLoading) {
    return (
      <TabsContent value={category}>
        <LoadingSkeletons />
      </TabsContent>
    );
  }

  // Create pagination numbers with logic for responsive design
  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = isMobile ? 3 : 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <Button 
            variant={currentPage === i ? "default" : "outline"}
            size="icon"
            onClick={() => onPageChange(i)}
            className="w-10 h-10"
          >
            {i}
          </Button>
        </PaginationItem>
      );
    }
    return items;
  };

  return (
    <TabsContent value={category}>
      {!news || news.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item: NewsItem, index: number) => (
            <NewsCard 
              key={index} 
              item={item} 
              onTranslate={onTranslate}
              selectedLanguage={selectedLanguage}
              onPin={onPinNews}
            />
          ))}
        </div>
      )}
      
      {totalPages > 1 && (
        <Pagination className="my-8">
          <PaginationContent>
            <PaginationItem>
              <Button 
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                variant="outline"
                size="icon"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </PaginationItem>
            
            {getPaginationItems()}
            
            <PaginationItem>
              <Button 
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                variant="outline"
                size="icon"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </TabsContent>
  );
};
