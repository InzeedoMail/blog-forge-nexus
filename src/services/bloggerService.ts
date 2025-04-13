
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
        throw new Error(`API returned status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error("Error fetching posts from Blogger:", error);
      throw new Error("Failed to fetch posts from Blogger");
    }
  }

  async createPost(post: BloggerPost) {
    try {
      const response = await fetch(
        `https://www.googleapis.com/blogger/v3/blogs/${this.blogId}/posts?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: post.title,
            content: post.content,
            labels: post.labels,
          }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API returned status: ${response.status}, message: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error creating post on Blogger:", error);
      throw new Error("Failed to create post on Blogger");
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
            title: post.title,
            content: post.content,
            labels: post.labels,
          }),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API returned status: ${response.status}, message: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error updating post on Blogger:", error);
      throw new Error("Failed to update post on Blogger");
    }
  }
}
