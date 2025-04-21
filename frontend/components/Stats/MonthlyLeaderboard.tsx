import React from 'react';
import { Card, ScrollArea, Table, Title, Anchor } from '@mantine/core';
import { Person } from '../../types';

interface LeaderboardProps {
  users: Person[];
}

export function MonthlyLeaderboard({ users }: LeaderboardProps) {
  const sorted = [...users].sort((a, b) => b.total_drinks - a.total_drinks);

  return (
    <Card shadow="sm" p="md" radius="md" withBorder style={{ flex: 1 }}>
      <Title order={4} mb="sm">This Month</Title>
      <ScrollArea>
        <Table verticalSpacing="sm" highlightOnHover>
          <thead style={{ fontWeight: 700 }}>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th style={{ textAlign: 'right' }}>Drinks</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((u, i) => (
              <tr key={u.id}>
                <td>{i + 1}</td>
                <td><Anchor component="button">{u.name}</Anchor></td>
                <td style={{ textAlign: 'right' }}>{u.total_drinks.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ScrollArea>
    </Card>
  );
}
