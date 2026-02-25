import { type Request, type Response } from "express";

export const getAllUsers = async (request: Request, response: Response) => {
	response.status(200).json({ ok: true, message: "get all users" });
};
