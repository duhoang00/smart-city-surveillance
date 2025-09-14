import { Router } from "express";

import { getAllGuards } from "../controllers/guard"

const router = Router();

router.get("/", getAllGuards);

export default router;
