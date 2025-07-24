import { Request, Response, NextFunction } from "express";

export const adminCheck: (
  req: Request,
  res: Response,
  next: NextFunction
) => void = (req, res, next) => {
  const email = req.header("x-user-email");

  if (!email || email !== "admin@dummy-library.com") {
    return res
      .status(403)
      .json({ error: "Forbidden: Only Admin can access these resources" });
  }

  next();
};
