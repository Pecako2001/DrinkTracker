import React from 'react';
import { Person } from '../../types';
import { Paper, Group, Avatar, Text, Stack, Box } from '@mantine/core';
// Removed ThemeIcon and IconCash as they are not used in the final example from the prompt
// but good to keep in mind for future enhancements.

interface UserQuickActionsDisplayProps {
  user: Person;
}

const UserQuickActionsDisplay: React.FC<UserQuickActionsDisplayProps> = ({ user }) => {
  return (
    <Paper shadow="md" p="lg" radius="md" withBorder>
      <Stack align="center" gap="md">
        <Avatar size="xl" color="blue" radius="xl">
          {user.name.charAt(0).toUpperCase()}
        </Avatar>
        <Text size="xl" fw={700} ta="center">
          {user.name}
        </Text>
        <Box>
          <Text size="lg" c="dimmed" ta="center">
            Current Balance
          </Text>
          {/* Conditional coloring for balance */}
          <Text 
            size="xxl" 
            fw={700} 
            ta="center" 
            c={user.balance > 0 ? 'teal.600' : user.balance < 0 ? 'red.600' : 'dimmed'}
          >
            €{user.balance.toFixed(2)}
          </Text>
        </Box>
      </Stack>
    </Paper>
  );
};

export default UserQuickActionsDisplay;
