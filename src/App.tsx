
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AppLayout from "./components/layout/AppLayout";
import AuthGuard from "./components/auth/AuthGuard";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import Settings from "./pages/Settings";
import ImageGenerator from "./pages/ImageGenerator";
import Blogger from "./pages/Blogger";
import GoogleSheets from "./pages/GoogleSheets";
import History from "./pages/History";
import NotFound from "./pages/NotFound";
import ArticleParaphraser from "./pages/ArticleParaphraser";
import ImageTextExtractor from "./pages/ImageTextExtractor";
import FileAnalyzer from "./pages/FileAnalyzer";
import CodeReviewer from "./pages/CodeReviewer";
import News from "./pages/News";

import { AuthProvider } from "@/contexts/AuthContext";
import { ApiKeyProvider } from "@/contexts/ApiKeyContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CredentialsProvider } from "@/contexts/CredentialsContext";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Initialize the query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Google OAuth client ID
const GOOGLE_CLIENT_ID = "your-google-client-id"; // Replace with your actual client ID in production

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <ThemeProvider>
          <AuthProvider>
            <ApiKeyProvider>
              <CredentialsProvider>
                <SubscriptionProvider>
                  <Router>
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<Index />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />

                      {/* Protected routes - require authentication */}
                      <Route
                        path="/"
                        element={
                          <AuthGuard>
                            <AppLayout>
                              <Outlet />
                            </AppLayout>
                          </AuthGuard>
                        }
                      >
                        <Route path="dashboard" element={<Dashboard />} />
                        <Route path="editor" element={<Editor />} />
                        <Route path="article-paraphraser" element={<ArticleParaphraser />} />
                        <Route path="image-generator" element={<ImageGenerator />} />
                        <Route path="blogger" element={<Blogger />} />
                        <Route path="google-sheets" element={<GoogleSheets />} />
                        <Route path="history" element={<History />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="image-text-extractor" element={<ImageTextExtractor />} />
                        <Route path="file-analyzer" element={<FileAnalyzer />} />
                        <Route path="code-reviewer" element={<CodeReviewer />} />
                        <Route path="news" element={<News />} />
                      </Route>

                      {/* Catch-all route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Router>
                  <Toaster />
                </SubscriptionProvider>
              </CredentialsProvider>
            </ApiKeyProvider>
          </AuthProvider>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
