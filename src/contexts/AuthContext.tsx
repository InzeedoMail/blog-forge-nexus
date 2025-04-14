import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { jwtDecode } from "jwt-decode";

interface User {
  email: string;
  name: string;
  picture: string;
  token: string;
}

// Define the expected JWT payload structure
interface GoogleJwtPayload {
  email: string;
  name: string;
  picture: string;
  [key: string]: any; // For other properties that might be in the token
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (response) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// The email that is allowed to access the application
const ALLOWED_EMAIL = "inzeedomail@gmail.com"; // Replace with your actual email

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
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

  const login = (response) => {
    try {
      // Extract user info from Google response
      console.log(response);
      const decodedData = jwtDecode<GoogleJwtPayload>(response.credential);
      localStorage.setItem("accessToken", response.credential);

      const { email, name, picture } = decodedData;
      const token = response.credential;

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
