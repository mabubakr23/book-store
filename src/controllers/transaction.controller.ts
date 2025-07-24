import { Request, Response } from "express";
import {
  handleBorrowBook,
  handleReturnBook,
  handleBuyBook,
} from "../services/transaction.service";

export const borrowBookController = async (req: Request, res: Response) => {
  const userEmail = req.headers["x-user-email"]?.toString();
  const { itemId } = req.params;

  if (!userEmail)
    return res.status(400).json({ error: "User email required in headers" });

  const result = await handleBorrowBook(userEmail, itemId);
  res.status(result.status).json(result.body);
};

export const returnBookController = async (req: Request, res: Response) => {
  const userEmail = req.headers["x-user-email"]?.toString();
  const { itemId } = req.params;

  if (!userEmail)
    return res.status(400).json({ error: "User email required in headers" });

  const result = await handleReturnBook(userEmail, itemId);
  res.status(result.status).json(result.body);
};

export const buyBookController = async (req: Request, res: Response) => {
  const userEmail = req.headers["x-user-email"]?.toString();
  const { itemId } = req.params;

  if (!userEmail)
    return res.status(400).json({ error: "User email required in headers" });

  const result = await handleBuyBook(userEmail, itemId);
  res.status(result.status).json(result.body);
};
