import { Router } from "express";
import { mockCameras } from "../mocks";

const router = Router();

router.get("/", (_req, res) => {
  res.json(mockCameras.map(({ id, name }) => ({ id, name })));
});

export default router;
