
import { useAuth } from "@/contexts/AuthContext";

interface GoogleLoginProps {
  onSuccess?: () => void;
  onError?: () => void;
}

const GoogleLogin: React.FC<GoogleLoginProps> = ({ onSuccess, onError }) => {
  const { loginWithGoogle } = useAuth();

  const handleCredentialResponse = async () => {
    try {
      await loginWithGoogle();
      onSuccess?.();
    } catch (error) {
      console.error("Google login error:", error);
      onError?.();
    }
  };

  // Dummy implementation - not actually used
  return null;
};

export default GoogleLogin;
