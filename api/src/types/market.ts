export interface QuoteData {
  price: number;
  change: number;
  changePct: number;
}

export type MarketResults = Record<string, QuoteData | null>;

export const SYMBOLS: Record<string, string> = {
  "미 국채 10Y": "^TNX",
  "원달러 환율": "USDKRW=X",
  코스피: "^KS11",
  나스닥: "^IXIC",
  "S&P 500": "^GSPC",
  "WTI 유가": "CL=F",
  "구리 선물": "HG=F",
  "금 선물": "GC=F",
};

export const DISPLAY_ORDER = [
  "미 국채 10Y",
  "한국채 10Y",
  "원달러 환율",
  "코스피",
  "나스닥",
  "S&P 500",
  "WTI 유가",
  "구리 선물",
  "금 선물",
  "비트코인",
] as const;
