
import React from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  // No authentication required, just render children
  return <>{children}</>;
};

export default AuthGuard;
