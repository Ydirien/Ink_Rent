import argon2 from "argon2";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import z from "zod";
import { config } from "../../config.ts";
import { ConflictError, UnauthorizedError } from "../lib/errors.ts";
import type { Role } from "../lib/roles.ts";
import { prisma, type UserType } from "../models/index.ts";

const registerSchema = z
    .object({
        displayName: z.string().trim().min(2).max(80),
        email: z.email(),
        password: z
            .string()
            .min(12, "Le mot de passe doit contenir au moins 12 caractères")
            .max(30, "Le mot de passe doit contenir au maximum 30 caractères")
            .regex(/[a-z]/, "Le mot de passe doit contenir une minuscule")
            .regex(/[A-Z]/, "Le mot de passe doit contenir une majuscule")
            .regex(/[0-9]/, "Le mot de passe doit contenir un chiffre"),
        confirm: z.string(),
        role: z.enum(["TATTOO_ARTIST", "SHOP_MANAGER"]),
    })
    .refine((data) => data.password === data.confirm, {
        message: "Les mots de passe ne correspondent pas",
        path: ["confirm"],
    });

const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(1),
});

// Crée le token JWT que le front va utiliser pour s'authentifier
function generateAccessToken(userId: number, role: Role) {
    const token = jwt.sign(
        { id: userId, role },
        config.accessTokenSecret,
        { expiresIn: "15m" },
    );

    return {
        token,
        type: "Bearer",
        expiresInMS: 15 * 60 * 1000,
    };
}

export async function registerUser(req: Request, res: Response) {
    const { displayName, email, password, role } =
        await registerSchema.parseAsync(req.body);

    const normalizedEmail = email.toLowerCase();

    // On vérifie que l'email n'est pas déjà pris
    const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail },
    });

    if (existingUser) {
        throw new ConflictError("Cet email est déjà utilisé");
    }

    const passwordHash = await argon2.hash(password);

    // Selon le rôle choisi, on crée le bon profil en même temps que l'utilisateur
    let accountType: UserType;
    let profile: { tattooArtist: { create: {} } } | { shopManager: { create: {} } };

    if (role === "TATTOO_ARTIST") {
        accountType = "tattoo_artist";
        profile = { tattooArtist: { create: {} } };
    } else {
        accountType = "shop_manager";
        profile = { shopManager: { create: {} } };
    }

    const user = await prisma.user.create({
        data: {
            displayName,
            email: normalizedEmail,
            password: passwordHash,
            accountType,
            ...profile,
        },
    });

    const accessToken = generateAccessToken(user.id, role);

    res.status(201).json({
        data: {
            accessToken,
            user: {
                id: user.id,
                displayName: user.displayName,
                email: user.email,
                role,
            },
        },
    });
}

export async function loginUser(req: Request, res: Response) {
    const { email, password } = await loginSchema.parseAsync(req.body);
    const normalizedEmail = email.toLowerCase();

    const user = await prisma.user.findUnique({
        where: { email: normalizedEmail },
        include: {
            tattooArtist: true,
            shopManager: true,
        },
    });

    if (!user) {
        throw new UnauthorizedError("Email ou mot de passe incorrect");
    }

    const isMatching = await argon2.verify(user.password, password);

    if (!isMatching) {
        throw new UnauthorizedError("Email ou mot de passe incorrect");
    }

    // On retrouve le rôle du compte à partir du profil lié
    let role: Role;

    if (user.tattooArtist) {
        role = "TATTOO_ARTIST";
    } else if (user.shopManager) {
        role = "SHOP_MANAGER";
    } else {
        throw new UnauthorizedError("Compte utilisateur invalide");
    }

    const accessToken = generateAccessToken(user.id, role);

    res.json({
        data: {
            accessToken,
            user: {
                id: user.id,
                displayName: user.displayName,
                email: user.email,
                role,
            },
        },
    });
}

export async function logoutUser(req: Request, res: Response) {
    // Le JWT est stateless : le front supprime le token lors de la déconnexion.
    res.status(204).end();
}
