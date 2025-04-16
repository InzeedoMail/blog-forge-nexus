
export interface NewsItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
}

export const NewsCategories = {
  srilanka: "Sri Lanka News",
  world: "World News",
  gaza: "Gaza Updates",
  israel: "Israel News",
  tech: "Technology",
} as const;

export const languageOptions = [
  { value: "en", label: "English" },
  { value: "ta", label: "Tamil" },
  { value: "si", label: "Sinhala" },
  { value: "ar", label: "Arabic" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
] as const;
