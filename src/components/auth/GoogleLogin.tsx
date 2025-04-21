// components/GoogleLogin.tsx
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

const GoogleLogin = () => {
  const { handleGoogleAuthSuccess } = useAuth();

  const login = useGoogleLogin({
    scope: "https://www.googleapis.com/auth/blogger",
    onSuccess: async (tokenResponse) => {
      try {
        const accessToken = tokenResponse.access_token;

        // Get user profile from Google
        const res = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        handleGoogleAuthSuccess(accessToken, res.data);
      } catch (err) {
        console.error("Google userinfo fetch failed", err);
      }
    },
    onError: (error) => {
      console.error("Google login error", error);
    },
  });

  return (
    <button
      onClick={() => login()}
      className="px-4 py-2 bg-blue-600 text-white rounded"
    >
      Sign in with Google
    </button>
  );
};

export default GoogleLogin;
