import type { Request, Response } from "express";
import z from "zod";
import { ConflictError, NotFoundError } from "../lib/errors.ts";
import { prisma } from "../models/index.ts";

const shopSchema = z
    .object({
        name: z.string().trim().min(2).max(120),
        description: z.string().trim().max(1000).optional(),
        address: z.string().trim().min(2).max(255),
        postalCode: z.string().trim().min(2).max(10),
        city: z.string().trim().min(1).max(120),
    })
    .strict();

const updateShopSchema = shopSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    { message: "Au moins un champ doit être renseigné" },
);

export async function getShop(req: Request, res: Response) {
    const shop = await prisma.shop.findUnique({
        where: { managerId: req.user.id },
    });

    if (!shop) {
        throw new NotFoundError("Salon introuvable");
    }

    res.json({ data: shop });
}

export async function createShop(req: Request, res: Response) {
    const data = await shopSchema.parseAsync(req.body);

    // Un gérant ne peut avoir qu'un seul salon
    const existingShop = await prisma.shop.findUnique({
        where: { managerId: req.user.id },
    });

    if (existingShop) {
        throw new ConflictError("Vous possédez déjà un salon");
    }

    const shop = await prisma.shop.create({
        data: {
            ...data,
            managerId: req.user.id,
        },
    });

    res.status(201).json({ data: shop });
}

export async function updateShop(req: Request, res: Response) {
    const data = await updateShopSchema.parseAsync(req.body);

    // On vérifie que le gérant a bien déjà un salon avant de le modifier
    const existingShop = await prisma.shop.findUnique({
        where: { managerId: req.user.id },
    });

    if (!existingShop) {
        throw new NotFoundError("Salon introuvable");
    }

    const shop = await prisma.shop.update({
        where: { managerId: req.user.id },
        data,
    });

    res.json({ data: shop });
}
