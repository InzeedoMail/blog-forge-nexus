// src/services/newsService.js
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY || localStorage.getItem('newsApiKey')  || "ba8c5f0c548348eaab804059d3826820";
const NEWS_API_URL = "https://newsapi.org/v2/everything";

// Mock news data to use when API fails or for development
const MOCK_NEWS = {
  status: "ok",
  totalResults: 10,
  articles: [
    {
      source: { id: "mock-source", name: "Mock News" },
      author: "Mock Author",
      title: "Sample News Headline",
      description: "This is a sample news article for testing purposes",
      url: "https://example.com/news/1",
      urlToImage: "https://via.placeholder.com/600x400?text=News+Image",
      publishedAt: new Date().toISOString(),
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget ultricies ultrices, nunc nisl ultricies nunc."
    },
    {
      source: { id: "mock-source-2", name: "Another News Source" },
      author: "Another Author",
      title: "Another Important Headline",
      description: "This is another sample news article with different content",
      url: "https://example.com/news/2",
      urlToImage: "https://via.placeholder.com/600x400?text=Another+Image",
      publishedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      content: "Praesent et lacus a arcu commodo fringilla. Sed vitae mi eget justo efficitur tincidunt."
    }
  ]
};

// Add mock data for different categories
const getMockNewsForCategory = (category) => {
  const mockData = JSON.parse(JSON.stringify(MOCK_NEWS));
  
  // Customize titles and descriptions based on category
  mockData.articles = mockData.articles.map((article) => {
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
    } else if (category === 'tech') {
      article.title = `Tech: ${article.title}`;
      article.description = `Technology update: ${article.description}`;
    }
    return article;
  });
  
  return mockData;
};

export const fetchNews = async (query, page = 1, pageSize = 10, keywords = "") => {
  try {
    // Check for API key
    if (!NEWS_API_KEY) {
      console.log("No News API key provided, using mock data");
      return getMockNewsForCategory(query.replace('+', ''));
    }
    
    const searchQuery = keywords ? `${query} ${keywords}` : query;
    let url = `${NEWS_API_URL}?apiKey=${NEWS_API_KEY}&q=${encodeURIComponent(searchQuery)}`;
    url += `&page=${page}&pageSize=${pageSize}&language=en`;
    
    console.log(`Fetching news for query: ${searchQuery}`);
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "ok") {
      console.log(`Received ${data.articles?.length || 0} articles from API`);
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

export const transformNewsItem = (item) => ({
  source: item.source,
  author: item.author || "Unknown",
  title: item.title || "Untitled",
  description: item.description || "No description available",
  url: item.url || "#",
  urlToImage: item.urlToImage || "https://via.placeholder.com/600x400?text=No+Image",
  publishedAt: item.publishedAt || item.pubDate || new Date().toISOString(),
  content: item.content || "No content available",
  pinned: false,
  link: item.url || "#"
});

export const pinNewsItem = async (newsItem) => {
  try {
    // Store pinned news in local storage
    const savedPinnedNews = localStorage.getItem('pinnedNews');
    let pinnedNews = savedPinnedNews ? JSON.parse(savedPinnedNews) : [];
    
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

export const fetchPinnedNews = async () => {
  try {
    // Get from localStorage
    const savedPinnedNews = localStorage.getItem('pinnedNews');
    const pinnedNews = savedPinnedNews ? JSON.parse(savedPinnedNews) : [];
    
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