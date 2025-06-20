import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import {
  Container,
  Title,
  Loader,
  Button,
  Box,
  Text,
  Stack,
  Notification,
} from "@mantine/core"; // Removed Paper, Group as they are now encapsulated in UserQuickActionsDisplay
import api from "../api/api";
import { Person } from "../types";
import {
  IconCoffee,
  IconCreditCardPay,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import UserQuickActionsDisplay from "../components/Mobile/UserQuickActionsDisplay";
import MobileTopUpModal from "../components/Mobile/MobileTopUpModal";
import styles from "../styles/MobileQuickActions.module.css"; // Assuming you have a CSS module for styles

interface DrinkNotification {
  user: Person;
  id: number;
}

const MobileQuickActionsPage: React.FC = () => {
  const [user, setUser] = useState<Person | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState({
    drink: false,
    topup: false,
  });
  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(5);
  const [notifications, setNotifications] = useState<DrinkNotification[]>([]);
  const [animateDrink, setAnimateDrink] = useState(false);
  const router = useRouter();

  const fetchUserData = useCallback(async (userId: string) => {
    setLoading(true); // Ensure loading is true when fetching
    try {
      const response = await api.get<Person>(`/users/${userId}`);
      setUser(response.data);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch user data:", err);
      setError("Failed to load user data. Please try again or re-select user.");
      setUser(null); // Clear user data on error
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const userId = Cookies.get("selected_user_id");
    if (!userId) {
      router.push("/MobileUserSelect");
      setLoading(false);
      return;
    }
    fetchUserData(userId);
  }, [router, fetchUserData]);

  const handleAddDrink = async () => {
    if (!user) return;
    if (user.balance <= 0) {
      setTopUpModalOpen(true);
      return;
    }
    setActionLoading((prev) => ({ ...prev, drink: true }));
    try {
      const freshUser = (await api.get<Person>(`/users/${user.id}`)).data;
      setNotifications((prev) => [
        ...prev,
        {
          id: Date.now(),
          user: freshUser,
        },
      ]);
      await api.post(`/users/${user.id}/drinks`);
      await fetchUserData(user.id.toString());
    } catch (err) {
      setError("Failed to add drink. Please try again.");
    } finally {
      setActionLoading((prev) => ({ ...prev, drink: false }));
    }
  };

  const handleAddDrinkWithAnimation = async () => {
    setAnimateDrink(true);
    setTimeout(() => setAnimateDrink(false), 300);
    await handleAddDrink();
  };

  const handleUndoDrink = async (notif: DrinkNotification) => {
    await api.post(`/users/${notif.user.id}/drinks/undo`);
    await fetchUserData(notif.user.id.toString());
    setNotifications((prev) => prev.filter((n) => n.id !== notif.id));
  };

  const handleTopUp = async () => {
    if (!user) return;
    setActionLoading((prev) => ({ ...prev, topup: true }));
    try {
      // Call backend to create payment and get checkout URL
      const { data } = await api.post<{ checkoutUrl: string }>(
        "/payments/topup",
        { user_id: user.id, amount: topUpAmount },
      );
      // Redirect to payment provider
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError("Failed to initiate top up. Please try again.");
    } finally {
      setActionLoading((prev) => ({ ...prev, topup: false }));
      setTopUpModalOpen(false);
    }
  };

  const handleAvatarChange = async (file: File | null) => {
    if (!file || !user) return;
    setActionLoading((prev) => ({ ...prev, drink: true }));
    try {
      const form = new FormData();
      form.append("file", file);
      await api.post(`/users/${user.id}/avatar`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await fetchUserData(user.id.toString());
    } catch {
      setError("Failed to update avatar. Please try again.");
    } finally {
      setActionLoading((prev) => ({ ...prev, drink: false }));
    }
  };

  if (loading && !user) {
    // Show loader only if truly loading initial data
    return (
      <Container className={styles.container} fluid>
        <Loader />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className={styles.container} fluid>
        <Title order={2} c="red.500" ta="center">
          Error
        </Title>
        <Text ta="center">{error}</Text>
        <Button
          onClick={() => {
            const userId = Cookies.get("selected_user_id");
            if (userId) fetchUserData(userId);
            else router.push("/MobileUserSelect");
          }}
          mt="md"
        >
          Try Again
        </Button>
        <Button
          onClick={() => router.push("/MobileUserSelect")}
          mt="sm"
          variant="outline"
        >
          Select Different User
        </Button>
      </Container>
    );
  }

  if (!user) {
    // Should ideally be covered by loading or error state, but as a fallback
    return (
      <Container className={styles.container} fluid>
        <Text>No user data available. You might need to re-select a user.</Text>
        <Button onClick={() => router.push("/MobileUserSelect")} mt="md">
          Go to User Selection
        </Button>
      </Container>
    );
  }

  return (
    <Container className={styles.container} fluid>
      <Box className={styles.box}>
        <UserQuickActionsDisplay
          user={user}
          onChangeAvatar={handleAvatarChange}
        />
      </Box>

      <Stack className={styles.stack}>
        <Button
          onClick={handleAddDrinkWithAnimation}
          loading={actionLoading.drink}
          disabled={actionLoading.topup}
          size="lg"
          leftSection={<IconCoffee size={25} />}
          className={`${styles.button} ${animateDrink ? styles.animate : ""}`}
        >
          +1 Drink
        </Button>
        <Button
          onClick={() => setTopUpModalOpen(true)}
          loading={actionLoading.topup}
          disabled={actionLoading.drink}
          size="lg"
          leftSection={<IconCreditCardPay size={25} />}
          variant="outline"
          className={styles.button}
        >
          Top Up
        </Button>
      </Stack>

      <Button
        onClick={() => router.push("/MobileUserSelect")}
        mt="xl"
        variant="light"
        fullWidth
        leftSection={<IconUser size={20} />}
      >
        Change User
      </Button>

      <MobileTopUpModal
        opened={topUpModalOpen}
        amount={topUpAmount}
        onChangeAmount={setTopUpAmount}
        onConfirm={handleTopUp}
        onClose={() => setTopUpModalOpen(false)}
      />

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
};

export default MobileQuickActionsPage;
