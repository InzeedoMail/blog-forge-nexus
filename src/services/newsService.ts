
import { NewsItem } from '@/types/news';

export class NewsService {
  private apiKey = 'ba8c5f0c548348eaab804059d3826820';
  private baseUrl = 'https://newsapi.org/v2/everything';

  async fetchNews(query: string, page: number = 1, pageSize: number = 10): Promise<{
    articles: NewsItem[];
    totalResults: number;
  }> {
    try {
      const response = await fetch(
        `${this.baseUrl}?q=${query}&sortBy=publishedAt&page=${page}&pageSize=${pageSize}&apiKey=${this.apiKey}`
      );
      const data = await response.json();
      
      return {
        articles: data.articles.map((article: any) => ({
          title: article.title,
          description: article.description,
          link: article.url,
          pubDate: new Date(article.publishedAt).toLocaleDateString(),
          source: article.source.name,
          imageUrl: article.urlToImage,
          tags: article.content?.match(/#\w+/g) || [],
          keywords: [article.source.name, ...article.title.split(' ').slice(0, 5)],
          pinned: false
        })),
        totalResults: data.totalResults
      };
    } catch (error) {
      console.error("Error fetching news:", error);
      throw error;
    }
  }

  async sendTelegramNotification(chatId: string, message: string): Promise<void> {
    const botToken = localStorage.getItem('telegramBotToken');
    if (!botToken) {
      throw new Error('Telegram bot token not found');
    }

    try {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
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
    } catch (error) {
      console.error("Error sending Telegram notification:", error);
      throw error;
    }
  }
}

export const newsService = new NewsService();
