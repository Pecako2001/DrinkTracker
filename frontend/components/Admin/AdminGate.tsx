import React, { useEffect, useState } from "react";
import { LoginForm } from "./LoginForm";

interface Props {
  children: React.ReactNode;
  onAuthenticated?: (token: string) => void;
}

export function AdminGate({ children, onAuthenticated }: Props) {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t =
      typeof window !== "undefined"
        ? localStorage.getItem("admin_token")
        : null;
    if (t) {
      setToken(t);
      onAuthenticated?.(t);
    }
  }, [onAuthenticated]);

  if (!token) {
    return (
      <LoginForm
        onSuccess={(t) => {
          setToken(t);
          onAuthenticated?.(t);
        }}
      />
    );
  }
  return <>{children}</>;
}
