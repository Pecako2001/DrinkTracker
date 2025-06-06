import React, { useEffect, useState } from "react";
import { BarChart } from "@mantine/charts";
import { Loader, Text, Title, useMantineTheme } from "@mantine/core";
import api from "../../api/api";
import { PeakThirstHoursResponse } from "../../types/insights";

interface PeakThirstHoursChartProps {
  userIds: number[];
  idToName: Record<number, string>;
}

export function PeakThirstHoursChart({
  userIds,
  idToName,
}: PeakThirstHoursChartProps) {
  const theme = useMantineTheme();
  const [data, setData] = useState<PeakThirstHoursResponse>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userIds.length === 0) {
      setData([]);
      return;
    }
    setLoading(true);
    api
      .get<PeakThirstHoursResponse>("/insights/peak_thirst_hours", {
        params: { user_ids: userIds.join(",") },
      })
      .then((res) => setData(res.data))
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [userIds]);

  if (loading) {
    return <Loader />;
  }

  if (userIds.length === 0) {
    return <Text c="dimmed">Select users to view chart.</Text>;
  }

  const seriesNames = data.map((d) => idToName[d.userId] || `User ${d.userId}`);

  const chartData = Array.from({ length: 24 }, (_, hour) => {
    const entry: Record<string, number | string> = { x: hour };
    data.forEach((d, idx) => {
      entry[seriesNames[idx]] = d.hours[hour] ?? 0;
    });
    return entry;
  });

  const series = seriesNames.map((name, idx) => ({
    name,
    color: theme.colors[theme.primaryColor][(idx * 3) % 10],
  }));

  return (
    <div>
      <Title order={4} mb="sm">
        Peak Thirst Hours
      </Title>
      <BarChart
        h={300}
        data={chartData}
        dataKey="x"
        series={series}
      />
    </div>
  );
}

export default PeakThirstHoursChart;
