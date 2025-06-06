import React, { useState, useEffect } from "react";
import {
  MultiSelect,
  Text,
  Title,
  SimpleGrid,
  Card,
  Loader,
  Table,
} from "@mantine/core";
import { BarChart } from "@mantine/charts";
import { Person } from "../../types";
import api from "../../api/api";
import classes from "../../styles/StatsPage.module.css";

interface UserStatsData {
  drinks_last_30_days: number;
  favorite_drink: string;
}

interface InsightsData {
  monthlyVolume: Record<string, number | string>[];
  peakHours: Record<string, number | string>[];
  hydrationStreaks: { user: string; days: number }[];
  earlyLate: { user: string; early: number; late: number }[];
  chugOfFame: { user: string; seconds: number }[];
  hydrationHolidays: { date: string; count: number }[];
  socialSip: { group: string; count: number }[];
}

const colors = [
  "blue.6",
  "grape.6",
  "teal.6",
  "cyan.6",
  "orange.6",
  "red.6",
  "lime.6",
  "indigo.6",
];

function getLastMonths(count: number) {
  const now = new Date();
  return Array.from({ length: count }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1);
    return d.toLocaleString("default", { month: "short" });
  });
}

function generateMockInsights(ids: string[], names: string[]): InsightsData {
  const months = getLastMonths(6);
  const monthlyVolume = months.map((m) => {
    const item: Record<string, number | string> = { month: m };
    ids.forEach((id) => {
      item[id] = Math.floor(Math.random() * 30) + 5;
    });
    return item;
  });

  const peakHours = Array.from({ length: 24 }).map((_, h) => {
    const item: Record<string, number | string> = { hour: h };
    ids.forEach((id) => {
      item[id] = Math.floor(Math.random() * 5);
    });
    return item;
  });

  const hydrationStreaks = ids.map((id, i) => ({
    user: names[i] ?? id,
    days: Math.floor(Math.random() * 15) + 1,
  }));

  const earlyLate = ids.map((id, i) => ({
    user: names[i] ?? id,
    early: Math.floor(Math.random() * 20),
    late: Math.floor(Math.random() * 20),
  }));

  const chugOfFame = ids.map((id, i) => ({
    user: names[i] ?? id,
    seconds: Math.floor(Math.random() * 200) + 30,
  }));

  const hydrationHolidays = months.map((m) => ({
    date: m,
    count: Math.floor(Math.random() * 10) + 1,
  }));

  const socialSip = ids.map((id, i) => ({
    group: names[i] ?? id,
    count: Math.floor(Math.random() * 30),
  }));

  return {
    monthlyVolume,
    peakHours,
    hydrationStreaks,
    earlyLate,
    chugOfFame,
    hydrationHolidays,
    socialSip,
  };
}

export function UserInsightPanel() {
  const [users, setUsers] = useState<{ value: string; label: string }[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userData, setUserData] = useState<UserStatsData | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);

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

  // Fetch stats for the first selected user
  useEffect(() => {
    const firstId = selectedUserIds[0];
    if (firstId) {
      setLoading(true);
      setUserData(null);
      const selectedUser = users.find((u) => u.value === firstId);
      setSelectedUserName(selectedUser ? selectedUser.label : null);
      api
        .get<UserStatsData>(`/users/${firstId}/stats`)
        .then((response) => {
          setUserData(response.data);
        })
        .catch(() => {
          setUserData(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setUserData(null);
      setSelectedUserName(null);
    }
  }, [selectedUserIds, users]);

  // Fetch insights for selected users or generate mock data
  useEffect(() => {
    if (selectedUserIds.length === 0) {
      setInsights(null);
      return;
    }
    const names = selectedUserIds.map(
      (id) => users.find((u) => u.value === id)?.label || id,
    );
    setLoading(true);
    api
      .get<InsightsData>("/insights", {
        params: { users: selectedUserIds.join(",") },
      })
      .then((res) => setInsights(res.data))
      .catch(() => {
        setInsights(generateMockInsights(selectedUserIds, names));
      })
      .finally(() => setLoading(false));
  }, [selectedUserIds, users]);

    return (
      <div className={classes.userInsightPanel}>
        <Title order={3} mb="md">
          User Insights
        </Title>
        <MultiSelect
          label="Select Users"
          placeholder="Search or pick users"
          data={users}
          value={selectedUserIds}
          onChange={setSelectedUserIds}
          searchable
          clearable
          disabled={loadingUsers}
          mb="lg"
          nothingFoundMessage={
            loadingUsers ? "Loading users..." : "No users found"
          }
        />

      {loading && <Loader />}

        {!loading && selectedUserIds.length === 0 && (
          <Text c="dimmed">Select users to see insights.</Text>
        )}

        {!loading && selectedUserIds.length > 0 && userData && selectedUserName && (
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
        </>
        )}
        {!loading && selectedUserIds.length > 0 && !userData && !selectedUserName && (
          // This case might happen briefly if user name isn't found before mock data is set
          <Text c="dimmed">Loading user data...</Text>
        )}
        {!loading && insights && (
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md" mt="md">
            <Card shadow="sm" p="md" radius="md" withBorder>
              <Title order={5} mb="sm">
                Monthly Drink Volume (Last 6 Months)
              </Title>
              <BarChart
                h={260}
                data={insights.monthlyVolume}
                dataKey="month"
                stacked
                withLegend
                series={selectedUserIds.map((id, i) => ({
                  name: users.find((u) => u.value === id)?.label || id,
                  valueKey: id,
                  color: colors[i % colors.length],
                }))}
              />
            </Card>

            <Card shadow="sm" p="md" radius="md" withBorder>
              <Title order={5} mb="sm">
                Peak Thirst Hours
              </Title>
              <BarChart
                h={260}
                data={insights.peakHours}
                dataKey="hour"
                withLegend
                series={selectedUserIds.map((id, i) => ({
                  name: users.find((u) => u.value === id)?.label || id,
                  valueKey: id,
                  color: colors[i % colors.length],
                }))}
              />
            </Card>

            <Card shadow="sm" p="md" radius="md" withBorder>
              <Title order={5} mb="sm">
                Longest Hydration Streaks
              </Title>
              <BarChart
                h={220}
                data={insights.hydrationStreaks}
                dataKey="user"
                orientation="horizontal"
                series={[{
                  name: "Days",
                  valueKey: "days",
                  color: "teal.6",
                }]}
              />
            </Card>

            <Card shadow="sm" p="md" radius="md" withBorder>
              <Title order={5} mb="sm">
                Early Bird vs Night Owl
              </Title>
              <BarChart
                h={220}
                data={insights.earlyLate}
                dataKey="user"
                stacked
                orientation="horizontal"
                withLegend
                series={[
                  { name: "Before 9 AM", valueKey: "early", color: "blue.6" },
                  { name: "After 9 PM", valueKey: "late", color: "grape.6" },
                ]}
              />
            </Card>

            <Card shadow="sm" p="md" radius="md" withBorder>
              <Title order={5} mb="sm">
                Chug of Fame
              </Title>
              <BarChart
                h={220}
                data={insights.chugOfFame}
                dataKey="user"
                orientation="horizontal"
                series={[{
                  name: "Fastest Gap (s)",
                  valueKey: "seconds",
                  color: "orange.6",
                }]}
              />
            </Card>

            <Card shadow="sm" p="md" radius="md" withBorder>
              <Title order={5} mb="sm">
                Hydration Holidays
              </Title>
              <Table withRowBorders={false} verticalSpacing="xs">
                <Table.Tbody>
                  {insights.hydrationHolidays.map((d) => (
                    <Table.Tr key={d.date}>
                      <Table.Td>{d.date}</Table.Td>
                      <Table.Td>{d.count}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Card>

            <Card shadow="sm" p="md" radius="md" withBorder>
              <Title order={5} mb="sm">
                Social Sip Score
              </Title>
              <BarChart
                h={220}
                data={insights.socialSip}
                dataKey="group"
                series={[{
                  name: "Co-logged Drinks",
                  valueKey: "count",
                  color: "cyan.6",
                }]}
              />
            </Card>
          </SimpleGrid>
        )}
      </div>
    );
  }

export default UserInsightPanel;
