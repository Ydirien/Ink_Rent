import { Router } from "express";
import * as shopController from "../controllers/shop.controller.ts";
import { authenticate, checkRole } from "../middlewares/auth.middleware.ts";

export const router = Router();

router.get(
    "/",
    authenticate,
    checkRole("SHOP_MANAGER"),
    shopController.getShop,
);

router.post(
    "/",
    authenticate,
    checkRole("SHOP_MANAGER"),
    shopController.createShop,
);

router.patch(
    "/",
    authenticate,
    checkRole("SHOP_MANAGER"),
    shopController.updateShop,
);
