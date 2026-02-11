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
 * Utility: Verify user is a coach and student belongs to them
 */
async function verifyCoachStudentRelation(
  coachId: string,
  studentId: string,
  res: Response
): Promise<boolean> {
  const coach = await prisma.user.findUnique({
    where: { id: coachId },
    select: { role: true },
  });

  if (!coach || coach.role !== "coach") {
    res.status(403).json({
      message: "Seuls les coaches peuvent effectuer cette action.",
    });
    return false;
  }

  const student = await prisma.user.findFirst({
    where: {
      id: studentId,
      coachId: coachId,
    },
  });

  if (!student) {
    res.status(404).json({
      message: "Élève non trouvé ou vous n'avez pas accès.",
    });
    return false;
  }

  return true;
}

// --- Lister les notes d'un élève ---
export async function getCoachNotes(req: Request, res: Response) {
  try {
    const coachId = getCoachId(req);
    if (!coachId) {
      res.status(401).json({ message: "Non authentifié" });
      return;
    }

    const { studentId } = req.params;

    if (!(await verifyCoachStudentRelation(coachId, studentId, res))) return;

    const notes = await prisma.coachNote.findMany({
      where: {
        coachId,
        studentId,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(notes);
  } catch (error) {
    console.error("GetCoachNotes Error:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la récupération des notes.",
    });
  }
}

// --- Créer une note ---
export async function createCoachNote(req: Request, res: Response) {
  try {
    const coachId = getCoachId(req);
    if (!coachId) {
      res.status(401).json({ message: "Non authentifié" });
      return;
    }

    const { studentId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ message: "Le contenu de la note est requis." });
      return;
    }

    if (!(await verifyCoachStudentRelation(coachId, studentId, res))) return;

    const note = await prisma.coachNote.create({
      data: {
        coachId,
        studentId,
        content: content.trim(),
      },
    });

    res.status(201).json(note);
  } catch (error) {
    console.error("CreateCoachNote Error:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la création de la note.",
    });
  }
}

// --- Modifier une note ---
export async function updateCoachNote(req: Request, res: Response) {
  try {
    const coachId = getCoachId(req);
    if (!coachId) {
      res.status(401).json({ message: "Non authentifié" });
      return;
    }

    const { noteId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      res.status(400).json({ message: "Le contenu de la note est requis." });
      return;
    }

    // Vérifier que la note appartient au coach
    const note = await prisma.coachNote.findFirst({
      where: {
        id: noteId,
        coachId,
      },
    });

    if (!note) {
      res.status(404).json({
        message: "Note non trouvée ou vous n'avez pas accès.",
      });
      return;
    }

    const updatedNote = await prisma.coachNote.update({
      where: { id: noteId },
      data: { content: content.trim() },
    });

    res.json(updatedNote);
  } catch (error) {
    console.error("UpdateCoachNote Error:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la mise à jour de la note.",
    });
  }
}

// --- Supprimer une note ---
export async function deleteCoachNote(req: Request, res: Response) {
  try {
    const coachId = getCoachId(req);
    if (!coachId) {
      res.status(401).json({ message: "Non authentifié" });
      return;
    }

    const { noteId } = req.params;

    // Vérifier que la note appartient au coach
    const note = await prisma.coachNote.findFirst({
      where: {
        id: noteId,
        coachId,
      },
    });

    if (!note) {
      res.status(404).json({
        message: "Note non trouvée ou vous n'avez pas accès.",
      });
      return;
    }

    await prisma.coachNote.delete({
      where: { id: noteId },
    });

    res.json({ message: "Note supprimée avec succès." });
  } catch (error) {
    console.error("DeleteCoachNote Error:", error);
    res.status(500).json({
      message: "Une erreur est survenue lors de la suppression de la note.",
    });
  }
}
