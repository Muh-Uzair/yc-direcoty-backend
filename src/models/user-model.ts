import { IUser } from "@/types/user-types";
import { Schema, model } from "mongoose";
import validator from "validator";

// 2. Mongoose Schema
const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      unique: true,
      minlength: [2, "Username must be at least 2 characters long"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false, // Do not return in queries
      validate: {
        validator: (val: string) =>
          validator.isStrongPassword(val, {
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          }),
        message:
          "Password must include uppercase, lowercase, number, and special character",
      },
    },
    avatar: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Remove sensitive fields when sending to client
userSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete (ret as any).__v;
    return ret;
  },
});

// 3. Mongoose model
export const UserModel = model<IUser>("User", userSchema);
