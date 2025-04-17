
import { NewsItem, NewsFilters } from "@/types/news";
import { supabase } from "@/integrations/supabase/client";

// Use import.meta.env instead of process.env for Vite projects
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY || localStorage.getItem('newsApiKey');
const NEWS_API_URL = "https://newsapi.org/v2/everything";

// Sample mock news data to use when API fails due to CORS restrictions
const MOCK_NEWS = {
  "status": "ok",
  "totalResults": 30,
  "articles": [
    {
      "source": { "id": "bbc-news", "name": "BBC News" },
      "author": "BBC News",
      "title": "Latest developments in global technology trends",
      "description": "How AI and machine learning are transforming various industries across the globe.",
      "url": "https://www.bbc.com/news/technology",
      "urlToImage": "https://via.placeholder.com/640x360?text=Technology+News",
      "publishedAt": "2025-04-17T08:30:00Z",
      "content": "Artificial Intelligence continues to reshape how businesses operate..."
    },
    {
      "source": { "id": "cnn", "name": "CNN" },
      "author": "CNN Tech Team",
      "title": "The rise of sustainable technology solutions",
      "description": "Companies are increasingly focusing on sustainable tech solutions to combat climate change.",
      "url": "https://www.cnn.com/tech",
      "urlToImage": "https://via.placeholder.com/640x360?text=Sustainable+Tech",
      "publishedAt": "2025-04-16T14:15:00Z",
      "content": "Renewable energy technology is making significant strides in efficiency..."
    },
    {
      "source": { "id": "reuters", "name": "Reuters" },
      "author": "Reuters Staff",
      "title": "Global chip shortage expected to ease by end of year",
      "description": "Experts predict improvements in the semiconductor supply chain by Q4 2025.",
      "url": "https://www.reuters.com/technology",
      "urlToImage": "https://via.placeholder.com/640x360?text=Semiconductor+Industry",
      "publishedAt": "2025-04-15T10:45:00Z",
      "content": "The semiconductor industry is showing signs of recovery after two years of shortages..."
    },
    {
      "source": { "id": "tech-crunch", "name": "TechCrunch" },
      "author": "TechCrunch Staff",
      "title": "Startups to watch in the quantum computing space",
      "description": "These emerging companies are making waves in quantum technology development.",
      "url": "https://techcrunch.com/category/quantum-computing/",
      "urlToImage": "https://via.placeholder.com/640x360?text=Quantum+Computing",
      "publishedAt": "2025-04-14T16:20:00Z",
      "content": "Quantum computing startups are attracting record levels of venture capital..."
    },
    {
      "source": { "id": "wired", "name": "Wired" },
      "author": "Wired Magazine",
      "title": "The future of work: How technology is reshaping office culture",
      "description": "Remote work technologies continue to evolve as hybrid models become the norm.",
      "url": "https://www.wired.com/category/business",
      "urlToImage": "https://via.placeholder.com/640x360?text=Future+of+Work",
      "publishedAt": "2025-04-13T09:10:00Z",
      "content": "Companies are reimagining workplace technologies to support flexible work arrangements..."
    },
    {
      "source": { "id": "guardian", "name": "The Guardian" },
      "author": "Guardian Tech",
      "title": "Privacy concerns mount over new social media regulations",
      "description": "Experts debate the balance between security and privacy in new regulatory frameworks.",
      "url": "https://www.theguardian.com/technology",
      "urlToImage": "https://via.placeholder.com/640x360?text=Privacy+Regulations",
      "publishedAt": "2025-04-12T11:30:00Z",
      "content": "New regulations aim to address growing concerns about data privacy..."
    },
    {
      "source": { "id": "the-verge", "name": "The Verge" },
      "author": "The Verge Staff",
      "title": "Review: Latest smartphone innovations worth the upgrade",
      "description": "Our comprehensive review of this year's most impressive smartphone features.",
      "url": "https://www.theverge.com/reviews",
      "urlToImage": "https://via.placeholder.com/640x360?text=Smartphone+Review",
      "publishedAt": "2025-04-11T13:45:00Z",
      "content": "This generation of smartphones brings substantive improvements in battery life and camera capabilities..."
    },
    {
      "source": { "id": "nature", "name": "Nature" },
      "author": "Nature Research",
      "title": "Breakthrough in renewable energy storage technology",
      "description": "Scientists develop new material that could revolutionize battery efficiency.",
      "url": "https://www.nature.com/subjects/technology",
      "urlToImage": "https://via.placeholder.com/640x360?text=Energy+Storage",
      "publishedAt": "2025-04-10T15:00:00Z",
      "content": "The newly developed compound shows promise for significantly improving energy density in batteries..."
    },
    {
      "source": { "id": "financial-times", "name": "Financial Times" },
      "author": "FT Technology Reporter",
      "title": "Tech stocks rally amid positive earnings reports",
      "description": "Major technology companies exceed market expectations in Q1 earnings.",
      "url": "https://www.ft.com/technology",
      "urlToImage": "https://via.placeholder.com/640x360?text=Tech+Stocks",
      "publishedAt": "2025-04-09T08:20:00Z",
      "content": "Investor confidence grows as technology sector shows resilience despite economic headwinds..."
    },
    {
      "source": { "id": "mit-tech", "name": "MIT Technology Review" },
      "author": "MIT Technology Review",
      "title": "The ethical implications of advanced AI systems",
      "description": "Researchers call for stronger frameworks to govern artificial intelligence development.",
      "url": "https://www.technologyreview.com",
      "urlToImage": "https://via.placeholder.com/640x360?text=AI+Ethics",
      "publishedAt": "2025-04-08T12:40:00Z",
      "content": "As AI systems become more capable, questions about governance and ethics become increasingly important..."
    }
  ]
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
