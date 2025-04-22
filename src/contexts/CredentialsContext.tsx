import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

interface Credentials {
  openaiApiKey?: string;
  googleApiKey?: string;
  googleSheetId?: string;
  bloggerBlogId?: string;
  leonardoApiKey?: string;
  geminiApiKey?: string;
  newsApikey?: string;
  facebookApiKey?: string;
  facebookPageIds?: string;
}

interface CredentialsContextType {
  credentials: Credentials;
  setCredential: (key: keyof Credentials, value: string) => void;
  clearCredentials: () => void;
}

const CredentialsContext = createContext<CredentialsContextType | undefined>(
  undefined
);

export const CredentialsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [credentials, setCredentials] = useState<Credentials>({});
  const { toast } = useToast();

  useEffect(() => {
    // Load credentials from encrypted localStorage
    const savedCredentials = localStorage.getItem("credentials");
    if (savedCredentials) {
      try {
        // In a real application, you would decrypt this data
        const parsedCredentials = JSON.parse(savedCredentials);
        setCredentials(parsedCredentials);
      } catch (error) {
        console.error("Failed to parse credentials from localStorage", error);
        localStorage.removeItem("credentials");
      }
    }
  }, []);

  const setCredential = (key: keyof Credentials, value: string) => {
    setCredentials((prev) => {
      const updated = { ...prev, [key]: value };

      // In a real application, you would encrypt this data
      localStorage.setItem("credentials", JSON.stringify(updated));

      return updated;
    });

    toast({
      title: "Credential updated",
      description: `Your ${key} has been updated successfully.`,
    });
  };

  const clearCredentials = () => {
    setCredentials({});
    localStorage.removeItem("credentials");
    toast({
      title: "Credentials cleared",
      description: "All your API credentials have been removed.",
    });
  };

  return (
    <CredentialsContext.Provider
      value={{
        credentials,
        setCredential,
        clearCredentials,
      }}
    >
      {children}
    </CredentialsContext.Provider>
  );
};

export const useCredentials = () => {
  const context = useContext(CredentialsContext);
  if (context === undefined) {
    throw new Error("useCredentials must be used within a CredentialsProvider");
  }
  return context;
};
