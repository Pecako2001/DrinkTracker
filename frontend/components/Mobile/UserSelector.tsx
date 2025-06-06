import React from "react";
import { Person } from "../../types";
import {
  SimpleGrid,
  Card,
  Text,
  Avatar,
  Group,
  Stack,
  UnstyledButton,
} from "@mantine/core";

interface UserSelectorProps {
  users: Person[];
  onSelectUser: (userId: string) => void;
}

const UserSelector: React.FC<UserSelectorProps> = ({ users, onSelectUser }) => {
  return (
    <SimpleGrid
      cols={1} // Always single column for mobile user selection for clarity
      spacing="md"
    >
      {users.map((user) => (
        <UnstyledButton
          key={user.id}
          onClick={() => onSelectUser(user.id.toString())}
          style={{ width: "100%" }}
        >
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group>
              <Avatar color="blue" radius="xl" size="lg">
                {user.name.charAt(0).toUpperCase()}
              </Avatar>
              <Stack gap={2}>
                <Text fz="lg" fw={500}>
                  {user.name}
                </Text>
                {user.nickname && (
                  <Text c="dimmed" size="sm">
                    “{user.nickname}”
                  </Text>
                )}
              </Stack>
            </Group>
          </Card>
        </UnstyledButton>
      ))}
    </SimpleGrid>
  );
};

export default UserSelector;
