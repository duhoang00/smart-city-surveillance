import { Request, Response } from "express";

import { mockCameras } from "../mocks";

export const getAllCameras = async (req: Request, res: Response) => {
  try {
    res.status(200).json(mockCameras);
  } catch (error) {
    console.error("Error getting all cameras:", error);
  }
};