import { Request, Response } from "express";
import { fetchAllMarket } from "../services/market.service";

export async function getMarket(_req: Request, res: Response): Promise<void> {
  try {
    const data = await fetchAllMarket();
    res.json({ ok: true, data, timestamp: new Date().toISOString() });
  } catch (e) {
    res.status(500).json({ ok: false, error: (e as Error).message });
  }
}

export function getHealth(_req: Request, res: Response): void {
  res.json({ ok: true, uptime: process.uptime() });
}
