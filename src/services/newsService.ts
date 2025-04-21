
import { NewsItem, NewsFilters } from "@/types/news";
import { supabase } from "@/integrations/supabase/client";

// Use import.meta.env instead of process.env for Vite projects
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY || localStorage.getItem('newsApiKey');
const NEWS_API_URL = "https://newsapi.org/v2/everything";

// Sample mock news data to use when API fails due to CORS restrictions
const MOCK_NEWS = {

};

// Add mock data for different categories
const getMockNewsForCategory = (category: string) => {
  const mockData = JSON.parse(JSON.stringify(MOCK_NEWS));
  
  // Customize titles and descriptions based on category
  mockData.articles = mockData.articles.map((article: any) => {
    if (category === 'world') {
      article.title = `World: ${article.title}`;
      article.description = `Global perspective: ${article.description}`;
    } else if (category === 'srilanka') {
      article.title = `Sri Lanka: ${article.title}`;
      article.description = `Sri Lankan perspective: ${article.description}`;
    } else if (category === 'gaza') {
      article.title = `Gaza: ${article.title}`;
      article.description = `Middle East update: ${article.description}`;
    } else if (category === 'israel') {
      article.title = `Israel: ${article.title}`;
      article.description = `Israeli perspective: ${article.description}`;
    }
    return article;
  });
  
  return mockData;
};

export const fetchNews = async (query: string, page: number = 1, pageSize: number = 10, keywords: string = ""): Promise<any> => {
  try {
    // If no API key is provided, use mock data
    if (!NEWS_API_KEY) {
      console.log("No News API key provided, using mock data");
      return getMockNewsForCategory(query.replace('+', ''));
    }
    
    const searchQuery = keywords ? `${query} ${keywords}` : query;
    let url = `${NEWS_API_URL}?apiKey=${NEWS_API_KEY}&q=${encodeURIComponent(searchQuery)}`;
    url += `&page=${page}&pageSize=${pageSize}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "ok") {
      return data;
    } else {
      console.error("Error fetching news:", data.message);
      // Return mock data if the API request fails
      return getMockNewsForCategory(query.replace('+', ''));
    }
  } catch (error) {
    console.error("Error fetching news:", error);
    // Return mock data if the API request fails
    return getMockNewsForCategory(query.replace('+', ''));
  }
};

export const transformNewsItem = (item: any): NewsItem => ({
  source: item.source,
  author: item.author,
  title: item.title,
  description: item.description,
  url: item.url,
  urlToImage: item.urlToImage,
  publishedAt: item.publishedAt || item.pubDate, // Handle both date formats
  content: item.content,
  pinned: false,
  link: item.url
});

// Create a pinned_news table in Supabase if it doesn't exist before using this function
export const pinNewsItem = async (newsItem: NewsItem): Promise<boolean> => {
  try {
    // Store pinned news in local storage as a fallback
    const savedPinnedNews = localStorage.getItem('pinnedNews');
    let pinnedNews: NewsItem[] = savedPinnedNews ? JSON.parse(savedPinnedNews) : [];
    
    // Check if the article is already pinned
    const isAlreadyPinned = pinnedNews.some(item => item.url === newsItem.url);
    
    if (!isAlreadyPinned) {
      // Add to local pinnedNews array
      pinnedNews.push({...newsItem, pinned: true});
      localStorage.setItem('pinnedNews', JSON.stringify(pinnedNews));
    }

    return true;
  } catch (error) {
    console.error("Error pinning news item:", error);
    return false;
  }
};

export const fetchPinnedNews = async (): Promise<NewsItem[]> => {
  try {
    // Get from localStorage
    const savedPinnedNews = localStorage.getItem('pinnedNews');
    const pinnedNews: NewsItem[] = savedPinnedNews ? JSON.parse(savedPinnedNews) : [];
    
    return pinnedNews.map(item => ({
      ...item,
      pinned: true
    }));
  } catch (error) {
    console.error("Error fetching pinned news:", error);
    return [];
  }
};

// Export as a module
export const newsService = {
  fetchNews,
  transformNewsItem,
  pinNewsItem,
  fetchPinnedNews
};
