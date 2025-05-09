import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
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
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ArticleParaphraser from "./pages/ArticleParaphraser";
import ImageTextExtractor from "./pages/ImageTextExtractor";
import FileAnalyzer from "./pages/FileAnalyzer";
import CodeReviewer from "./pages/CodeReviewer";
import News from "./pages/News";
import FacebookPosts from "./pages/FacebookPosts";
import AuthGuard from "./components/auth/AuthGuard";

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

const GOOGLE_CLIENT_ID =
  "217614331285-4iik77mg1e12hnp7ofm1barm123gtmb7.apps.googleusercontent.com"; // Replace with your actual client ID in production

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <ThemeProvider>
          <ApiKeyProvider>
            <CredentialsProvider>
              <Router>
                <AuthProvider>
                  <SubscriptionProvider>
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<Index />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/signup" element={<Signup />} />
                      <Route path="/facebook-posts" element={<FacebookPosts />} />

                      {/* NEWS should also be public */}
                      <Route path="news" element={
                        <AppLayout>
                          <News />
                        </AppLayout>
                      } />

                      {/* Protected routes */}
                      <Route
                        path="dashboard"
                        element={
                          <AuthGuard>
                            <AppLayout>
                              <Dashboard />
                            </AppLayout>
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="editor"
                        element={
                          <AuthGuard>
                            <AppLayout>
                              <Editor />
                            </AppLayout>
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="article-paraphraser"
                        element={
                          <AuthGuard>
                            <AppLayout>
                              <ArticleParaphraser />
                            </AppLayout>
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="image-generator"
                        element={
                          <AuthGuard>
                            <AppLayout>
                              <ImageGenerator />
                            </AppLayout>
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="blogger"
                        element={
                          <AuthGuard>
                            <AppLayout>
                              <Blogger />
                            </AppLayout>
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="google-sheets"
                        element={
                          <AuthGuard>
                            <AppLayout>
                              <GoogleSheets />
                            </AppLayout>
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="history"
                        element={
                          <AuthGuard>
                            <AppLayout>
                              <History />
                            </AppLayout>
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="settings"
                        element={
                          <AuthGuard>
                            <AppLayout>
                              <Settings />
                            </AppLayout>
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="image-text-extractor"
                        element={
                          <AuthGuard>
                            <AppLayout>
                              <ImageTextExtractor />
                            </AppLayout>
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="file-analyzer"
                        element={
                          <AuthGuard>
                            <AppLayout>
                              <FileAnalyzer />
                            </AppLayout>
                          </AuthGuard>
                        }
                      />
                      <Route
                        path="code-reviewer"
                        element={
                          <AuthGuard>
                            <AppLayout>
                              <CodeReviewer />
                            </AppLayout>
                          </AuthGuard>
                        }
                      />

                      {/* Catch-all route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    <Toaster />
                  </SubscriptionProvider>
                </AuthProvider>
              </Router>
            </CredentialsProvider>
          </ApiKeyProvider>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
