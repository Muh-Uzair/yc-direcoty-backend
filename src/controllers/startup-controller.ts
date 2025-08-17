import StartupModel from "@/models/startup-model";
import { UserModel } from "@/models/user-model";
import { IUploadedFiles } from "@/types/startup-types";
import { AppError } from "@/utils/AppError";
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface CustomRequest extends Request {
  userId?: string; // optional because it may not always exist
}

export const checkUserAuth = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1 : Get the token from Authorization header (format: "Bearer <token>")
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(
        new AppError("Authorization token is missing or invalid", 401)
      );
    }

    // Extract the token string
    const token = authHeader.split(" ")[1];

    if (!token) {
      return next(new AppError("Token is not provided", 401));
    }

    // 2 : verify jwt
    const jwtSecret = process.env.JWT_SECRET as string;

    const decodedToken = jwt.verify(token, jwtSecret) as { id: string };

    // 3 : get the user based on id in token
    const userId = decodedToken?.id;

    // 4 : get the user based on id
    const user = await UserModel.findById(userId);

    if (!user) {
      return next(new AppError("User does not exists", 401));
    }

    req.userId = user?.id;

    next();
  } catch (err: unknown) {
    return next(err);
  }
};

export const createStartup = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = req.files as IUploadedFiles | undefined;

    const startup = await StartupModel.create({
      ...req.body,
      fundingAmount: Number(req.body?.fundingAmount),
      yearsInOp: Number(req.body?.yearsInOp),
      preferredContactMethod: req.body.preferredContactMethod.split(","),
      coverImage: files?.coverImage?.[0]
        ? {
            data: files.coverImage[0].buffer,
            contentType: files.coverImage[0].mimetype,
            fileName: files.coverImage[0].originalname,
          }
        : undefined,
      pitchDeck: files?.pitchDeck?.[0]
        ? {
            data: files.pitchDeck[0].buffer,
            contentType: files.pitchDeck[0].mimetype,
            fileName: files.pitchDeck[0].originalname,
          }
        : undefined,
      startupOwner: req.userId,
    });

    if (!startup) {
      return next(new AppError("Startup creation failed", 500));
    }

    return res.status(200).json({
      status: "success",
      message: "Startup creation success",
    });
  } catch (err: unknown) {
    return next(err);
  }
};
