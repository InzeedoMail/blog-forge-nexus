
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { facebook } from "lucide-react";
import { useCredentials } from "@/contexts/CredentialsContext";

const getAccessToken = (credentials) => credentials.facebookApiKey || '';

const FacebookPosts: React.FC = () => {
  const { credentials } = useCredentials();
  const [pageIds, setPageIds] = useState<string>(credentials.facebookPageIds || "");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For demonstration, you can input comma separated page IDs and click fetch
  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    const token = getAccessToken(credentials);
    const ids = pageIds.split(",").map((id) => id.trim()).filter(Boolean);
    let allPosts: any[] = [];
    try {
      for (let id of ids) {
        const res = await fetch(
          `https://graph.facebook.com/v19.0/${id}/posts?fields=message,full_picture,created_time,permalink_url&access_token=${token}`
        );
        const data = await res.json();
        if (data?.data) {
          allPosts = allPosts.concat(
            data.data.map((post) => ({
              ...post,
              pageId: id,
            }))
          );
        }
      }
      setPosts(allPosts);
    } catch (err) {
      setError("Failed to fetch posts. Please check API key/page IDs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Optionally auto-fetch if keys are present
    if (credentials.facebookApiKey && credentials.facebookPageIds) {
      setPageIds(credentials.facebookPageIds);
      fetchPosts();
    }
    // eslint-disable-next-line
  }, [credentials.facebookApiKey, credentials.facebookPageIds]);

  return (
    <div>
      <div className="flex flex-col gap-2 max-w-xl mx-auto mt-4 mb-6">
        <Input
          placeholder="Comma separated Facebook Page IDs"
          value={pageIds}
          onChange={e => setPageIds(e.target.value)}
        />
        <Button onClick={fetchPosts} disabled={loading}>
          {loading ? "Fetching..." : "Fetch Posts"}
        </Button>
        {error && <div className="text-red-500">{error}</div>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.length === 0 && !loading && <div>No posts loaded.</div>}
        {posts.map((post, idx) => (
          <Card key={post.id || idx}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <facebook className="h-5 w-5 text-blue-600" />
                <span>Page ID: {post.pageId}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {post.full_picture && (
                <img
                  src={post.full_picture}
                  alt="Post Img"
                  className="rounded-md mb-2 w-full object-cover max-h-60"
                />
              )}
              <p className="mb-2">{post.message || "No text"}</p>
              <div className="text-xs text-gray-500">
                {new Date(post.created_time).toLocaleString()}
              </div>
              <a href={post.permalink_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">
                View on Facebook
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FacebookPosts;
