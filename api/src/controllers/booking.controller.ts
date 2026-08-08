import type { Request, Response } from "express";
import z from "zod";
import { ConflictError, NotFoundError } from "../lib/errors.ts";
import { prisma } from "../models/index.ts";

const createBookingSchema = z
    .object({
        availabilityId: z.number().int().positive(),
        message: z.string().trim().max(500).optional(),
    })
    .strict();

const bookingParamsSchema = z.object({
    bookingId: z.coerce.number().int().positive(),
});

const statusValues = {
    PENDING: "pending",
    CONFIRMED: "confirmed",
    REJECTED: "rejected",
    CANCELLED: "cancelled",
} as const;

const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
    status: z
        .enum(["PENDING", "CONFIRMED", "REJECTED", "CANCELLED"])
        .transform((status) => statusValues[status])
        .optional(),
});

const updateStatusSchema = z
    .object({
        status: z.enum(["CONFIRMED", "REJECTED"]),
    })
    .strict();

function getToday() {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    return today;
}

// Routes du tatoueur

export async function createBooking(req: Request, res: Response) {
    const { availabilityId, message } =
        await createBookingSchema.parseAsync(req.body);

    const booking = await prisma.$transaction(async (transaction) => {
        const availability = await transaction.availability.findUnique({
            where: { id: availabilityId },
        });

        if (!availability) {
            throw new NotFoundError("Disponibilité introuvable");
        }

        if (
            availability.status !== "open" ||
            availability.availableOn <= getToday()
        ) {
            throw new ConflictError("Cette disponibilité n'est plus réservable");
        }

        const updatedAvailability =
            await transaction.availability.updateMany({
                where: {
                    id: availabilityId,
                    status: "open",
                    availableOn: { gt: getToday() },
                },
                data: { status: "pending" },
            });

        if (updatedAvailability.count === 0) {
            throw new ConflictError(
                "Cette disponibilité n'est plus réservable",
            );
        }

        return transaction.booking.create({
            data: {
                availabilityId,
                tattooArtistId: req.user.id,
                message,
                status: "pending",
            },
        });
    });

    res.status(201).json({
        data: {
            ...booking,
            status: booking.status.toUpperCase(),
        },
    });
}

export async function getMyBookings(req: Request, res: Response) {
    const { page, limit, status } = await paginationSchema.parseAsync(
        req.query,
    );

    const where = {
        tattooArtistId: req.user.id,
        ...(status && { status }),
    };

    const total = await prisma.booking.count({ where });

    const bookings = await prisma.booking.findMany({
        where,
        select: {
            id: true,
            message: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            availability: {
                select: {
                    id: true,
                    availableOn: true,
                    status: true,
                    workstation: {
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
                                    address: true,
                                    postalCode: true,
                                    city: true,
                                },
                            },
                        },
                    },
                },
            },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
    });

    const data = bookings.map((booking) => {
        const { dailyPrice, ...workstation } =
            booking.availability.workstation;

        return {
            ...booking,
            status: booking.status.toUpperCase(),
            availability: {
                ...booking.availability,
                status: booking.availability.status.toUpperCase(),
                workstation: {
                    ...workstation,
                    dailyPriceCents: Math.round(Number(dailyPrice) * 100),
                },
            },
        };
    });

    res.json({
        data,
        meta: { page, limit, total },
    });
}

export async function cancelBooking(req: Request, res: Response) {
    const { bookingId } = await bookingParamsSchema.parseAsync(req.params);

    const booking = await prisma.$transaction(async (transaction) => {
        const existingBooking = await transaction.booking.findFirst({
            where: {
                id: bookingId,
                tattooArtistId: req.user.id,
            },
        });

        if (!existingBooking) {
            throw new NotFoundError("Demande introuvable");
        }

        if (existingBooking.status !== "pending") {
            throw new ConflictError(
                "Cette demande ne peut plus être annulée",
            );
        }

        const updatedBooking = await transaction.booking.updateMany({
            where: {
                id: bookingId,
                tattooArtistId: req.user.id,
                status: "pending",
            },
            data: { status: "cancelled" },
        });

        if (updatedBooking.count === 0) {
            throw new ConflictError(
                "Cette demande ne peut plus être annulée",
            );
        }

        const updatedAvailability =
            await transaction.availability.updateMany({
                where: {
                    id: existingBooking.availabilityId,
                    status: "pending",
                },
                data: { status: "open" },
            });

        if (updatedAvailability.count === 0) {
            throw new ConflictError(
                "Cette demande ne peut plus être annulée",
            );
        }

        return transaction.booking.findUniqueOrThrow({
            where: { id: bookingId },
            include: { availability: true },
        });
    });

    res.json({
        data: {
            ...booking,
            status: booking.status.toUpperCase(),
            availability: {
                ...booking.availability,
                status: booking.availability.status.toUpperCase(),
            },
        },
    });
}

// Routes du gérant

export async function getManagerBookings(req: Request, res: Response) {
    const { page, limit, status } = await paginationSchema.parseAsync(
        req.query,
    );

    const where = {
        availability: {
            workstation: {
                shop: { managerId: req.user.id },
            },
        },
        ...(status && { status }),
    };

    const total = await prisma.booking.count({ where });

    const bookings = await prisma.booking.findMany({
        where,
        include: {
            tattooArtist: {
                include: {
                    user: {
                        select: {
                            id: true,
                            displayName: true,
                        },
                    },
                },
            },
            availability: {
                include: { workstation: true },
            },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
    });

    const data = bookings.map((booking) => {
        const { dailyPrice, ...workstation } =
            booking.availability.workstation;

        return {
            ...booking,
            status: booking.status.toUpperCase(),
            availability: {
                ...booking.availability,
                status: booking.availability.status.toUpperCase(),
                workstation: {
                    ...workstation,
                    dailyPriceCents: Math.round(Number(dailyPrice) * 100),
                },
            },
        };
    });

    res.json({
        data,
        meta: { page, limit, total },
    });
}

export async function updateBookingStatus(req: Request, res: Response) {
    const { bookingId } = await bookingParamsSchema.parseAsync(req.params);
    const { status } = await updateStatusSchema.parseAsync(req.body);

    const bookingStatus =
        status === "CONFIRMED" ? "confirmed" : "rejected";
    const availabilityStatus =
        status === "CONFIRMED" ? "booked" : "open";

    const booking = await prisma.$transaction(async (transaction) => {
        const existingBooking = await transaction.booking.findFirst({
            where: {
                id: bookingId,
                availability: {
                    workstation: {
                        shop: { managerId: req.user.id },
                    },
                },
            },
        });

        if (!existingBooking) {
            throw new NotFoundError("Demande introuvable");
        }

        if (existingBooking.status !== "pending") {
            throw new ConflictError("Cette demande a déjà été traitée");
        }

        const updatedBooking = await transaction.booking.updateMany({
            where: {
                id: bookingId,
                status: "pending",
            },
            data: { status: bookingStatus },
        });

        if (updatedBooking.count === 0) {
            throw new ConflictError("Cette demande a déjà été traitée");
        }

        const updatedAvailability =
            await transaction.availability.updateMany({
                where: {
                    id: existingBooking.availabilityId,
                    status: "pending",
                },
                data: { status: availabilityStatus },
            });

        if (updatedAvailability.count === 0) {
            throw new ConflictError("Cette demande a déjà été traitée");
        }

        return transaction.booking.findUniqueOrThrow({
            where: { id: bookingId },
            include: { availability: true },
        });
    });

    res.json({
        data: {
            ...booking,
            status: booking.status.toUpperCase(),
            availability: {
                ...booking.availability,
                status: booking.availability.status.toUpperCase(),
            },
        },
    });
}
