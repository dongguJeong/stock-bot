import cron from "node-cron";
import { runJob } from "./services/telegram.service";

export function startCronJobs(): void {
  cron.schedule("0 7 * * *", () => runJob(), { timezone: "Asia/Seoul" });
  cron.schedule("0 19 * * *", () => runJob(), { timezone: "Asia/Seoul" });
  console.log("크론 등록 완료 (07:00, 19:00 KST)");
}
