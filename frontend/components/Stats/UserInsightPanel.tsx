import React, { useState, useEffect } from "react";
import {
  Select,
  MultiSelect,
  Text,
  Title,
  SimpleGrid,
  Card,
  Loader,
} from "@mantine/core";
import MonthlyDrinkVolumeChart from "./MonthlyDrinkVolumeChart";
import { Person } from "../../types";
import api from "../../api/api";
import classes from "../../styles/StatsPage.module.css";
import PeakThirstHoursChart from "./PeakThirstHoursChart";
// import SocialSipScoreChart from "./SocialSipScoreChart";
import LongestHydrationStreakChart from "./LongestHydrationStreakChart";
import SocialSipChart from "./SocialSipChart";

interface UserStatsData {
  drinks_last_30_days: number;
  favorite_drink: string;
}

export function UserInsightPanel() {
  const [users, setUsers] = useState<{ value: string; label: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [chartUsers, setChartUsers] = useState<string[]>([]);
  const [userData, setUserData] = useState<UserStatsData | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [selectedChartUsers, setSelectedChartUsers] = useState<string[]>([]);

  // Fetch all users for the dropdown
  useEffect(() => {
    setLoadingUsers(true);
    api
      .get<Person[]>("/users")
      .then((response) => {
        const transformedUsers = response.data.map((user) => ({
          value: user.id.toString(),
          label: user.name,
        }));
        setUsers(transformedUsers);
      })
      .catch((_error) => {
        // Optionally set an error state here
        // console.error("Error fetching users:", error);
      })
      .finally(() => {
        setLoadingUsers(false);
      });
  }, []);

  const idToName = Object.fromEntries(users.map((u) => [Number(u.value), u.label]));

  // Fetch stats for the selected user
  useEffect(() => {
    if (selectedUserId) {
      setLoading(true);
      setUserData(null); // Clear previous data

      // Find user name for display
      const selectedUser = users.find((user) => user.value === selectedUserId);
      setSelectedUserName(selectedUser ? selectedUser.label : null);

      api
        .get<UserStatsData>(`/users/${selectedUserId}/stats`)
        .then((response) => {
          setUserData(response.data);
        })
        .catch(() => {
          // Optionally handle error state
          setUserData(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setUserData(null);
      setSelectedUserName(null);
    }
  }, [selectedUserId, users]); // Add users to dependency array in case it's initially empty

  return (
    <div className={classes.userInsightPanel}>
      <Title order={3} mb="md">
        User Insights
      </Title>
      <Select
        label="Select User"
        placeholder="Search or pick a user"
        data={users}
        value={selectedUserId}
        onChange={setSelectedUserId}
        searchable
        clearable
        disabled={loadingUsers}
        mb="lg"
        nothingFoundMessage={
          loadingUsers ? "Loading users..." : "No users found"
        }
      />
      <MultiSelect
        label="Compare Users"
        placeholder="Pick users to compare"
        data={users}
        value={chartUsers}
        onChange={setChartUsers}
        searchable
        clearable
        disabled={loadingUsers}
        mb="lg"
        nothingFoundMessage={
          loadingUsers ? "Loading users..." : "No users found"
        }
      />

      <MultiSelect
        label="Compare Users"
        placeholder="Select users"
        data={users}
        value={selectedChartUsers}
        onChange={setSelectedChartUsers}
        searchable
        clearable
        disabled={loadingUsers}
        mb="lg"
      />

      {loading && <Loader />}

      {!loading && !selectedUserId && (
        <Text c="dimmed">Select a user to see their insights.</Text>
      )}

      {!loading && selectedUserId && userData && selectedUserName && (
        <>
          <Title order={4} mb="sm">
            Stats for {selectedUserName}
          </Title>
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
            <Card
              shadow="sm"
              p="md"
              radius="md"
              className={classes.userStatsCard}
            >
              <Text size="xs" c="dimmed" fw={700}>
                DRINKS (LAST 30 DAYS)
              </Text>
              <Text size="xl" fw={500}>
                {userData.drinks_last_30_days}
              </Text>
            </Card>
            <Card
              shadow="sm"
              p="md"
              radius="md"
              className={classes.userStatsCard}
            >
              <Text size="xs" c="dimmed" fw={700}>
                FAVORITE DRINK (MOCK)
              </Text>
              <Text size="xl" fw={500}>
                {userData.favorite_drink}
              </Text>
            </Card>
            {/* Add more stat cards here */}
          </SimpleGrid>
          {/* <SocialSipChart userId={selectedUserId} /> */}
        </>
      )}
      {/* <LongestHydrationStreakChart />
      {!loading && selectedUserId && !userData && !selectedUserName && (
        // This case might happen briefly if user name isn't found before mock data is set
        <Text c="dimmed">Loading user data...</Text>
      )} */}

      {/* <PeakThirstHoursChart
        userIds={selectedChartUsers.map((id) => parseInt(id, 10))}
        idToName={idToName}
      /> */}
      {/* <SocialSipScoreChart /> */}

      <MonthlyDrinkVolumeChart userIds={chartUsers.map(Number)} />
    </div>
  );
}

export default UserInsightPanel;
