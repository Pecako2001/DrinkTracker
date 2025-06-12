import React, { useEffect, useState, useMemo } from "react";
import { Select, Loader } from "@mantine/core";
import api from "../../api/api";
import type { Person } from "../../types";
import type { MonthlyVolumeEntry } from "../../types/insights";
import MonthlyDrinkVolumeChart from "./MonthlyDrinkVolumeChart";
import classes from "../../styles/StatsPage.module.css";

export default function UserMonthlyComparison() {
  const [users, setUsers] = useState<Person[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [data, setData] = useState<MonthlyVolumeEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<Person[]>("/users").then((res) => setUsers(res.data));
  }, []);

  const options = users.map((u) => ({ value: u.id.toString(), label: u.name }));

  // Only include the selected user in the idToName map
  const idToName = useMemo(() => {
    if (!selected) return {};
    const user = users.find((u) => u.id.toString() === selected);
    return user ? { [user.id]: user.name } : {};
  }, [users, selected]);

  useEffect(() => {
    if (!selected) {
      setData([]);
      return;
    }
    setLoading(true);
    api
      .get<MonthlyVolumeEntry[]>("/insights/monthly_totals", {
        params: { user_ids: selected },
      })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <div className={classes.userInsightPanel}>
      <Select
        label="Select user"
        placeholder="Choose a user"
        data={options}
        searchable
        value={selected}
        onChange={setSelected}
        clearable
      />
      {loading && <Loader />}
      {!loading && selected && (
        <MonthlyDrinkVolumeChart data={data} users={idToName} />
      )}
    </div>
  );
}
