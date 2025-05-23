import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  TextInput,
  SimpleGrid,
  Notification,
  Button,
  Stack,
} from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";
import api from "../api/api";
import { Person } from "../types";
import { UserCardImage } from "../components/UserCard/UserCard";
import { TopUpModal } from "../components/TopUpModal";

interface DrinkNotification {
  user: Person;
  id: number;
}

export default function HomePage() {
  const [users, setUsers] = useState<Person[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpened, setModalOpened] = useState(false);
  const [topUpUser, setTopUpUser] = useState<Person | null>(null);
  const [amount, setAmount] = useState<number>(5);
  const originalOrderRef = useRef<number[]>([]);

  const [notifications, setNotifications] = useState<DrinkNotification[]>([]);

  useEffect(() => {
    api.get<Person[]>("/users").then((r) => {
      setUsers(r.data);
      originalOrderRef.current = r.data.map((u) => u.id);
    });
  }, []);

  const fetchUsersSorted = async () => {
    const updatedUsers = (await api.get<Person[]>("/users")).data;
    const sorted = originalOrderRef.current.map(
      (id) => updatedUsers.find((u) => u.id === id)!,
    );
    setUsers(sorted);
  };

  const handleDrink = async (userId: number) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;

    if (user.balance <= 0) {
      // Open top-up modal instead
      setTopUpUser(user);
      setAmount(5);
      setModalOpened(true);
      return;
    }

    // Add drink and show notification
    const freshUser = (await api.get<Person>(`/users/${userId}`)).data;
    setNotifications((prev) => [
      ...prev,
      {
        id: Date.now(),
        user: freshUser,
      },
    ]);

    await api.post(`/users/${userId}/drinks`);
    await fetchUsersSorted();
  };

  const handleUndoDrink = async (notif: DrinkNotification) => {
    const freshUser = (await api.get<Person>(`/users/${notif.user.id}`)).data;

    await api.patch(`/users/${notif.user.id}`, {
      balance: freshUser.balance + 1,
      total_drinks: freshUser.total_drinks - 1,
    });

    await fetchUsersSorted();
    setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
  };

  const openTopUp = (user: Person) => {
    setTopUpUser(user);
    setAmount(5);
    setModalOpened(true);
  };

  const confirmTopUp = async () => {
    if (!topUpUser) return;
    const { data } = await api.post<{ checkoutUrl: string }>(
      "/payments/topup",
      {
        user_id: topUpUser.id,
        amount,
      },
    );
    window.location.href = data.checkoutUrl;
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Container size={750} py="md">
      <TextInput
        placeholder="Search users..."
        leftSection={<IconSearch size={16} />}
        mb="md"
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
        __clearable
      />

      <TopUpModal
        opened={modalOpened}
        userName={topUpUser?.name ?? ""}
        amount={amount}
        onChangeAmount={setAmount}
        onConfirm={confirmTopUp}
        onClose={() => setModalOpened(false)}
      />

      <SimpleGrid
        cols={2}
        spacing="md"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))" }}
      >
        {filtered.map((user) => (
          <UserCardImage
            key={user.id}
            user={user}
            onDrink={() => handleDrink(user.id)}
            onTopUp={() => openTopUp(user)}
          />
        ))}
      </SimpleGrid>

      <Stack pos="fixed" bottom={16} right={16} gap="sm">
        {notifications.map((notif) => (
          <Notification
            key={notif.id}
            onClose={() =>
              setNotifications((prev) => prev.filter((n) => n.id !== notif.id))
            }
            withCloseButton
            icon={<IconX size={16} />}
            color="teal"
            title="Drink added"
          >
            +1 drink added to <strong>{notif.user.name}</strong>
            <Button
              size="xs"
              ml="sm"
              variant="light"
              onClick={() => handleUndoDrink(notif)}
            >
              Undo
            </Button>
          </Notification>
        ))}
      </Stack>
    </Container>
  );
}
