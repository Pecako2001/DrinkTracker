import React, { useEffect, useState } from "react";
import { BarChart } from "@mantine/charts";
import { Card, Title, Text, Loader } from "@mantine/core";
import api from "../../api/api";

interface StreakEntry {
  id: number;
  name: string;
  streak: number;
}

export function LongestHydrationStreakChart() {
  const [data, setData] = useState<StreakEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<StreakEntry[]>("/stats/longest_hydration_streaks")
      .then((r) => setData(r.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (data.length === 0) {
    return <Text c="dimmed">No streak data available.</Text>;
  }

  const chartData = data.map((d) => ({
    name: d.name,
    "Streak Length": d.streak,
  }));

  return (
    <Card shadow="sm" p="md" radius="md" withBorder>
      <Title order={4} mb="sm">
        Longest Hydration Streaks
      </Title>
      <BarChart
        h={300}
        data={chartData}
        dataKey="name"
        series={[{ name: "Streak Length", color: "blue.6" }]}
      />
    </Card>
  );
}

export default LongestHydrationStreakChart;
