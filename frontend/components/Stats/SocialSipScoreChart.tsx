import React, { useEffect, useState } from "react";
import { Card, Loader, Text, Title } from "@mantine/core";
import { BarChart } from "@mantine/charts";

interface PairFrequency {
  pairLabel: string;
  count: number;
}

export function SocialSipScoreChart() {
  const [data, setData] = useState<PairFrequency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/insights/social-sip-score")
      .then((res) => res.json())
      .then((d: PairFrequency[]) => setData(d))
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
        <Text>No overlapping drink logs found.</Text>
      </Card>
    );
  }

  return (
    <Card shadow="sm" p="md" radius="md" withBorder>
      <Title order={4} mb="sm">
        Social Sip Score
      </Title>
      <BarChart
        h={300}
        data={data}
        dataKey="pairLabel"
        series={[{ name: "count", color: "blue.6" }]}
      />
    </Card>
  );
}

export default SocialSipScoreChart;
