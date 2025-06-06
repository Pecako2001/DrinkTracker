import React, { useEffect, useState } from "react";
import { Card, ScrollArea, Table, Title } from "@mantine/core";
import api from "../../api/api";
import { Person } from "../../types";
import classes from "../../styles/StatsPage.module.css";

export function AllTimeLeaderboard() {
  const [entries, setEntries] = useState<Person[]>([]);

  useEffect(() => {
    api.get<Person[]>("/users").then((r) => setEntries(r.data));
  }, []);

  const sorted = [...entries].sort((a, b) => b.total_drinks - a.total_drinks);

  return (
    <Card
      shadow="sm"
      p="md"
      radius="md"
      withBorder
      className={classes.leaderboardCard}
    >
      <Title order={4} mb="sm">
        All Time
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
                <td>{u.total_drinks.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </ScrollArea>
    </Card>
  );
}
