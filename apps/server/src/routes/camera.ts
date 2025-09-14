import { Router } from "express";

import { getAllCameras } from "../controllers/camera";

const router = Router();

router.get("/", getAllCameras);

export default router;
