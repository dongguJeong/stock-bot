import "dotenv/config";
import express from "express";
import marketRoutes from "./routes/market.routes.js";
import telegramRoutes from "./routes/telegram.routes.js";
import { startCronJobs } from "./cron.js";
import { poll, runJob } from "./services/telegram.service.js";

const app = express();
app.use(express.json());

app.use("/api", marketRoutes);
app.use("/api", telegramRoutes);

const PORT = Number(process.env.PORT) || 3002;
app.listen(PORT, () => {
  console.log(`API 서버 시작됨: http://localhost:${PORT}`);
});

startCronJobs();
poll();

console.log("텔레그램 시황 봇 시작됨 (07:00, 19:00 KST) + /시황 커맨드 대기 중");

if (process.env.RUN_NOW === "true") {
  runJob();
}
