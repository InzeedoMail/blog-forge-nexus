export interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  imageUrl?: string;
  tags?: string[];
  keywords?: string[];
  pinned?: boolean;
}

export const NewsCategories = {
  srilanka: "Sri Lanka News",
  world: "World News",
  gaza: "Gaza Updates",
  israel: "Israel News",
  tech: "Technology",
} as const;

export const languageOptions = [
  { value: "en", label: "English" },
  { value: "ta", label: "Tamil" },
  { value: "si", label: "Sinhala" },
  { value: "ar", label: "Arabic" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
] as const;

export interface NewsFilters {
  search: string;
  categories: string[];
  sortBy: 'date' | 'relevance';
  sortOrder: 'asc' | 'desc';
}

export interface TelegramNotification {
  chatId: string;
  keywords: string[];
  categories: string[];
}
