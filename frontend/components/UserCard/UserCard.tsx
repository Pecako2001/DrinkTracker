// frontend/components/UserCard/UserCard.tsx
import React from 'react';
import { Avatar, Button, Card, Text, Divider, Stack, Group } from '@mantine/core';
import classes from './UserCardImage.module.css';
import { Person } from '../../types';

interface UserCardProps {
  user: Person & { nickname?: string };
  onDrink: () => void;
  onTopUp: () => void;
}

export function UserCardImage({ user, onDrink, onTopUp }: UserCardProps) {
  return (
    <Card withBorder radius="md" className={classes.card} >
      {/* Header Image */}
      <Card.Section
        h={120}
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?...&auto=format&fit=crop&w=500&q=80)',
          backgroundSize: 'cover',
        }}
      />

      {/* Avatar */}
      <Avatar
        src={user.avatarUrl}
        size={80}
        radius={80}
        mx="auto"
        mt={-40}
        className={classes.avatar}
      />

      {/* Name + Nickname */}
      <Stack spacing={2} align="center" mt="sm">
        <Text weight={600} size="lg">{user.name}</Text>
        {user.nickname && (
          <Text color="dimmed" size="sm">“{user.nickname}”</Text>
        )}
      </Stack>

      <Divider my="sm" />

      {/* Single Stat: Balance */}
      <Group position="center" spacing="xs" mb="md">
        <Text size="lg" weight={500}>€{user.balance.toFixed(2)}</Text>
        <Text color="dimmed" size="sm">Balance</Text>
      </Group>

      <Divider />

      {/* Actions: +1 Drink, Top Up */}
      <Stack spacing="xs" mt="md">
        <Button fullWidth variant="outline" onClick={onDrink}>
          +1 Drink
        </Button>
        <Button fullWidth onClick={onTopUp}>
          Top Up
        </Button>
      </Stack>
    </Card>
  );
}
