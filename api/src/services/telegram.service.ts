import axios from "axios";
import { QuoteData, MarketResults } from "../types/market.js";
import { fetchAllMarket } from "./market.service.js";

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN!;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

function fmt(value: number, decimals = 2): string {
  return value.toLocaleString("ko-KR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function arrow(change: number): string {
  return change >= 0 ? "▲" : "▼";
}

export function buildMessage(results: MarketResults): string {
  const now = new Date().toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  let msg = `📊 *시황 브리핑* (${now} KST)\n`;
  msg += "─────────────────────\n";

  for (const [name, data] of Object.entries(results)) {
    if (!data) {
      msg += `${name}: 조회 실패\n`;
      continue;
    }
    const { price, change, changePct } = data as QuoteData;
    const sign = change >= 0 ? "+" : "";
    const decimals = name === "비트코인" ? 0 : 2;
    msg += `*${name}*\n`;
    msg += `  ${fmt(price, decimals)} ${arrow(change)} ${sign}${fmt(Math.abs(change), decimals)} (${sign}${fmt(changePct, 2)}%)\n`;
  }

  return msg;
}

export async function sendTelegram(
  message: string,
  chatId: string = TELEGRAM_CHAT_ID
): Promise<void> {
  const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`;
  await axios.post(url, { chat_id: chatId, text: message, parse_mode: "Markdown" });
}

export async function runJob(chatId: string = TELEGRAM_CHAT_ID): Promise<void> {
  console.log(`[${new Date().toISOString()}] 시황 수집 시작...`);
  const ordered = await fetchAllMarket();
  const message = buildMessage(ordered);
  console.log(message);
  try {
    await sendTelegram(message, chatId);
    console.log("텔레그램 전송 완료");
  } catch (e) {
    console.error("텔레그램 전송 실패:", (e as Error).message);
  }
}

// ── Long Polling ──────────────────────────────────────────────
let lastUpdateId = 0;

export async function poll(): Promise<void> {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/getUpdates`;
    const res = await axios.get<{
      result: Array<{
        update_id: number;
        message?: { text?: string; chat?: { id: number } };
      }>;
    }>(url, {
      params: { offset: lastUpdateId + 1, timeout: 30 },
      timeout: 35000,
    });

    for (const update of res.data.result) {
      lastUpdateId = update.update_id;
      const text = update.message?.text?.trim();
      const chatId = update.message?.chat?.id;
      if (text === "/시황" && chatId !== undefined) {
        console.log(`[poll] /시황 요청 from ${chatId}`);
        runJob(String(chatId));
      }
    }
  } catch (e) {
    const status = (e as { response?: { status?: number } }).response?.status;
    if (status === 409) {
      console.warn("[poll] 409 Conflict: 다른 인스턴스 충돌, 10초 후 재시도");
      setTimeout(poll, 10000);
      return;
    }
    if (status !== 401 && status !== 403) {
      console.error("[poll] 오류:", (e as Error).message);
    }
  }
  setTimeout(poll, 1000);
}
