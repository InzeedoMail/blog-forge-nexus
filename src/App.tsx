
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import AppLayout from "./components/layout/AppLayout";
import Index from "./pages/Index";
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

import { ApiKeyProvider } from "@/contexts/ApiKeyContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CredentialsProvider } from "@/contexts/CredentialsContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const GOOGLE_CLIENT_ID = "your-google-client-id"; // Replace with your actual client ID in production

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <ThemeProvider>
          <ApiKeyProvider>
            <CredentialsProvider>
              <AuthProvider>
                <SubscriptionProvider>
                  <Router>
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<Index />} />

                      {/* Dashboard and other routes */}
                      <Route path="dashboard" element={
                        <AppLayout>
                          <Dashboard />
                        </AppLayout>
                      } />
                      <Route path="editor" element={
                        <AppLayout>
                          <Editor />
                        </AppLayout>
                      } />
                      <Route path="article-paraphraser" element={
                        <AppLayout>
                          <ArticleParaphraser />
                        </AppLayout>
                      } />
                      <Route path="image-generator" element={
                        <AppLayout>
                          <ImageGenerator />
                        </AppLayout>
                      } />
                      <Route path="blogger" element={
                        <AppLayout>
                          <Blogger />
                        </AppLayout>
                      } />
                      <Route path="google-sheets" element={
                        <AppLayout>
                          <GoogleSheets />
                        </AppLayout>
                      } />
                      <Route path="history" element={
                        <AppLayout>
                          <History />
                        </AppLayout>
                      } />
                      <Route path="settings" element={
                        <AppLayout>
                          <Settings />
                        </AppLayout>
                      } />
                      <Route path="image-text-extractor" element={
                        <AppLayout>
                          <ImageTextExtractor />
                        </AppLayout>
                      } />
                      <Route path="file-analyzer" element={
                        <AppLayout>
                          <FileAnalyzer />
                        </AppLayout>
                      } />
                      <Route path="code-reviewer" element={
                        <AppLayout>
                          <CodeReviewer />
                        </AppLayout>
                      } />
                      <Route path="news" element={
                        <AppLayout>
                          <News />
                        </AppLayout>
                      } />

                      {/* Catch-all route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    <Toaster />
                  </Router>
                </SubscriptionProvider>
              </AuthProvider>
            </CredentialsProvider>
          </ApiKeyProvider>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
