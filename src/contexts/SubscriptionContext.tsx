
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "./AuthContext";

export type SubscriptionTier = 'free' | 'basic' | 'premium' | 'enterprise';

export interface SubscriptionInfo {
  isSubscribed: boolean;
  tier: SubscriptionTier;
  expiresAt: string | null;
  features: {
    contentGeneration: number; // Words per month
    imageGeneration: number; // Images per month
    ocr: boolean;
    codeAnalysis: boolean;
    advancedTranslation: boolean;
  };
  usage: {
    contentGeneration: number;
    imageGeneration: number;
  };
}

interface SubscriptionContextType {
  subscription: SubscriptionInfo;
  isLoading: boolean;
  error: string | null;
  refreshSubscription: () => Promise<void>;
  createCheckoutSession: (priceId: string) => Promise<string | null>;
  createCustomerPortalSession: () => Promise<string | null>;
}

const defaultSubscription: SubscriptionInfo = {
  isSubscribed: false,
  tier: 'free',
  expiresAt: null,
  features: {
    contentGeneration: 1000,
    imageGeneration: 5,
    ocr: false,
    codeAnalysis: false,
    advancedTranslation: false,
  },
  usage: {
    contentGeneration: 0,
    imageGeneration: 0,
  }
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<SubscriptionInfo>(defaultSubscription);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isAuthenticated && user) {
      refreshSubscription();
    } else {
      setSubscription(defaultSubscription);
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  const refreshSubscription = async () => {
    if (!isAuthenticated || !user) {
      setSubscription(defaultSubscription);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Call the edge function to check subscription status
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data) {
        // Determine features based on subscription tier
        const tier = data.subscription_tier?.toLowerCase() as SubscriptionTier || 'free';
        const features = getTierFeatures(tier);
        
        // Fetch usage data
        const { data: usageData, error: usageError } = await supabase
          .from('user_usage')
          .select('content_generation, image_generation')
          .eq('user_id', user.id)
          .single();
        
        if (usageError && usageError.code !== 'PGRST116') { // PGRST116 means no rows
          console.error("Error fetching usage data:", usageError);
        }
        
        const usage = usageData || { content_generation: 0, image_generation: 0 };
        
        setSubscription({
          isSubscribed: data.subscribed || false,
          tier,
          expiresAt: data.subscription_end || null,
          features,
          usage: {
            contentGeneration: usage.content_generation || 0,
            imageGeneration: usage.image_generation || 0,
          }
        });
      }
    } catch (err: any) {
      console.error("Error fetching subscription:", err);
      setError(err.message || "Failed to fetch subscription status");
      toast({
        title: "Subscription error",
        description: "Failed to load your subscription information. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTierFeatures = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'basic':
        return {
          contentGeneration: 10000,
          imageGeneration: 20,
          ocr: true,
          codeAnalysis: false,
          advancedTranslation: false,
        };
      case 'premium':
        return {
          contentGeneration: 50000,
          imageGeneration: 100,
          ocr: true,
          codeAnalysis: true,
          advancedTranslation: true,
        };
      case 'enterprise':
        return {
          contentGeneration: 100000,
          imageGeneration: 500,
          ocr: true,
          codeAnalysis: true,
          advancedTranslation: true,
        };
      case 'free':
      default:
        return {
          contentGeneration: 1000,
          imageGeneration: 5,
          ocr: false,
          codeAnalysis: false,
          advancedTranslation: false,
        };
    }
  };

  const createCheckoutSession = async (priceId: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data?.url || null;
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Checkout error",
        description: error.message || "Failed to create checkout session",
        variant: "destructive"
      });
      return null;
    }
  };

  const createCustomerPortalSession = async (): Promise<string | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data?.url || null;
    } catch (error: any) {
      console.error("Error creating customer portal session:", error);
      toast({
        title: "Portal error",
        description: error.message || "Failed to access customer portal",
        variant: "destructive"
      });
      return null;
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        isLoading,
        error,
        refreshSubscription,
        createCheckoutSession,
        createCustomerPortalSession,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
};
