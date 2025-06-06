// frontend/pages/SettingsPage.tsx
import React, { useState, useEffect } from "react";
import { Container, Paper, Tabs, Title, FloatingIndicator } from "@mantine/core";
import api from "../api/api";
import { Person } from "../types";
import { UserManagement } from "../components/Settings/UserManagement";
import { PaymentsTable } from "../components/Settings/PaymentsTable";
import { AdminGate } from "../components/Admin/AdminGate";

import classes from "../styles/SettingsPage.module.css";

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

  const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);
  const [value, setValue] = useState<string | null>('Users');
  const [controlsRefs, setControlsRefs] = useState<Record<string, HTMLButtonElement | null>>({});
  const setControlRef = (val: string) => (node: HTMLButtonElement) => {
    controlsRefs[val] = node;
    setControlsRefs(controlsRefs);
  };
  
  return (
    <Container py="md">
      <AdminGate onAuthenticated={() => setIsAuth(true)}>
        <Title order={2} mt="sm" mb="xs">
          Admin Control
        </Title>
        <Tabs value={value} onChange={setValue} className={classes.list}>
          <Tabs.List mb="md"  ref={setRootRef}>
            <Tabs.Tab value="Users" ref={setControlRef('Users')} className={classes.tab}>
              Users</Tabs.Tab>
            <Tabs.Tab value="Payments" ref={setControlRef('Payments')} className={classes.tab}>
              Payments</Tabs.Tab>
            <FloatingIndicator
              target={value ? controlsRefs[value] : null}
              parent={rootRef}
              className={classes.indicator}
            />
          </Tabs.List>

          <Tabs.Panel value="Users">
            <UserManagement users={users} setUsers={setUsers}/>
          </Tabs.Panel>
          <Tabs.Panel value="Payments">
            <PaymentsTable payments={payments} />
          </Tabs.Panel>
        </Tabs>

      </AdminGate>
    </Container>
  );
}
