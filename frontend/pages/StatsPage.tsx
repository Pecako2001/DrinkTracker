import React from "react";
import { useState } from "react";
import {
  Container,
  Paper,
  Tabs,
  Title,
  FloatingIndicator,
} from "@mantine/core";
import { UserInsightPanel } from "../components/Stats/UserInsightPanel";
import classes from "../styles/StatsPage.module.css";

function StatsPage() {
  return (
    <Container size="xl" py="md" className={classes.statsContainer}>
      <Title>Statistics</Title>
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
