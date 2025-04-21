import React, { useState, useEffect } from 'react';
import { AppShell, Navbar, Group, Button, Avatar, Text } from '@mantine/core';
import api from '../api/api';
import { Person } from '../types';

export default function WebLayout() {
  const [users, setUsers] = useState<Person[]>([]);

  useEffect(() => { api.get('/users').then(r => setUsers(r.data)) }, []);

  return (
    <AppShell
      navbar={<Navbar width={{ base: 200 }} height="100%" p="xs">
        <Button fullWidth>Home</Button>
        <Button fullWidth mt="sm">Statistics</Button>
        <div style={{ flexGrow: 1 }} />
        <Button fullWidth mt="sm">Settings</Button>
        <Button fullWidth mt="xs">Add User</Button>
      </Navbar>}
    >
      <Group direction="column" spacing="lg" p="md">
        {users.map(u => (
          <Group key={u.id} spacing="md">
            <Avatar src={u.avatarUrl} />
            <Text>{u.name}</Text>
            <Button onClick={() => {/* drink */}}>+1</Button>
            <Button>Top Up</Button>
            <Text>€{u.balance}</Text>
          </Group>
        ))}
      </Group>
    </AppShell>
  );
}