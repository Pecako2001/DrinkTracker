import type { NextApiRequest, NextApiResponse } from "next";
import { fetchDrinksPerHour } from "../../../../lib/insights/drinksPerHour";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;
  if (typeof id !== "string") {
    return res.status(400).json({ message: "Invalid user id" });
  }
  const userId = parseInt(id, 10);
  if (Number.isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user id" });
  }
  try {
    const hours = await fetchDrinksPerHour(userId);
    return res.status(200).json({ userId, hours });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}
