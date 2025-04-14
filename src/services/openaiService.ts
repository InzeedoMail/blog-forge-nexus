
import { Configuration, OpenAIApi } from "openai";

interface ContentGenerationOptions {
  topic: string;
  length: "short" | "medium" | "long";
  audience?: string;
  tone?: string;
  contentType?: string;
  seoKeywords?: string[];
  seoCountry?: string;
  includeHtml?: boolean;
}

export class OpenAIService {
  private openai: OpenAIApi;

  constructor(apiKey: string) {
    const configuration = new Configuration({
      apiKey,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async generateBlogPost(options: ContentGenerationOptions) {
    try {
      const { 
        topic, 
        length = "medium", 
        audience = "general",
        tone = "professional",
        contentType = "blog",
        seoKeywords = [],
        seoCountry = "global",
        includeHtml = false
      } = options;
      
      const wordCount = {
        short: "500-800",
        medium: "800-1200",
        long: "1500-2000",
      };

      // Build a comprehensive prompt based on all options
      let prompt = `Write a high-quality, engaging ${contentType} about "${topic}". 
      The post should be ${wordCount[length]} words long and target a ${audience} audience with a ${tone} tone.`;
      
      // Add SEO keywords if provided
      if (seoKeywords.length > 0) {
        prompt += `\nOptimize for these SEO keywords: ${seoKeywords.join(", ")}.`;
      }
      
      // Add country-specific SEO if not global
      if (seoCountry !== "global") {
        prompt += `\nOptimize content specifically for ${seoCountry} readers and SEO.`;
      }
      
      // Structure requirements
      prompt += `\nThe content should include:
      - An attention-grabbing headline
      - An engaging introduction that hooks the reader
      - Well-structured body with subheadings
      - A conclusion with a call to action`;
      
      // Format instructions
      if (includeHtml) {
        prompt += `\nFormat the output with HTML tags for headings, paragraphs, lists, etc.`;
      } else {
        prompt += `\nUse markdown formatting.`;
      }
      
      prompt += `\nFormat the output as a JSON object with these fields:
      - "title": the headline
      - "body": the formatted content
      - "seoDescription": a compelling 150-160 character meta description
      - "seoKeywords": suggested SEO keywords based on the content (array)
      - "targetAudience": who this content is best suited for
      - "contentType": "${contentType}"`;

      const response = await this.openai.createCompletion({
        model: "gpt-3.5-turbo-instruct",
        prompt,
        max_tokens: 2500,
        temperature: 0.7,
      });

      const text = response.data.choices[0]?.text || "";
      
      try {
        // Try to parse as JSON
        return JSON.parse(text.trim());
      } catch (e) {
        // If parsing fails, create a structured response manually
        return {
          title: text.split("\n")[0].replace(/^#\s*/, ""),
          body: text,
          seoDescription: "",
          seoKeywords: [],
          targetAudience: audience,
          contentType: contentType,
        };
      }
    } catch (error) {
      console.error("Error generating blog post with OpenAI:", error);
      throw new Error("Failed to generate content with OpenAI");
    }
  }

  async generateImage(prompt: string) {
    try {
      const response = await this.openai.createImage({
        prompt,
        n: 1,
        size: "1024x1024",
      });

      return response.data.data[0].url;
    } catch (error) {
      console.error("Error generating image with DALL-E:", error);
      throw new Error("Failed to generate image with DALL-E");
    }
  }
}
