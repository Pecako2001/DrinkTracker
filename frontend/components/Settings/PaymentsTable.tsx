// components/Settings/PaymentsTable.tsx
import { Title, Table } from '@mantine/core';

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
    <>
      <Title order={2} mt="xl">
        Payments
      </Title>
      <Table striped highlightOnHover>
        <thead>
          <tr>
            <th>ID</th>
            <th>User ID</th>
            <th>Amount (€)</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.person_id}</td>
              <td>{p.amount ? Number(p.amount).toFixed(2) : '–'}</td>
              <td>{p.status}</td>
              <td>
                {p.created_at
                  ? new Date(p.created_at).toLocaleString()
                  : '–'}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
