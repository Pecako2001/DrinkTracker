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
      <Title order={1} mb="sm">
        Stats
      </Title>

      <Title order={2} mt="sm" mb="xs">
        Leaderboard
      </Title>
      <Tabs value={value} onChange={setValue} className={classes.list}>
        <Tabs.List mb="md" ref={setRootRef}>
          <Tabs.Tab
            value="monthly"
            ref={setControlRef("monthly")}
            className={classes.tab}
          >
            Monthly
          </Tabs.Tab>
          <Tabs.Tab
            value="yearly"
            ref={setControlRef("yearly")}
            className={classes.tab}
          >
            Yearly
          </Tabs.Tab>
          <Tabs.Tab
            value="all"
            ref={setControlRef("all")}
            className={classes.tab}
          >
            All Time
          </Tabs.Tab>

          <FloatingIndicator
            target={value ? controlsRefs[value] : null}
            parent={rootRef}
            className={classes.indicator}
          />
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
    </Container>
  );
}

export default StatsPage;
