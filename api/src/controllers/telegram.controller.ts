import { Request, Response } from "express";
import { runJob } from "../services/telegram.service.js";

export async function sendBriefing(req: Request, res: Response): Promise<void> {
  const chatId: string | undefined = req.body?.chat_id;
  try {
    await runJob(chatId);
    res.json({ ok: true, message: "전송 완료" });
  } catch (e) {
    res.status(500).json({ ok: false, error: (e as Error).message });
  }
}
