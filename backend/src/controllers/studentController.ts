import { Request, Response } from "express";
import prisma from "../config/database";

/**
 * Utility: Extract userId from req.user
 */
function getCoachId(req: Request): string | undefined {
  const userPayload = (req as any).user;
  return userPayload?.userId;
}

/**
 * Utility: Verify user is a coach
 */
async function verifyCoach(userId: string, res: Response): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!user || user.role !== "coach") {
    res.status(403).json({
      message: "Seuls les coaches peuvent effectuer cette action.",
    });
    return false;
  }
  return true;
}

// --- Lister les élèves d'un coach (actifs + fiches clients) ---
export async function getStudents(req: Request, res: Response) {
  try {
    const userId = getCoachId(req);
    if (!userId) {
      res.status(401).json({ message: "Non authentifié" });
      return;
    }

    if (!(await verifyCoach(userId, res))) return;

    const students = await prisma.user.findMany({
      where: {
        coachId: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        goalType: true,
        isVirtual: true,
        allowEmails: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            trainingSessions: true,
            measurements: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(students);
  } catch (error) {
    console.error("GetStudents Error:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la récupération des élèves.",
    });
  }
}

// --- Obtenir les détails d'un élève spécifique ---
export async function getStudentDetails(req: Request, res: Response) {
  try {
    const userId = getCoachId(req);
    if (!userId) {
      res.status(401).json({ message: "Non authentifié" });
      return;
    }

    if (!(await verifyCoach(userId, res))) return;

    const { studentId } = req.params;

    // Vérifier que l'élève appartient bien au coach
    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        coachId: userId,
      },
      include: {
        trainingSessions: {
          orderBy: { date: "desc" },
          take: 10,
          include: {
            exercises: {
              include: {
                exercise: true,
              },
            },
          },
        },
        measurements: {
          orderBy: { date: "desc" },
          take: 10,
        },
        coachNotes: {
          where: { coachId: userId },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            trainingSessions: true,
            measurements: true,
          },
        },
      },
    });

    if (!student) {
      res.status(404).json({
        message: "Élève non trouvé ou vous n'avez pas accès à cet élève.",
      });
      return;
    }

    res.json({
      id: student.id,
      name: student.name,
      email: student.email,
      goalType: student.goalType,
      isVirtual: student.isVirtual,
      allowEmails: student.allowEmails,
      createdAt: student.createdAt,
      updatedAt: student.updatedAt,
      trainingSessions: student.trainingSessions,
      measurements: student.measurements,
      coachNotes: student.coachNotes,
      _count: student._count,
    });
  } catch (error) {
    console.error("GetStudentDetails Error:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la récupération des détails.",
    });
  }
}

// --- Créer une fiche client (élève virtuel) ---
export async function createVirtualStudent(req: Request, res: Response) {
  try {
    const userId = getCoachId(req);
    if (!userId) {
      res.status(401).json({ message: "Non authentifié" });
      return;
    }

    if (!(await verifyCoach(userId, res))) return;

    const { name, email, goalType, allowEmails } = req.body;

    // Validation
    if (!name || !name.trim()) {
      res.status(400).json({ message: "Le nom est requis." });
      return;
    }

    if (!email || !email.trim()) {
      res.status(400).json({ message: "L'email est requis." });
      return;
    }

    // Vérifier que l'email n'est pas déjà utilisé
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      res.status(400).json({
        message: "Cet email est déjà utilisé par un autre compte.",
      });
      return;
    }

    // Créer la fiche client (utilisateur virtuel)
    const virtualStudent = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name.trim(),
        passwordHash: null, // Pas de mot de passe
        role: "eleve",
        goalType: goalType || null,
        coachId: userId,
        isVirtual: true,
        allowEmails: allowEmails !== undefined ? allowEmails : true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        goalType: true,
        isVirtual: true,
        allowEmails: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            trainingSessions: true,
            measurements: true,
          },
        },
      },
    });

    res.status(201).json(virtualStudent);
  } catch (error) {
    console.error("CreateVirtualStudent Error:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la création de la fiche client.",
    });
  }
}

// --- Modifier une fiche client ---
export async function updateVirtualStudent(req: Request, res: Response) {
  try {
    const userId = getCoachId(req);
    if (!userId) {
      res.status(401).json({ message: "Non authentifié" });
      return;
    }

    if (!(await verifyCoach(userId, res))) return;

    const { studentId } = req.params;
    const { name, email, goalType, allowEmails } = req.body;

    // Vérifier que l'élève appartient au coach et est virtuel
    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        coachId: userId,
        isVirtual: true,
      },
    });

    if (!student) {
      res.status(404).json({
        message: "Fiche client non trouvée ou vous n'avez pas accès.",
      });
      return;
    }

    // Vérifier l'unicité de l'email si changé
    if (email && email.toLowerCase().trim() !== student.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });
      if (existingUser) {
        res.status(400).json({
          message: "Cet email est déjà utilisé par un autre compte.",
        });
        return;
      }
    }

    const updatedStudent = await prisma.user.update({
      where: { id: studentId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(email !== undefined && { email: email.toLowerCase().trim() }),
        ...(goalType !== undefined && { goalType }),
        ...(allowEmails !== undefined && { allowEmails }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        goalType: true,
        isVirtual: true,
        allowEmails: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            trainingSessions: true,
            measurements: true,
          },
        },
      },
    });

    res.json(updatedStudent);
  } catch (error) {
    console.error("UpdateVirtualStudent Error:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la mise à jour de la fiche.",
    });
  }
}

// --- Supprimer une fiche client ---
export async function deleteVirtualStudent(req: Request, res: Response) {
  try {
    const userId = getCoachId(req);
    if (!userId) {
      res.status(401).json({ message: "Non authentifié" });
      return;
    }

    if (!(await verifyCoach(userId, res))) return;

    const { studentId } = req.params;

    // Vérifier que l'élève appartient au coach et est virtuel
    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        coachId: userId,
        isVirtual: true,
      },
    });

    if (!student) {
      res.status(404).json({
        message: "Fiche client non trouvée ou vous n'avez pas accès.",
      });
      return;
    }

    await prisma.user.delete({
      where: { id: studentId },
    });

    res.json({ message: "Fiche client supprimée avec succès." });
  } catch (error) {
    console.error("DeleteVirtualStudent Error:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la suppression de la fiche.",
    });
  }
}







