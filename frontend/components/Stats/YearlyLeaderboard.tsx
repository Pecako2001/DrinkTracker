import React, { useEffect, useState } from "react";
import { Card, ScrollArea, Table, Title } from "@mantine/core";
import api from "../../api/api";
import classes from "../../styles/StatsPage.module.css"; // Import CSS module

interface LeaderboardEntry {
  id: number;
  name: string;
  drinks: number;
}

export function YearlyLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    api.get<LeaderboardEntry[]>("/stats/yearly_leaderboard").then((r) => {
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
        This Year
      </Title>
      <ScrollArea>
        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Drinks</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((u, i) => (
              <tr key={u.id}>
                <td>{i + 1}</td>
                <td>{u.name}</td>
                <td>{u.drinks.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ScrollArea>
    </Card>
  );
}
