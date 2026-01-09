import { Request, Response } from "express";
import prisma from "../config/database";

// --- Lister les élèves d'un coach ---
export async function getStudents(req: Request, res: Response) {
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
        message: "Seuls les coaches peuvent voir leurs élèves.",
      });
      return;
    }

    const students = await prisma.user.findMany({
      where: {
        coachId: userId,
        role: "eleve",
      },
      select: {
        id: true,
        name: true,
        email: true,
        goalType: true,
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
    const userPayload = (req as any).user;
    const userId = userPayload.userId;
    const { studentId } = req.params;

    // Vérifier que l'utilisateur est un coach
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== "coach") {
      res.status(403).json({
        message: "Seuls les coaches peuvent voir les détails de leurs élèves.",
      });
      return;
    }

    // Vérifier que l'élève appartient bien au coach
    const student = await prisma.user.findFirst({
      where: {
        id: studentId,
        coachId: userId,
        role: "eleve",
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

    res.json(student);
  } catch (error) {
    console.error("GetStudentDetails Error:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la récupération des détails.",
    });
  }
}







