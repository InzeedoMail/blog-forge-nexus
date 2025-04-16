
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import {
  Globe,
  Flag,
  AlertTriangle,
  Newspaper,
  Code2,
} from "lucide-react";
import { NewsList } from "@/components/news/NewsList";
import { NewsLanguageSelector } from "@/components/news/NewsLanguageSelector";
import { NewsItem, NewsCategories } from "@/types/news";

const News = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const fetchNews = async (category: string) => {
    try {
      const response = await fetch(
        `https://newsapi.org/v2/everything?q=${category}&sortBy=publishedAt&apiKey=ba8c5f0c548348eaab804059d3826820`
      );
      const data = await response.json();
      return data.articles.map((article: any) => ({
        title: article.title,
        description: article.description,
        link: article.url,
        pubDate: new Date(article.publishedAt).toLocaleDateString(),
        source: article.source.name,
      }));
    } catch (error) {
      console.error("Error fetching news:", error);
      throw error;
    }
  };

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

  // Queries for different news categories
  const { data: srilankaNews, isLoading: loadingSL } = useQuery({
    queryKey: ["news", "srilanka"],
    queryFn: () => fetchNews("sri+lanka"),
  });

  const { data: worldNews, isLoading: loadingWorld } = useQuery({
    queryKey: ["news", "world"],
    queryFn: () => fetchNews("world"),
  });

  const { data: gazaNews, isLoading: loadingGaza } = useQuery({
    queryKey: ["news", "gaza"],
    queryFn: () => fetchNews("gaza"),
  });

  const { data: israelNews, isLoading: loadingIsrael } = useQuery({
    queryKey: ["news", "israel"],
    queryFn: () => fetchNews("israel"),
  });

  const { data: techNews, isLoading: loadingTech } = useQuery({
    queryKey: ["news", "technology"],
    queryFn: () => fetchNews("technology"),
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">News Feed</h1>
        <NewsLanguageSelector
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
      </div>

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
          news={srilankaNews}
          isLoading={loadingSL}
          onTranslate={translateText}
          selectedLanguage={selectedLanguage}
        />
        <NewsList
          category="world"
          news={worldNews}
          isLoading={loadingWorld}
          onTranslate={translateText}
          selectedLanguage={selectedLanguage}
        />
        <NewsList
          category="gaza"
          news={gazaNews}
          isLoading={loadingGaza}
          onTranslate={translateText}
          selectedLanguage={selectedLanguage}
        />
        <NewsList
          category="israel"
          news={israelNews}
          isLoading={loadingIsrael}
          onTranslate={translateText}
          selectedLanguage={selectedLanguage}
        />
        <NewsList
          category="tech"
          news={techNews}
          isLoading={loadingTech}
          onTranslate={translateText}
          selectedLanguage={selectedLanguage}
        />
      </Tabs>
    </div>
  );
};

export default News;
