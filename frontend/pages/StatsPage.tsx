import React from "react";
import { Container, Paper, Tabs, Title } from "@mantine/core";
import { OverallStats } from "../components/Stats/OverallStats";
import { MonthlyLeaderboard } from "../components/Stats/MonthlyLeaderboard";
import { YearlyLeaderboard } from "../components/Stats/YearlyLeaderboard";
import { AllTimeLeaderboard } from "../components/Stats/AllTimeLeaderboard";
import { UserInsightPanel } from "../components/Stats/UserInsightPanel";
import classes from "../styles/StatsPage.module.css";

function StatsPage() {
  return (
    <Container size="xl" py="md" className={classes.statsContainer}>
      <Title order={1} mb="sm">
        Stats
      </Title>

      <Title order={2} mt="sm" mb="xs">
        Leaderboard
      </Title>
      <Tabs defaultValue="monthly" variant="outline" radius="xs">
        <Tabs.List mb="md">
          <Tabs.Tab value="monthly">Monthly</Tabs.Tab>
          <Tabs.Tab value="yearly">Yearly</Tabs.Tab>
          <Tabs.Tab value="all">All Time</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="monthly">
          <MonthlyLeaderboard />
        </Tabs.Panel>
        <Tabs.Panel value="yearly">
          <YearlyLeaderboard />
        </Tabs.Panel>
        <Tabs.Panel value="all">
          <AllTimeLeaderboard />
        </Tabs.Panel>
      </Tabs>

      <Title order={2} mt="lg" mb="sm">
        Your Insights
      </Title>
      <Paper withBorder shadow="sm" p="md" mb="md">
        <OverallStats />
      </Paper>
      <Paper
        withBorder
        shadow="sm"
        p="md"
        className={classes.userInsightSection}
      >
        <UserInsightPanel />
      </Paper>
    </Container>
  );
}

export default StatsPage;
