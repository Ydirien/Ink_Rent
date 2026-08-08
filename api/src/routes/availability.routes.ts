import { Router } from "express";
import * as availabilityController from "../controllers/availability.controller.ts";
import { authenticate, checkRole } from "../middlewares/auth.middleware.ts";

export const router = Router();

router.post(
    "/:workstationId/availabilities",
    authenticate,
    checkRole("SHOP_MANAGER"),
    availabilityController.createAvailability,
);

router.delete(
    "/:workstationId/availabilities/:availabilityId",
    authenticate,
    checkRole("SHOP_MANAGER"),
    availabilityController.deleteAvailability,
);
