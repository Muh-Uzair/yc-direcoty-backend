import mongoose, { Document } from "mongoose";

export interface IStartup extends Document {
  name: string;
  tagline: string;
  industry: "tech" | "healthcare" | "finance" | "education";
  stage: "idea" | "mvp" | "launched" | "scaling";
  foundedDate: Date;
  coverImage: {
    data: Buffer;
    contentType: string;
    fileName: string;
  };

  businessModel: "B2B" | "B2C" | "C2C" | "Other";
  fundingStatus:
    | "bootstrapped"
    | "seedFunded"
    | "seriesA"
    | "seriesB"
    | "seriesC";
  fundingAmount: number;
  revenueModel: string;
  yearsInOp: number;
  pitchDeck: {
    data: Buffer;
    contentType: string;
    fileName: string;
  };
  preferredContactMethod: ("Email" | "Phone" | "Fax")[];
  newsletterSubscription: boolean;
  startupOwner: mongoose.Types.ObjectId; // Reference to User
}

// One uploaded file structure
export interface IUploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

// Multer's files structure for your case
export interface IUploadedFiles {
  coverImage?: IUploadedFile[] | null; // optional, because it may or may not exist
  pitchDeck?: IUploadedFile[] | null;
}
