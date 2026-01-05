import { Request, Response } from "express";
import prisma from "../config/database";
import crypto from "crypto";

// Fonction pour générer un code d'invitation unique et complexe
function generateInvitationCode(): string {
  // Génère un code de 16 caractères avec lettres majuscules, minuscules, chiffres et caractères spéciaux
  // Utilise crypto.randomBytes pour plus de sécurité
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  const randomBytes = crypto.randomBytes(16);
  let code = "";
  for (let i = 0; i < 16; i++) {
    code += chars[randomBytes[i] % chars.length];
  }
  return code;
}

// --- Générer un code d'invitation ---
export async function createInvitationCode(req: Request, res: Response) {
  try {
    const userPayload = (req as any).user;
    const userId = userPayload.userId;

    // Vérifier que l'utilisateur est un coach
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== "coach") {
      res.status(403).json({
        message: "Seuls les coaches peuvent créer des codes d'invitation.",
      });
      return;
    }

    // Générer un code unique
    let code: string;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      code = generateInvitationCode();
      const existing = await prisma.invitationCode.findUnique({
        where: { code },
      });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      res.status(500).json({
        message: "Erreur lors de la génération du code. Veuillez réessayer.",
      });
      return;
    }

    // Créer le code d'invitation
    const invitationCode = await prisma.invitationCode.create({
      data: {
        code: code!,
        coachId: userId,
      },
    });

    res.status(201).json({
      id: invitationCode.id,
      code: invitationCode.code,
      createdAt: invitationCode.createdAt,
      used: invitationCode.used,
    });
  } catch (error) {
    console.error("CreateInvitationCode Error:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la création du code.",
    });
  }
}

// --- Lister les codes d'invitation d'un coach ---
export async function getInvitationCodes(req: Request, res: Response) {
  try {
    const userPayload = (req as any).user;
    const userId = userPayload.userId;

    // Vérifier que l'utilisateur est un coach
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== "coach") {
      res.status(403).json({
        message: "Seuls les coaches peuvent voir leurs codes d'invitation.",
      });
      return;
    }

    const codes = await prisma.invitationCode.findMany({
      where: { coachId: userId },
      orderBy: { createdAt: "desc" },
      include: {
        usedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json(codes);
  } catch (error) {
    console.error("GetInvitationCodes Error:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la récupération des codes.",
    });
  }
}

// --- Valider un code d'invitation ---
export async function validateInvitationCode(req: Request, res: Response) {
  try {
    const { code } = req.body;

    if (!code || !code.trim()) {
      res.status(400).json({
        message: "Le code est requis.",
      });
      return;
    }

    const invitationCode = await prisma.invitationCode.findUnique({
      where: { code: code.trim() },
      include: {
        coach: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!invitationCode) {
      res.status(404).json({
        message: "Code d'invitation invalide.",
      });
      return;
    }

    if (invitationCode.used) {
      res.status(400).json({
        message: "Ce code a déjà été utilisé.",
      });
      return;
    }

    if (invitationCode.expiresAt && invitationCode.expiresAt < new Date()) {
      res.status(400).json({
        message: "Ce code a expiré.",
      });
      return;
    }

    // Vérifier que le coach existe toujours et est bien un coach
    if (!invitationCode.coach || invitationCode.coach.role !== "coach") {
      res.status(400).json({
        message: "Le coach associé à ce code n'existe plus ou n'est plus valide.",
      });
      return;
    }

    res.json({
      valid: true,
      coach: invitationCode.coach,
    });
  } catch (error) {
    console.error("ValidateInvitationCode Error:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la validation du code.",
    });
  }
}

