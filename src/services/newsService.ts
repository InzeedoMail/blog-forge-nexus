import { NewsItem, NewsFilters } from "@/types/news";
import { supabase } from "@/integrations/supabase/client";

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = "https://newsapi.org/v2/everything";

export const fetchNews = async (filters: NewsFilters): Promise<NewsItem[]> => {
  try {
    const { search, categories, sortBy, sortOrder } = filters;

    let url = `${NEWS_API_URL}?apiKey=${NEWS_API_KEY}&q=${search}`;

    if (categories && categories.length > 0) {
      url += `&category=${categories.join(",")}`;
    }

    if (sortBy) {
      url += `&sortBy=${sortBy}`;
    }

    if (sortOrder) {
      url += `&sortOrder=${sortOrder}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "ok") {
      return data.articles.map(transformNewsItem);
    } else {
      console.error("Error fetching news:", data.message);
      return [];
    }
  } catch (error) {
    console.error("Error fetching news:", error);
    return [];
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
  pinned: false
});

export const pinNewsItem = async (newsItem: NewsItem): Promise<boolean> => {
  try {
    // Assuming you have a table named 'pinned_news' in Supabase
    const { data, error } = await supabase
      .from('pinned_news')
      .insert([
        {
          source: newsItem.source.name,
          author: newsItem.author,
          title: newsItem.title,
          description: newsItem.description,
          url: newsItem.url,
          urlToImage: newsItem.urlToImage,
          publishedAt: newsItem.publishedAt,
          content: newsItem.content,
        },
      ]);

    if (error) {
      console.error("Error pinning news item:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error pinning news item:", error);
    return false;
  }
};

export const fetchPinnedNews = async (): Promise<NewsItem[]> => {
    try {
      const { data, error } = await supabase
        .from('pinned_news')
        .select('*');
  
      if (error) {
        console.error("Error fetching pinned news:", error);
        return [];
      }
  
      // Transform the data from Supabase to NewsItem format
      const pinnedNews: NewsItem[] = data.map(item => ({
        source: { id: 'supabase', name: item.source }, // Adjust as needed
        author: item.author,
        title: item.title,
        description: item.description,
        url: item.url,
        urlToImage: item.urlToImage,
        publishedAt: item.publishedAt,
        content: item.content,
        pinned: true,
      }));
  
      return pinnedNews;
    } catch (error) {
      console.error("Error fetching pinned news:", error);
      return [];
    }
  };
