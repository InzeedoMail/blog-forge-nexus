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
    if (isAuthenticated && user) {
      loadCredentials();
    } else {
      setCredentials({});
      setApiKeyStatuses([]);
    }
  }, [isAuthenticated, user]);

  const loadCredentials = async () => {
    try {
      if (!user?.id) return;
      
      const cachedCredentials = secureStorage.getItem<APICredentials>("apiCredentials", {});
      
      const { data, error } = await supabase
        .from('user_api_keys')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
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
        
        setCredentials(fetchedCredentials);
        secureStorage.setItem("apiCredentials", fetchedCredentials);
      } else if (Object.keys(cachedCredentials).length > 0) {
        setCredentials(cachedCredentials);
        
        Object.keys(cachedCredentials).forEach(key => {
          statuses.push({
            key: key as keyof APICredentials,
            isValid: Boolean(cachedCredentials[key as keyof APICredentials]),
            loading: false
          });
        });
      }
      
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
      
      setApiKeyStatuses(prev => 
        prev.map(status => 
          status.key === key 
            ? { ...status, loading: true } 
            : status
        )
      );
      
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
      
      setCredentials(prev => ({ ...prev, [key]: value }));
      
      const storedCredentials = secureStorage.getItem<APICredentials>("apiCredentials", {});
      secureStorage.setItem("apiCredentials", { ...storedCredentials, [key]: value });
      
      const isValid = await validateCredential(key);
      
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
      
      const { error } = await supabase
        .from('user_api_keys')
        .delete()
        .eq('user_id', user.id);
      
      if (error) {
        throw error;
      }
      
      setCredentials({});
      
      secureStorage.removeItem("apiCredentials");
      
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
