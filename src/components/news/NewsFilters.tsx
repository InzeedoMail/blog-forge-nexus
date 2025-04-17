
import React from 'react';
import { Button } from "@/components/ui/button";
import { NewsCategories } from '@/types/news';
import type { NewsFilters as NewsFiltersType } from '@/types/news';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortAsc, SortDesc } from 'lucide-react';
import { motion } from "framer-motion";

interface NewsFiltersProps {
  filters: NewsFiltersType;
  onFiltersChange: (filters: NewsFiltersType) => void;
}

export const NewsFilters = ({ filters, onFiltersChange }: NewsFiltersProps) => {
  const toggleSortOrder = () => {
    onFiltersChange({
      ...filters,
      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc'
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-wrap gap-4 items-center bg-accent/20 p-4 rounded-lg shadow-sm"
    >
      <Select 
        value={filters.sortBy} 
        onValueChange={(value) => onFiltersChange({ ...filters, sortBy: value as 'date' | 'relevance' | 'popularity' })}
      >
        <SelectTrigger className="w-[180px] bg-background/60 backdrop-blur-sm">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date">Date</SelectItem>
          <SelectItem value="relevance">Relevance</SelectItem>
          <SelectItem value="popularity">Popularity</SelectItem>
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        onClick={toggleSortOrder}
        className="hover:bg-accent bg-background/60 backdrop-blur-sm"
      >
        {filters.sortOrder === 'asc' ? <SortAsc /> : <SortDesc />}
      </Button>

      <div className="flex flex-wrap gap-2">
        {NewsCategories.map((category) => (
          <Button
            key={category}
            variant={filters.categories.includes(category) ? "default" : "outline"}
            onClick={() => {
              const newCategories = filters.categories.includes(category)
                ? filters.categories.filter(c => c !== category)
                : [...filters.categories, category];
              onFiltersChange({ ...filters, categories: newCategories });
            }}
            className={`text-sm transition-all ${
              filters.categories.includes(category) 
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 border-none text-white' 
                : 'bg-background/60 backdrop-blur-sm'
            }`}
          >
            {category}
          </Button>
        ))}
      </div>
    </motion.div>
  );
};
