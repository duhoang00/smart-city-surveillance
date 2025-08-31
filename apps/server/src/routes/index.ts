import express from "express";

import { getAllCameras } from "../controllers/camera" 

const router = express.Router();

router.use(express.json());

router.use("/cameras", getAllCameras);

router.use((req, res) => {
  res.status(404);
});

export default router;