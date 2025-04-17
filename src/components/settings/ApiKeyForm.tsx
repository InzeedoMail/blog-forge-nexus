
import React, { useState } from "react";
import { useApiKeys } from "@/contexts/ApiKeyContext";
import { APICredentials } from "@/types/credentials";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Check, Save, Key, RefreshCw } from "lucide-react";

interface ApiKeyFormProps {
  keyType: keyof APICredentials;
  title: string;
  description: string;
  placeholder?: string;
}

const ApiKeyForm: React.FC<ApiKeyFormProps> = ({
  keyType,
  title,
  description,
  placeholder = "Enter your API key",
}) => {
  const { credentials, setCredential, apiKeyStatuses, validateCredential } = useApiKeys();
  const [apiKey, setApiKey] = useState<string>(credentials[keyType] || "");
  const [validating, setValidating] = useState(false);

  const status = apiKeyStatuses.find(status => status.key === keyType) || {
    key: keyType,
    isValid: false,
    loading: false,
    error: undefined
  };

  const handleSave = async () => {
    if (!apiKey.trim()) return;
    await setCredential(keyType, apiKey.trim());
  };

  const handleValidate = async () => {
    if (!apiKey.trim()) return;
    
    setValidating(true);
    try {
      const isValid = await validateCredential(keyType);
      setValidating(false);
    } catch (error) {
      console.error(`Error validating ${keyType}:`, error);
      setValidating(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center">
          <Key className="h-5 w-5 mr-2 text-muted-foreground" />
          {title}
          {status.loading ? (
            <RefreshCw className="h-4 w-4 ml-2 animate-spin text-amber-500" />
          ) : status.isValid ? (
            <Check className="h-4 w-4 ml-2 text-green-500" />
          ) : null}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="password"
            placeholder={placeholder}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          {status.error && (
            <div className="flex items-center text-red-500 text-sm">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {status.error}
            </div>
          )}
          {status.isValid && (
            <div className="flex items-center text-green-500 text-sm">
              <Check className="h-4 w-4 mr-1" />
              API key validated successfully
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleValidate}
          disabled={!apiKey.trim() || validating || status.loading}
        >
          {validating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Validating...
            </>
          ) : (
            "Validate"
          )}
        </Button>
        <Button
          className="flex-1"
          onClick={handleSave}
          disabled={!apiKey.trim() || status.loading}
        >
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApiKeyForm;
