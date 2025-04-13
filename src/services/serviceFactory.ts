
import { OpenAIService } from "./openaiService";
import { BloggerService } from "./bloggerService";
// We'll add more imports as we implement other AI services
// import { GeminiService } from "./geminiService";

export class AIServiceFactory {
  private openaiService: OpenAIService | null = null;
  // private geminiService: GeminiService | null = null;
  
  constructor(
    private openaiApiKey?: string,
    private geminiApiKey?: string,
  ) {}

  getContentGenerationService() {
    // Try to use OpenAI first if API key is available
    if (this.openaiApiKey) {
      try {
        if (!this.openaiService) {
          this.openaiService = new OpenAIService(this.openaiApiKey);
        }
        return this.openaiService;
      } catch (error) {
        console.error("Failed to initialize OpenAI service:", error);
      }
    }

    // Fall back to Gemini if OpenAI fails or is unavailable
    // if (this.geminiApiKey) {
    //   try {
    //     if (!this.geminiService) {
    //       this.geminiService = new GeminiService(this.geminiApiKey);
    //     }
    //     return this.geminiService;
    //   } catch (error) {
    //     console.error("Failed to initialize Gemini service:", error);
    //   }
    // }

    // If all services fail, throw an error
    throw new Error("No content generation service available. Please check your API keys.");
  }

  getImageGenerationService() {
    // Currently, we're just using OpenAI's DALL-E for images
    if (this.openaiApiKey) {
      try {
        if (!this.openaiService) {
          this.openaiService = new OpenAIService(this.openaiApiKey);
        }
        return this.openaiService;
      } catch (error) {
        console.error("Failed to initialize OpenAI service:", error);
      }
    }

    // In the future, add fallbacks to other image generation services
    // like Leonardo.AI when we implement those services

    throw new Error("No image generation service available. Please check your API keys.");
  }
}

// Factory for Google services
export class GoogleServiceFactory {
  constructor(
    private googleApiKey?: string,
    private googleSheetId?: string,
    private bloggerBlogId?: string,
  ) {}

  getGoogleSheetsService() {
    if (this.googleApiKey && this.googleSheetId) {
      // Directly import GoogleSheetsService using dynamic import
      const { GoogleSheetsService } = require("./googleSheetsService");
      return new GoogleSheetsService(this.googleApiKey, this.googleSheetId);
    }
    throw new Error("Google Sheets API key or Sheet ID not provided");
  }

  getBloggerService() {
    if (this.googleApiKey && this.bloggerBlogId) {
      // Return a new instance of BloggerService
      return new BloggerService(this.googleApiKey, this.bloggerBlogId);
    }
    throw new Error("Google API key or Blogger Blog ID not provided");
  }
}
