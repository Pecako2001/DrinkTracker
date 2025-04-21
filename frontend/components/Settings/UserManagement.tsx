// components/Settings/UserManagement.tsx
import {
    Title,
    Table,
    NumberInput,
    Button,
    Group,
    Modal,
    Text,
  } from '@mantine/core';
  import { IconTrash } from '@tabler/icons-react';
  import { useState } from 'react';
  import { Person } from '../../types';
  import api from '../../api/api';
  
  interface Props {
    users: Person[];
    setUsers: (users: Person[]) => void;
  }
  
  export function UserManagement({ users, setUsers }: Props) {
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [targetUser, setTargetUser] = useState<Person | null>(null);
  
    const updateBalance = async (id: number, newBalance: number) => {
      await api.patch(`/users/${id}`, { balance: newBalance });
      setUsers(users.map((u) => (u.id === id ? { ...u, balance: newBalance } : u)));
    };
  
    const deleteUser = async () => {
      if (!targetUser) return;
      await api.delete(`/users/${targetUser.id}`);
      setUsers(users.filter((u) => u.id !== targetUser.id));
      setConfirmOpen(false);
    };
  
    return (
      <>
        <Title order={2}>User Management</Title>
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
                  defaultValue={u.balance}
                  step={1}
                  formatter={(value) =>
                    !Number.isNaN(parseFloat(value || '')) ? `€ ${parseFloat(value).toFixed(2)}` : ''
                  }
                  parser={(value) => value.replace(/€\s?|(,*)/g, '')}
                  onBlur={(e) =>
                    updateBalance(u.id, Number(e.currentTarget.value))
                  }
                />
                </td>
                <td>{u.total_drinks}</td>
                <td>
                  <Group spacing="xs">
                    <Button
                      color="red"
                      variant="subtle"
                      onClick={() => {
                        setTargetUser(u);
                        setConfirmOpen(true);
                      }}
                      leftIcon={<IconTrash size={16} />}
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
            Are you sure you want to delete{' '}
            <strong>{targetUser?.name}</strong>?
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
  