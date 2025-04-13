import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "@/contexts/AuthContext";
import { CredentialsProvider } from "@/contexts/CredentialsContext";

import AppLayout from "@/components/layout/AppLayout";
import AuthGuard from "@/components/auth/AuthGuard";
import GoogleLogin from "@/components/auth/GoogleLogin";
import Dashboard from "@/pages/Dashboard";
import Editor from "@/pages/Editor";
import ImageGenerator from "@/pages/ImageGenerator";
import History from "@/pages/History";
import GoogleSheets from "@/pages/GoogleSheets";
import Blogger from "@/pages/Blogger";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <GoogleOAuthProvider clientId="217614331285-4iik77mg1e12hnp7ofm1barm123gtmb7.apps.googleusercontent.com">
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CredentialsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<GoogleLogin />} />

                <Route
                  path="/"
                  element={
                    <AuthGuard>
                      <AppLayout />
                    </AuthGuard>
                  }
                >
                  <Route index element={<Dashboard />} />
                  <Route path="editor" element={<Editor />} />
                  <Route path="images" element={<ImageGenerator />} />
                  <Route path="history" element={<History />} />
                  <Route path="sheets" element={<GoogleSheets />} />
                  <Route path="blogger" element={<Blogger />} />
                  <Route path="settings" element={<Settings />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </CredentialsProvider>
      </AuthProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);

export default App;
