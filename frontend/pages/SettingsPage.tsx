// frontend/pages/SettingsPage.tsx
import React, { useState, useEffect } from "react";
import {
  PasswordInput,
  Button,
  Paper,
  Title,
  Container,
  Stack,
} from "@mantine/core";
import api from "../api/api";
import { Person } from "../types";
import { UserManagement } from "../components/Settings/UserManagement";
import { PaymentsTable } from "../components/Settings/PaymentsTable";

interface Payment {
  id: number;
  mollie_id: string;
  person_id: number;
  amount: number;
  status: string;
  created_at: string;
}

export default function SettingsPage() {
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuth, setIsAuth] = useState(false);

  const [users, setUsers] = useState<Person[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (!isAuth) return;
    api.get<Person[]>("/users").then((r) => setUsers(r.data));
    api.get<Payment[]>("/payments").then((r) => setPayments(r.data));
  }, [isAuth]);

  const handleLogin = () => {
    if (password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setIsAuth(true);
      setAuthError("");
    } else {
      setAuthError("Incorrect password");
    }
  };

  return (
    <Container py="md">
      {!isAuth ? (
        <Paper shadow="sm" p="xl" maw={400} mx="auto">
          <Title order={3} mb="md">
            Admin Login
          </Title>
          <PasswordInput
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.currentTarget.value)}
            mb="sm"
            error={authError}
          />
          <Button fullWidth onClick={handleLogin}>
            Login
          </Button>
        </Paper>
      ) : (
        <Stack gap="lg">
          <UserManagement users={users} setUsers={setUsers} />
          <PaymentsTable payments={payments} />
        </Stack>
      )}
    </Container>
  );
}
