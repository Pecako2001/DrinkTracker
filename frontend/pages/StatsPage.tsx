import React, { useState, useEffect } from 'react';
import { Container, Divider, Flex } from '@mantine/core';
import api from '../api/api'; // ✅ correct path from 'pages' dir
import { Person } from '../types';
import { OverallStats } from '../components/Stats/OverallStats';
import { MonthlyLeaderboard } from '../components/Stats/MonthlyLeaderboard';
import { YearlyLeaderboard } from '../components/Stats/YearlyLeaderboard';

function StatsPage() {
  const [users, setUsers] = useState<Person[]>([]);

  useEffect(() => {
    api.get<Person[]>('/users').then((r) => setUsers(r.data));
  }, []);

  return (
    <Container py="md">
      <OverallStats />
      <Flex gap="md" align="stretch">
        <MonthlyLeaderboard users={users} />
        <Divider orientation="vertical" />
        <YearlyLeaderboard users={users} />
      </Flex>
    </Container>
  );
}

export default StatsPage;
