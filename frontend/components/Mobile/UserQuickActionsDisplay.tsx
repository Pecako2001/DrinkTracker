import React from "react";
import { Person } from "../../types";
import { Paper, Group, Avatar, Text, Stack, Box } from "@mantine/core";
import { resolveAvatarUrl } from "../../lib/resolveAvatarUrl";
// Removed ThemeIcon and IconCash as they are not used in the final example from the prompt
// but good to keep in mind for future enhancements.

interface UserQuickActionsDisplayProps {
  user: Person;
}

const UserQuickActionsDisplay: React.FC<UserQuickActionsDisplayProps> = ({
  user,
}) => {
  return (
    <Paper shadow="md" p="lg" radius="md" withBorder>
      <Stack align="center" gap="md">
        <Avatar
          src={resolveAvatarUrl(user.avatarUrl)}
          size="xl"
          color="blue"
          radius="xl"
        >
          {user.name.charAt(0).toUpperCase()}
        </Avatar>
        <Stack gap={2} align="center">
          <Text size="xl" fw={700} ta="center">
            {user.name}
          </Text>
          {user.nickname && (
            <Text size="sm" c="dimmed" ta="center">
              “{user.nickname}”
            </Text>
          )}
        </Stack>
        <Box>
          <Text size="lg" c="dimmed" ta="center">
            Current Balance
          </Text>
          {/* Conditional coloring for balance */}
          <Text
            size="xxl"
            fw={700}
            ta="center"
            c={user.balance > 0 ? "teal" : user.balance < 0 ? "red" : "dimmed"}
          >
            €{user.balance.toFixed(2)}
          </Text>
        </Box>
      </Stack>
    </Paper>
  );
};

export default UserQuickActionsDisplay;
