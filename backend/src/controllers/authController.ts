import { Request, Response } from "express";
import prisma from "../config/database";
import { hashPassword, comparePassword } from "../utils/bcrypt";
import { generateToken } from "../utils/jwt";
import { sendEmail } from "../email/emailService";
import {
  requestPasswordReset,
  resetPasswordWithToken,
} from "../services/passwordResetService";

// --- Register ---
export async function register(req: Request, res: Response) {
  try {
    const { email, goaltype, password, name, role, coachCode } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      res.status(400).json({
        message: "Cet email existe déjà.",
      });
      return;
    }

    // Validation pour le plan élève (CODE OBLIGATOIRE)
    let coachId: string | undefined = undefined;
    if (role === "eleve") {
      // Le code coach est OBLIGATOIRE pour les élèves
      if (!coachCode || !coachCode.trim()) {
        res.status(400).json({
          message:
            "Le code d'invitation est requis pour créer un compte élève.",
        });
        return;
      }

      const invitation = await prisma.invitationCode.findUnique({
        where: { code: coachCode.trim() },
        include: {
          coach: {
            select: {
              id: true,
              role: true,
            },
          },
        },
      });

      if (!invitation) {
        res.status(400).json({
          message: "Code d'invitation invalide.",
        });
        return;
      }

      if (invitation.used) {
        res.status(400).json({
          message: "Ce code d'invitation a déjà été utilisé.",
        });
        return;
      }

      if (invitation.expiresAt && invitation.expiresAt < new Date()) {
        res.status(400).json({
          message: "Ce code d'invitation a expiré.",
        });
        return;
      }

      if (!invitation.coach || invitation.coach.role !== "coach") {
        res.status(400).json({
          message: "Le coach associé à ce code n'est plus valide.",
        });
        return;
      }

      coachId = invitation.coachId;
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        passwordHash,
        name: name.trim(),
        goalType: goaltype,
        role: role || "personnel",
        coachId: coachId,
      },
    });

    // Marquer le code d'invitation comme utilisé si un code a été fourni
    if (role === "eleve" && coachCode && coachCode.trim()) {
      await prisma.invitationCode.updateMany({
        where: {
          code: coachCode.trim(),
          used: false,
        },
        data: {
          used: true,
          usedByUserId: user.id,
          usedAt: new Date(),
        },
      });
    }

    // Récupérer le coach si c'est un élève
    let coach = undefined;
    if (role === "eleve" && coachId) {
      const coachData = await prisma.user.findUnique({
        where: { id: coachId },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
      coach = coachData || undefined;

      // Envoyer un email au coach pour l'informer qu'un élève a utilisé son code
      // Envoi asynchrone (ne bloque pas la réponse)
      if (coachData && coachData.email) {
        sendEmail(
          coachData.email,
          "Un élève a utilisé votre code d'invitation - MyTrackLy",
          "studentInvitationUsed",
          {
            coachName: coachData.name,
            studentName: user.name,
            studentEmail: user.email,
          }
        ).catch((error) => {
          // Les erreurs sont déjà gérées dans sendEmail, mais on log ici aussi pour traçabilité
          console.error("Erreur lors de l'envoi de l'email au coach:", error);
        });
      }
    }

    // 4. Générer le token
    const token = generateToken({
      userId: user.id,
      email: user.email,
    });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        goalType: user.goalType,
        name: user.name,
        role: user.role,
        coachId: user.coachId,
        coach: coach,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      message: "Une erreur est survenue pendant l'inscription.",
    });
  }
}

// --- Login ---
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    // 1. Validation des entrées avec 'return'
    if (!email) {
      res.status(400).json({ message: "Veuillez saisir votre email." });
      return;
    }
    if (!password) {
      res.status(400).json({ message: "Veuillez saisir votre mot de passe." });
      return;
    }

    // 2. Chercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      res.status(401).json({ message: "Email ou mot de passe incorrect" });
      return;
    }

    // 3. Vérifier le mot de passe
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      res.status(401).json({ message: "Email ou mot de passe incorrect" });
      return;
    }

    // 4. Générer le token
    const token = generateToken({ userId: user.id, email: user.email });

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        goalType: user.goalType,
        role: user.role,
        coachId: user.coachId,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      message: "Une erreur est survenue pendant la connexion.",
    });
  }
}

// --- Get Me ---
export async function getMe(req: Request, res: Response) {
  try {
    // Le middleware auth ajoute 'user' à la requête (typiquement { userId: "...", email: "..." })
    const userPayload = (req as any).user;

    // Correction : userPayload.userId est déjà l'ID (string), pas besoin de faire .id dessus
    const userId = userPayload.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        goalType: true,
        name: true,
        role: true,
        coachId: true,
        createdAt: true,
        updatedAt: true,
        googleCalendarId: true,
        coach: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!user) {
      res.status(404).json({ message: "Utilisateur non trouvé" });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error("GetMe Error:", error);
    res.status(500).json({
      message: "Une erreur est survenue.",
    });
  }
}

// --- Request Password Reset ---
export async function requestPasswordResetController(
  req: Request,
  res: Response
) {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      res.status(400).json({ message: "Veuillez saisir votre email." });
      return;
    }

    // Déléguer la logique métier au service
    const message = await requestPasswordReset(email);

    res.json({ message });
  } catch (error) {
    console.error("Request Password Reset Error:", error);
    res.status(500).json({
      message:
        "Une erreur est survenue lors de la demande de réinitialisation.",
    });
  }
}

// --- Reset Password ---
export async function resetPasswordController(req: Request, res: Response) {
  try {
    const { token, password } = req.body;

    // Validation des entrées
    if (!token) {
      res.status(400).json({ message: "Le token est requis." });
      return;
    }

    if (!password) {
      res.status(400).json({ message: "Le mot de passe est requis." });
      return;
    }

    // Déléguer la logique métier au service
    await resetPasswordWithToken(token, password);

    res.json({
      message: "Votre mot de passe a été réinitialisé avec succès.",
    });
  } catch (error) {
    // Gérer les erreurs métier (token invalide, mot de passe trop court, etc.)
    if (error instanceof Error) {
      const errorMessage = error.message;

      // Erreurs de validation métier (400)
      if (
        errorMessage.includes("Token invalide") ||
        errorMessage.includes("expiré") ||
        errorMessage.includes("caractères")
      ) {
        res.status(400).json({ message: errorMessage });
        return;
      }
    }

    // Erreurs serveur (500)
    console.error("Reset Password Error:", error);
    res.status(500).json({
      message:
        "Une erreur est survenue lors de la réinitialisation du mot de passe.",
    });
  }
}
