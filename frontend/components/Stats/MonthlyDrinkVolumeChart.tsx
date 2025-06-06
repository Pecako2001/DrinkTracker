import { useEffect, useState } from "react";
import { BarChart } from "@mantine/charts";
import { Center, Loader, Text } from "@mantine/core";
import type { MonthlyVolumeEntry } from "../../types/insights";

interface Props {
  userIds: number[];
}

interface ChartDatum {
  month: string;
  [key: string]: number | string;
}

export default function MonthlyDrinkVolumeChart({ userIds }: Props) {
  const [data, setData] = useState<MonthlyVolumeEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userIds.length) {
      setData([]);
      return;
    }
    setLoading(true);
    fetch("/api/insights/monthly-drink-volume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIds }),
    })
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [userIds]);

  if (!userIds.length) {
    return <Text c="dimmed">Select users to view data</Text>;
  }

  if (loading) {
    return (
      <Center h={200}>
        <Loader />
      </Center>
    );
  }

  if (!data.length) {
    return <Text c="dimmed">No data available</Text>;
  }

  const months = Array.from(new Set(data.map((d) => d.month))).sort();
  const seriesIds = Array.from(new Set(data.map((d) => d.userId)));

  const chartData: ChartDatum[] = months.map((m) => {
    const obj: ChartDatum = { month: m };
    seriesIds.forEach((id) => {
      const entry = data.find((d) => d.month === m && d.userId === id);
      obj[`user-${id}`] = entry ? entry.count : 0;
    });
    return obj;
  });

  const series = seriesIds.map((id) => ({
    name: `User ${id}`,
    valueKey: `user-${id}`,
  }));

  return (
    <BarChart
      h={300}
      data={chartData}
      dataKey="month"
      series={series}
      withLegend
    />
  );
}
