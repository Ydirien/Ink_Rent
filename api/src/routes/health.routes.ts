import { Router } from "express";
import * as healthController from "../controllers/health.controller.ts";

export const router = Router();

router.get("/", healthController.getHealth);
