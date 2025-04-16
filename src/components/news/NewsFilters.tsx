
import React from 'react';
import { Button } from "@/components/ui/button";
import { NewsCategories, NewsFilters } from '@/types/news';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortAsc, SortDesc, Filter } from 'lucide-react';

interface NewsFiltersProps {
  filters: NewsFilters;
  onFiltersChange: (filters: NewsFilters) => void;
}

export const NewsFilters = ({ filters, onFiltersChange }: NewsFiltersProps) => {
  const toggleSortOrder = () => {
    onFiltersChange({
      ...filters,
      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
    });
  };

  return (
    <div className="flex flex-wrap gap-4 items-center bg-accent/20 p-4 rounded-lg">
      <Select 
        value={filters.sortBy} 
        onValueChange={(value) => onFiltersChange({ ...filters, sortBy: value as 'date' | 'relevance' })}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date">Date</SelectItem>
          <SelectItem value="relevance">Relevance</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        onClick={toggleSortOrder}
        className="hover:bg-accent"
      >
        {filters.sortOrder === 'asc' ? <SortAsc /> : <SortDesc />}
      </Button>

      <div className="flex flex-wrap gap-2">
        {Object.entries(NewsCategories).map(([key, label]) => (
          <Button
            key={key}
            variant={filters.categories.includes(key) ? "default" : "outline"}
            onClick={() => {
              const newCategories = filters.categories.includes(key)
                ? filters.categories.filter(c => c !== key)
                : [...filters.categories, key];
              onFiltersChange({ ...filters, categories: newCategories });
            }}
            className="text-sm"
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
};
