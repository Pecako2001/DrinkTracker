import React, { useState, useEffect } from 'react';
import { List, Avatar, Button, Group } from '@mantine/core';
import api from '../api/api';
import { Person } from '../types';

export default function UserSelect({ onSelect }: { onSelect: (u: Person) => void }) {
  const [users, setUsers] = useState<Person[]>([]);
  useEffect(() => { api.get('/users').then(r => setUsers(r.data)) }, []);
  return (
    <List spacing="sm">
      {users.map(u => (
        <List.Item key={u.id}>
          <Group>
            <Avatar src={u.avatarUrl} />
            <Button variant="subtle" onClick={() => onSelect(u)}>{u.name}</Button>
          </Group>
        </List.Item>
      ))}
    </List>
  );
}