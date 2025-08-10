import { userSignup } from "@/controllers/user-controller";
import express, { RequestHandler, Router } from "express";

const router: Router = express.Router();

router.route("/signup").post(userSignup);

export default router;
