import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { TextInput, Button, Group, Paper, Title, Stack } from '@mantine/core';
import api from '../api/api';

export default function AddUserPage() {
  const [name, setName] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/users', { name });
    router.push('/');
  };

  return (
    <Paper shadow="sm" p="lg" maw={400} mx="auto">
      <Title order={3} mb="md">
        Add New User
      </Title>

      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="Name"
            placeholder="Enter user name"
            required
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />

          <Group position="right">
            <Button type="submit">Create User</Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}
