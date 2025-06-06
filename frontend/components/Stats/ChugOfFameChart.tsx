import React, { useEffect, useState } from "react";
import { BarChart } from "@mantine/charts";
import { Card, Loader, Text, Title } from "@mantine/core";
import api from "../../api/api";

interface ChugEntry {
  id: number;
  name: string;
  fastest_seconds: number;
}

export function ChugOfFameChart() {
  const [data, setData] = useState<ChugEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ChugEntry[]>("/stats/chug_of_fame")
      .then((r) => {
        const sorted = [...r.data].sort(
          (a, b) => a.fastest_seconds - b.fastest_seconds,
        );
        setData(sorted);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card shadow="sm" p="md" radius="md" withBorder>
        <Loader />
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card shadow="sm" p="md" radius="md" withBorder>
        <Text c="dimmed">No drink data available.</Text>
      </Card>
    );
  }

  const chartData = data.map((d) => ({
    user: d.name,
    seconds: d.fastest_seconds,
  }));

  return (
    <Card shadow="sm" p="md" radius="md" withBorder>
      <Title order={4} mb="sm">
        Chug of Fame
      </Title>
      <BarChart
        h={300}
        data={chartData}
        dataKey="user"
        series={[{ name: "Fastest Time (s)", valueKey: "seconds" }]}
      />
    </Card>
  );
}

export default ChugOfFameChart;
