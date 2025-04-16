import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Globe, Flag, AlertTriangle, Newspaper, Code2 } from "lucide-react";
import { NewsList } from "@/components/news/NewsList";
import { NewsSearch } from "@/components/news/NewsSearch";
import { NewsFilters } from "@/components/news/NewsFilters";
import { NewsLanguageSelector } from "@/components/news/NewsLanguageSelector";
import { TelegramSettings } from "@/components/news/TelegramSettings";
import { NewsItem, NewsFilters as NewsFiltersType, TelegramNotification } from "@/types/news";
import { newsService } from "@/services/newsService";

const ITEMS_PER_PAGE = 10;

const News = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pinnedNews, setPinnedNews] = useState<NewsItem[]>([]);
  const [filters, setFilters] = useState<NewsFiltersType>({
    search: "",
    categories: [],
    sortBy: "date",
    sortOrder: "desc"
  });

  const { data: srilankaNews, isLoading: loadingSL } = useQuery({
    queryKey: ["news", "srilanka", currentPage],
    queryFn: () => newsService.fetchNews("sri+lanka", currentPage, ITEMS_PER_PAGE),
  });

  const { data: worldNews, isLoading: loadingWorld } = useQuery({
    queryKey: ["news", "world"],
    queryFn: () => newsService.fetchNews("world", currentPage, ITEMS_PER_PAGE),
  });

  const { data: gazaNews, isLoading: loadingGaza } = useQuery({
    queryKey: ["news", "gaza"],
    queryFn: () => newsService.fetchNews("gaza", currentPage, ITEMS_PER_PAGE),
  });

  const { data: israelNews, isLoading: loadingIsrael } = useQuery({
    queryKey: ["news", "israel"],
    queryFn: () => newsService.fetchNews("israel", currentPage, ITEMS_PER_PAGE),
  });

  const { data: techNews, isLoading: loadingTech } = useQuery({
    queryKey: ["news", "technology"],
    queryFn: () => newsService.fetchNews("technology", currentPage, ITEMS_PER_PAGE),
  });

  const translateText = async (text: string) => {
    try {
      const response = await fetch(
        "https://translation.googleapis.com/language/translate/v2",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: JSON.stringify({
            q: text,
            target: selectedLanguage,
          }),
        }
      );
      const data = await response.json();
      return data.data.translations[0].translatedText;
    } catch (error) {
      console.error("Translation error:", error);
      throw error;
    }
  };

  const handlePinNews = (item: NewsItem) => {
    setPinnedNews(prev => {
      const isPinned = prev.some(news => news.link === item.link);
      if (isPinned) {
        return prev.filter(news => news.link !== item.link);
      }
      return [...prev, { ...item, pinned: true }];
    });
  };

  const handleTelegramSettings = async (settings: TelegramNotification) => {
    localStorage.setItem('telegramNotificationSettings', JSON.stringify(settings));
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
            News Feed
          </h1>
          <NewsLanguageSelector
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-[2fr,1fr]">
          <NewsSearch value={searchTerm} onChange={setSearchTerm} />
          <TelegramSettings onSave={handleTelegramSettings} />
        </div>

        <NewsFilters filters={filters} onFiltersChange={setFilters} />

        {pinnedNews.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Pinned News</h2>
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
        )}

        <Tabs defaultValue="srilanka" className="w-full">
          <TabsList className="grid grid-cols-5 gap-4 mb-4">
            <TabsTrigger value="srilanka" className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              <span>Sri Lanka</span>
            </TabsTrigger>
            <TabsTrigger value="world" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span>World</span>
            </TabsTrigger>
            <TabsTrigger value="gaza" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Gaza</span>
            </TabsTrigger>
            <TabsTrigger value="israel" className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              <span>Israel</span>
            </TabsTrigger>
            <TabsTrigger value="tech" className="flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              <span>Technology</span>
            </TabsTrigger>
          </TabsList>

          <NewsList
            category="srilanka"
            news={srilankaNews?.articles}
            isLoading={loadingSL}
            onTranslate={translateText}
            selectedLanguage={selectedLanguage}
            onPinNews={handlePinNews}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalPages={Math.ceil((srilankaNews?.totalResults || 0) / ITEMS_PER_PAGE)}
          />
          <NewsList
            category="world"
            news={worldNews?.articles}
            isLoading={loadingWorld}
            onTranslate={translateText}
            selectedLanguage={selectedLanguage}
            onPinNews={handlePinNews}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalPages={Math.ceil((worldNews?.totalResults || 0) / ITEMS_PER_PAGE)}
          />
          <NewsList
            category="gaza"
            news={gazaNews?.articles}
            isLoading={loadingGaza}
            onTranslate={translateText}
            selectedLanguage={selectedLanguage}
            onPinNews={handlePinNews}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalPages={Math.ceil((gazaNews?.totalResults || 0) / ITEMS_PER_PAGE)}
          />
          <NewsList
            category="israel"
            news={israelNews?.articles}
            isLoading={loadingIsrael}
            onTranslate={translateText}
            selectedLanguage={selectedLanguage}
            onPinNews={handlePinNews}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalPages={Math.ceil((israelNews?.totalResults || 0) / ITEMS_PER_PAGE)}
          />
          <NewsList
            category="tech"
            news={techNews?.articles}
            isLoading={loadingTech}
            onTranslate={translateText}
            selectedLanguage={selectedLanguage}
            onPinNews={handlePinNews}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            totalPages={Math.ceil((techNews?.totalResults || 0) / ITEMS_PER_PAGE)}
          />
        </Tabs>
      </div>
    </div>
  );
};

export default News;
