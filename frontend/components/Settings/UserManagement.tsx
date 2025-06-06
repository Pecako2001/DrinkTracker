// components/Settings/UserManagement.tsx
import {
  Title,
  Table,
  NumberInput,
  Button,
  Group,
  Modal,
  ScrollArea,
  Card,
  Text,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { Person } from "../../types";
import api from "../../api/api";
import classes from "./UserManagement.module.css";

interface Props {
  users: Person[];
  setUsers: (users: Person[]) => void;
}

export function UserManagement({ users, setUsers }: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<Person | null>(null);

  const updateBalance = async (id: number, newBalance: number) => {
    await api.patch(`/users/${id}`, { balance: newBalance });
    setUsers(
      users.map((u) => (u.id === id ? { ...u, balance: newBalance } : u)),
    );
  };

  const deleteUser = async () => {
    if (!targetUser) {
      return;
    }
    await api.delete(`/users/${targetUser.id}`);
    setUsers(users.filter((u) => u.id !== targetUser.id));
    setConfirmOpen(false);
  };

  return (
    <Card
      shadow="sm"
      p="md"
      radius="md"
      withBorder
      style={{ flex: 1 }}
      className={classes.leaderboardCard}
    >
      <Title order={4} mb="sm">
        Users Insight
      </Title>
      <ScrollArea>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Saldo</Table.Th>
              <Table.Th>Drinks</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.map((u) => (
              <Table.Tr key={u.id}>
                <Table.Td>{u.name}</Table.Td>
                <Table.Td>
                  <NumberInput
                    defaultValue={Math.round(u.balance * 100) / 100}
                    step={1}
                    onBlur={(e) =>
                      updateBalance(
                        u.id,
                        Math.round(Number(e.currentTarget.value) * 100) / 100,
                      )
                    }
                  />
                </Table.Td>
                <Table.Td>{u.total_drinks}</Table.Td>
                <Table.Td>
                  <Button
                    variant="subtle"
                    color="red"
                    leftSection={<IconTrash />}
                    onClick={() => {
                      setTargetUser(u);
                      setConfirmOpen(true);
                    }}
                  >
                    Delete
                  </Button>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        <Modal
          opened={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="Confirm deletion"
          centered
        >
          <Text>
            Are you sure you want to delete <strong>{targetUser?.name}</strong>?
          </Text>
          <Group mt="md" justify="flex-end">
            <Button variant="default" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button color="red" onClick={deleteUser}>
              Yes, delete
            </Button>
          </Group>
        </Modal>
      </ScrollArea>
    </Card>
  );
}