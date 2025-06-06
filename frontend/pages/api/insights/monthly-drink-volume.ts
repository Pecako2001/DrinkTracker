import type { NextApiRequest, NextApiResponse } from "next";
import { fetchMonthlyDrinkVolume } from "../../../lib/insights/monthlyDrinkVolume";
import type { MonthlyDrinkVolumeRow } from "../../../lib/insights/monthlyDrinkVolume";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<MonthlyDrinkVolumeRow[] | { message: string }>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  const { userIds } = req.body as { userIds?: number[] };
  if (!Array.isArray(userIds) || userIds.some((id) => typeof id !== "number")) {
    return res.status(400).json({ message: "Invalid userIds" });
  }

  try {
    const data = await fetchMonthlyDrinkVolume(userIds);
    return res.status(200).json(data);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
