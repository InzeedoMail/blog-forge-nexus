
interface BloggerPost {
  title: string;
  content: string;
  labels?: string[];
  id?: string;
  url?: string;
  published?: string;
  updated?: string;
}

export class BloggerService {
  private apiKey: string;
  private blogId: string;

  constructor(apiKey: string, blogId: string) {
    this.apiKey = apiKey;
    this.blogId = blogId;
  }

  async getPosts() {
    try {
      const response = await fetch(
        `https://www.googleapis.com/blogger/v3/blogs/${this.blogId}/posts?key=${this.apiKey}&maxResults=20`
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API returned status: ${response.status}, message: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error("Error fetching posts from Blogger:", error);
      throw error; // Propagate the original error for better debugging
    }
  }

  async createPost(post: BloggerPost) {
    throw new Error(
      "Creating posts requires OAuth authentication. This app currently only supports read operations with API keys. " +
      "Please check the Blogger documentation for implementing OAuth 2.0 authentication."
    );
  }

  async updatePost(post: BloggerPost) {
    throw new Error(
      "Updating posts requires OAuth authentication. This app currently only supports read operations with API keys. " +
      "Please check the Blogger documentation for implementing OAuth 2.0 authentication."
    );
  }
}
