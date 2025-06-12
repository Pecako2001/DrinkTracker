import React from "react";
import { useState } from "react";
import {
  Container,
  Text,
  Title,
} from "@mantine/core";
import classes from "../styles/StatsPage.module.css";

function StatsPage() {
  return (
    <Container size="xl" py="md" className={classes.statsContainer}>
      <Title>Statistics </Title>
      <Text size="sm" color="dimmed" mb="md">
        View insights about users, drinks, and more. coming soon.
      </Text>
    </Container>
  );
}

export default StatsPage;
