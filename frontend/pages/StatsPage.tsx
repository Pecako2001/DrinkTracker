import React from "react";
import { useState } from "react";
import {
  Container,
  Paper,
  Tabs,
  Title,
  FloatingIndicator,
} from "@mantine/core";
import { OverallStats } from "../components/Stats/OverallStats";
import { MonthlyLeaderboard } from "../components/Stats/MonthlyLeaderboard";
import { YearlyLeaderboard } from "../components/Stats/YearlyLeaderboard";
import { AllTimeLeaderboard } from "../components/Stats/AllTimeLeaderboard";
import { UserInsightPanel } from "../components/Stats/UserInsightPanel";
import classes from "../styles/StatsPage.module.css";

function StatsPage() {
  const [rootRef, setRootRef] = useState<HTMLDivElement | null>(null);
  const [value, setValue] = useState<string | null>("monthly");
  const [controlsRefs, setControlsRefs] = useState<
    Record<string, HTMLButtonElement | null>
  >({});
  const setControlRef = (val: string) => (node: HTMLButtonElement) => {
    controlsRefs[val] = node;
    setControlsRefs(controlsRefs);
  };

  return (
    <Container size="xl" py="md" className={classes.statsContainer}>
      <Title>Your Insights</Title>
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
