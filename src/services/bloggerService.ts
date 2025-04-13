
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
    try {
      // For Blogger API v3, we need to use OAuth for write operations, not just API key
      // But since we're using a simple integration, let's try with the API key first
      const response = await fetch(
        `https://www.googleapis.com/blogger/v3/blogs/${this.blogId}/posts?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            kind: "blogger#post",
            blog: {
              id: this.blogId
            },
            title: post.title,
            content: post.content,
            labels: post.labels || [],
          }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error details:", errorData);
        throw new Error(`API returned status: ${response.status}, message: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error creating post on Blogger:", error);
      throw error; // Propagate the original error for better debugging
    }
  }

  async updatePost(post: BloggerPost) {
    if (!post.id) {
      throw new Error("Post ID is required for update");
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/blogger/v3/blogs/${this.blogId}/posts/${post.id}?key=${this.apiKey}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            kind: "blogger#post",
            id: post.id,
            blog: {
              id: this.blogId
            },
            title: post.title,
            content: post.content,
            labels: post.labels || [],
          }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error details:", errorData);
        throw new Error(`API returned status: ${response.status}, message: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error updating post on Blogger:", error);
      throw error; // Propagate the original error for better debugging
    }
  }
}
