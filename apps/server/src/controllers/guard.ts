import { Request, Response } from "express";
import { Guard } from "@repo/types";
import { mockGuards } from "../mocks";

export const getAllGuards = async (
	req: Request,
	res: Response<Guard[]>
) => {
	try {
		res.status(200).json(mockGuards as Guard[]);
	} catch (error) {
		console.error("Error getting all guards:", error);
		res.status(500).json([]);
	}
};