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

interface FormattedContentResponse {
  content: string;
  seoMetadata: {
    description: string;
    keywords: string[];
    targetAudience: string;
    contentType: string;
  }
}

export class OpenAIService {
  private openai: OpenAIApi;

  constructor(apiKey: string) {
    const configuration = new Configuration({
      apiKey,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async generateBlogPost(options: ContentGenerationOptions): Promise<FormattedContentResponse> {
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
        long: "1500-3000",
      };
  
      // Build a comprehensive prompt based on all options
      const systemPrompt = `You are a professional content writer who specializes in creating well-formatted, engaging ${contentType} content.`;
      
      let userPrompt = `Write a high-quality, engaging ${contentType} about "${topic}". 
      The content should be ${wordCount[length]} words long and target a ${audience} audience with a ${tone} tone.`;
      
      // Add SEO keywords if provided
      if (seoKeywords.length > 0) {
        userPrompt += `\nOptimize for these SEO keywords: ${seoKeywords.join(", ")}.`;
      }
      
      // Add country-specific SEO if not global
      if (seoCountry !== "global") {
        userPrompt += `\nOptimize content specifically for ${seoCountry} readers and SEO.`;
      }
      
      // Structure requirements
      userPrompt += `\nThe content should include:
      - An attention-grabbing headline (as an H1 at the top)
      - An engaging introduction that hooks the reader
      - Well-structured body with clear subheadings
      - Proper formatting for headings and subheadings (H2, H3, etc.)
      - Properly formatted code examples where relevant
      - Clear transitions between sections
      - A conclusion with a call to action`;
      
      // Format instructions
      if (includeHtml) {
        userPrompt += `\nFormat the output with proper HTML tags for headings, paragraphs, lists, etc.`;
      } else {
        userPrompt += `\nUse proper markdown formatting with # for H1, ## for H2, etc.`;
      }
  
      userPrompt += `\nFor each section:
      - Include practical examples, code snippets, or case studies where relevant
      - Explain concepts in an accessible way for ${audience}
      - Highlight important information in bullet points or numbered lists
      - Suggest where images would enhance understanding (with [IMAGE: description] placeholders)`;
      
      userPrompt += `\n\nAfter the main content, please provide the following metadata on separate lines with clear labels:
      
      SEO DESCRIPTION: A compelling 150-160 character meta description
      SEO KEYWORDS: 5-7 suggested SEO keywords based on the content
      TARGET AUDIENCE: Who this content is best suited for
      CONTENT TYPE: ${contentType}
      
      Format the main content properly with appropriate spacing between paragraphs and sections. Do not wrap the response in JSON or code blocks.`;
  
      // Use createChatCompletion with separating the main content from SEO info
      const response = await this.openai.createChatCompletion({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      });
  
      const fullText = response.data.choices[0]?.message?.content || "";
      
      // Split the content and metadata
      let content = fullText;
      let seoDescription = "";
      let extractedKeywords: string[] = [];
      let targetAudience = audience;
      let finalContentType = contentType;
      
      // Check if there's metadata at the end and extract it
      if (fullText.includes("SEO DESCRIPTION:")) {
        const mainContentEndIndex = fullText.indexOf("SEO DESCRIPTION:");
        content = fullText.substring(0, mainContentEndIndex).trim();
        
        // Extract SEO description
        const seoDescMatch = fullText.match(/SEO DESCRIPTION:(.*?)(?=SEO KEYWORDS:|TARGET AUDIENCE:|CONTENT TYPE:|$)/s);
        if (seoDescMatch && seoDescMatch[1]) {
          seoDescription = seoDescMatch[1].trim();
        }
        
        // Extract SEO keywords
        const seoKeywordsMatch = fullText.match(/SEO KEYWORDS:(.*?)(?=TARGET AUDIENCE:|CONTENT TYPE:|$)/s);
        if (seoKeywordsMatch && seoKeywordsMatch[1]) {
          extractedKeywords = seoKeywordsMatch[1].trim().split(/,\s*/);
        }
        
        // Extract target audience
        const targetAudienceMatch = fullText.match(/TARGET AUDIENCE:(.*?)(?=CONTENT TYPE:|$)/s);
        if (targetAudienceMatch && targetAudienceMatch[1]) {
          targetAudience = targetAudienceMatch[1].trim();
        }
        
        // Extract content type
        const contentTypeMatch = fullText.match(/CONTENT TYPE:(.*?)$/s);
        if (contentTypeMatch && contentTypeMatch[1]) {
          finalContentType = contentTypeMatch[1].trim();
        }
      }
      
      return {
        content: content,
        seoMetadata: {
          description: seoDescription,
          keywords: seoKeywords,
          targetAudience: targetAudience,
          contentType: finalContentType
        }
      };
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