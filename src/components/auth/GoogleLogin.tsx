
import { useAuth } from "@/contexts/AuthContext";

interface GoogleLoginProps {
  onSuccess?: () => void;
  onError?: () => void;
}

const GoogleLogin: React.FC<GoogleLoginProps> = ({ onSuccess, onError }) => {
  const { loginWithGoogle } = useAuth();

  const handleCredentialResponse = async (response: any) => {
    try {
      await loginWithGoogle(response);
      onSuccess?.();
    } catch (error) {
      console.error("Google login error:", error);
      onError?.();
    }
  };

  return (
    <div id="g_id_onload"
         data-client_id="your-google-client-id"
         data-context="signin"
         data-ux_mode="popup"
         data-callback="handleCredentialResponse"
         data-auto_prompt="false">
    </div>
  );
};

export default GoogleLogin;
