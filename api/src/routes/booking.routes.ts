import { Router } from "express";
import * as bookingController from "../controllers/booking.controller.ts";
import { authenticate, checkRole } from "../middlewares/auth.middleware.ts";

export const router = Router();
export const managerRouter = Router();

router.post(
    "/",
    authenticate,
    checkRole("TATTOO_ARTIST"),
    bookingController.createBooking,
);

router.get(
    "/me",
    authenticate,
    checkRole("TATTOO_ARTIST"),
    bookingController.getMyBookings,
);

router.patch(
    "/:bookingId/cancel",
    authenticate,
    checkRole("TATTOO_ARTIST"),
    bookingController.cancelBooking,
);

managerRouter.get(
    "/",
    authenticate,
    checkRole("SHOP_MANAGER"),
    bookingController.getManagerBookings,
);

managerRouter.patch(
    "/:bookingId/status",
    authenticate,
    checkRole("SHOP_MANAGER"),
    bookingController.updateBookingStatus,
);
