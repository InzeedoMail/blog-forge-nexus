import React, { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import {
  Globe,
  Flag,
  AlertTriangle,
  Newspaper,
  Code2,
  Languages,
  ExternalLink,
  Search,
  Calendar,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  imageUrl?: string;
  author?: string;
}

const NewsCategories = {
  srilanka: "Sri Lanka News",
  world: "World News",
  gaza: "Gaza Updates",
  israel: "Israel News",
  tech: "Technology",
} as const;

type NewsCategory = keyof typeof NewsCategories;

const languageOptions = [
  { value: "en", label: "English" },
  { value: "ta", label: "Tamil" },
  { value: "si", label: "Sinhala" },
  { value: "ar", label: "Arabic" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
];

const sortOptions = [
  { value: "publishedAt", label: "Newest First" },
  { value: "relevancy", label: "Relevance" },
  { value: "popularity", label: "Popularity" },
];

const pageSizeOptions = [10, 20, 30, 50];

const News = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [activeTab, setActiveTab] = useState<NewsCategory>("srilanka");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("publishedAt");
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateFilter, setDateFilter] = useState("");
  const { toast } = useToast();

  // Fetch news with enhanced parameters
  const fetchNews = async (category: NewsCategory) => {
    try {
      const queryMap: Record<NewsCategory, string> = {
        srilanka: "sri+lanka",
        world: "world",
        gaza: "gaza+palestine",
        israel: "israel",
        tech: "technology",
      };

      // Use search query if available, otherwise use category default
      const q = searchQuery || queryMap[category];

      let url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(
        q
      )}&pageSize=${pageSize}&page=${currentPage}&sortBy=${sortBy}`;

      if (dateFilter) {
        url += `&from=${dateFilter}`;
      }

      const response = await fetch(
        `${url}&apiKey=ba8c5f0c548348eaab804059d3826820`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        articles: data.articles.map((article: any) => ({
          title: article.title,
          description: article.description || "No description available",
          link: article.url,
          pubDate: new Date(article.publishedAt).toLocaleDateString(),
          source: article.source?.name || "Unknown source",
          imageUrl: article.urlToImage,
          author: article.author,
        })),
        totalResults: data.totalResults,
      };
    } catch (error) {
      console.error("Error fetching news:", error);
      throw error;
    }
  };

  // Memoized translation function with caching
  const translateText = useMemo(() => {
    const cache = new Map<string, string>();

    return async (text: string, targetLang: string): Promise<string> => {
      if (!text.trim()) return text;

      const cacheKey = `${targetLang}:${text}`;
      if (cache.has(cacheKey)) {
        return cache.get(cacheKey)!;
      }

      try {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const translated = `[${targetLang.toUpperCase()}] ${text}`;
        cache.set(cacheKey, translated);
        return translated;
      } catch (error) {
        console.error("Translation error:", error);
        toast({
          title: "Translation Error",
          description: "Failed to translate the text. Please try again.",
          variant: "destructive",
        });
        return text;
      }
    };
  }, [toast]);

  // Unified query for all news categories with search parameters
  const {
    data: newsData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "news",
      activeTab,
      searchQuery,
      sortBy,
      pageSize,
      currentPage,
      dateFilter,
    ],
    queryFn: () => fetchNews(activeTab),
    staleTime: 1000 * 60 * 5, // 5 minutes stale time
  });

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy, pageSize, dateFilter, activeTab]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    refetch();
  };

  const NewsCard = React.memo(({ item }: { item: NewsItem }) => {
    const [translatedTitle, setTranslatedTitle] = useState(item.title);
    const [translatedDescription, setTranslatedDescription] = useState(
      item.description
    );
    const [isTranslating, setIsTranslating] = useState(false);

    const handleTranslate = async () => {
      if (selectedLanguage === "en") return;

      setIsTranslating(true);
      try {
        const [title, desc] = await Promise.all([
          translateText(item.title, selectedLanguage),
          translateText(item.description, selectedLanguage),
        ]);
        setTranslatedTitle(title);
        setTranslatedDescription(desc);
      } finally {
        setIsTranslating(false);
      }
    };

    useEffect(() => {
      if (selectedLanguage !== "en") {
        handleTranslate();
      }
    }, [selectedLanguage]);

    return (
      <Card className="mb-6 hover:shadow-lg transition-shadow">
        {item.imageUrl && (
          <div className="relative h-48 w-full">
            <img
              src={item.imageUrl}
              alt={item.title}
              className="w-full h-full object-cover rounded-t-lg"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-lg line-clamp-2">
            {translatedTitle}
          </CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-2">
            <span>{item.source}</span>
            <span>•</span>
            <span>{item.pubDate}</span>
            {item.author && (
              <>
                <span>•</span>
                <span>{item.author}</span>
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 line-clamp-3">
            {translatedDescription}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Read Full Story
            </a>
          </Button>
          <Button
            onClick={handleTranslate}
            disabled={isTranslating || selectedLanguage === "en"}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <Languages className="h-4 w-4" />
            {isTranslating ? "Translating..." : "Translate"}
          </Button>
        </CardFooter>
      </Card>
    );
  });

  const renderSkeleton = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: pageSize }).map((_, index) => (
        <Card key={index}>
          <Skeleton className="h-48 w-full rounded-t-lg" />
          <CardHeader>
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-2/3 mt-2" />
          </CardContent>
          <CardFooter className="flex justify-between gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  const totalPages = newsData ? Math.ceil(newsData.totalResults / pageSize) : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Global News Feed
          </h1>
          <p className="text-muted-foreground">
            Stay updated with the latest news from around the world
          </p>
        </div>
        <div className="w-full md:w-48">
          <Select
            onValueChange={setSelectedLanguage}
            defaultValue={selectedLanguage}
          >
            <SelectTrigger className="bg-background">
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

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search news..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit">Search</Button>
        </form>

        <div className="flex flex-col sm:flex-row gap-4">
          <Select onValueChange={setSortBy} value={sortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={setPageSize} value={pageSize.toString()}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Items per page" />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size} per page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1 sm:max-w-[200px]">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              placeholder="Filter by date"
              className="pl-10"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as NewsCategory)}
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-6">
          {Object.entries(NewsCategories).map(([key, label]) => (
            <TabsTrigger
              key={key}
              value={key}
              className="flex items-center gap-2"
            >
              {key === "srilanka" && <Flag className="h-4 w-4" />}
              {key === "world" && <Globe className="h-4 w-4" />}
              {key === "gaza" && <AlertTriangle className="h-4 w-4" />}
              {key === "israel" && <Newspaper className="h-4 w-4" />}
              {key === "tech" && <Code2 className="h-4 w-4" />}
              <span className="truncate">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.keys(NewsCategories).map((category) => (
          <TabsContent key={category} value={category}>
            {isLoading ? (
              renderSkeleton()
            ) : newsData?.articles?.length ? (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {newsData.articles.map((item: NewsItem, index: number) => (
                    <NewsCard key={index} item={item} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-8 gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }).map(
                        (_, i) => {
                          // Show pages around current page
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPage === pageNum ? "default" : "outline"
                              }
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        }
                      )}
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <>
                          <span className="px-2">...</span>
                          <Button
                            variant="outline"
                            onClick={() => setCurrentPage(totalPages)}
                          >
                            {totalPages}
                          </Button>
                        </>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Newspaper className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No news found</h3>
                <p className="text-sm text-muted-foreground">
                  We couldn't find any news for this category. Try adjusting
                  your search or filters.
                </p>
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default News;
