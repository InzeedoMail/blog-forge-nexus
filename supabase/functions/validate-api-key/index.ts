
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const { keyType, keyValue } = await req.json();
    if (!keyType || !keyValue) {
      return new Response(
        JSON.stringify({ error: "Missing key type or value" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    let isValid = false;
    let error = null;

    switch (keyType) {
      case "openaiApiKey":
        isValid = await validateOpenAIKey(keyValue);
        break;
      case "geminiApiKey":
        isValid = await validateGeminiKey(keyValue);
        break;
      case "deepseekApiKey":
        isValid = await validateDeepseekKey(keyValue);
        break;
      case "googleApiKey":
        isValid = await validateGoogleApiKey(keyValue);
        break;
      case "leonardoApiKey":
        isValid = await validateLeonardoKey(keyValue);
        break;
      default:
        error = "Unsupported API key type";
    }

    return new Response(
      JSON.stringify({ isValid, error }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Server error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

async function validateOpenAIKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });
    
    return response.status === 200;
  } catch (error) {
    console.error("OpenAI validation error:", error);
    return false;
  }
}

async function validateGeminiKey(apiKey: string): Promise<boolean> {
  try {
    // Use a simple request to validate Gemini API key
    const url = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
    const response = await fetch(url);
    
    return response.status === 200;
  } catch (error) {
    console.error("Gemini validation error:", error);
    return false;
  }
}

async function validateDeepseekKey(apiKey: string): Promise<boolean> {
  try {
    // Validate Deepseek API key by making a simple request
    const response = await fetch("https://api.deepseek.com/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });
    
    return response.status === 200;
  } catch (error) {
    console.error("Deepseek validation error:", error);
    return false;
  }
}

async function validateGoogleApiKey(apiKey: string): Promise<boolean> {
  try {
    // Use Google Translate API to validate Google API key
    const url = `https://translation.googleapis.com/language/translate/v2/languages?key=${apiKey}`;
    const response = await fetch(url);
    
    return response.status === 200;
  } catch (error) {
    console.error("Google API validation error:", error);
    return false;
  }
}

async function validateLeonardoKey(apiKey: string): Promise<boolean> {
  try {
    // Validate Leonardo.AI API key
    const response = await fetch("https://cloud.leonardo.ai/api/rest/v1/me", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });
    
    return response.status === 200;
  } catch (error) {
    console.error("Leonardo API validation error:", error);
    return false;
  }
}
