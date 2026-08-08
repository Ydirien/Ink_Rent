import { Router } from "express";
import * as workstationController from "../controllers/workstation.controller.ts";
import { authenticate, checkRole } from "../middlewares/auth.middleware.ts";

export const publicRouter = Router();
export const managerRouter = Router();

publicRouter.get("/", workstationController.searchWorkstations);
publicRouter.get(
    "/:workstationId",
    workstationController.getPublicWorkstation,
);

managerRouter.get(
    "/",
    authenticate,
    checkRole("SHOP_MANAGER"),
    workstationController.getManagerWorkstations,
);

managerRouter.post(
    "/",
    authenticate,
    checkRole("SHOP_MANAGER"),
    workstationController.createWorkstation,
);

managerRouter.get(
    "/:workstationId",
    authenticate,
    checkRole("SHOP_MANAGER"),
    workstationController.getManagerWorkstation,
);

managerRouter.patch(
    "/:workstationId",
    authenticate,
    checkRole("SHOP_MANAGER"),
    workstationController.updateWorkstation,
);

managerRouter.delete(
    "/:workstationId",
    authenticate,
    checkRole("SHOP_MANAGER"),
    workstationController.deleteWorkstation,
);
