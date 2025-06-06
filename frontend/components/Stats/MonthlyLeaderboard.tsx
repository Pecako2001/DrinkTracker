import React, { useEffect, useState } from "react";
import { Card, ScrollArea, Table, Title, Anchor } from "@mantine/core";
import api from "../../api/api";
import classes from "../../styles/StatsPage.module.css"; // Import CSS module

interface LeaderboardEntry {
  id: number;
  name: string;
  drinks: number;
}

export function MonthlyLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    api.get<LeaderboardEntry[]>("/stats/monthly_leaderboard").then((r) => {
      setEntries(r.data);
    });
  }, []);

  const sorted = [...entries].sort((a, b) => b.drinks - a.drinks);

  return (
    <Card
      shadow="sm"
      p="md"
      radius="md"
      withBorder
      style={{ flex: 1 }}
      className={classes.leaderboardCard}
    >
      <Title order={4} mb="sm">
        Most Drinks This Month
      </Title>
      <ScrollArea>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Standing</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Drinks</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {sorted.map((u, i) => (
              <Table.Tr key={u.id}>
                <Table.Td>{i + 1}</Table.Td>
                <Table.Td>{u.name}</Table.Td>
                <Table.Td>{u.drinks.toLocaleString()}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Card>
  );
}
