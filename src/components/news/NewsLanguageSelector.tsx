
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { languageOptions } from '@/types/news';

interface NewsLanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (value: string) => void;
}

export const NewsLanguageSelector = ({ selectedLanguage, onLanguageChange }: NewsLanguageSelectorProps) => {
  return (
    <div className="w-48">
      <Select onValueChange={onLanguageChange} defaultValue={selectedLanguage}>
        <SelectTrigger>
          <SelectValue placeholder="Select Language" />
        </SelectTrigger>
        <SelectContent>
          {languageOptions.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
