import express from "express";

import cameraRouter from "./camera"
import alarmRouter from "./alarm"

const router = express.Router();

router.use(express.json());

router.use("/cameras", cameraRouter);
router.use("/alarm", alarmRouter);

router.use((req, res) => {
  res.status(404);
});

export default router;