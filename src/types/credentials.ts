export interface APICredentials {
  openaiApiKey?: string;
  geminiApiKey?: string;
  deepseekApiKey?: string;
  googleApiKey?: string;
  leonardoApiKey?: string;
  newsApiKey?: string; // keep for consistency if used elsewhere
  facebookApiKey?: string; // add for settings
  facebookPageIds?: string;
}

export interface ApiKeyStatus {
  key: keyof APICredentials;
  isValid: boolean;
  loading?: boolean;
  error?: string;
}

export interface SubscriptionTier {
  name: string;
  limits: {
    contentGeneration: number;
    imageGeneration: number;
    codeAnalysis: boolean;
    newsAccess: boolean;
    advancedFeatures: boolean;
  };
}

export interface UserUsage {
  contentGeneration: number;
  imageGeneration: number;
  codeAnalysis: number;
  ocrUsage: number;
  translationUsage: number;
}
