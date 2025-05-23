import React, { useState, useEffect } from "react";
import { Container, Grid, Paper } from "@mantine/core"; // Removed Text, Flex, added Grid, Paper
import api from "../api/api"; // ✅ correct path from 'pages' dir
import { Person } from "../types";
import { MonthlyLeaderboard } from "../components/Stats/MonthlyLeaderboard";
import { YearlyLeaderboard } from "../components/Stats/YearlyLeaderboard";
import { UserInsightPanel } from "../components/Stats/UserInsightPanel"; // New import
import classes from "../styles/StatsPage.module.css"; // Import CSS module

function StatsPage() {
  const [users, setUsers] = useState<Person[]>([]);

  useEffect(() => {
    api.get<Person[]>("/users").then((r) => setUsers(r.data));
  }, []);

  return (
    <Container py="md" className={classes.statsContainer}>
      {/* Leaderboards Section */}
      <Paper
        withBorder
        shadow="sm"
        p="md"
        mb="lg"
        className={classes.leaderboardSection}
      >
        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <MonthlyLeaderboard users={users} />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <YearlyLeaderboard users={users} />
          </Grid.Col>
        </Grid>
      </Paper>

      {/* User Insight Panel Section */}
      <Paper
        withBorder
        shadow="sm"
        p="md"
        mt="lg"
        className={classes.userInsightSection}
      >
        <UserInsightPanel />
      </Paper>
    </Container>
  );
}

export default StatsPage;
