/**
 * Utilitaires pour les emails
 */

/**
 * Formate une date en français pour les emails
 * Exemple: "15 janvier 2025"
 */
export function formatDateFrench(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Formate une date avec l'heure en français
 * Exemple: "15 janvier 2025 à 14:30"
 */
export function formatDateTimeFrench(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Messages intelligents basés sur le goalType et weightChange
 * Reprend la logique de Home.tsx (frontend)
 */
export function getGoalMessage(
  goalType: string | null,
  weightChange: number | null
): { message: string; color: "green" | "orange" } | null {
  if (!goalType || weightChange === null) return null;

  const goalMessages = {
    weight_loss: {
      positive: "Bien joué ! Vous avez perdu du poids",
      negative: "Pas de panique, la progression n'est pas toujours linéaire !",
    },
    weight_gain: {
      positive: "Excellent ! Vous avez pris du poids",
      negative: "Pas de panique, la progression n'est pas toujours linéaire !",
    },
    muscle_gain: {
      positive: "Super ! Votre progression est au rendez-vous.",
      negative: "Continuez vos efforts, la masse musculaire prend du temps.",
    },
    maintenance: {
      positive: "Votre poids est stable. Parfait pour maintenir votre forme !",
      negative: "Votre poids fluctue légèrement. C'est normal.",
    },
  };

  const messages = goalMessages[goalType as keyof typeof goalMessages];
  if (!messages) return null;

  const isPositive =
    (goalType === "weight_loss" && weightChange < 0) ||
    (goalType === "weight_gain" && weightChange > 0) ||
    goalType === "muscle_gain" ||
    (goalType === "maintenance" && Math.abs(weightChange) < 1);

  const baseMessage = isPositive ? messages.positive : messages.negative;

  // Ajouter le changement de poids si applicable
  let message = baseMessage;
  if (weightChange !== 0 && goalType !== "muscle_gain") {
    message += ` ${Math.abs(weightChange).toFixed(1)}kg ce mois`;
  }

  return {
    message,
    color: isPositive ? "green" : "orange",
  };
}

/**
 * Calcule les statistiques simplifiées pour un utilisateur
 * Version allégée de getTrainingStats pour les emails
 */
export async function calculateSimpleStats(userId: string, prisma: any) {
  // Statistiques de base
  const totalSessions = await prisma.trainingSession.count({
    where: { userId },
  });

  // Streak (jours consécutifs)
  const sortedSessions = await prisma.trainingSession.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    select: { date: true },
  });

  let currentStreak = 0;
  if (sortedSessions.length > 0) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let checkDate = new Date(sortedSessions[0].date);
    checkDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor(
      (today.getTime() - checkDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff <= 1) {
      currentStreak = 1;
      for (let i = 1; i < sortedSessions.length; i++) {
        const prevDate = new Date(sortedSessions[i - 1].date);
        prevDate.setHours(0, 0, 0, 0);

        const currDate = new Date(sortedSessions[i].date);
        currDate.setHours(0, 0, 0, 0);

        const diff = Math.floor(
          (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diff === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }

  // Fréquence hebdomadaire (4 dernières semaines)
  const fourWeeksAgo = new Date();
  fourWeeksAgo.setDate(fourWeeksAgo.getDate() - 28);

  const recentSessions = await prisma.trainingSession.count({
    where: {
      userId,
      date: {
        gte: fourWeeksAgo,
      },
    },
  });

  const weeklyFrequency = recentSessions / 4;

  // Récupérer le dernier poids et weightChange
  // Note: Utilisation de (prisma as any) pour éviter les erreurs TypeScript si le client Prisma n'est pas à jour
  const latestMeasurement = await (prisma as any).measurement.findFirst({
    where: {
      userId,
      bodyWeightKg: { not: null },
    },
    orderBy: { date: "desc" },
    select: { bodyWeightKg: true, date: true },
  });

  const latestWeight = latestMeasurement?.bodyWeightKg ?? null;

  let weightChange: number | null = null;
  if (latestWeight) {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const previousMeasurement = await (prisma as any).measurement.findFirst({
      where: {
        userId,
        bodyWeightKg: { not: null },
        date: { lte: oneMonthAgo },
      },
      orderBy: { date: "desc" },
      select: { bodyWeightKg: true },
    });

    if (previousMeasurement?.bodyWeightKg) {
      weightChange = latestWeight - previousMeasurement.bodyWeightKg;
    }
  }

  return {
    totalSessions,
    currentStreak,
    weeklyFrequency: weeklyFrequency.toFixed(1),
    latestWeight,
    weightChange,
  };
}

