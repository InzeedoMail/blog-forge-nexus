
export interface NewsSource {
  id: string;
  name: string;
}

export interface NewsItem {
  source: NewsSource;
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string | null;
  pinned?: boolean;
  link?: string;
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsItem[];
}

export interface NewsFilters {
  search: string;
  categories: string[];
  sortBy: "date" | "relevance" | "popularity";
  sortOrder: "asc" | "desc";
}

export interface TelegramNotification {
  enabled: boolean;
  botToken?: string;
  chatId?: string;
  keywords?: string[];
  categories?: string[];
}

export const NewsCategories = [
  'business',
  'entertainment',
  'general',
  'health',
  'science',
  'sports',
  'technology'
] as const;

export const languageOptions = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ar', name: 'Arabic' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ta', name: 'Tamil' }
] as const;
