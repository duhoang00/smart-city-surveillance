import { Router } from "express";

import { sendAlarm } from "../controllers/alarm";

const router = Router();

router.post("/", sendAlarm);

export default router;
