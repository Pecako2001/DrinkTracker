import React, { useEffect, useState } from "react";
import { Select } from "@mantine/core";
import api from "../../api/api";
import { Person } from "../../types";
import MonthlyDrinkVolumeChart from "./MonthlyDrinkVolumeChart";
import PeakThirstHours from "./PeakThirstHours";
import classes from "../../styles/StatsPage.module.css";

export function UserInsightPanel() {
  const [users, setUsers] = useState<{ value: string; label: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loadingUsers, setLoadingUsers] = useState(true);

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
      {selectedUserId && (
        <>
          <MonthlyDrinkVolumeChart userIds={[parseInt(selectedUserId, 10)]} />
          <PeakThirstHours userId={selectedUserId} />
        </>
      )}
    </div>
  );
}

export default UserInsightPanel;
