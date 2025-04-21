
import React, { createContext, useContext, useState } from "react";

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
  const [loadingSubscription] = useState(false);
  
  // Default subscription state
  const [subscription] = useState<Subscription>({
    isSubscribed: false,
    plan: null,
    status: null,
  });

  const createCheckoutSession = async (): Promise<string | null> => {
    console.log("Creating checkout session (disabled)");
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
