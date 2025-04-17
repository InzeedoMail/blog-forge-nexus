import React, {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
} from "react";
import { APICredentials, ApiKeyStatus } from "@/types/credentials";
import { useToast } from "@/hooks/use-toast";

interface ApiKeyContextProps {
  apiKeys: APICredentials;
  apiKeyStatuses: { [key in keyof APICredentials]?: ApiKeyStatus };
  updateApiKey: (key: keyof APICredentials, value: string) => void;
  validateApiKey: (key: keyof APICredentials, value: string) => Promise<void>;
  validateAllApiKeys: () => Promise<void>;
}

const ApiKeyContext = createContext<ApiKeyContextProps | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [apiKeys, setApiKeys] = useState<APICredentials>({
    openaiApiKey: localStorage.getItem("openaiApiKey") || "",
    geminiApiKey: localStorage.getItem("geminiApiKey") || "",
    deepseekApiKey: localStorage.getItem("deepseekApiKey") || "",
    googleApiKey: localStorage.getItem("googleApiKey") || "",
    leonardoApiKey: localStorage.getItem("leonardoApiKey") || "",
  });

  const [apiKeyStatuses, setApiKeyStatuses] = useState<{
    [key in keyof APICredentials]?: ApiKeyStatus;
  }>({});

  const { toast } = useToast();

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = () => {
    setApiKeys({
      openaiApiKey: localStorage.getItem("openaiApiKey") || "",
      geminiApiKey: localStorage.getItem("geminiApiKey") || "",
      deepseekApiKey: localStorage.getItem("deepseekApiKey") || "",
      googleApiKey: localStorage.getItem("googleApiKey") || "",
      leonardoApiKey: localStorage.getItem("leonardoApiKey") || "",
    });
  };

  const updateApiKey = (key: keyof APICredentials, value: string) => {
    setApiKeys((prevApiKeys) => ({
      ...prevApiKeys,
      [key]: value,
    }));
    localStorage.setItem(key, value);
  };

  const validateApiKey = async (key: keyof APICredentials, value: string): Promise<void> => {
    setApiKeyStatuses((prevStatuses) => ({
      ...prevStatuses,
      [key]: { key, isValid: false, loading: true, error: undefined },
    }));

    try {
      let isValid = false;
      let errorMessage: string | undefined = undefined;

      switch (key) {
        case "openaiApiKey":
          isValid = value.startsWith("sk-");
          if (!isValid) errorMessage = "Invalid OpenAI API Key format.";
          break;
        case "geminiApiKey":
          isValid = value.length > 0;
          if (!isValid) errorMessage = "Invalid Gemini API Key format.";
          break;
        case "deepseekApiKey":
          isValid = value.length > 0;
          if (!isValid) errorMessage = "Invalid Deepseek API Key format.";
          break;
        case "googleApiKey":
          isValid = value.length > 0;
          if (!isValid) errorMessage = "Invalid Google API Key format.";
          break;
        case "leonardoApiKey":
          isValid = value.length > 0;
          if (!isValid) errorMessage = "Invalid Leonardo API Key format.";
          break;
        default:
          console.warn("Unknown API key type:", key);
          break;
      }

      setApiKeyStatuses((prevStatuses) => ({
        ...prevStatuses,
        [key]: { key, isValid, loading: false, error: errorMessage },
      }));

      if (!isValid && errorMessage) {
        toast({
          title: "Invalid API Key",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error validating API key:", error);
      setApiKeyStatuses((prevStatuses) => ({
        ...prevStatuses,
        [key]: {
          key,
          isValid: false,
          loading: false,
          error: error.message || "Failed to validate API key.",
        },
      }));
      toast({
        title: "API Key Validation Error",
        description: error.message || "Failed to validate API key.",
        variant: "destructive",
      });
    }
    return undefined; // Make sure to return void
  };

  const validateAllApiKeys = async (): Promise<void> => {
    for (const key of Object.keys(apiKeys) as (keyof APICredentials)[]) {
      await validateApiKey(key, apiKeys[key] || "");
    }
    return undefined; // Make sure to return void
  };

  const contextValue: ApiKeyContextProps = {
    apiKeys,
    apiKeyStatuses,
    updateApiKey,
    validateApiKey,
    validateAllApiKeys,
  };

  return (
    <ApiKeyContext.Provider value={contextValue}>{children}</ApiKeyContext.Provider>
  );
};

export const useApiKey = (): ApiKeyContextProps => {
  const context = useContext(ApiKeyContext);
  if (!context) {
    throw new Error("useApiKey must be used within a ApiKeyProvider");
  }
  return context;
};
