import React from "react";
import { Container, Title, Paper } from "@mantine/core";
import UserMonthlyComparison from "../components/Stats/UserMonthlyComparison";
import classes from "../styles/StatsPage.module.css";

function StatsPage() {
  return (
    <Container size="xl" py="md" className={classes.statsContainer}>
      <Title order={1} mb="sm">
        Statistics
      </Title>
      <Paper p="md" className={classes.userInsightSection}>
        <UserMonthlyComparison />
      </Paper>
    </Container>
  );
}

export default StatsPage;
