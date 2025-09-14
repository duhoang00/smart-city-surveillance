import express from "express";

import cameraRouter from "./camera"
import guardRouter from "./guard"

const router = express.Router();

router.use(express.json());

router.use("/cameras", cameraRouter);
router.use("/guards", guardRouter)

router.use((req, res) => {
  res.status(404);
});

export default router;