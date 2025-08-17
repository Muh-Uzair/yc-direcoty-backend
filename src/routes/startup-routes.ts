import { checkUserAuth, createStartup } from "@/controllers/startup-controller";
import express, { Router } from "express";
import multer from "multer";

const router: Router = express.Router();

const storage = multer.memoryStorage();

// /api/v1/startup
router.post(
  "/create",
  checkUserAuth,
  multer({
    storage,
    limits: { fileSize: 10 * 1e6 },
    fileFilter: (req, file, cb) => {
      // Check mimetype and size of coverImage
      if (file.fieldname === "coverImage") {
        // allow only images
        if (!file.mimetype.startsWith("image/")) {
          return cb(new Error("Only image files are allowed for coverImage!"));
        }
      }
      if (file.fieldname === "coverImage" && file.size > 5 * 1e6) {
        return cb(new Error("Cover image must be less than 5MB"));
      }

      // Check mimetype and size of pithDeck
      if (file.fieldname === "pitchDeck") {
        // allow only PDFs
        if (file.mimetype !== "application/pdf") {
          return cb(new Error("Only PDF is allowed for pitchDeck!"));
        }
      }

      if (file.fieldname === "pitchDeck" && file.size > 10 * 1e6) {
        return cb(new Error("Pitch deck must be less than 10MB"));
      }
      cb(null, true);
    },
  }).fields([
    { name: "coverImage", maxCount: 1 },
    { name: "pitchDeck", maxCount: 1 },
  ]),
  createStartup
);

export default router;
