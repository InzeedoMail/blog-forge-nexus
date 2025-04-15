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

interface ParaphraseOptions {
  text: string;
  language: "english" | "tamil";
  toneStyle?: string;
  preserveKeywords?: boolean;
  outputFormat?: "text" | "html";
}

interface GrammarCheckOptions {
  text: string;
  language: "english" | "tamil";
  detailedFeedback?: boolean;
}

interface GrammarCheckResponse {
  correctedText: string;
  issues: {
    original: string;
    suggested: string;
    reason: string;
    type: "grammar" | "spelling" | "punctuation" | "style";
  }[];
  score: number;
}

interface ArticleMetadata {
  wordCount: number;
  readingTime: number;
  seoScore: number;
  readabilityScore: number;
  keywordsFrequency: Record<string, number>;
  titleSeoScore: number;
  languageDetected: string;
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
  
      const systemPrompt = `You are a professional content writer who specializes in creating well-formatted, engaging ${contentType} content.`;
      
      let userPrompt = `Write a high-quality, engaging ${contentType} about "${topic}". 
      The content should be ${wordCount[length]} words long and target a ${audience} audience with a ${tone} tone.`;
      
      if (seoKeywords.length > 0) {
        userPrompt += `\nOptimize for these SEO keywords: ${seoKeywords.join(", ")}.`;
      }
      
      if (seoCountry !== "global") {
        userPrompt += `\nOptimize content specifically for ${seoCountry} readers and SEO.`;
      }
      
      userPrompt += `\nThe content should include:
      - An attention-grabbing headline (as an H1 at the top)
      - An engaging introduction that hooks the reader
      - Well-structured body with clear subheadings
      - Proper formatting for headings and subheadings (H2, H3, etc.)
      - Properly formatted code examples where relevant
      - Clear transitions between sections
      - A conclusion with a call to action`;
      
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
  
      const response = await this.openai.createChatCompletion({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      });
  
      const fullText = response.data.choices[0]?.message?.content || "";
      
      let content = fullText;
      let seoDescription = "";
      let extractedKeywords: string[] = [];
      let targetAudience = audience;
      let finalContentType = contentType;
      
      if (fullText.includes("SEO DESCRIPTION:")) {
        const mainContentEndIndex = fullText.indexOf("SEO DESCRIPTION:");
        content = fullText.substring(0, mainContentEndIndex).trim();
        
        const seoDescMatch = fullText.match(/SEO DESCRIPTION:(.*?)(?=SEO KEYWORDS:|TARGET AUDIENCE:|CONTENT TYPE:|$)/s);
        if (seoDescMatch && seoDescMatch[1]) {
          seoDescription = seoDescMatch[1].trim();
        }
        
        const seoKeywordsMatch = fullText.match(/SEO KEYWORDS:(.*?)(?=TARGET AUDIENCE:|CONTENT TYPE:|$)/s);
        if (seoKeywordsMatch && seoKeywordsMatch[1]) {
          extractedKeywords = seoKeywordsMatch[1].trim().split(/,\s*/);
        }
        
        const targetAudienceMatch = fullText.match(/TARGET AUDIENCE:(.*?)(?=CONTENT TYPE:|$)/s);
        if (targetAudienceMatch && targetAudienceMatch[1]) {
          targetAudience = targetAudienceMatch[1].trim();
        }
        
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

  async paraphraseContent(options: ParaphraseOptions): Promise<string> {
    try {
      const { 
        text, 
        language = "english",
        toneStyle = "professional",
        preserveKeywords = true,
        outputFormat = "text"
      } = options;
      
      if (!text || text.trim().length === 0) {
        throw new Error("No text provided for paraphrasing");
      }

      const systemPrompt = language === "english"
        ? `You are an expert paraphrasing assistant with excellent command of English. 
          Paraphrase the provided text while maintaining its meaning and key points.`
        : `You are an expert in Tamil language with excellent paraphrasing skills.
          Paraphrase the provided Tamil text while maintaining its meaning and key points.`;
      
      let userPrompt = ` 
      Paraphrase the following content professionally while preserving its structure. 
- make sure to paraphrase the content without changing its meaning.
-make sure to paraphrase in  ${language} text in a ${toneStyle} tone.
- Identify and keep all main headings (e.g., H1, H2) and subheadings.
- Maintain paragraph breaks and spacing.
- Enhance clarity, grammar, and formal tone.
- Do not remove or merge any important sections.
- Keep bullet points or numbered lists, if any, intact.
- Format output neatly with clear separation between headings and paragraphs.
`;
      
      if (preserveKeywords) {
        userPrompt += " Preserve important keywords, names, and technical terms.";
      }
      
      if (outputFormat === "html") {
        userPrompt += " Format the output with proper HTML tags for paragraphs, headings, and lists.";
      }
      
      userPrompt += `\n\nOriginal text:\n${text}`;
      
      const response = await this.openai.createChatCompletion({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.7,
      });
      
      return response.data.choices[0]?.message?.content || "Failed to paraphrase content";
    } catch (error) {
      console.error("Error paraphrasing content:", error);
      throw new Error("Failed to paraphrase content with OpenAI");
    }
  }

  async checkGrammar(options: GrammarCheckOptions): Promise<GrammarCheckResponse> {
    try {
      const { 
        text, 
        language = "english",
        detailedFeedback = true
      } = options;
      
      if (!text || text.trim().length === 0) {
        throw new Error("No text provided for grammar checking");
      }

      const systemPrompt = language === "english"
        ? `You are an expert grammar and language correction assistant with excellent command of English.
          Provide corrections and improvements to the given text.`
        : `You are an expert in Tamil language grammar and style.
          Provide corrections and improvements to the given Tamil text.`;
      
      const userPrompt = `Review the following ${language} text for grammar, spelling, punctuation, and style errors. 
      ${detailedFeedback ? 'Provide detailed feedback for each issue found.' : 'Provide a brief summary of issues.'}
      
      Return your response in the following JSON format:
      {
        "correctedText": "The full corrected text",
        "issues": [
          {
            "original": "original text with error",
            "suggested": "suggested correction",
            "reason": "brief explanation of correction",
            "type": "grammar/spelling/punctuation/style"
          }
        ],
        "score": 85 (a number from 0-100 representing overall language quality)
      }
      
      Text to check:
      ${text}`;
      
      const response = await this.openai.createChatCompletion({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
      });
      
      const responseContent = response.data.choices[0]?.message?.content || '';
      
      try {
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]) as GrammarCheckResponse;
        }
        
        return {
          correctedText: text,
          issues: [],
          score: 100
        };
      } catch (jsonError) {
        console.error("Error parsing grammar check response:", jsonError);
        return {
          correctedText: text,
          issues: [{
            original: "",
            suggested: "",
            reason: "Failed to process response",
            type: "grammar"
          }],
          score: 0
        };
      }
    } catch (error) {
      console.error("Error checking grammar:", error);
      throw new Error("Failed to check grammar with OpenAI");
    }
  }

  async analyzeArticleMetadata(text: string, title: string): Promise<ArticleMetadata> {
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    const readingTime = Math.ceil(wordCount / 200);
    
    try {
      const systemPrompt = `You are an expert content analyst specializing in SEO and readability.`;
      
      const userPrompt = `Analyze this article title and content for SEO and readability metrics.
      Return your analysis in the following JSON format:
      {
        "seoScore": 85,
        "readabilityScore": 80,
        "keywordsFrequency": {"keyword1": 5, "keyword2": 3},
        "titleSeoScore": 75,
        "languageDetected": "english or tamil"
      }
      
      Title: ${title}
      
      Content: ${text.substring(0, 2000)}${text.length > 2000 ? "..." : ""}`;
      
      const response = await this.openai.createChatCompletion({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
      });
      
      const responseContent = response.data.choices[0]?.message?.content || '';
      
      try {
        const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const aiAnalysis = JSON.parse(jsonMatch[0]);
          return {
            wordCount,
            readingTime,
            ...aiAnalysis
          };
        }
      } catch (jsonError) {
        console.error("Error parsing metadata analysis response:", jsonError);
      }
      
      return {
        wordCount,
        readingTime,
        seoScore: 0,
        readabilityScore: 0,
        keywordsFrequency: {},
        titleSeoScore: 0,
        languageDetected: text.match(/[\u0B80-\u0BFF]/) ? "tamil" : "english"
      };
    } catch (error) {
      console.error("Error analyzing article metadata:", error);
      
      return {
        wordCount,
        readingTime,
        seoScore: 0,
        readabilityScore: 0,
        keywordsFrequency: {},
        titleSeoScore: 0,
        languageDetected: text.match(/[\u0B80-\u0BFF]/) ? "tamil" : "english"
      };
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
