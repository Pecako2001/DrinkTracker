import React, { useEffect, useState } from "react";
import {
  Container,
  Group,
  Avatar,
  Text,
  FileInput,
  TextInput,
  Stack,
} from "@mantine/core";
import { IconUpload } from "@tabler/icons-react";
import api from "../api/api";
import { Person } from "../types";

export default function AvatarPage() {
  const [users, setUsers] = useState<Person[]>([]);

  useEffect(() => {
    api.get<Person[]>("/users").then((r) => setUsers(r.data));
  }, []);

  const handleUpload = async (userId: number, file: File | null) => {
    if (!file) {
      return;
    }
    const form = new FormData();
    form.append("file", file);
    await api.post(`/users/${userId}/avatar`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    const { data } = await api.get<Person[]>("/users");
    setUsers(data);
  };

  const handleNickname = async (userId: number, nickname: string) => {
    await api.patch(`/users/${userId}/nickname`, { nickname });
    const { data } = await api.get<Person[]>("/users");
    setUsers(data);
  };

  return (
    <Container py="md" size={600}>
      <Stack>
        {users.map((user) => (
          <Group key={user.id} justify="space-between" align="center">
            <Group>
              <Avatar src={user.avatarUrl} radius="xl" />
              <Stack gap={2}>
                <Text>{user.name}</Text>
                <TextInput
                  placeholder="Nickname"
                  defaultValue={user.nickname ?? ""}
                  onBlur={(e) => handleNickname(user.id, e.currentTarget.value)}
                  size="xs"
                />
              </Stack>
            </Group>
            <FileInput
              accept="image/*"
              leftSection={<IconUpload size={16} />}
              onChange={(file) => handleUpload(user.id, file)}
            />
          </Group>
        ))}
      </Stack>
    </Container>
  );
}
