import { Router } from "express";
import * as userController from "../controllers/users.controller.ts";
import { authenticate } from "../middlewares/auth.middleware.ts";

export const router = Router();

router.get("/", authenticate, userController.getCurrentUser);

router.delete("/", authenticate, userController.deleteCurrentUser);