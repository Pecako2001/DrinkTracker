import React, { useState } from "react";
import { PasswordInput, Button, Paper, Title } from "@mantine/core";
import api from "../../api/api";

interface Props {
  onSuccess: (token: string) => void;
}

export function LoginForm({ onSuccess }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async () => {
    try {
      const { data } = await api.post<{ access_token: string }>("/auth/login", {
        password,
      });
      localStorage.setItem("admin_token", data.access_token);
      setError("");
      onSuccess(data.access_token);
    } catch {
      setError("Incorrect password");
    }
  };

  return (
    <Paper shadow="sm" p="xl" maw={400} mx="auto">
      <Title order={3} mb="md">
        Admin Login
      </Title>
      <PasswordInput
        placeholder="Enter admin password"
        value={password}
        onChange={(e) => setPassword(e.currentTarget.value)}
        mb="sm"
        error={error}
      />
      <Button fullWidth onClick={handleLogin}>
        Login
      </Button>
    </Paper>
  );
}
