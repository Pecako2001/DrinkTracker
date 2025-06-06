import React, { useRef } from "react";
import { Person } from "../../types";
import { Paper, Avatar, Text, Stack, Box, Button } from "@mantine/core";
import { resolveAvatarUrl } from "../../lib/resolveAvatarUrl";
import classes from "../UserCard/UserCardImage.module.css";
import { IconCamera } from "@tabler/icons-react";

interface UserQuickActionsDisplayProps {
  user: Person;
  onChangeAvatar?: (file: File | null) => void;
}

const UserQuickActionsDisplay: React.FC<UserQuickActionsDisplayProps> = ({
  user,
  onChangeAvatar,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const triggerFile = () => fileRef.current?.click();
  return (
    <Paper shadow="md" p="lg" radius="md" withBorder>
      <Stack align="center" gap="md">
        <div style={{ position: "relative" }}>
          <Avatar
            src={resolveAvatarUrl(user.avatarUrl)}
            size="xl"
            color="blue"
            radius="xl"
          >
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
          {onChangeAvatar && (
            <>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(e) =>
                  onChangeAvatar(e.currentTarget.files?.[0] ?? null)
                }
              />
              <Button
                size="xs"
                className={classes.changeBtn}
                onClick={triggerFile}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 0,
                  width: 36,
                  height: 36,
                }}
                variant="subtle"
              >
                <IconCamera size={26} />
              </Button>
            </>
          )}
        </div>
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
