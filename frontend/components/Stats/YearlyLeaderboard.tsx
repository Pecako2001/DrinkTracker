import React from 'react';
import { Card, ScrollArea, Table, Title } from '@mantine/core';
import { Person } from '../../types';

interface LeaderboardProps {
  users: Person[];
}

export function YearlyLeaderboard({ users }: LeaderboardProps) {
  // sort by total_drinks desc, replace with year-specific count
  const sorted = [...users].sort((a, b) => b.total_drinks - a.total_drinks);

  return (
    <Card shadow="sm" p="md" radius="md" withBorder style={{ flex: 1 }}>
      <Title order={4} mb="sm">This Year</Title>
      <ScrollArea>
        <Table striped highlightOnHover>
          <thead>
            <tr><th>#</th><th>Name</th><th>Drinks</th></tr>
          </thead>
          <tbody>
            {sorted.map((u, i) => (
              <tr key={u.id}>
                <td>{i + 1}</td>
                <td>{u.name}</td>
                <td>{u.total_drinks}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ScrollArea>
    </Card>
  );
}