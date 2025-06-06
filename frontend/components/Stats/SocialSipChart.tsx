import React, { useEffect, useState } from "react";
import { BarChart } from "@mantine/charts";
import { Card, Title, Loader, Text } from "@mantine/core";
import api from "../../api/api";

interface BuddyData {
  id: number;
  name: string;
  count: number;
}

interface Props {
  userId: string | null;
}

export function SocialSipChart({ userId }: Props) {
  const [data, setData] = useState<BuddyData[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    api
      .get<BuddyData[]>(`/users/${userId}/buddies`)
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [userId]);

  if (!userId) {
    return <Text c="dimmed">Select a user to see Social Sip Score.</Text>;
  }

  if (loading) {
    return <Loader />;
  }

  if (data.length === 0) {
    return <Text c="dimmed">No buddy data.</Text>;
  }

  return (
    <Card shadow="sm" p="md" radius="md" withBorder>
      <Title order={5} mb="sm">
        Social Sip Score
      </Title>
      <BarChart
        h={200}
        data={data.map((d) => ({ name: d.name, value: d.count }))}
        dataKey="name"
        series={[{ name: "value", color: "blue.6" }]}
      />
    </Card>
  );
}

export default SocialSipChart;

