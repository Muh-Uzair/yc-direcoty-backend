import StartupModel from "../models/startup-model";
import { UserModel } from "../models/user-model";
import { IStartup, IUploadedFiles } from "../types/startup-types";
import { AppError } from "../utils/AppError";
import { Request, Response, NextFunction } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

export interface CustomRequest extends Request {
  userId?: string; // optional because it may not always exist
}

export const checkUserAuth = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(
        new AppError("Authorization token is missing or invalid", 401)
      );
    }

    // Extract the token
    const token = authHeader.split(" ")[1];

    if (!token) {
      return next(new AppError("Token is not provided", 401));
    }

    // 2. Verify JWT
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next(new AppError("JWT secret is not configured", 500));
    }

    let decodedToken: { id: string };
    try {
      decodedToken = jwt.verify(token, jwtSecret) as { id: string };
    } catch (err) {
      if (err instanceof TokenExpiredError) {
        return next(
          new AppError("Token has expired. Please log in again.", 401)
        );
      }
      if (err instanceof JsonWebTokenError) {
        return next(new AppError("Invalid token. Please log in again.", 401));
      }
      return next(err);
    }

    // 3. Get the user from DB
    const user = await UserModel.findById(decodedToken.id);
    if (!user) {
      return next(new AppError("User does not exist", 401));
    }

    // 4. Attach userId to request
    req.userId = user.id;

    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    next(new AppError("Authentication failed", 500));
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
      data: {
        startup,
      },
    });
  } catch (err: unknown) {
    return next(err);
  }
};

export const getAllStartups = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const startups = await StartupModel.find({
      startupOwner: req.userId,
    }).select("name industry stage businessModel foundedDate");

    if (!startups) {
      return next(new AppError("Unable to get startups", 500));
    }

    return res.status(200).json({
      status: "success",
      message: "Get startups success",
      data: {
        startups,
      },
    });
  } catch (err: unknown) {
    return next(err);
  }
};

export const getStartupOnId = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const startup = await StartupModel.findById(req.params.id).lean();

    if (!startup) {
      return next(new AppError("No startup of this id", 404));
    }

    return res.status(200).json({
      status: "success",
      message: "Get startup on id success",
      data: {
        startup: {
          ...startup,
          name: startup.name,
          coverImage: {
            contentType: startup.coverImage.contentType,
            fileName: startup.coverImage.fileName,
            data: startup.coverImage.data.toString("base64"),
          },
          pitchDeck: {
            contentType: startup.pitchDeck.contentType,
            fileName: startup.pitchDeck.fileName,
            data: startup.pitchDeck.data.toString("base64"),
          },
        },
      },
    });
  } catch (err: unknown) {
    return next(err);
  }
};

export const deleteStartupOnId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const deletedStartup = await StartupModel.findByIdAndDelete(id);

    if (!deletedStartup) {
      return res.status(404).json({
        status: "fail",
        message: `No startup found with id: ${id}`,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Startup deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export const updateStartupOnId = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.body);
    const files = req.files as IUploadedFiles | undefined;

    const prevStartup = await StartupModel.findById(req.body.id).lean();

    if (!prevStartup) {
      return next(new AppError("Startup does not exist", 404));
    }

    const updatedData = {
      name: req.body.name ?? prevStartup?.name,
      tagline: req.body.tagline ?? prevStartup?.tagline,
      industry: req.body.industry ?? prevStartup?.industry,
      stage: req.body.stage ?? prevStartup?.stage,
      foundedDate: req.body.foundedDate ?? prevStartup?.foundedDate,
      coverImage: files?.coverImage?.[0]
        ? {
            data: files.coverImage[0].buffer,
            contentType: files.coverImage[0].mimetype,
            fileName: files.coverImage[0].originalname,
          }
        : prevStartup?.coverImage,

      businessModel: req.body.businessModel ?? prevStartup?.businessModel,
      fundingStatus: req.body.fundingStatus ?? prevStartup?.fundingStatus,
      fundingAmount: req.body.fundingAmount ?? prevStartup?.fundingAmount,
      revenueModel: req.body.revenueModel ?? prevStartup?.revenueModel,
      yearsInOp: req.body.yearsInOp ?? prevStartup?.yearsInOp,
      pitchDeck: files?.pitchDeck?.[0]
        ? {
            data: files.pitchDeck[0].buffer,
            contentType: files.pitchDeck[0].mimetype,
            fileName: files.pitchDeck[0].originalname,
          }
        : prevStartup?.pitchDeck,

      preferredContactMethod: req.body.preferredContactMethod
        ? req.body.preferredContactMethod.split(",")
        : prevStartup?.preferredContactMethod,
      newsletterSubscription:
        req.body.newsletterSubscription ?? prevStartup?.newsletterSubscription,
      startupOwner: req.userId,
    };

    const startup = await StartupModel.findByIdAndUpdate(
      req.body.id,
      updatedData,
      {
        new: true, // return updated doc
        runValidators: true,
      }
    );

    if (!startup) {
      return next(new AppError("Unable to update startup", 500));
    }

    return res.status(200).json({
      status: "success",
      message: "Startup update success",
      data: {
        startup,
      },
    });
  } catch (err: unknown) {
    return next(err);
  }
};

export const getAllStartupsDashboardHome = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const startups = await StartupModel.find()
      .select("coverImage name foundedDate")
      .lean();

    const formattedStartups = startups.map((startup) => ({
      ...startup,
      coverImage: startup.coverImage
        ? {
            contentType: startup.coverImage.contentType,
            fileName: startup.coverImage.fileName,
            data: startup.coverImage.data.toString("base64"),
          }
        : null,
    }));

    return res.status(200).json({
      status: "success",
      message: "All startups dashboard home.",
      data: {
        startups: formattedStartups,
      },
    });
  } catch (err: unknown) {
    return next(err);
  }
};
