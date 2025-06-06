import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import {
  Container,
  Title,
  Loader,
  Button,
  Text,
  TextInput,
} from "@mantine/core"; // Removed Stack as UserSelector will handle layout
import { IconSearch } from "@tabler/icons-react";
import api from "../api/api";
import { Person } from "../types";
import UserSelector from "../components/Mobile/UserSelector";

const MobileUserSelectPage: React.FC = () => {
  const [users, setUsers] = useState<Person[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get<Person[]>("/users");
        setUsers(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch users. Please try again later.");
        setLoading(false);
        console.error(err); // Log error for debugging
      }
    };

    fetchUsers();
  }, []);

  const handleSelectUser = (userId: string | number) => {
    Cookies.set("selected_user_id", userId.toString(), { expires: 7 }); // Ensure userId is string
    router.push("/MobileQuickActions");
  };

  const searchLower = search.toLowerCase();
  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchLower) ||
      (u.nickname ?? "").toLowerCase().includes(searchLower),
  );

  if (loading) {
    return (
      <Container
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Loader />
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Title order={2} c="red.500">
          Error
        </Title>
        <Text>{error}</Text>
        <Button onClick={() => router.reload()} mt="md">
          Try Again
        </Button>
      </Container>
    );
  }

  return (
    <Container py="xl">
      <Title order={1} ta="center" mb="xl">
        Select User
      </Title>
      <TextInput
        placeholder="Search users..."
        leftSection={<IconSearch size={16} />}
        mb="md"
        value={search}
        onChange={(e) => setSearch(e.currentTarget.value)}
      />
      <UserSelector users={filteredUsers} onSelectUser={handleSelectUser} />
      {filteredUsers.length === 0 && !loading && (
        <Text ta="center" mt="lg">
          No users found.
        </Text>
      )}
    </Container>
  );
};

export default MobileUserSelectPage;
