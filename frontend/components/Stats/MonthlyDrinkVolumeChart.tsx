import { BarChart } from "@mantine/charts";
import { Text } from "@mantine/core";
import type { MonthlyVolumeEntry } from "../../types/insights";

interface Props {
  data: MonthlyVolumeEntry[];
}

interface ChartDatum {
  month: string;
  [key: string]: number | string;
}

export default function MonthlyDrinkVolumeChart({ data }: Props) {
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
