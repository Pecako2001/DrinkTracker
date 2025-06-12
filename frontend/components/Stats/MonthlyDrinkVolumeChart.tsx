import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import type { MonthlyVolumeEntry } from "../../types/insights";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface Props {
  data: MonthlyVolumeEntry[];
  users: Record<number, string>;
}

const colors = [
  "#1c7ed6",
  "#37b24d",
  "#f59f00",
  "#e03131",
  "#ae3ec9",
  "#0ca678",
];

export default function MonthlyDrinkVolumeChart({ data, users }: Props) {
  const months = Array.from(new Set(data.map((d) => d.month))).sort();
  const datasets = Object.entries(users).map(([idStr, name], idx) => {
    const id = parseInt(idStr, 10);
    return {
      label: name,
      backgroundColor: colors[idx % colors.length],
      data: months.map((m) => {
        const row = data.find((d) => d.userId === id && d.month === m);
        return row ? row.count : 0;
      }),
    };
  });
  const chartData = {
    labels: months,
    datasets,
  };
  return <Bar data={chartData} options={{ responsive: true }} />;
}
