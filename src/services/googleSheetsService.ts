
import { GoogleAuth } from "google-auth-library";

interface BlogPost {
  title: string;
  body: string;
  imageUrl?: string;
  tags?: string[];
  date?: string;
  status?: string;
}

export class GoogleSheetsService {
  private auth: any;
  private sheetId: string;

  constructor(apiKey: string, sheetId: string) {
    this.auth = new GoogleAuth({
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      apiKey,
    });
    this.sheetId = sheetId;
  }

  async getAllPosts() {
    try {
      const { google } = await import("googleapis");
      const sheets = google.sheets({ version: "v4", auth: this.auth });
      
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: "Posts!A2:F", // Assuming headers are in row 1
      });

      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return [];
      }

      return rows.map((row) => ({
        title: row[0] || "",
        body: row[1] || "",
        imageUrl: row[2] || "",
        tags: row[3] ? row[3].split(",").map((tag: string) => tag.trim()) : [],
        date: row[4] || new Date().toISOString(),
        status: row[5] || "draft",
      }));
    } catch (error) {
      console.error("Error fetching posts from Google Sheets:", error);
      throw new Error("Failed to fetch posts from Google Sheets");
    }
  }

  async savePost(post: BlogPost) {
    try {
      const { google } = await import("googleapis");
      const sheets = google.sheets({ version: "v4", auth: this.auth });
      
      const values = [
        [
          post.title,
          post.body,
          post.imageUrl || "",
          post.tags ? post.tags.join(", ") : "",
          post.date || new Date().toISOString(),
          post.status || "draft",
        ],
      ];

      const response = await sheets.spreadsheets.values.append({
        spreadsheetId: this.sheetId,
        range: "Posts!A:F",
        valueInputOption: "RAW",
        requestBody: { values },
      });

      return response.data;
    } catch (error) {
      console.error("Error saving post to Google Sheets:", error);
      throw new Error("Failed to save post to Google Sheets");
    }
  }

  async updatePost(rowIndex: number, post: Partial<BlogPost>) {
    try {
      const { google } = await import("googleapis");
      const sheets = google.sheets({ version: "v4", auth: this.auth });
      
      // Get current row data
      const currentResponse = await sheets.spreadsheets.values.get({
        spreadsheetId: this.sheetId,
        range: `Posts!A${rowIndex + 2}:F${rowIndex + 2}`, // +2 to account for header row
      });
      
      const currentRow = currentResponse.data.values?.[0] || ["", "", "", "", "", ""];
      
      // Update only the fields that are provided
      const updatedRow = [
        post.title !== undefined ? post.title : currentRow[0],
        post.body !== undefined ? post.body : currentRow[1],
        post.imageUrl !== undefined ? post.imageUrl : currentRow[2],
        post.tags !== undefined ? post.tags.join(", ") : currentRow[3],
        post.date !== undefined ? post.date : currentRow[4],
        post.status !== undefined ? post.status : currentRow[5],
      ];

      const response = await sheets.spreadsheets.values.update({
        spreadsheetId: this.sheetId,
        range: `Posts!A${rowIndex + 2}:F${rowIndex + 2}`,
        valueInputOption: "RAW",
        requestBody: { values: [updatedRow] },
      });

      return response.data;
    } catch (error) {
      console.error("Error updating post in Google Sheets:", error);
      throw new Error("Failed to update post in Google Sheets");
    }
  }
}
