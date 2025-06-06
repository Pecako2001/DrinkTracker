import React, { useEffect, useState } from "react";
import { BarChart } from "@mantine/charts";
import { Card, Loader, Text, Title } from "@mantine/core";

export function toPercentages(counts: number[]): number[] {
  const total = counts.reduce((a, b) => a + b, 0);
  if (total === 0) return counts.map(() => 0);
  return counts.map((c) => Math.round((c / total) * 100));
}

interface Props {
  userId: string | null;
}

export default function PeakThirstHours({ userId }: Props) {
  const [data, setData] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`/api/users/${userId}/drinks-per-hour`)
      .then((res) => res.json())
      .then((d) => setData(Array.isArray(d.hours) ? d.hours : []))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [userId]);

  if (!userId) {
    return <Text c="dimmed">Select a user to view data.</Text>;
  }

  if (loading) {
    return <Loader />;
  }

  if (!data.length) {
    return <Text c="dimmed">No drink data.</Text>;
  }

  const percentages = toPercentages(data);
  const chartData = percentages.map((p, h) => ({ hour: h.toString(), pct: p }));

  return (
    <Card shadow="sm" p="md" radius="md" withBorder>
      <Title order={5} mb="sm">
        Peak Thirst Hours
      </Title>
      <BarChart
        h={200}
        data={chartData}
        dataKey="hour"
        series={[{ name: "%", valueKey: "pct", color: "blue.6" }]}
      />
    </Card>
  );
}
