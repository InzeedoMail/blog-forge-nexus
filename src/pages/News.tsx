
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useQuery } from '@tanstack/react-query';
import { Globe, Flag, AlertTriangle, Newspaper, Zap, Code2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
}

const NewsCategories = {
  srilanka: "Sri Lanka News",
  world: "World News",
  gaza: "Gaza Updates",
  israel: "Israel News",
  tech: "Technology",
};

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'ta', label: 'Tamil' },
  { value: 'si', label: 'Sinhala' },
  { value: 'ar', label: 'Arabic' },
  { value: 'fr', label: 'French' },
  { value: 'es', label: 'Spanish' },
];

const News = () => {
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const { toast } = useToast();

  // Fetch news for each category
  const fetchNews = async (category: string) => {
    try {
      // Using NewsAPI as an example - you'll need to replace with your API key
      const response = await fetch(`https://newsapi.org/v2/everything?q=${category}&sortBy=publishedAt&apiKey=YOUR_API_KEY`);
      const data = await response.json();
      return data.articles.map((article: any) => ({
        title: article.title,
        description: article.description,
        link: article.url,
        pubDate: new Date(article.publishedAt).toLocaleDateString(),
        source: article.source.name,
      }));
    } catch (error) {
      console.error('Error fetching news:', error);
      throw error;
    }
  };

  // Function to translate text using Google Translate API
  const translateText = async (text: string, targetLang: string) => {
    try {
      const response = await fetch('https://translation.googleapis.com/language/translate/v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          q: text,
          target: targetLang,
        }),
      });
      const data = await response.json();
      return data.data.translations[0].translatedText;
    } catch (error) {
      console.error('Translation error:', error);
      throw error;
    }
  };

  // Query for Sri Lanka news
  const { data: srilankaNews, isLoading: loadingSL } = useQuery({
    queryKey: ['news', 'srilanka'],
    queryFn: () => fetchNews('sri+lanka'),
  });

  // Query for World news
  const { data: worldNews, isLoading: loadingWorld } = useQuery({
    queryKey: ['news', 'world'],
    queryFn: () => fetchNews('world'),
  });

  // Query for Gaza news
  const { data: gazaNews, isLoading: loadingGaza } = useQuery({
    queryKey: ['news', 'gaza'],
    queryFn: () => fetchNews('gaza'),
  });

  // Query for Israel news
  const { data: israelNews, isLoading: loadingIsrael } = useQuery({
    queryKey: ['news', 'israel'],
    queryFn: () => fetchNews('israel'),
  });

  // Query for Tech news
  const { data: techNews, isLoading: loadingTech } = useQuery({
    queryKey: ['news', 'technology'],
    queryFn: () => fetchNews('technology'),
  });

  const handleTranslate = async (text: string) => {
    try {
      const translated = await translateText(text, selectedLanguage);
      return translated;
    } catch (error) {
      toast({
        title: "Translation Error",
        description: "Failed to translate the text. Please try again.",
        variant: "destructive",
      });
      return text;
    }
  };

  const NewsCard = ({ item }: { item: NewsItem }) => {
    const [translatedTitle, setTranslatedTitle] = useState(item.title);
    const [translatedDescription, setTranslatedDescription] = useState(item.description);

    useEffect(() => {
      setTranslatedTitle(item.title);
      setTranslatedDescription(item.description);
    }, [item, selectedLanguage]);

    return (
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg">{translatedTitle}</CardTitle>
          <CardDescription>
            {item.source} - {item.pubDate}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">{translatedDescription}</p>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" asChild>
              <a href={item.link} target="_blank" rel="noopener noreferrer">Read More</a>
            </Button>
            <Button onClick={async () => {
              const newTitle = await handleTranslate(item.title);
              const newDesc = await handleTranslate(item.description);
              setTranslatedTitle(newTitle);
              setTranslatedDescription(newDesc);
            }}>
              Translate
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">News Feed</h1>
        <div className="w-48">
          <Select onValueChange={setSelectedLanguage} defaultValue={selectedLanguage}>
            <SelectTrigger>
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              {languageOptions.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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

        <TabsContent value="srilanka">
          {loadingSL ? (
            <p>Loading Sri Lanka news...</p>
          ) : (
            srilankaNews?.map((item: NewsItem, index: number) => (
              <NewsCard key={index} item={item} />
            ))
          )}
        </TabsContent>

        <TabsContent value="world">
          {loadingWorld ? (
            <p>Loading World news...</p>
          ) : (
            worldNews?.map((item: NewsItem, index: number) => (
              <NewsCard key={index} item={item} />
            ))
          )}
        </TabsContent>

        <TabsContent value="gaza">
          {loadingGaza ? (
            <p>Loading Gaza news...</p>
          ) : (
            gazaNews?.map((item: NewsItem, index: number) => (
              <NewsCard key={index} item={item} />
            ))
          )}
        </TabsContent>

        <TabsContent value="israel">
          {loadingIsrael ? (
            <p>Loading Israel news...</p>
          ) : (
            israelNews?.map((item: NewsItem, index: number) => (
              <NewsCard key={index} item={item} />
            ))
          )}
        </TabsContent>

        <TabsContent value="tech">
          {loadingTech ? (
            <p>Loading Technology news...</p>
          ) : (
            techNews?.map((item: NewsItem, index: number) => (
              <NewsCard key={index} item={item} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default News;
