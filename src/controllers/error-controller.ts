/* eslint-disable */

import { Request, Response } from "express";
import { AppError } from "@/utils/AppError";
import { MongoServerError } from "mongodb";

export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response
) => {
  console.log("Global error handler triggered");

  // Handle known AppError
  if (err instanceof AppError) {
    return res.status(err.errCode).json({
      status: "fail",
      message: err.message,
    });
  }

  // Handle MongoDB duplicate key error (E11000)
  if (err instanceof MongoServerError && err.code === 11000) {
    const duplicatedFields = Object.keys(err.keyValue || {}).join(", ");
    return res.status(409).json({
      status: "fail",
      message: `Duplicate value for field(s): ${duplicatedFields}`,
    });
  }

  // Handle unknown errors
  console.error("Unexpected error:", err);
  return res.status(500).json({
    status: "error",
    message: "Something went wrong",
  });
};
