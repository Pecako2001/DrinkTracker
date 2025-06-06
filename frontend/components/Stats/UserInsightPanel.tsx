import React, { useEffect, useState, useMemo } from "react";
import api from "../../api/api";
import MonthlyDrinkVolumeChart from "./MonthlyDrinkVolumeChart";
import PeakThirstHours from "./PeakThirstHours";
import { Select, Loader, Text } from "@mantine/core";
import { Person } from "../../types";
import type { MonthlyVolumeEntry } from "../../types/insights";
import classes from "../../styles/StatsPage.module.css";

export function UserInsightPanel() {
  const [users, setUsers] = useState<{ value: string; label: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [monthlyData, setMonthlyData] = useState<MonthlyVolumeEntry[]>([]);
  const [loadingMonthly, setLoadingMonthly] = useState(false);

  const idToName = useMemo(() => {
    const map: Record<number, string> = {};
    users.forEach((u) => {
      map[parseInt(u.value, 10)] = u.label;
    });
    return map;
  }, [users]);

  useEffect(() => {
    if (!selectedUserId) {
      setMonthlyData([]);
      return;
    }
    setLoadingMonthly(true);
    api
      .get<MonthlyVolumeEntry[]>(`/users/${selectedUserId}/monthly_drinks`)
      .then((res) => setMonthlyData(res.data))
      .catch(() => {
        const base = new Date();
        base.setDate(1);
        const mock: MonthlyVolumeEntry[] = [];
        for (let i = 5; i >= 0; i--) {
          const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
          mock.push({
            userId: parseInt(selectedUserId, 10),
            month: d.toISOString().slice(0, 7),
            count: 0,
          });
        }
        setMonthlyData(mock);
      })
      .finally(() => setLoadingMonthly(false));
  }, [selectedUserId]);

  // Fetch all users for the dropdown
  useEffect(() => {
    setLoadingUsers(true);
    api
      .get<Person[]>("/users")
      .then((res) =>
        setUsers(
          res.data.map((u) => ({ value: u.id.toString(), label: u.name })),
        ),
      )
      .finally(() => setLoadingUsers(false));
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
      {selectedUserId &&
        (loadingMonthly ? (
          <Loader />
        ) : (
          <MonthlyDrinkVolumeChart data={monthlyData} />
        ))}
    </div>
  );
}

export default UserInsightPanel;
