import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import AuthGuard from "./components/auth/AuthGuard";
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

import { AuthProvider } from "@/contexts/AuthContext";
import { CredentialsProvider } from "@/contexts/CredentialsContext";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CredentialsProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />

              <Route
                path="/dashboard"
                element={
                  <AuthGuard>
                    <AppLayout>
                      <Dashboard />
                    </AppLayout>
                  </AuthGuard>
                }
              />

              <Route
                path="/editor"
                element={
                  <AuthGuard>
                    <AppLayout>
                      <Editor />
                    </AppLayout>
                  </AuthGuard>
                }
              />

              <Route
                path="/article-paraphraser"
                element={
                  <AuthGuard>
                    <AppLayout>
                      <ArticleParaphraser />
                    </AppLayout>
                  </AuthGuard>
                }
              />

              <Route
                path="/image-generator"
                element={
                  <AuthGuard>
                    <AppLayout>
                      <ImageGenerator />
                    </AppLayout>
                  </AuthGuard>
                }
              />

              <Route
                path="/blogger"
                element={
                  <AuthGuard>
                    <AppLayout>
                      <Blogger />
                    </AppLayout>
                  </AuthGuard>
                }
              />

              <Route
                path="/google-sheets"
                element={
                  <AuthGuard>
                    <AppLayout>
                      <GoogleSheets />
                    </AppLayout>
                  </AuthGuard>
                }
              />

              <Route
                path="/history"
                element={
                  <AuthGuard>
                    <AppLayout>
                      <History />
                    </AppLayout>
                  </AuthGuard>
                }
              />

              <Route
                path="/settings"
                element={
                  <AuthGuard>
                    <AppLayout>
                      <Settings />
                    </AppLayout>
                  </AuthGuard>
                }
              />

              <Route
                path="/image-text-extractor"
                element={
                  <AuthGuard>
                    <AppLayout>
                      <ImageTextExtractor />
                    </AppLayout>
                  </AuthGuard>
                }
              />

              <Route
                path="/file-analyzer"
                element={
                  <AuthGuard>
                    <AppLayout>
                      <FileAnalyzer />
                    </AppLayout>
                  </AuthGuard>
                }
              />

              <Route
                path="/code-reviewer"
                element={
                  <AuthGuard>
                    <AppLayout>
                      <CodeReviewer />
                    </AppLayout>
                  </AuthGuard>
                }
              />

              <Route
                path="/news"
                element={
                  <AuthGuard>
                    <AppLayout>
                      <News />
                    </AppLayout>
                  </AuthGuard>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </CredentialsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
