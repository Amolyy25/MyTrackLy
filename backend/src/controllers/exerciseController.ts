import { Request, Response } from "express";
import prisma from "../config/database";

function getUserIdFromRequest(req: Request, res: Response): string | undefined {
  const userPayload = (req as any).user;
  const userId = userPayload && (userPayload.userId || userPayload.id);
  if (!userId) {
    res.status(401).json({ message: "Utilisateur non authentifié" });
    return undefined;
  }
  return userId;
}

// GET /api/exercises - Récupère les exercices (prédéfinis + custom de l'utilisateur)
export async function getExercises(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const { category, search } = req.query;

    const where: any = {
      OR: [
        { isCustom: false }, // Exercices prédéfinis (pour tous les utilisateurs)
        { isCustom: true, createdByUserId: userId }, // Exercices custom de l'utilisateur uniquement
      ],
    };

    if (category) {
      where.category = category as string;
    }

    if (search) {
      where.name = {
        contains: search as string,
        mode: "insensitive",
      };
    }

    const exercises = await prisma.exercise.findMany({
      where,
      orderBy: [
        { isCustom: "asc" }, // Prédéfinis en premier
        { name: "asc" },
      ],
    });

    res.json(exercises);
  } catch (error) {
    console.error("Error fetching exercises:", error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
}

// GET /api/exercises/my-library - Récupère uniquement les exercices custom de l'utilisateur
export async function getMyExercises(req: Request, res: Response) {
  try {
    const userId = getUserIdFromRequest(req, res);
    if (!userId) return;

    const exercises = await prisma.exercise.findMany({
      where: {
        isCustom: true,
        createdByUserId: userId,
      },
      orderBy: {
        name: "asc",
      },
    });

    res.json(exercises);
  } catch (error) {
    console.error("Error fetching my exercises:", error);
    res.status(500).json({ message: "Erreur serveur interne" });
  }
}
