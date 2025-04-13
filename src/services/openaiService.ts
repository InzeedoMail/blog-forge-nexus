
import { Configuration, OpenAIApi } from "openai";

export class OpenAIService {
  private openai: OpenAIApi;

  constructor(apiKey: string) {
    const configuration = new Configuration({
      apiKey,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async generateBlogPost(
    topic: string, 
    length: "short" | "medium" | "long" = "medium"
  ) {
    try {
      const wordCount = {
        short: "500-800",
        medium: "800-1200",
        long: "1500-2000",
      };

      const prompt = `Write a high-quality, engaging blog post about "${topic}". 
      The post should be ${wordCount[length]} words long and include:
      - An attention-grabbing headline
      - An engaging introduction that hooks the reader
      - Well-structured body with subheadings
      - A conclusion with a call to action
      - Use a professional but conversational tone.
      Format the output as a JSON object with "title" and "body" fields. The body should include markdown formatting.`;

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
