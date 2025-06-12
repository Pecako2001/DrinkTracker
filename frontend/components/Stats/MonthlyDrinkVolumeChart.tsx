import React, { useState, useMemo } from "react";
import { BarChart } from '@mantine/charts';
import type { MonthlyVolumeEntry } from "../../types/insights";
import '@mantine/charts/styles.css';
import { Container, Title, Select, Group, Box, Stack } from "@mantine/core";

interface Props {
  data: MonthlyVolumeEntry[];
  users: Record<number, string>;
  mainUserId?: string; // Optional, for default selection
}

const colors = [
  "blue.6",
  "green.6",
  "yellow.6",
  "red.6",
  "grape.6",
  "teal.6",
];

export default function MonthlyDrinkVolumeChart({ data, users, mainUserId }: Props) {
  // Prepare user options for multi-select
  const userOptions = Object.entries(users).map(([id, name]) => ({
    value: id,
    label: name,
  }));

  // State: selected user IDs (as strings)
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>(
    mainUserId && users[Number(mainUserId)] ? [mainUserId] : userOptions.length > 0 ? [userOptions[0].value] : []
  );

  // Only show data for selected users
  const selectedUsers = useMemo(() => {
    const obj: Record<number, string> = {};
    selectedUserIds.forEach((id) => {
      if (users[Number(id)]) obj[Number(id)] = users[Number(id)];
    });
    return obj;
  }, [selectedUserIds, users]);

  // Get all unique months, sorted
  const months = Array.from(new Set(data.map((d) => d.month))).sort();

  // Build a flat array for Mantine BarChart
  const chartData = months.map((month) => {
    const entry: Record<string, any> = { month };
    Object.entries(selectedUsers).forEach(([idStr, name]) => {
      const id = parseInt(idStr, 10);
      const row = data.find((d) => d.userId === id && d.month === month);
      entry[name] = row ? row.count : 0;
    });
    return entry;
  });

  // Build series for each selected user
  const series = Object.values(selectedUsers).map((name, idx) => ({
    name,
    color: colors[idx % colors.length],
  }));

  return (
    <Container size="lg" className="monthly-drink-volume-chart">
      <Group align="flex-start" justify="space-between" wrap="nowrap">
        <Box style={{ flex: 1 }}>
          <Title order={4} mb="md">
            Monthly Drink Volume Comparison
          </Title>
          <BarChart
            h={300}
            data={chartData}
            dataKey="month"
            series={series}
            tickLine="y"
            withLegend
          />
        </Box>
        <Box style={{ minWidth: 250, marginLeft: 32 }}>
          <Stack>
            <Title order={5} mb={4}>
              Add users
            </Title>
            <Select
              label="Select users"
              placeholder="Choose users"
              data={userOptions}
              value={selectedUserIds}
              onChange={(values) => setSelectedUserIds(Array.isArray(values) ? values : [])}
              multiple
              searchable
              clearable={false}
              nothingFoundMessage="No users"
            />
          </Stack>
        </Box>
      </Group>
    </Container>
  );
}
