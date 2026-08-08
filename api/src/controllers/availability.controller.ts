import type { Request, Response } from "express";
import z from "zod";
import { BadRequestError, ConflictError, NotFoundError } from "../lib/errors.ts";
import { prisma } from "../models/index.ts";

const createAvailabilitySchema = z
    .object({
        date: z.iso.date().transform((date) => {
            return new Date(`${date}T00:00:00.000Z`);
        }),
    })
    .strict();

const workstationParamsSchema = z.object({
    workstationId: z.coerce.number().int().positive(),
});

const availabilityParamsSchema = workstationParamsSchema.extend({
    availabilityId: z.coerce.number().int().positive(),
});

function getToday() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return today;
}

export async function createAvailability(req: Request, res: Response) {
    const { workstationId } =
        await workstationParamsSchema.parseAsync(req.params);
    const { date } = await createAvailabilitySchema.parseAsync(req.body);

    if (date <= getToday()) {
        throw new BadRequestError("La date doit être future");
    }

    // On vérifie que le poste appartient bien au gérant connecté
    const workstation = await prisma.workstation.findFirst({
        where: {
            id: workstationId,
            shop: { managerId: req.user.id },
        },
    });

    if (!workstation) {
        throw new NotFoundError("Poste introuvable");
    }

    // On évite de créer deux fois la même date pour ce poste
    const existingAvailability = await prisma.availability.findUnique({
        where: {
            workstationId_availableOn: {
                workstationId,
                availableOn: date,
            },
        },
    });

    if (existingAvailability) {
        throw new ConflictError("Cette date est déjà disponible");
    }

    const availability = await prisma.availability.create({
        data: {
            availableOn: date,
            status: "open",
            workstationId,
        },
    });

    res.status(201).json({ data: availability });
}

export async function deleteAvailability(req: Request, res: Response) {
    const { workstationId, availabilityId } =
        await availabilityParamsSchema.parseAsync(req.params);

    // On vérifie que le poste appartient bien au gérant connecté
    const workstation = await prisma.workstation.findFirst({
        where: {
            id: workstationId,
            shop: { managerId: req.user.id },
        },
    });

    if (!workstation) {
        throw new NotFoundError("Poste introuvable");
    }

    const availability = await prisma.availability.findFirst({
        where: {
            id: availabilityId,
            workstationId,
        },
    });

    if (!availability) {
        throw new NotFoundError("Disponibilité introuvable");
    }

    if (availability.status !== "open") {
        throw new ConflictError(
            "Cette disponibilité ne peut plus être supprimée",
        );
    }

    // On ne supprime que si le statut est toujours "open" au moment de la
    // requête, pour éviter de supprimer une dispo qui vient d'être réservée
    const deletedAvailability = await prisma.availability.deleteMany({
        where: {
            id: availabilityId,
            workstationId,
            status: "open",
        },
    });

    if (deletedAvailability.count === 0) {
        throw new ConflictError(
            "Cette disponibilité ne peut plus être supprimée",
        );
    }

    res.status(204).end();
}
