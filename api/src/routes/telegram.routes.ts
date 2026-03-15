import { Router } from "express";
import { sendBriefing } from "../controllers/telegram.controller.js";

const router = Router();

router.post("/send", sendBriefing);

export default router;
