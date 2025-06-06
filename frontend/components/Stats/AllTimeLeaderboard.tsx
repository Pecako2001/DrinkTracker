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
        Most Drinks of All Time
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
                <Table.Td>{u.total_drinks.toLocaleString()}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Card>
  );
}
