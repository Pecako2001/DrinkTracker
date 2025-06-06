import type { NextApiRequest, NextApiResponse } from "next";
import { getSocialSipScore } from "../../../lib/insights/socialSipScore";

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const data = await getSocialSipScore();
    res.status(200).json(data);
  } catch (error) {
    console.error("social sip score error", error);
    res.status(500).json({ message: "Failed to compute social sip score" });
  }
}
