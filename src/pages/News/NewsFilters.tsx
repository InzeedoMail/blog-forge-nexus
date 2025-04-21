// src/components/news/NewsFilters.jsx
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export const NewsFilters = ({ filters, onFiltersChange }) => {
  const handleSortByChange = (value) => {
    onFiltersChange({
      ...filters,
      sortBy: value,
    });
  };

  const handleSortOrderChange = (value) => {
    onFiltersChange({
      ...filters,
      sortOrder: value,
    });
  };

  const handleCategoryAdd = (category) => {
    if (!filters.categories.includes(category)) {
      onFiltersChange({
        ...filters,
        categories: [...filters.categories, category],
      });
    }
  };

  const handleCategoryRemove = (category) => {
    onFiltersChange({
      ...filters,
      categories: filters.categories.filter((c) => c !== category),
    });
  };

  const availableCategories = [
    "Business",
    "Entertainment",
    "Health",
    "Science",
    "Sports",
    "Technology",
  ];

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium">Sort by:</span>
        <Select value={filters.sortBy} onValueChange={handleSortByChange}>
          <SelectTrigger className="w-32 h-8">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">Date</SelectItem>
            <SelectItem value="relevancy">Relevance</SelectItem>
            <SelectItem value="popularity">Popularity</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.sortOrder} onValueChange={handleSortOrderChange}>
          <SelectTrigger className="w-32 h-8">
            <SelectValue placeholder="Order" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">Descending</SelectItem>
            <SelectItem value="asc">Ascending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="text-sm font-medium mb-2">Categories:</div>
        <div className="flex flex-wrap gap-2">
          {filters.categories.map((category) => (
            <Badge key={category} variant="secondary" className="px-2 py-1">
              {category}
              <Button
                variant="ghost"
                size="sm"
                className="ml-1 h-4 w-4 p-0"
                onClick={() => handleCategoryRemove(category)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

          <Select onValueChange={handleCategoryAdd}>
            <SelectTrigger className="h-8 w-40">
              <SelectValue placeholder="Add category" />
            </SelectTrigger>
            <SelectContent>
              {availableCategories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
