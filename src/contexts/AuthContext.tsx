
import React, { createContext, useState, useEffect, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { secureStorage } from "@/utils/secureStorage";

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  subscription_tier?: string;
  subscription_status?: "active" | "trialing" | "past_due" | "cancelled" | "incomplete";
  subscription_end_date?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  loginWithGoogle: (credential: any) => Promise<void>;
  signup: (credentials: { email: string; password: string; name?: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error fetching session:", error);
          return;
        }

        if (session) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const userProfile: UserProfile = {
              id: user.id,
              email: user.email || "",
              name: user.user_metadata?.name,
              avatar_url: user.user_metadata?.avatar_url,
            };
            setUser(userProfile);
            setIsAuthenticated(true);
            
            // Fetch additional user profile data
            await fetchUserProfile(userProfile);
          }
        }
      } catch (error) {
        console.error("Error during session check:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const authListener = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const userProfile: UserProfile = {
            id: user.id,
            email: user.email || "",
            name: user.user_metadata?.name,
            avatar_url: user.user_metadata?.avatar_url,
          };
          setUser(userProfile);
          setIsAuthenticated(true);
          
          // Fetch additional user profile data
          await fetchUserProfile(userProfile);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
        secureStorage.removeItem("userProfile");
      }
    });

    checkSession();

    return () => {
      authListener.data.subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (baseProfile: UserProfile) => {
    try {
      // Fetch user profile from the profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', baseProfile.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
        console.error("Error fetching user profile:", error);
        return;
      }

      if (data) {
        const updatedProfile = {
          ...baseProfile,
          name: data.name || baseProfile.name,
          avatar_url: data.avatar_url || baseProfile.avatar_url,
          subscription_tier: data.subscription_tier,
          subscription_status: data.subscription_status,
          subscription_end_date: data.subscription_end_date,
        };
        
        setUser(updatedProfile);
        secureStorage.setItem("userProfile", updatedProfile);
      }
    } catch (error) {
      console.error("Error processing user profile:", error);
    }
  };

  const login = async (credentials: { email: string; password: string }) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Login successful",
        description: "You've been logged in successfully.",
      });

    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async (credential: any) => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: credential.credential,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Login successful",
        description: "You've been logged in with Google successfully.",
      });
    } catch (error: any) {
      console.error("Google login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during Google login.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (credentials: { email: string; password: string; name?: string }) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name || "",
          }
        }
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Registration successful",
        description: "Please check your email to confirm your account.",
      });
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred during registration.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }

      toast({
        title: "Logout successful",
        description: "You've been logged out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    try {
      setIsLoading(true);
      
      if (!user?.id) {
        throw new Error("User not authenticated");
      }
      
      // Update auth metadata if name is provided
      if (profile.name) {
        await supabase.auth.updateUser({
          data: { name: profile.name }
        });
      }
      
      // Update profile in profiles table
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: profile.name || user.name,
          avatar_url: profile.avatar_url || user.avatar_url,
          updated_at: new Date().toISOString(),
        });
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setUser(prev => prev ? { ...prev, ...profile } : null);
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message || "An error occurred while updating your profile.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isAuthenticated,
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
