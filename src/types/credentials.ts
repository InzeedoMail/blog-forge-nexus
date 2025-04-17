
export interface APICredentials {
  openaiApiKey?: string;
  geminiApiKey?: string;
  deepseekApiKey?: string;
  googleApiKey?: string;
  leonardoApiKey?: string;
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
