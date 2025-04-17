
export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  name: string | null;
  avatar_url: string | null;
  subscription_tier: string | null;
  subscription_status: string | null;
  subscription_end_date: string | null;
}

export interface UserApiKey {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  key_type: string;
  key_value: string;
}

export interface Customer {
  id: string;
  created_at: string;
  user_id: string;
  stripe_customer_id: string;
  email: string;
}

export interface Subscription {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  subscribed: boolean;
  stripe_subscription_id: string | null;
  subscription_tier: string;
  subscription_end: string | null;
}

export interface UserUsage {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  content_generation: number;
  image_generation: number;
  code_analysis: number;
  ocr_usage: number;
  translation_usage: number;
}
