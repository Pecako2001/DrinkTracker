import React, { useEffect, useState } from 'react';
import {
  Card,
  Grid,
  Group,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconArrowUpRight, IconArrowDownRight } from '@tabler/icons-react';
import api from '../../api/api';

interface OverallStatsProps {}

export function OverallStats() {
  const [thisMonth, setThisMonth] = useState(0);
  const [lastMonth, setLastMonth] = useState(0);
  const [thisYear, setThisYear] = useState(0);
  const [lastYear, setLastYear] = useState(0);

  useEffect(() => {
    api.get('/stats/drinks_this_month').then((res) => setThisMonth(res.data));
    api.get('/stats/drinks_last_month').then((res) => setLastMonth(res.data));
    api.get('/stats/drinks_this_year').then((res) => setThisYear(res.data));
    api.get('/stats/drinks_last_year').then((res) => setLastYear(res.data));
  }, []);

  const calcChange = (curr: number, prev: number) => {
    const diff = curr - prev;
    const perc = prev === 0 ? 100 : Math.round((diff / prev) * 100);
    const positive = diff >= 0;

    return {
      value: `${positive ? '+' : ''}${perc}%`,
      icon: positive ? <IconArrowUpRight size={16} /> : <IconArrowDownRight size={16} />,
      color: positive ? 'teal' : 'red',
    };
  };

  const monthChange = calcChange(thisMonth, lastMonth);
  const yearChange = calcChange(thisYear, lastYear);

  return (
    <Grid gutter="md" mb="lg">
      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <Card withBorder shadow="sm" radius="md" p="md">
          <Text size="xs" fw={700} c="dimmed" mb={5}>
            DRINKS THIS MONTH
          </Text>
          <Group justify="space-between" align="flex-end">
            <Title order={2}>{thisMonth.toLocaleString()}</Title>
            <Group gap={4}>
              <Text c={monthChange.color} fw={500} size="sm">
                {monthChange.value}
              </Text>
              <ThemeIcon size="sm" variant="light" color={monthChange.color}>
                {monthChange.icon}
              </ThemeIcon>
            </Group>
          </Group>
          <Text size="xs" c="dimmed" mt={4}>
            Compared to previous month
          </Text>
        </Card>
      </Grid.Col>

      <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
        <Card withBorder shadow="sm" radius="md" p="md">
          <Text size="xs" fw={700} c="dimmed" mb={5}>
            DRINKS THIS YEAR
          </Text>
          <Group justify="space-between" align="flex-end">
            <Title order={2}>{thisYear.toLocaleString()}</Title>
            <Group gap={4}>
              <Text c={yearChange.color} fw={500} size="sm">
                {yearChange.value}
              </Text>
              <ThemeIcon size="sm" variant="light" color={yearChange.color}>
                {yearChange.icon}
              </ThemeIcon>
            </Group>
          </Group>
          <Text size="xs" c="dimmed" mt={4}>
            Compared to previous year
          </Text>
        </Card>
      </Grid.Col>
    </Grid>
  );
}
