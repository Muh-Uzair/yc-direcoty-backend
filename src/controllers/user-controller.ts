import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { UserModel } from "@/models/user-model";
import { AppError } from "@/utils/AppError";

// FUNCTION
export const userSignup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1 : take the data out
    const { username, password } = req.body;

    // 2 : hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3 : create user
    const user = await UserModel.create({
      username,
      password: hashedPassword,
    });

    if (!user) {
      return next(new AppError("Error in creating user", 500));
    }

    // 4 : preparation for jwt
    const jwtSecret: string = process.env.JWT_SECRET!;
    const jwtExpiresIn: number =
      Number(process.env.JWT_EXPIRES_IN) || 259200000;

    const signOptions: SignOptions = {
      expiresIn: jwtExpiresIn,
    };

    // 5 : sign token
    const token = jwt.sign({ id: String(user._id) }, jwtSecret, signOptions);

    // 7 : send the cookie
    res.cookie("jwt", token, {
      httpOnly: true, // prevents access from JavaScript (XSS protection)
      secure: process.env.NODE_ENV === "production", // only sent over HTTPS in production
      sameSite: "lax", // or "strict" / "none" depending on frontend/backend setup
      path: "/",
      maxAge: 3 * 24 * 60 * 60 * 1000, // in milliseconds
    });

    return res.status(200).json({
      status: "success",
      message: "User sign up success",
      data: {
        user,
        jwt: token,
      },
    });
  } catch (err: unknown) {
    return next(err);
  }
};

// FUNCTION
export const getCurrUser = async (
  req: Request,
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
    const token = authHeader.split(" ")[1]; // "Bearer token" => ["Bearer", "token"]

    // 2 : verify jwt
    const jwtSecret = process.env.JWT_SECRET as string;

    const decodedToken = jwt.verify(token, jwtSecret) as { id: string };

    // 3 : get the user based on id in token
    const userId = decodedToken?.id;

    // 4 : get the user based on id
    const user = await UserModel.findById(userId);

    if (!user) {
      return next(new AppError("User does not exists", 400));
    }

    //  : send response
    return res.status(200).json({
      status: "success",
      message: "User fetched successfully",
      data: {
        user,
      },
    });
  } catch (err: unknown) {
    return next(err);
  }
};

// FUNCTION
export const userSigning = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1 : check the username and password
    const { username, password } = req.body;

    if (!username || !password) {
      return next(new AppError("Username or password missing", 400));
    }

    // 2 : check wether the user exists against that username
    const user = await UserModel.findOne({
      username,
    }).select("+password");

    // 3 : compare the password
    const passwordCorrect = user?.password
      ? await bcrypt.compare(password, user?.password)
      : false;

    // 4 : check both buildManager and passwords are correct or not
    if (!user || !passwordCorrect) {
      return next(new AppError("Wrong username or password", 401));
    }

    // 6 : sign a jwt, create a jwt
    const jwtSecret: string = process.env.JWT_SECRET!;
    const jwtExpiresIn: number =
      Number(process.env.JWT_EXPIRES_IN) || 259200000;

    const signOptions: SignOptions = {
      expiresIn: jwtExpiresIn,
    };

    const token = jwt.sign(
      { id: String(user._id) }, // always cast ObjectId to string
      jwtSecret,
      signOptions
    );

    // 7 : send the cookie
    res.cookie("jwt", token, {
      httpOnly: true, // prevents access from JavaScript (XSS protection)
      secure: process.env.NODE_ENV === "production", // only sent over HTTPS in production
      sameSite: "lax", // or "strict" / "none" depending on frontend/backend setup
      path: "/",
      maxAge: 3 * 24 * 60 * 60 * 1000, // in milliseconds
    });

    res.status(200).json({
      status: "success",
      data: {
        user,
        jwt: token,
      },
    });
  } catch (err: unknown) {
    return next(err);
  }
};
