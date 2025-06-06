import { Client } from "pg";
import { startOfMonth, subMonths, formatISO } from "date-fns";

export interface MonthlyDrinkVolumeRow {
  userId: number;
  month: string; // ISO string YYYY-MM
  count: number;
}

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

export async function fetchMonthlyDrinkVolume(
  userIds: number[],
): Promise<MonthlyDrinkVolumeRow[]> {
  if (!userIds.length) return [];
  const client = getClient();
  await client.connect();
  try {
    const startDate = startOfMonth(subMonths(new Date(), 5));
    const res = await client.query(
      `SELECT person_id AS "userId",
              to_char(date_trunc('month', timestamp), 'YYYY-MM') AS month,
              COUNT(*)::int AS count
         FROM drink_events
        WHERE person_id = ANY($1)
          AND timestamp >= $2
        GROUP BY person_id, month
        ORDER BY month`,
      [userIds, startDate],
    );
    return res.rows as MonthlyDrinkVolumeRow[];
  } finally {
    await client.end();
  }
}
