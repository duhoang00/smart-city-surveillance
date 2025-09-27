import { Request, Response } from "express";
import { Camera } from "@repo/types";
import { mockCameras } from "../mocks";

export const getAllCameras = async (
  req: Request,
  res: Response<Camera[]>
) => {
  try {
    res.status(200).json(mockCameras as Camera[]);
  } catch (error) {
    console.error("Error getting all cameras:", error);
    res.status(500).json([]);
  }
};