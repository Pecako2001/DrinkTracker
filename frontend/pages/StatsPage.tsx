import React from "react";
import { Container, Grid, Paper } from "@mantine/core";
import { OverallStats } from "../components/Stats/OverallStats";
import { MonthlyLeaderboard } from "../components/Stats/MonthlyLeaderboard";
import { YearlyLeaderboard } from "../components/Stats/YearlyLeaderboard";
import { UserInsightPanel } from "../components/Stats/UserInsightPanel";
import classes from "../styles/StatsPage.module.css";

function StatsPage() {
  return (
    <Container py="md" className={classes.statsContainer}>
      {/* Overall Stats - wrapped in Paper */}
      <Paper withBorder shadow="sm" p="md" mb="lg">
        <OverallStats />
      </Paper>

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
            <MonthlyLeaderboard />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <YearlyLeaderboard />
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
