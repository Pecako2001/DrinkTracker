import { Title, Table, Card, ScrollArea } from "@mantine/core";

interface BackupLog {
  id: number;
  timestamp: string;
  success: boolean;
  message: string | null;
}

interface Props {
  backups: BackupLog[];
}

export function BackupsTable({ backups }: Props) {
  return (
    <Card shadow="sm" p="md" radius="md" withBorder style={{ flex: 1 }}>
      <Title order={4} mb="sm">
        Backups
      </Title>
      <ScrollArea>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Time</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Message</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {backups.map((b) => (
              <Table.Tr key={b.id}>
                <Table.Td>{b.id}</Table.Td>
                <Table.Td>{new Date(b.timestamp).toLocaleString()}</Table.Td>
                <Table.Td>{b.success ? "Success" : "Failed"}</Table.Td>
                <Table.Td>{b.message ?? ""}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Card>
  );
}
