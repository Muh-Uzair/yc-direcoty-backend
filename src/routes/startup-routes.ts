import {
  checkUserAuth,
  createStartup,
  deleteStartupOnId,
  getAllStartups,
  getStartupOnId,
  updateStartupOnId,
  getAllStartupsDashboardHome,
} from "../controllers/startup-controller";
import express, { Router } from "express";
import multer from "multer";

const router: Router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1e6 }, // 10MB max for any file
  fileFilter: (req, file, cb) => {
    // coverImage validation
    if (file.fieldname === "coverImage") {
      if (!file.mimetype.startsWith("image/")) {
        return cb(new Error("Only image files are allowed for coverImage!"));
      }
    }

    // pitchDeck validation
    if (file.fieldname === "pitchDeck") {
      if (file.mimetype !== "application/pdf") {
        return cb(new Error("Only PDF is allowed for pitchDeck!"));
      }
    }

    cb(null, true);
  },
});

// /api/v1/startup
router.post(
  "/create",
  checkUserAuth,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "pitchDeck", maxCount: 1 },
  ]),
  createStartup
);

router.get("/all", checkUserAuth, getAllStartups);
router.get("/:id", checkUserAuth, getStartupOnId);
router.delete("/:id", checkUserAuth, deleteStartupOnId);
router.patch(
  "/update/:id",
  checkUserAuth,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "pitchDeck", maxCount: 1 },
  ]),
  updateStartupOnId
);

router.get("/all/dashboard/home", getAllStartupsDashboardHome);
router.get("/dashboard/home/:id", getStartupOnId);

export default router;
