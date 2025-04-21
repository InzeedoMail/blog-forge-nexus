// src/components/news/NewsSearch.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const NewsSearch = ({ value, onChange, onSearch }) => {
  const [searchInput, setSearchInput] = useState(value || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    const keywords = searchInput.trim().split(/\s+/).filter(Boolean);
    onSearch(keywords);
  };

  const handleChange = (e) => {
    setSearchInput(e.target.value);
    onChange(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex w-full items-center space-x-2">
        <Input
          type="text"
          placeholder="Search news..."
          value={searchInput}
          onChange={handleChange}
          className="flex-1"
        />
        <Button type="submit" className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          <span>Search</span>
        </Button>
      </div>
    </form>
  );
};
