import type { Request, Response } from "express";
import z from "zod";
import { BadRequestError, ConflictError, NotFoundError } from "../lib/errors.ts";
import { prisma, type Prisma } from "../models/index.ts";

const workstationSchema = z
    .object({
        name: z.string().trim().min(2).max(120),
        description: z.string().trim().max(1000).optional(),
        equipment: z.string().trim().max(1000).optional(),
        dailyPriceCents: z.number().int().min(0),
    })
    .strict();

const updateWorkstationSchema = workstationSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    { message: "Au moins un champ doit être renseigné" },
);

const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
});

const dateSchema = z.iso.date().transform((date) => {
    return new Date(`${date}T00:00:00.000Z`);
});

const searchSchema = paginationSchema.extend({
    city: z.string().trim().min(1).max(120),
    date: dateSchema,
});

const detailQuerySchema = z.object({
    date: dateSchema.optional(),
});

const paramsSchema = z.object({
    workstationId: z.coerce.number().int().positive(),
});

function getToday() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return today;
}

function checkDateIsNotPast(date: Date) {
    if (date < getToday()) {
        throw new BadRequestError("La date ne peut pas être passée");
    }
}

// Le prix est stocké en euros (Decimal) en base, mais l'API renvoie des centimes
function toCents(price: Prisma.Decimal) {
    return Math.round(Number(price) * 100);
}

// Routes publiques

export async function searchWorkstations(req: Request, res: Response) {
    const { city, date, page, limit } = await searchSchema.parseAsync(req.query);
    checkDateIsNotPast(date);

    // On ne garde que les postes d'une ville qui ont au moins une dispo
    // "open" à la date demandée
    const where = {
        shop: {
            city: {
                equals: city,
                mode: "insensitive" as const,
            },
        },
        availabilities: {
            some: {
                availableOn: date,
                status: "open" as const,
            },
        },
    };

    const total = await prisma.workstation.count({ where });

    const workstations = await prisma.workstation.findMany({
        where,
        select: {
            id: true,
            name: true,
            description: true,
            equipment: true,
            dailyPrice: true,
            shop: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    address: true,
                    postalCode: true,
                    city: true,
                },
            },
            availabilities: {
                where: {
                    availableOn: date,
                    status: "open",
                },
                select: {
                    id: true,
                    availableOn: true,
                    status: true,
                },
            },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: "asc" },
    });

    const data = workstations.map((workstation) => {
        const { dailyPrice, ...rest } = workstation;

        return {
            ...rest,
            dailyPriceCents: toCents(dailyPrice),
        };
    });

    res.json({
        data,
        meta: { page, limit, total },
    });
}

export async function getPublicWorkstation(req: Request, res: Response) {
    const { workstationId } = await paramsSchema.parseAsync(req.params);
    const { date } = await detailQuerySchema.parseAsync(req.query);

    if (date) {
        checkDateIsNotPast(date);
    }

    const workstation = await prisma.workstation.findUnique({
        where: { id: workstationId },
        select: {
            id: true,
            name: true,
            description: true,
            equipment: true,
            dailyPrice: true,
            shop: {
                select: {
                    id: true,
                    name: true,
                    description: true,
                    address: true,
                    postalCode: true,
                    city: true,
                },
            },
            availabilities: {
                where: {
                    status: "open",
                    availableOn: date ?? { gte: getToday() },
                },
                select: {
                    id: true,
                    availableOn: true,
                    status: true,
                },
                orderBy: { availableOn: "asc" },
            },
        },
    });

    if (!workstation) {
        throw new NotFoundError("Poste introuvable");
    }

    const { dailyPrice, ...data } = workstation;

    res.json({
        data: {
            ...data,
            dailyPriceCents: toCents(dailyPrice),
        },
    });
}

// Routes du gérant

export async function getManagerWorkstations(req: Request, res: Response) {
    const { page, limit } = await paginationSchema.parseAsync(req.query);

    const where = {
        shop: { managerId: req.user.id },
    };

    const total = await prisma.workstation.count({ where });

    const workstations = await prisma.workstation.findMany({
        where,
        select: {
            id: true,
            name: true,
            description: true,
            equipment: true,
            dailyPrice: true,
            createdAt: true,
            updatedAt: true,
            shopId: true,
            _count: {
                select: {
                    availabilities: {
                        where: {
                            status: "open",
                            availableOn: { gte: getToday() },
                        },
                    },
                },
            },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { id: "asc" },
    });

    const data = workstations.map((workstation) => {
        const { dailyPrice, _count, ...rest } = workstation;

        return {
            ...rest,
            dailyPriceCents: toCents(dailyPrice),
            openAvailabilityCount: _count.availabilities,
        };
    });

    res.json({
        data,
        meta: { page, limit, total },
    });
}

export async function createWorkstation(req: Request, res: Response) {
    const { dailyPriceCents, ...data } =
        await workstationSchema.parseAsync(req.body);

    // On ne peut créer un poste que si on a déjà un salon
    const shop = await prisma.shop.findUnique({
        where: { managerId: req.user.id },
    });

    if (!shop) {
        throw new ConflictError("Vous devez d'abord créer votre salon");
    }

    // On reconvertit les centimes reçus du front en euros pour la base
    const workstation = await prisma.workstation.create({
        data: {
            ...data,
            dailyPrice: (dailyPriceCents / 100).toFixed(2),
            shopId: shop.id,
        },
    });

    const { dailyPrice, ...workstationData } = workstation;

    res.status(201).json({
        data: {
            ...workstationData,
            dailyPriceCents: toCents(dailyPrice),
        },
    });
}

export async function getManagerWorkstation(req: Request, res: Response) {
    const { workstationId } = await paramsSchema.parseAsync(req.params);

    const workstation = await prisma.workstation.findFirst({
        where: {
            id: workstationId,
            shop: { managerId: req.user.id },
        },
        include: {
            availabilities: {
                orderBy: { availableOn: "asc" },
            },
        },
    });

    if (!workstation) {
        throw new NotFoundError("Poste introuvable");
    }

    const { dailyPrice, ...data } = workstation;

    res.json({
        data: {
            ...data,
            dailyPriceCents: toCents(dailyPrice),
        },
    });
}

export async function updateWorkstation(req: Request, res: Response) {
    const { workstationId } = await paramsSchema.parseAsync(req.params);
    const { dailyPriceCents, ...data } =
        await updateWorkstationSchema.parseAsync(req.body);

    const existingWorkstation = await prisma.workstation.findFirst({
        where: {
            id: workstationId,
            shop: { managerId: req.user.id },
        },
    });

    if (!existingWorkstation) {
        throw new NotFoundError("Poste introuvable");
    }

    const workstation = await prisma.workstation.update({
        where: { id: workstationId },
        data: {
            ...data,
            ...(dailyPriceCents !== undefined && {
                dailyPrice: (dailyPriceCents / 100).toFixed(2),
            }),
        },
    });

    const { dailyPrice, ...workstationData } = workstation;

    res.json({
        data: {
            ...workstationData,
            dailyPriceCents: toCents(dailyPrice),
        },
    });
}

export async function deleteWorkstation(req: Request, res: Response) {
    const { workstationId } = await paramsSchema.parseAsync(req.params);

    const workstation = await prisma.workstation.findFirst({
        where: {
            id: workstationId,
            shop: { managerId: req.user.id },
        },
    });

    if (!workstation) {
        throw new NotFoundError("Poste introuvable");
    }

    // On empêche la suppression d'un poste qui a une demande en cours ou
    // une réservation confirmée à venir
    const activeAvailability = await prisma.availability.findFirst({
        where: {
            workstationId,
            OR: [
                { status: "pending" },
                {
                    status: "booked",
                    availableOn: { gte: getToday() },
                },
            ],
        },
    });

    if (activeAvailability) {
        throw new ConflictError(
            "Ce poste possède une demande ou une réservation active",
        );
    }

    await prisma.workstation.delete({
        where: { id: workstationId },
    });

    res.status(204).end();
}
