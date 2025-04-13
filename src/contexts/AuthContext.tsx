
import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

interface User {
  email: string;
  name: string;
  picture: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (response: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The email that is allowed to access the application
const ALLOWED_EMAIL = "myemail@gmail.com"; // Replace with your actual email

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user data exists in localStorage
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("Failed to parse user from localStorage", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = (response: any) => {
    try {
      // Extract user info from Google response
      const { email, name, picture } = response.profileObj;
      const token = response.tokenId;

      // Verify if the user's email is allowed
      if (email !== ALLOWED_EMAIL) {
        toast({
          title: "Access denied",
          description: "You are not authorized to access this application.",
          variant: "destructive",
        });
        return;
      }

      // Create user object
      const userData: User = {
        email,
        name,
        picture,
        token,
      };

      // Save user to state and localStorage
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      toast({
        title: "Logged in successfully",
        description: `Welcome back, ${name}!`,
      });
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: "There was an error during the login process.",
        variant: "destructive",
      });
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
