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
      // Get the OAuth token from localStorage
      const accessToken = localStorage.getItem("accessToken");
      
      if (!accessToken) {
        throw new Error("OAuth token not found. Please login again.");
      }

      // First check if we can get the blog ID using the OAuth token
      const blogRes = await fetch(
        "https://www.googleapis.com/blogger/v3/users/self/blogs",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!blogRes.ok) {
        // If this fails, the token might be invalid or expired
        const errorData = await blogRes.json().catch(() => ({}));
        throw new Error(`Failed to get blog details: ${blogRes.status}, message: ${errorData.error?.message || 'Token might be expired or invalid'}`);
      }

      // Use the OAuth token to create the post
      const response = await fetch(
        `https://www.googleapis.com/blogger/v3/blogs/${this.blogId}/posts/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: post.title,
            content: post.content,
            labels: post.labels,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // If it's a permission issue, provide a more helpful error with manual posting option
        if (response.status === 403) {
          throw {
            type: "OAUTH_REQUIRED",
            message: "OAuth permission issue. Please use the Blogger editor directly.",
            bloggerEditorUrl: `https://www.blogger.com/blog/post/edit/content/${this.blogId}`,
            post: post
          };
        }
        
        throw new Error(`API returned status: ${response.status}, message: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error creating post in Blogger:", error);
      
      // If it's our special error type, propagate it
      if (error && typeof error === 'object' && 'type' in error && error.type === "OAUTH_REQUIRED") {
        throw error;
      }
      
      // Otherwise, provide the option to use the Blogger editor manually
      throw {
        type: "OAUTH_REQUIRED",
        message: "Creating posts requires proper OAuth authentication. Please use the Blogger editor directly.",
        bloggerEditorUrl: `https://www.blogger.com/blog/post/edit/content/${this.blogId}`,
        post: post
      };
    }
  }

  async updatePost(post: BloggerPost) {
    if (!post.id) {
      throw new Error("Post ID is required for updating a post");
    }

    try {
      // Get the OAuth token from localStorage
      const accessToken = localStorage.getItem("accessToken");
      
      if (!accessToken) {
        throw new Error("OAuth token not found. Please login again.");
      }

      const response = await fetch(
        `https://www.googleapis.com/blogger/v3/blogs/${this.blogId}/posts/${post.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: post.title,
            content: post.content,
            labels: post.labels,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // If it's a permission issue, provide a more helpful error
        if (response.status === 403) {
          throw {
            type: "OAUTH_REQUIRED",
            message: "OAuth permission issue. Please use the Blogger editor directly.",
            bloggerEditorUrl: `https://www.blogger.com/blog/post/edit/${this.blogId}/${post.id}`,
            post: post
          };
        }
        
        throw new Error(`API returned status: ${response.status}, message: ${errorData.error?.message || 'Unknown error'}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error updating post in Blogger:", error);
      
      // If it's our special error type, propagate it
      if (error && typeof error === 'object' && 'type' in error) {
        throw error;
      }
      
      // Otherwise, provide a fallback
      throw {
        type: "OAUTH_REQUIRED",
        message: "Updating posts requires OAuth authentication. Please use the Blogger editor directly.",
        bloggerEditorUrl: post.id ? `https://www.blogger.com/blog/post/edit/${this.blogId}/${post.id}` : `https://www.blogger.com/blog/post/edit/content/${this.blogId}`,
        post: post
      };
    }
  }
}
