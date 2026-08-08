import { Router } from "express";
import { router as availabilityRouter } from "./availability.routes.ts";
import { router as authRouter } from "./auth.routes.ts";
import {
    managerRouter as managerBookingRouter,
    router as bookingRouter,
} from "./booking.routes.ts";
import { router as healthRouter } from "./health.routes.ts";
import { router as shopRouter } from "./shop.routes.ts";
import { router as userRouter } from "./users.routes.ts";
import {
    managerRouter as managerWorkstationRouter,
    publicRouter as publicWorkstationRouter,
} from "./workstation.routes.ts";

export const router = Router();

router.use("/auth", authRouter);
router.use("/bookings", bookingRouter);
router.use("/health", healthRouter);
router.use("/manager/bookings", managerBookingRouter);
router.use("/manager/shop", shopRouter);
router.use("/manager/workstations", managerWorkstationRouter);
router.use("/manager/workstations", availabilityRouter);
router.use("/users", userRouter);
router.use("/workstations", publicWorkstationRouter);
