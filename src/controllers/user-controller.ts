import { Request, Response, NextFunction } from "express";

export const userSignup = (req: Request, res: Response, next: NextFunction) => {
  return res.status(200).json({
    status: "success",
  });
};
