import { Router } from "express";
import { sendBriefing } from "../controllers/telegram.controller";

const router = Router();

router.post("/send", sendBriefing);

export default router;
