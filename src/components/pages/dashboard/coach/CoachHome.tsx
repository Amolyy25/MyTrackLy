import React, { useState, useEffect } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
import { useCoachStudentsSessions } from "../../../../hooks/useTrainingSessions";
import { useMyReservations } from "../../../../hooks/useCalendarReservations";
import { useStudentMeasurements } from "../../../../hooks/useMeasurements";
import { calculateTotalVolume } from "../../../../utils/trainingCalculations";
import LoadingSpinner from "../../../composants/LoadingSpinner";
import ErrorDisplay from "../../../composants/ErrorDisplay";
import API_URL from "../../../../config/api";
import { Ruler } from "lucide-react";

// New Dashboard Components
import { HeroSection } from "../../dashboard-new/hero-section";
import { StatsCards } from "../../dashboard-new/stats-cards";
import {
  RecentActivity,
  ActivitySession,
} from "../../dashboard-new/recent-activity";
import {
  Measurements,
  WeightPoint,
  MeasurementItem,
} from "../../dashboard-new/measurements";
import { StatisticsCard } from "../../dashboard-new/statistics-card";

interface Student {
  id: string;
  name: string;
  email: string;
}

const CoachHome: React.FC = () => {
  const { user, token } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);

  // Récupérer les élèves
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`${API_URL}/students`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStudents(data);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des élèves:", err);
      } finally {
        setLoadingStudents(false);
      }
    };

    if (token) {
      fetchStudents();
    }
  }, [token]);

  // Récupérer les séances des élèves
  const {
    sessions: studentSessions,
    isLoading: isLoadingSessions,
    error: errorSessions,
  } = useCoachStudentsSessions({});

  // Récupérer les réservations
  const {
    reservations,
    isLoading: isLoadingReservations,
    error: errorReservations,
  } = useMyReservations({});

  // Récupérer les mensurations du premier élève (le plus récemment actif)
  const lastActiveStudentId = students.length > 0 ? students[0].id : "";
  const {
    measurements: studentMeasurements,
    isLoading: isLoadingMeasurements,
  } = useStudentMeasurements(lastActiveStudentId);

  // Loading state
  if (loadingStudents || isLoadingSessions || isLoadingReservations) {
    return <LoadingSpinner />;
  }

  // Error state
  if (errorSessions || errorReservations) {
    return (
      <ErrorDisplay
        error={errorSessions || errorReservations || "Une erreur est survenue"}
      />
    );
  }

  // --- Data Transformation ---

  // 1. Réservations à venir (confirmées ou en attente)
  const now = new Date();
  const upcomingReservations = reservations.filter((r) => {
    const startDate = new Date(r.startDateTime);
    return (
      startDate > now && (r.status === "confirmed" || r.status === "pending")
    );
  });

  // 2. Stats Cards Data
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const sessionsThisMonth = studentSessions.filter((s) => {
    const d = new Date(s.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  // Calculer le volume total des séances élèves
  const totalVolume = studentSessions.reduce(
    (acc, session) => acc + calculateTotalVolume(session),
    0
  );

  const totalVolumeStr =
    totalVolume > 1000
      ? `${(totalVolume / 1000).toFixed(1)}T`
      : `${totalVolume.toFixed(0)}kg`;

  const statsData = {
    sessionsThisMonth,
    totalVolume: totalVolumeStr,
    streakDays: 0,
    weekActivity: [false, false, false, false, false, false, false],
    studentsCount: students.length,
    upcomingReservations: upcomingReservations.length,
  };

  // 3. Recent Activity Data - Combiner séances et réservations
  const recentActivities: ActivitySession[] = [];

  // Ajouter les séances récentes
  studentSessions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)
    .forEach((session) => {
      const sessionDate = new Date(session.date);
      recentActivities.push({
        id: session.id,
        date: sessionDate.toLocaleString("fr-FR", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
        name: session.notes || "Séance d'entraînement",
        exercises: session.exercises.length,
        duration: session.durationMinutes
          ? `${session.durationMinutes} min`
          : "-",
        volume: `${Math.round(calculateTotalVolume(session))} kg`,
        status: "completed",
        studentName: session.user?.name || "Élève",
        type: "training",
        timestamp: sessionDate.getTime(),
      });
    });

  // Ajouter les réservations à venir
  upcomingReservations
    .sort(
      (a, b) =>
        new Date(a.startDateTime).getTime() -
        new Date(b.startDateTime).getTime()
    )
    .slice(0, 3)
    .forEach((reservation) => {
      const reservationDate = new Date(reservation.startDateTime);
      recentActivities.push({
        id: reservation.id,
        date: reservationDate.toLocaleString("fr-FR", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }),
        name: reservation.sessionType || "Séance coaching",
        exercises: 0,
        duration: "-",
        volume: "-",
        status: reservation.status as "confirmed" | "pending",
        studentName: reservation.student?.name || "Élève",
        type: "reservation",
        timestamp: reservationDate.getTime(),
      });
    });

  // Trier par type (réservations en premier), puis par date (plus récent en premier)
  recentActivities.sort((a, b) => {
    // Priorité aux réservations à venir, puis aux séances récentes
    if (a.type === "reservation" && b.type !== "reservation") return -1;
    if (b.type === "reservation" && a.type !== "reservation") return 1;
    // Tri secondaire par date (plus récent en premier)
    const timestampA = a.timestamp || 0;
    const timestampB = b.timestamp || 0;
    return timestampB - timestampA;
  });

  // 4. Measurements Data - Du premier élève
  const sortedMeasurements = [...studentMeasurements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const weightDataPoints: WeightPoint[] = sortedMeasurements
    .filter((m) => m.bodyWeightKg)
    .slice(0, 7)
    .reverse()
    .map((m) => ({
      day: new Date(m.date).toLocaleDateString("fr-FR", { day: "numeric" }),
      weight: m.bodyWeightKg || 0,
    }));

  const latestMeasurement = sortedMeasurements[0];
  const currentWeight = latestMeasurement?.bodyWeightKg || 0;
  const previousWeight = sortedMeasurements[1]?.bodyWeightKg || currentWeight;
  const weightChange = parseFloat((currentWeight - previousWeight).toFixed(1));

  const measurementItems: MeasurementItem[] = [];
  if (latestMeasurement) {
    if (latestMeasurement.waistCm) {
      measurementItems.push({
        label: "Tour de taille",
        value: `${latestMeasurement.waistCm} cm`,
        change: "0 cm",
        positive: true,
        icon: Ruler,
      });
    }
  }

  const lastActiveStudent = students.find((s) => s.id === lastActiveStudentId);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <HeroSection
        userName={user?.name || "Coach"}
        sessionsThisMonth={sessionsThisMonth}
        role="coach"
        studentsCount={students.length}
        upcomingReservations={upcomingReservations.length}
      />

      <StatsCards stats={statsData} role="coach" />

      <div className="px-4 lg:px-8">
        <StatisticsCard
          sessions={studentSessions}
          measurements={studentMeasurements}
          role="coach"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3 px-4 lg:px-8">
        <div className="lg:col-span-2">
          <RecentActivity
            sessions={recentActivities.slice(0, 5)}
            title="Activité récente"
            viewAllLink="/dashboard/sessions"
            emptyMessage="Aucune activité récente de vos élèves"
            role="coach"
          />
        </div>
        <div>
          {isLoadingMeasurements ? (
            <div className="flex items-center justify-center h-64">
              <LoadingSpinner />
            </div>
          ) : (
            <Measurements
              weightData={weightDataPoints}
              measurements={measurementItems}
              currentWeight={currentWeight}
              weightChange={weightChange}
              role="coach"
              studentName={lastActiveStudent?.name}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CoachHome;
