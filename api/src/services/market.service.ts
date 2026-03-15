import axios from "axios";
import YahooFinance from "yahoo-finance2";
import { QuoteData, MarketResults, SYMBOLS, DISPLAY_ORDER } from "../types/market.js";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey"] });

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchYahooQuote(symbol: string): Promise<QuoteData> {
  const q = await yf.quote(symbol);
  return {
    price: q.regularMarketPrice!,
    change: q.regularMarketChange!,
    changePct: q.regularMarketChangePercent!,
  };
}

async function fetchYahooQuoteBatch(
  symbolMap: Record<string, string>
): Promise<MarketResults> {
  const result: MarketResults = {};
  for (const [name, symbol] of Object.entries(symbolMap)) {
    try {
      result[name] = await fetchYahooQuote(symbol);
    } catch (e) {
      console.error(`[${name}] 조회 실패:`, (e as Error).message);
      result[name] = null;
    }
    await sleep(500);
  }
  return result;
}

async function fetchKrBond(): Promise<QuoteData> {
  const url =
    "https://fred.stlouisfed.org/graph/fredgraph.csv?id=IRLTLT01KRM156N";
  const res = await axios.get<string>(url, { timeout: 10000 });
  const lines = res.data.trim().split("\n").slice(1);
  const recent = lines.slice(-2);
  const parse = (line: string) => parseFloat(line.split(",")[1]);
  const prev = parse(recent[0]);
  const curr = parse(recent[1]);
  const change = curr - prev;
  return { price: curr, change, changePct: (change / prev) * 100 };
}

async function fetchBitcoin(): Promise<QuoteData> {
  const url =
    "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true";
  const res = await axios.get<{
    bitcoin: { usd: number; usd_24h_change: number };
  }>(url, { timeout: 10000 });
  const price = res.data.bitcoin.usd;
  const changePct = res.data.bitcoin.usd_24h_change;
  const change = (price / (1 + changePct / 100)) * (changePct / 100);
  return { price, change, changePct };
}

export async function fetchAllMarket(): Promise<MarketResults> {
  const results: MarketResults = {};

  const [yahooResults] = await Promise.all([
    fetchYahooQuoteBatch(SYMBOLS).catch((e: Error) => {
      console.error("[Yahoo] 배치 조회 실패:", e.message);
      return {} as MarketResults;
    }),
    fetchKrBond()
      .then((data) => { results["한국채 10Y"] = data; })
      .catch((e: Error) => {
        console.error("[한국채 10Y] 조회 실패:", e.message);
        results["한국채 10Y"] = null;
      }),
    fetchBitcoin()
      .then((data) => { results["비트코인"] = data; })
      .catch((e: Error) => {
        console.error("[비트코인] 조회 실패:", e.message);
        results["비트코인"] = null;
      }),
  ]);

  Object.assign(results, yahooResults);

  const ordered: MarketResults = {};
  for (const key of DISPLAY_ORDER) {
    if (key in results) ordered[key] = results[key];
  }
  return ordered;
}
