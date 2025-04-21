
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface Subscription {
  isSubscribed: boolean;
  plan: string | null;
  status: string | null;
}

interface SubscriptionContextType {
  subscription: Subscription;
  loadingSubscription: boolean;
  createCheckoutSession: (priceId: string) => Promise<string | null>;
  createCustomerPortalSession: () => Promise<string | null>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const { user } = useAuth();
  
  // Default subscription state
  const [subscription, setSubscription] = useState<Subscription>({
    isSubscribed: false,
    plan: null,
    status: null,
  });

  // Check if the user has a subscription (for demo purposes)
  useEffect(() => {
    if (user) {
      setLoadingSubscription(true);
      
      // Simulate API call
      setTimeout(() => {
        // For demo purposes, just set a default state
        setSubscription({
          isSubscribed: false,
          plan: null,
          status: null
        });
        setLoadingSubscription(false);
      }, 1000);
    }
  }, [user]);

  const createCheckoutSession = async (priceId: string): Promise<string | null> => {
    console.log("Creating checkout session (disabled)", priceId);
    return null;
  };

  const createCustomerPortalSession = async (): Promise<string | null> => {
    console.log("Creating customer portal session (disabled)");
    return null;
  };

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loadingSubscription,
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
