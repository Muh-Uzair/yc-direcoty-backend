import {
  getCurrUser,
  userSignup,
  userSigning,
} from "../controllers/user-controller";
import express, { Router } from "express";

const router: Router = express.Router();

// /api/vi1/users
router.route("/signup").post(userSignup);
router.route("/curr").get(getCurrUser);
router.route("/signin").post(userSigning);

export default router;
