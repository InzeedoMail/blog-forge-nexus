
import React, { useState, useEffect, useTransition, useMemo, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Globe, Flag, AlertTriangle, Newspaper, Code2, Pin } from 'lucide-react';
import { NewsList } from "@/components/news/NewsList";
import { NewsSearch } from "@/components/news/NewsSearch";
import { NewsFilters } from "@/components/news/NewsFilters";
import { NewsLanguageSelector } from "@/components/news/NewsLanguageSelector";
import { TelegramSettings } from "@/components/news/TelegramSettings";
import { NewsCard } from "@/components/news/NewsCard";
import { NewsItem, NewsFilters as NewsFiltersType, TelegramNotification } from "@/types/news";
import { newsService } from "@/services/newsService";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const ITEMS_PER_PAGE = 10;

const News = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isPending, startTransition] = useTransition();
  
  // State management
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchKeywords, setSearchKeywords] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("srilanka");
  const [currentPage, setCurrentPage] = useState(1);
  const [pinnedNews, setPinnedNews] = useState<NewsItem[]>([]);
  const [filters, setFilters] = useState<NewsFiltersType>({
    search: "",
    categories: [],
    sortBy: "date",
    sortOrder: "desc"
  });

  // Load pinned news from localStorage on mount
  useEffect(() => {
    const loadPinnedNews = async () => {
      try {
        const pinned = await newsService.fetchPinnedNews();
        setPinnedNews(pinned);
      } catch (error) {
        console.error("Error loading pinned news:", error);
      }
    };
    
    loadPinnedNews();
  }, []);
  
  // Save pinned news to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('pinnedNews', JSON.stringify(pinnedNews));
  }, [pinnedNews]);

  // Reset pagination when tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Fetch news data with React Query
  const { data: srilankaNews, isLoading: loadingSL } = useQuery({
    queryKey: ["news", "srilanka", currentPage, searchKeywords],
    queryFn: () => newsService.fetchNews("sri+lanka", currentPage, ITEMS_PER_PAGE, searchKeywords.join(" ")),
  });

  const { data: worldNews, isLoading: loadingWorld } = useQuery({
    queryKey: ["news", "world", currentPage, searchKeywords],
    queryFn: () => newsService.fetchNews("world", currentPage, ITEMS_PER_PAGE, searchKeywords.join(" ")),
  });

  const { data: gazaNews, isLoading: loadingGaza } = useQuery({
    queryKey: ["news", "gaza", currentPage, searchKeywords],
    queryFn: () => newsService.fetchNews("gaza", currentPage, ITEMS_PER_PAGE, searchKeywords.join(" ")),
  });

  const { data: israelNews, isLoading: loadingIsrael } = useQuery({
    queryKey: ["news", "israel", currentPage, searchKeywords],
    queryFn: () => newsService.fetchNews("israel", currentPage, ITEMS_PER_PAGE, searchKeywords.join(" ")),
  });

  const { data: techNews, isLoading: loadingTech } = useQuery({
    queryKey: ["news", "tech", currentPage, searchKeywords],
    queryFn: () => newsService.fetchNews("technology", currentPage, ITEMS_PER_PAGE, searchKeywords.join(" ")),
  });

  // Helper function to translate text using Google Translate API
  const translateText = async (text: string) => {
    if (!text) return "";
    
    try {
      // Get preferred language from API or use selected language
      const targetLanguage = selectedLanguage;
      
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY || localStorage.getItem('googleTranslateApiKey')}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            q: text,
            target: targetLanguage,
            format: "text",
          }),
        }
      );
      
      const data = await response.json();
      
      if (data.error) {
        console.error("Translation API error:", data.error);
        toast({
          title: "Translation Error",
          description: data.error.message || "Failed to translate text",
          variant: "destructive",
        });
        return text;
      }
      
      return data.data?.translations?.[0]?.translatedText || text;
    } catch (error) {
      console.error("Translation error:", error);
      toast({
        title: "Translation Error",
        description: "Translation service is currently unavailable",
        variant: "destructive",
      });
      return text;
    }
  };

  // Pin/unpin news functionality
  const handlePinNews = useCallback((item: NewsItem) => {
    setPinnedNews(prev => {
      const isPinned = prev.some(news => news.url === item.url);
      
      if (isPinned) {
        toast({
          title: "Article Unpinned",
          description: "Article has been removed from pinned items",
        });
        return prev.filter(news => news.url !== item.url);
      }
      
      newsService.pinNewsItem({ ...item, pinned: true });
      
      toast({
        title: "Article Pinned",
        description: "Article has been added to pinned items",
      });
      return [...prev, { ...item, pinned: true }];
    });
  }, [toast]);

  // Handle search functionality
  const handleSearch = useCallback((keywords: string[]) => {
    startTransition(() => {
      setSearchKeywords(keywords);
      setCurrentPage(1);
    });
  }, []);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: NewsFiltersType) => {
    setFilters(newFilters);
    // Apply filters logic here
  }, []);

  // Save Telegram notification settings
  const handleTelegramSettings = useCallback(async (settings: TelegramNotification) => {
    try {
      localStorage.setItem('telegramNotificationSettings', JSON.stringify(settings));
      
      // Explain what Telegram settings do to the user
      toast({
        title: "Telegram Notifications Configured",
        description: 
          "You'll receive notifications when new articles match your selected keywords or categories. Make sure you've started a chat with your bot.",
        duration: 5000,
      });
    } catch (error) {
      console.error("Error saving Telegram settings:", error);
      toast({
        title: "Error",
        description: "Failed to save Telegram settings",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Memoize current news data based on active tab
  const currentNews = useMemo(() => {
    switch (activeTab) {
      case "srilanka": return { 
        data: srilankaNews?.articles, 
        loading: loadingSL, 
        total: srilankaNews?.totalResults || 0 
      };
      case "world": return { 
        data: worldNews?.articles, 
        loading: loadingWorld, 
        total: worldNews?.totalResults || 0 
      };
      case "gaza": return { 
        data: gazaNews?.articles, 
        loading: loadingGaza, 
        total: gazaNews?.totalResults || 0 
      };
      case "israel": return { 
        data: israelNews?.articles, 
        loading: loadingIsrael, 
        total: israelNews?.totalResults || 0 
      };
      case "tech": return { 
        data: techNews?.articles, 
        loading: loadingTech, 
        total: techNews?.totalResults || 0 
      };
      default: return { 
        data: srilankaNews?.articles, 
        loading: loadingSL, 
        total: srilankaNews?.totalResults || 0 
      };
    }
  }, [
    activeTab, 
    srilankaNews, loadingSL, 
    worldNews, loadingWorld, 
    gazaNews, loadingGaza, 
    israelNews, loadingIsrael, 
    techNews, loadingTech
  ]);

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-7xl">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
            News Feed
          </h1>
          <NewsLanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
          <NewsSearch 
            value={searchTerm} 
            onChange={setSearchTerm} 
            onSearch={handleSearch}
          />
          <div className="hidden md:block">
            <TelegramSettings onSave={handleTelegramSettings} />
          </div>
        </div>

        <NewsFilters filters={filters} onFiltersChange={handleFiltersChange} />

        {pinnedNews.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Pin className="h-5 w-5" /> Pinned News
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pinnedNews.map((item, index) => (
                <NewsCard
                  key={`pinned-${index}`}
                  item={item}
                  onTranslate={translateText}
                  selectedLanguage={selectedLanguage}
                  onPin={handlePinNews}
                />
              ))}
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
            <TabsTrigger value="srilanka" className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              <span className={isMobile ? "sr-only" : ""}>Sri Lanka</span>
            </TabsTrigger>
            <TabsTrigger value="world" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className={isMobile ? "sr-only" : ""}>World</span>
            </TabsTrigger>
            <TabsTrigger value="gaza" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className={isMobile ? "sr-only" : ""}>Gaza</span>
            </TabsTrigger>
            <TabsTrigger value="israel" className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              <span className={isMobile ? "sr-only" : ""}>Israel</span>
            </TabsTrigger>
            <TabsTrigger value="tech" className="flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              <span className={isMobile ? "sr-only" : ""}>Technology</span>
            </TabsTrigger>
          </TabsList>

          <NewsList
            category={activeTab}
            news={currentNews.data}
            isLoading={currentNews.loading || isPending}
            onTranslate={translateText}
            selectedLanguage={selectedLanguage}
            onPinNews={handlePinNews}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalPages={Math.max(1, Math.ceil(currentNews.total / ITEMS_PER_PAGE))}
          />
        </Tabs>
      </div>
      
      <div className="md:hidden mt-8">
        <TelegramSettings onSave={handleTelegramSettings} />
      </div>
    </div>
  );
};

export default News;
