import React, { useEffect, useState } from "react";
import { Select, Text, Title } from "@mantine/core";
import { Person } from "../../types";
import api from "../../api/api";
import PeakThirstHoursChart from "./PeakThirstHoursChart";
import MonthlyDrinkVolumeChart from "./MonthlyDrinkVolumeChart";
import classes from "../../styles/StatsPage.module.css";

export function UserInsightPanel() {
  const [users, setUsers] = useState<{ value: string; label: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // load users for dropdown
  useEffect(() => {
    setLoadingUsers(true);
    api
      .get<Person[]>("/users")
      .then((res) => {
        setUsers(
          res.data.map((u) => ({ value: u.id.toString(), label: u.name })),
        );
      })
      .finally(() => setLoadingUsers(false));
  }, []);

  const idToName = Object.fromEntries(
    users.map((u) => [parseInt(u.value, 10), u.label]),
  );

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

      {!selectedUserId && (
        <Text c="dimmed">Select a user to see their insights.</Text>
      )}

      {selectedUserId && (
        <>
          <PeakThirstHoursChart
            userIds={[parseInt(selectedUserId, 10)]}
            idToName={idToName}
          />
          <MonthlyDrinkVolumeChart userIds={[parseInt(selectedUserId, 10)]} />
        </>
      )}
    </div>
  );
}

export default UserInsightPanel;
