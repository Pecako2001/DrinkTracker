import React, { useEffect, useState, useMemo } from "react";
import { MultiSelect, Loader } from "@mantine/core";
import api from "../../api/api";
import type { Person } from "../../types";
import type { MonthlyVolumeEntry } from "../../types/insights";
import MonthlyDrinkVolumeChart from "./MonthlyDrinkVolumeChart";
import classes from "../../styles/StatsPage.module.css";

export default function UserMonthlyComparison() {
  const [users, setUsers] = useState<Person[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [data, setData] = useState<MonthlyVolumeEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get<Person[]>("/users").then((res) => setUsers(res.data));
  }, []);

  const options = users.map((u) => ({ value: u.id.toString(), label: u.name }));

  const idToName = useMemo(() => {
    const map: Record<number, string> = {};
    users.forEach((u) => {
      map[u.id] = u.name;
    });
    return map;
  }, [users]);

  useEffect(() => {
    if (selected.length === 0) {
      setData([]);
      return;
    }
    setLoading(true);
    api
      .get<MonthlyVolumeEntry[]>("/insights/monthly_totals", {
        params: { user_ids: selected.join(",") },
      })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [selected]);

  return (
    <div className={classes.userInsightPanel}>
      <MultiSelect
        label="Select users"
        placeholder="Choose users"
        data={options}
        searchable
        value={selected}
        onChange={setSelected}
        clearable
      />
      {loading && <Loader />}
      {!loading && selected.length > 0 && (
        <MonthlyDrinkVolumeChart data={data} users={idToName} />
      )}
    </div>
  );
}
