
import { NewsItem, TelegramNotification } from '@/types/news';

export class NewsService {
  private apiKey = 'ba8c5f0c548348eaab804059d3826820';
  private baseUrl = 'https://newsapi.org/v2/everything';

  async fetchNews(query: string, page: number = 1, pageSize: number = 10, additionalKeywords: string = ''): Promise<{
    articles: NewsItem[];
    totalResults: number;
  }> {
    try {
      const searchQuery = additionalKeywords ? `${query} ${additionalKeywords}` : query;
      
      const response = await fetch(
        `${this.baseUrl}?q=${encodeURIComponent(searchQuery)}&sortBy=publishedAt&page=${page}&pageSize=${pageSize}&apiKey=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(data.message || 'News API Error');
      }
      
      return {
        articles: (data.articles || []).map((article: any) => this.mapArticleToNewsItem(article)),
        totalResults: data.totalResults || 0
      };
    } catch (error) {
      console.error("Error fetching news:", error);
      return { articles: [], totalResults: 0 };
    }
  }

  private mapArticleToNewsItem(article: any): NewsItem {
    // Extract keywords from title and content
    const extractKeywords = (text: string = '') => {
      if (!text) return [];
      
      // Remove common words and punctuation
      const cleanedText = text.toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
        .replace(/\s{2,}/g, ' ');
      
      const words = cleanedText.split(' ');
      const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 
                           'of', 'in', 'to', 'for', 'with', 'on', 'at', 'from', 'by', 'about', 
                           'as', 'into', 'like', 'through', 'after', 'over', 'between', 'out', 
                           'against', 'during', 'without', 'before', 'under', 'around', 'among'];
      
      // Filter out common words and short words
      return words
        .filter(word => word.length > 3 && !commonWords.includes(word))
        .slice(0, 10); // Limit to 10 keywords
    };
    
    // Extract hashtags from content
    const extractTags = (content: string = '') => {
      if (!content) return [];
      const matches = content.match(/#\w+/g);
      return matches || [];
    };

    return {
      title: article.title || 'No title',
      description: article.description || 'No description available',
      link: article.url || '#',
      pubDate: article.publishedAt ? new Date(article.publishedAt).toISOString() : new Date().toISOString(),
      source: article.source?.name || 'Unknown Source',
      imageUrl: article.urlToImage || '',
      tags: extractTags(article.content),
      keywords: extractKeywords(article.title + ' ' + article.description),
      pinned: false
    };
  }

  async checkForNewNews(settings: TelegramNotification): Promise<NewsItem[]> {
    try {
      // Build query from settings
      const keywordQuery = settings.keywords.join(' OR ');
      const categoryQueries = settings.categories.join(' OR ');
      const query = [keywordQuery, categoryQueries].filter(Boolean).join(' OR ');
      
      if (!query) return [];
      
      const { articles } = await this.fetchNews(query, 1, 5);
      
      // Get last check time
      const lastCheckTime = localStorage.getItem('lastNewsCheckTime');
      const cutoffTime = lastCheckTime ? new Date(lastCheckTime).getTime() : new Date().getTime() - 3600000; // Default to 1 hour ago
      
      // Filter for news published since last check
      const newArticles = articles.filter(article => {
        const pubTime = new Date(article.pubDate).getTime();
        return pubTime > cutoffTime;
      });
      
      // Update last check time
      localStorage.setItem('lastNewsCheckTime', new Date().toISOString());
      
      return newArticles;
    } catch (error) {
      console.error("Error checking for new news:", error);
      return [];
    }
  }

  async sendTelegramNotification(chatId: string, message: string): Promise<boolean> {
    try {
      const botToken = localStorage.getItem('telegramBotToken');
      if (!botToken) {
        console.error("Telegram bot token not found");
        return false;
      }

      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Telegram API error:", errorData);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error sending Telegram notification:", error);
      return false;
    }
  }
  
  // Format a news item for Telegram message
  formatNewsForTelegram(news: NewsItem): string {
    return `
<b>${news.title}</b>

${news.description}

🔗 <a href="${news.link}">Read more</a>
📰 Source: ${news.source}
📅 Published: ${new Date(news.pubDate).toLocaleString()}

${news.keywords?.length ? '🔑 Keywords: ' + news.keywords.join(', ') : ''}
${news.tags?.length ? '🏷️ Tags: ' + news.tags.join(' ') : ''}
    `.trim();
  }
  
  // Check for new news and send notifications
  async checkAndSendNotifications(): Promise<void> {
    try {
      const savedSettings = localStorage.getItem('telegramNotificationSettings');
      if (!savedSettings) return;
      
      const settings: TelegramNotification = JSON.parse(savedSettings);
      if (!settings.chatId) return;
      
      const newArticles = await this.checkForNewNews(settings);
      
      for (const article of newArticles.slice(0, 3)) { // Limit to 3 notifications at once
        const message = this.formatNewsForTelegram(article);
        await this.sendTelegramNotification(settings.chatId, message);
      }
    } catch (error) {
      console.error("Error in notification service:", error);
    }
  }
}

export const newsService = new NewsService();

// Set up periodic check for new news (every 30 minutes)
setInterval(() => {
  newsService.checkAndSendNotifications();
}, 30 * 60 * 1000);
