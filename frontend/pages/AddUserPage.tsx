import React, { useState } from "react";
import {
  TextInput,
  Button,
  Group,
  Paper,
  Title,
  Stack,
  ActionIcon,
  Notification,
} from "@mantine/core";
import { IconPlus, IconTrash, IconCheck, IconX } from "@tabler/icons-react";
import api from "../api/api";

interface UserNotification {
  id: number;
  name: string;
  success: boolean;
  message?: string;
}

export default function AddUserPage() {
  const [names, setNames] = useState<string[]>([""]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = names.map((n) => n.trim()).filter((n) => n);
    const results: UserNotification[] = [];
    for (const n of trimmed) {
      try {
        await api.post("/users", { name: n });
        results.push({
          id: Date.now() + Math.random(),
          name: n,
          success: true,
        });
      } catch (err: any) {
        const msg = err?.response?.data?.detail ?? "Failed to add";
        results.push({
          id: Date.now() + Math.random(),
          name: n,
          success: false,
          message: msg,
        });
      }
    }
    setNotifications((prev) => [...prev, ...results]);
    if (results.every((r) => r.success)) {
      setNames([""]);
    }
  };

  const addField = () => setNames((prev) => [...prev, ""]);
  const removeField = (idx: number) =>
    setNames((prev) => prev.filter((_, i) => i !== idx));
  const changeField = (idx: number, value: string) =>
    setNames((prev) => prev.map((n, i) => (i === idx ? value : n)));

  return (
    <Paper shadow="sm" p="lg" maw={400} mx="auto">
      <Title order={3} mb="md">
        Add New Users
      </Title>

      <form onSubmit={handleSubmit}>
        <Stack>
          {names.map((n, idx) => (
            <Group key={idx} align="flex-end">
              <TextInput
                label="Name"
                placeholder="Enter user name"
                required
                flex={1}
                value={n}
                onChange={(e) => changeField(idx, e.currentTarget.value)}
              />
              {names.length > 1 && (
                <ActionIcon
                  color="red"
                  variant="subtle"
                  mt="sm"
                  onClick={() => removeField(idx)}
                  aria-label="Remove"
                >
                  <IconTrash size={16} />
                </ActionIcon>
              )}
            </Group>
          ))}

          <Button
            variant="light"
            leftSection={<IconPlus size={16} />}
            onClick={addField}
          >
            Add Another
          </Button>

          <Group justify="flex-end">
            <Button type="submit">Create Users</Button>
          </Group>
        </Stack>
      </form>

      <Stack pos="fixed" bottom={16} right={16} gap="sm">
        {notifications.map((n) => (
          <Notification
            key={n.id}
            withCloseButton
            onClose={() =>
              setNotifications((prev) => prev.filter((nn) => nn.id !== n.id))
            }
            color={n.success ? "teal" : "red"}
            icon={n.success ? <IconCheck size={16} /> : <IconX size={16} />}
            title={n.success ? "User added" : "Error"}
          >
            {n.success ? (
              <>
                Added <strong>{n.name}</strong>
              </>
            ) : (
              <>
                Failed to add <strong>{n.name}</strong>: {n.message}
              </>
            )}
          </Notification>
        ))}
      </Stack>
    </Paper>
  );
}
