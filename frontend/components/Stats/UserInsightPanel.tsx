import React, { useState, useEffect, useMemo } from "react";
import { Select, Text, Title, SimpleGrid, MultiSelect, Card, Loader } from "@mantine/core";
import { Person } from "../../types";
import api from "../../api/api";
import PeakThirstHoursChart from "./PeakThirstHoursChart";
import MonthlyDrinkVolumeChart from "./MonthlyDrinkVolumeChart";
import classes from "../../styles/StatsPage.module.css";

// Define BuddyScore type if not imported from elsewhere
type BuddyScore = {
  // Replace these fields with the actual structure as needed
  userId: number;
  score: number;
};

export function UserInsightPanel() {
  const [users, setUsers] = useState<{ value: string; label: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [buddyScores, setBuddyScores] = useState<BuddyScore[] | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [chartUsers, setChartUsers] = useState<string[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const idToName = useMemo(() => {
    const map: Record<number, string> = {};
    users.forEach((u) => {
      map[parseInt(u.value, 10)] = u.label;
    });
    return map;
  }, [users]);

  // Fetch all users for the dropdown
  useEffect(() => {
    setLoadingUsers(true);
    api
      .get<Person[]>("/users")
      .then((res) => {
        setUsers(
          res.data.map((u) => ({ value: u.id.toString(), label: u.name })),
        );
      })
      .finally(() => {
        setLoadingUsers(false);
      });
  }, []);

  return (
    <div className={classes.userInsightPanel}>
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
      {selectedUserId && (
        <MonthlyDrinkVolumeChart userIds={chartUsers.map(Number)} />
      )}


    </div>
  );
}

export default UserInsightPanel;

  {/* <PeakThirstHoursChart
    userIds={[parseInt(selectedUserId, 10)]}
    idToName={idToName}
  /> */}
  {/* <MonthlyDrinkVolumeChart userIds={[parseInt(selectedUserId, 10)]} /> */}

        {/* <PeakThirstHoursChart
userIds={chartUsers.map((id) => parseInt(id, 10))}
idToName={idToName}
/> */}
