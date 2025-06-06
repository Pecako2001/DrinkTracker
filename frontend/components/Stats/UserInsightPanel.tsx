import React, { useState, useEffect } from "react";
import { Select, Text, Title, Card, Loader, Table } from "@mantine/core";
import { Person, BuddyScore } from "../../types";
import api from "../../api/api";
import classes from "../../styles/StatsPage.module.css";
import PeakThirstHoursChart from "./PeakThirstHoursChart";
import LongestHydrationStreakChart from "./LongestHydrationStreakChart";
import SocialSipChart from "./SocialSipChart";

export function UserInsightPanel() {
  const [users, setUsers] = useState<{ value: string; label: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [buddyScores, setBuddyScores] = useState<BuddyScore[] | null>(null);
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

  // Fetch buddy scores for the selected user
  useEffect(() => {
    if (selectedUserId) {
      setLoading(true);
      setBuddyScores(null);

      const selectedUser = users.find((u) => u.value === selectedUserId);
      setSelectedUserName(selectedUser ? selectedUser.label : null);

      api
        .get<BuddyScore[]>(`/users/${selectedUserId}/social_sip_scores`)
        .then((res) => setBuddyScores(res.data))
        .finally(() => setLoading(false));
    } else {
      setBuddyScores(null);
      setSelectedUserName(null);
    }
  }, [selectedUserId, users]);

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

      {!loading && !selectedUserId && (
        <Text c="dimmed">Select a user to see their insights.</Text>
      )}

      {!loading && selectedUserId && buddyScores && selectedUserName && (
        <>
          <Title order={4} mb="sm">
            Top buddies for {selectedUserName}
          </Title>
          <Card withBorder p="md" radius="md" className={classes.userStatsCard}>
            {buddyScores.length === 0 && (
              <Text c="dimmed">No buddy data available.</Text>
            )}
            {buddyScores.length > 0 && (
              <Table highlightOnHover verticalSpacing="sm">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th style={{ textAlign: "right" }}>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {buddyScores.map((b) => (
                    <tr key={b.buddy_id}>
                      <td>{b.buddy_name}</td>
                      <td style={{ textAlign: "right" }}>{b.score}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card>
        </>
      )}
      {!loading && selectedUserId && !buddyScores && !selectedUserName && (
        <Text c="dimmed">Loading user data...</Text>
      )}

      <PeakThirstHoursChart
        userIds={selectedChartUsers.map((id) => parseInt(id, 10))}
        idToName={idToName}
      /> 
      

      <MonthlyDrinkVolumeChart userIds={chartUsers.map(Number)} />
    </div>
  );
}

export default UserInsightPanel;
