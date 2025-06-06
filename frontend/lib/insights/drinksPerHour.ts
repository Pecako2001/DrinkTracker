import { Client } from "pg";

function getClient() {
  const {
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_DB,
    POSTGRES_HOST,
    POSTGRES_PORT,
  } = process.env;
  const connectionString = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}`;
  return new Client({ connectionString });
}

export interface DrinksPerHourResponse {
  userId: number;
  hours: number[];
}

export async function fetchDrinksPerHour(userId: number): Promise<number[]> {
  const client = getClient();
  await client.connect();
  try {
    const res = await client.query(
      `SELECT extract(hour from timestamp) as hour, count(*)::int as count
       FROM drink_events
       WHERE person_id = $1
       GROUP BY hour
       ORDER BY hour`,
      [userId],
    );
    const counts = Array(24).fill(0);
    for (const row of res.rows as { hour: string; count: number }[]) {
      counts[parseInt(row.hour, 10)] = row.count;
    }
    return counts;
  } finally {
    await client.end();
  }
}
