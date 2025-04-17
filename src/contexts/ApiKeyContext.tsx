
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "./AuthContext";
import { secureStorage } from "@/utils/secureStorage";
import { APICredentials, ApiKeyStatus } from "@/types/credentials";

interface ApiKeyContextType {
  credentials: APICredentials;
  setCredential: (key: keyof APICredentials, value: string) => Promise<void>;
  clearCredentials: () => Promise<void>;
  validateCredential: (key: keyof APICredentials) => Promise<boolean>;
  apiKeyStatuses: ApiKeyStatus[];
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [credentials, setCredentials] = useState<APICredentials>({});
  const [apiKeyStatuses, setApiKeyStatuses] = useState<ApiKeyStatus[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load credentials when user is authenticated
    if (isAuthenticated && user) {
      loadCredentials();
    } else {
      // Clear credentials when user logs out
      setCredentials({});
      setApiKeyStatuses([]);
    }
  }, [isAuthenticated, user]);

  const loadCredentials = async () => {
    try {
      if (!user?.id) return;
      
      // First try to get from local storage (temporary solution for quick access)
      const cachedCredentials = secureStorage.getItem<APICredentials>("apiCredentials", {});
      
      // Always fetch the latest from the database
      const { data, error } = await supabase
        .from('user_api_keys')
        .select('key_type, key_value')
        .eq('user_id', user.id);
      
      if (error) {
        console.error("Error loading API keys:", error);
        return;
      }
      
      const fetchedCredentials: APICredentials = {};
      const statuses: ApiKeyStatus[] = [];
      
      if (data && data.length > 0) {
        data.forEach(item => {
          const keyName = item.key_type as keyof APICredentials;
          fetchedCredentials[keyName] = item.key_value;
          
          statuses.push({
            key: keyName,
            isValid: Boolean(item.key_value),
            loading: false
          });
        });
        
        // Update local state with fetched credentials
        setCredentials(fetchedCredentials);
        
        // Cache in secure storage for quick access
        secureStorage.setItem("apiCredentials", fetchedCredentials);
      } else if (Object.keys(cachedCredentials).length > 0) {
        // Use cached credentials if available
        setCredentials(cachedCredentials);
        
        // Generate statuses for cached credentials
        Object.keys(cachedCredentials).forEach(key => {
          statuses.push({
            key: key as keyof APICredentials,
            isValid: Boolean(cachedCredentials[key as keyof APICredentials]),
            loading: false
          });
        });
      }
      
      // Initialize statuses for all credential types
      const allKeys: (keyof APICredentials)[] = [
        'openaiApiKey', 
        'geminiApiKey', 
        'deepseekApiKey',
        'googleApiKey',
        'leonardoApiKey'
      ];
      
      allKeys.forEach(key => {
        if (!statuses.some(status => status.key === key)) {
          statuses.push({
            key,
            isValid: false,
            loading: false
          });
        }
      });
      
      setApiKeyStatuses(statuses);
    } catch (error) {
      console.error("Error in loadCredentials:", error);
    }
  };

  const setCredential = async (key: keyof APICredentials, value: string) => {
    try {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      
      // Update API key status to loading
      setApiKeyStatuses(prev => 
        prev.map(status => 
          status.key === key 
            ? { ...status, loading: true } 
            : status
        )
      );
      
      // Update in database
      const { error } = await supabase
        .from('user_api_keys')
        .upsert({
          user_id: user.id,
          key_type: key,
          key_value: value,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,key_type'
        });
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setCredentials(prev => ({ ...prev, [key]: value }));
      
      // Update in secure storage
      const storedCredentials = secureStorage.getItem<APICredentials>("apiCredentials", {});
      secureStorage.setItem("apiCredentials", { ...storedCredentials, [key]: value });
      
      // Validate the credential
      const isValid = await validateCredential(key);
      
      // Update API key status
      setApiKeyStatuses(prev => 
        prev.map(status => 
          status.key === key 
            ? { key, isValid, loading: false } 
            : status
        )
      );
      
      toast({
        title: "API key updated",
        description: `Your ${key} has been updated successfully.`,
      });
      
      return true;
    } catch (error: any) {
      console.error(`Error setting ${key}:`, error);
      
      // Update API key status to error
      setApiKeyStatuses(prev => 
        prev.map(status => 
          status.key === key 
            ? { key, isValid: false, loading: false, error: error.message } 
            : status
        )
      );
      
      toast({
        title: "Error updating API key",
        description: error.message || `Failed to update ${key}.`,
        variant: "destructive",
      });
      
      return false;
    }
  };

  const clearCredentials = async () => {
    try {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      
      // Delete from database
      const { error } = await supabase
        .from('user_api_keys')
        .delete()
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      // Clear local state
      setCredentials({});
      
      // Clear from secure storage
      secureStorage.removeItem("apiCredentials");
      
      // Reset API key statuses
      const resetStatuses: ApiKeyStatus[] = [
        { key: 'openaiApiKey', isValid: false, loading: false },
        { key: 'geminiApiKey', isValid: false, loading: false },
        { key: 'deepseekApiKey', isValid: false, loading: false },
        { key: 'googleApiKey', isValid: false, loading: false },
        { key: 'leonardoApiKey', isValid: false, loading: false }
      ];
      setApiKeyStatuses(resetStatuses);
      
      toast({
        title: "Credentials cleared",
        description: "All your API credentials have been removed.",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error clearing credentials:", error);
      
      toast({
        title: "Error clearing credentials",
        description: error.message || "Failed to clear your API credentials.",
        variant: "destructive",
      });
      
      return false;
    }
  };

  const validateCredential = async (key: keyof APICredentials): Promise<boolean> => {
    try {
      const value = credentials[key];
      if (!value) return false;
      
      // Call appropriate validation edge function
      const { data, error } = await supabase.functions.invoke('validate-api-key', {
        body: { keyType: key, keyValue: value }
      });
      
      if (error) throw new Error(error.message);
      
      return data?.isValid || false;
    } catch (error) {
      console.error(`Error validating ${key}:`, error);
      return false;
    }
  };

  return (
    <ApiKeyContext.Provider
      value={{
        credentials,
        setCredential,
        clearCredentials,
        validateCredential,
        apiKeyStatuses
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
};

export const useApiKeys = () => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error("useApiKeys must be used within an ApiKeyProvider");
  }
  return context;
};
