import { Pool } from "pg";

export interface PairFrequency {
  pairLabel: string;
  count: number;
}

const pool = new Pool({
  host: process.env.POSTGRES_HOST || "localhost",
  port: Number(process.env.POSTGRES_PORT) || 5432,
  user: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD || "postgres",
  database: process.env.POSTGRES_DB || "drinktracker",
});

export async function getSocialSipScore(topN = 10): Promise<PairFrequency[]> {
  const eventsRes = await pool.query<{ person_id: number; timestamp: string }>(
    "SELECT person_id, timestamp FROM drink_events",
  );
  const personsRes = await pool.query<{ id: number; name: string }>(
    "SELECT id, name FROM persons",
  );

  const nameMap = new Map<number, string>();
  personsRes.rows.forEach((p: { id: number; name: string }) =>
    nameMap.set(p.id, p.name),
  );

  const buckets: Record<number, number[]> = {};
  for (const ev of eventsRes.rows) {
    const date = new Date(ev.timestamp);
    const bucket = Math.floor(date.getTime() / (5 * 60 * 1000));
    buckets[bucket] = buckets[bucket] || [];
    if (!buckets[bucket].includes(ev.person_id)) {
      buckets[bucket].push(ev.person_id);
    }
  }

  const pairCounts: Record<string, number> = {};
  for (const ids of Object.values(buckets)) {
    if (ids.length < 2) continue;
    ids.sort((a, b) => a - b);
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const key = `${ids[i]}-${ids[j]}`;
        pairCounts[key] = (pairCounts[key] || 0) + 1;
      }
    }
  }

  const result: PairFrequency[] = Object.entries(pairCounts).map(
    ([key, count]) => {
      const [id1, id2] = key.split("-").map(Number);
      const name1 = nameMap.get(id1) || `User ${id1}`;
      const name2 = nameMap.get(id2) || `User ${id2}`;
      const pairLabel = `${name1} & ${name2}`;
      return { pairLabel, count };
    },
  );

  result.sort((a, b) => b.count - a.count);
  return result.slice(0, topN);
}
