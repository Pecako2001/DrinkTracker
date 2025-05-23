import React from "react";
import {
  Avatar,
  Button,
  Card,
  Text,
  Divider,
  Stack,
  Group,
} from "@mantine/core";
import classes from "./UserCardImage.module.css";
import { Person } from "../../types";

interface UserCardProps {
  user: Person & { nickname?: string };
  onDrink: () => void;
  onTopUp: () => void;
}

export function UserCardImage({ user, onDrink, onTopUp }: UserCardProps) {
  return (
    <Card withBorder radius="md" className={classes.card}>
      {/* Header Image */}
      <Card.Section
        h={120}
        style={{
          backgroundImage: 'url("/images/Logo.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
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
      <Stack gap={2} align="center" mt="sm">
        <Text fw={600} size="lg">
          {user.name}
        </Text>
        {user.nickname && (
          <Text color="dimmed" size="sm">
            “{user.nickname}”
          </Text>
        )}
      </Stack>

      <Divider my="sm" />

      {/* Single Stat: Balance */}
      <Group justify="center" gap={4} mb="md">
        <Text size="lg" fw={500}>
          €{user.balance.toFixed(2)}
        </Text>
        <Text color="dimmed" size="sm">
          Balance
        </Text>
      </Group>

      <Divider />

      {/* Actions: +1 Drink, Top Up */}
      <Stack gap={8} mt="md">
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
