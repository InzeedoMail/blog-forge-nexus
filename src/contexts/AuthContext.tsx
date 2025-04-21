
import React, { createContext, useState, useContext } from "react";
import { useToast } from "@/components/ui/use-toast";

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  login: () => void;
  loginWithGoogle: () => void;
  signup: () => void;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  
  // Create a default user
  const defaultUser: UserProfile = {
    id: "default-user-id",
    email: "user@example.com",
    name: "Guest User",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=guest"
  };

  const [user] = useState<UserProfile | null>(defaultUser);

  // Simplified auth functions that do nothing
  const login = () => {
    toast({
      title: "Info",
      description: "Authentication is currently disabled.",
    });
  };

  const loginWithGoogle = () => {
    toast({
      title: "Info",
      description: "Authentication is currently disabled.",
    });
  };

  const signup = () => {
    toast({
      title: "Info",
      description: "Authentication is currently disabled.",
    });
  };

  const logout = () => {
    toast({
      title: "Info",
      description: "Authentication is currently disabled.",
    });
  };

  const updateProfile = () => {
    toast({
      title: "Info",
      description: "Authentication is currently disabled.",
    });
  };

  const value = {
    isAuthenticated: true, // Always authenticated
    isLoading,
    user,
    login,
    loginWithGoogle,
    signup,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
