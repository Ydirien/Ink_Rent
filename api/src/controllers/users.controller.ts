import type { Request, Response } from "express";
import { UnauthorizedError } from "../lib/errors.ts";
import { prisma } from "../models/index.ts";

export async function getCurrentUser(req: Request, res: Response) {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
            id: true,
            displayName: true,
            email: true,
        },
    });

    if (!user) {
        throw new UnauthorizedError("Utilisateur introuvable");
    }

    res.json({
        data: {
            ...user,
            role: req.user.role,
        },
    });
}

export async function deleteCurrentUser(req: Request, res: Response) {
    const user = await prisma.user.findUnique({
        where: { id: req.user.id },
    });

    if (!user) {
        throw new UnauthorizedError("Utilisateur introuvable");
    }

    await prisma.user.delete({
        where: { id: req.user.id },
    });

    res.status(204).end();
}
