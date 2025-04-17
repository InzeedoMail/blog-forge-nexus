
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
