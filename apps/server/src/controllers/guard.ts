import { Request, Response } from "express";

import { mockGuards } from "../mocks";

export const getAllGuards = async (req: Request, res: Response) => {
	try {
		res.status(200).json(mockGuards);
	} catch (error) {
		console.error("Error getting all guards:", error);
	}
};