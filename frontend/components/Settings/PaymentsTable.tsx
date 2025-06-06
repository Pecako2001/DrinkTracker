// components/Settings/PaymentsTable.tsx
import { Title, Table } from "@mantine/core";
import { Card, ScrollArea, NumberInput, Button, Modal, Text, Group } from "@mantine/core";
import classes from "./PaymentsTable.module.css";

interface Payment {
  id: number;
  mollie_id: string;
  person_id: number;
  amount: number;
  status: string;
  created_at: string;
}

interface Props {
  payments: Payment[];
}

export function PaymentsTable({ payments }: Props) {
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
        Payments Insight
      </Title>
      <ScrollArea>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>User ID</Table.Th>
              <Table.Th>Amount (€)</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Date</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {payments.map((p) => (
              <Table.Tr key={p.id}>
                <Table.Td>{p.id}</Table.Td>
                <Table.Td>{p.person_id}</Table.Td>
                <Table.Td>{p.amount ? Number(p.amount).toFixed(2) : "–"}</Table.Td>
                <Table.Td>{p.status}</Table.Td>
                <Table.Td>{p.created_at ? new Date(p.created_at).toLocaleString() : "–"}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Card>
  );
}