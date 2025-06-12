import React, { useRef, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Text,
  Divider,
  Stack,
  Group,
} from "@mantine/core";
import { IconCoffee, IconCreditCardPay } from "@tabler/icons-react";
import classes from "./UserCardImage.module.css";
import styles from "@/styles/MobileQuickActions.module.css"
import { Person } from "../../types";
import { resolveAvatarUrl } from "../../lib/resolveAvatarUrl";

interface UserCardProps {
  user: Person;
  onDrink: () => Promise<void> | void;
  onTopUp: () => void;
  onChangeAvatar?: (file: File | null) => void;
}

export function UserCardImage({
  user,
  onDrink,
  onTopUp,
  onChangeAvatar,
}: UserCardProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [animateDrink, setAnimateDrink] = useState(false);
  const [actionLoading, setActionLoading] = useState({
    drink: false,
    topup: false,
  });

  // Unified drink handler with animation and loading state
  const handleAddDrinkWithAnimation = async () => {
    setAnimateDrink(true);
    setActionLoading((prev) => ({ ...prev, drink: true }));
    setTimeout(() => setAnimateDrink(false), 300);
    try {
      await onDrink();
    } finally {
      setActionLoading((prev) => ({ ...prev, drink: false }));
    }
  };

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
      <div className={classes.avatarWrapper}>
        <Avatar
          src={resolveAvatarUrl(user.avatarUrl)}
          size={120}
          radius={120}
          mx="auto"
          mt={-60}
          className={classes.avatar}
        >
          {user.name.charAt(0).toUpperCase()}
        </Avatar>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={(e) => onChangeAvatar?.(e.target.files?.[0] ?? null)}
        />
      </div>

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
        <Text
          size="lg"
          fw={500}
          c={
            Number(user.balance ?? 0) > 0
              ? "blue"
              : Number(user.balance ?? 0) < 0
              ? "red"
              : "dimmed"
          }
        >
          €{Number(user.balance ?? 0).toFixed(2)}
        </Text>
        <Text color="dimmed" size="sm">
          Balance
        </Text>
      </Group>

      <Divider />

      {/* Actions: +1 Drink, Top Up */}
      <Stack gap={8} mt="md">
        <Button
          onClick={handleAddDrinkWithAnimation}
          loading={actionLoading.drink}
          disabled={actionLoading.topup}
          size="lg"
          leftSection={<IconCoffee size={25} />}
          className={`${styles.button} ${animateDrink ? styles.animate : ""}`}
        >
          +1 Drink
        </Button>
        <Button
          fullWidth
          leftSection={<IconCreditCardPay size={25} />}
          variant="outline"
          onClick={onTopUp}
          disabled={actionLoading.drink}
        >
          Top Up
        </Button>
      </Stack>
    </Card>
  );
}
