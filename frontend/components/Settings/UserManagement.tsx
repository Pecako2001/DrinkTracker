// components/Settings/UserManagement.tsx
import {
  Title,
  Table,
  NumberInput,
  Button,
  Group,
  Modal,
  Text,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import { Person } from "../../types";
import api from "../../api/api";

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
    <>
      <Table striped highlightOnHover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Balance (€)</th>
            <th>Drinks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>
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
              </td>
              <td>{u.total_drinks}</td>
              <td>
                <Group gap="xs">
                  <Button
                    color="red"
                    variant="subtle"
                    onClick={() => {
                      setTargetUser(u);
                      setConfirmOpen(true);
                    }}
                    leftSection={<IconTrash size={16} />}
                  >
                    Delete
                  </Button>
                </Group>
              </td>
            </tr>
          ))}
        </tbody>
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
    </>
  );
}
