import React, { useEffect, useState } from "react";
import {
  Container,
  Avatar,
  Text,
  FileInput,
  TextInput,
  Stack,
  Table,
  Group,
} from "@mantine/core";
import { IconUpload } from "@tabler/icons-react";
import api from "../api/api";
import { Person } from "../types";
import classes from "../styles/AvatarPage.module.css";

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
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Avatar</Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>Nickname</Table.Th>
            <Table.Th>Upload New Avatar</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {users.map((user) => (
            <Table.Tr key={user.id}>
              <Table.Td>
                <Avatar src={user.avatarUrl} radius="xl" />
              </Table.Td>
              <Table.Td>
                <Text>{user.name}</Text>
              </Table.Td>
              <Table.Td>
                <TextInput
                  placeholder="Nickname"
                  defaultValue={user.nickname ?? ""}
                  onBlur={(e) => handleNickname(user.id, e.currentTarget.value)}
                  size="xs"
                />
              </Table.Td>
              <Table.Td>
                <FileInput
                  accept="image/*"
                  leftSection={<IconUpload size={16} />}
                  onChange={(file) => handleUpload(user.id, file)}
                  placeholder="Upload new avatar"
                  size="xs"
                  className={classes.FileInput}
                />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Container>
  );
}