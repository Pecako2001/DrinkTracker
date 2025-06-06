// frontend/pages/SettingsPage.tsx
import React, { useState, useEffect } from "react";
import { Container, Stack } from "@mantine/core";
import api from "../api/api";
import { Person } from "../types";
import { UserManagement } from "../components/Settings/UserManagement";
import { PaymentsTable } from "../components/Settings/PaymentsTable";
import { AdminGate } from "../components/Admin/AdminGate";

interface Payment {
  id: number;
  mollie_id: string;
  person_id: number;
  amount: number;
  status: string;
  created_at: string;
}

export default function SettingsPage() {
  const [isAuth, setIsAuth] = useState(false);
  const [users, setUsers] = useState<Person[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (!isAuth) {
      return;
    }
    api.get<Person[]>("/users").then((r) => setUsers(r.data));
    api.get<Payment[]>("/payments").then((r) => setPayments(r.data));
  }, [isAuth]);

  return (
    <Container py="md">
      <AdminGate onAuthenticated={() => setIsAuth(true)}>
        <Stack gap="lg">
          <UserManagement users={users} setUsers={setUsers} />
          <PaymentsTable payments={payments} />
        </Stack>
      </AdminGate>
    </Container>
  );
}
