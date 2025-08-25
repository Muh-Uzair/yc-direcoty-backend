import { IStartup } from "../types/startup-types";
import mongoose, { Schema } from "mongoose";
import { model } from "mongoose";

const StartupSchema: Schema<IStartup> = new Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 2,
      maxlength: 20,
      unique: true,
    },
    tagline: { type: String, required: true, minlength: 5, maxlength: 160 },
    industry: {
      type: String,
      enum: ["tech", "healthcare", "finance", "education"],
      required: true,
    },
    stage: {
      type: String,
      enum: ["idea", "mvp", "launched", "scaling"],
      required: true,
    },
    foundedDate: { type: Date, required: true },

    // Media
    coverImage: {
      data: Buffer,
      contentType: String,
      fileName: String,
    },

    // Business details
    businessModel: {
      type: String,
      enum: ["B2B", "B2C", "C2C", "Other"],
      required: true,
    },
    fundingStatus: {
      type: String,
      enum: ["bootstrapped", "seedFunded", "seriesA", "seriesB", "seriesC"],
      required: true,
    },
    fundingAmount: { type: Number, required: true, min: 0 },
    revenueModel: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 1000,
    },
    yearsInOp: { type: Number, required: true, min: 0, max: 10000 },
    pitchDeck: {
      data: Buffer,
      contentType: String,
      fileName: String,
    },

    // Preferences
    preferredContactMethod: {
      type: [String],
      enum: ["Email", "Phone", "Fax"],
      default: ["Email"],
    },
    newsletterSubscription: { type: Boolean, default: false },

    // Reference to User
    startupOwner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

StartupSchema.set("toJSON", {
  transform: function (doc, ret) {
    delete (ret as any).__v;
    return ret;
  },
});

const StartupModel = model<IStartup>("Startup", StartupSchema);

export default StartupModel;
