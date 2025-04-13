
interface BloggerPost {
  title: string;
  content: string;
  labels?: string[];
  id?: string;
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
      const { google } = await import("googleapis");
      const blogger = google.blogger({
        version: "v3",
        auth: this.apiKey,
      });

      const response = await blogger.posts.list({
        blogId: this.blogId,
        maxResults: 20,
      });

      return response.data.items || [];
    } catch (error) {
      console.error("Error fetching posts from Blogger:", error);
      throw new Error("Failed to fetch posts from Blogger");
    }
  }

  async createPost(post: BloggerPost) {
    try {
      const { google } = await import("googleapis");
      const blogger = google.blogger({
        version: "v3",
        auth: this.apiKey,
      });

      const response = await blogger.posts.insert({
        blogId: this.blogId,
        requestBody: {
          title: post.title,
          content: post.content,
          labels: post.labels,
        },
      });

      return response.data;
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
      const { google } = await import("googleapis");
      const blogger = google.blogger({
        version: "v3",
        auth: this.apiKey,
      });

      const response = await blogger.posts.update({
        blogId: this.blogId,
        postId: post.id,
        requestBody: {
          title: post.title,
          content: post.content,
          labels: post.labels,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error updating post on Blogger:", error);
      throw new Error("Failed to update post on Blogger");
    }
  }
}
