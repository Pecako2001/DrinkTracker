import React from "react";
import { Container, Paper } from "@mantine/core";
import { UserInsightPanel } from "../components/Stats/UserInsightPanel";
import classes from "../styles/StatsPage.module.css"; // Import CSS module

function StatsPage() {
  return (
    <Container py="md" className={classes.statsContainer}>
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
