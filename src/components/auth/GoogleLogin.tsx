import React from "react";
import { GoogleLogin as ReactGoogleLogin } from "@react-oauth/google";
import { useAuth } from "@/contexts/AuthContext";
import { jwtDecode } from "jwt-decode";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";

const GoogleLogin: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-[350px] bg-card shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Blog Forge</CardTitle>
            <CardDescription>
              Sign in with your Google account to access the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <ReactGoogleLogin
                onSuccess={(item) => {
                  login(item);
                }}
                onError={() => {
                  console.log("Login Failed");
                }}
              />
            </div>
          </CardContent>
          <CardFooter className="text-xs text-center text-muted-foreground">
            This application is restricted to authorized users only.
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default GoogleLogin;
