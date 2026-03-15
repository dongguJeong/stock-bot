import { Router } from "express";
import { getMarket, getHealth } from "../controllers/market.controller";

const router = Router();

router.get("/market", getMarket);
router.get("/health", getHealth);

export default router;
