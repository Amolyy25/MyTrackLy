import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import "./App.css";

// Pages
import LandingPage from "./components/pages/landingpage/main";
import {
  Login,
  Register,
  EmailConfirmation,
  ConfirmEmail,
  ForgotPassword,
  ResetPassword,
} from "./components/pages/Auth";
import Plans from "./components/pages/Plans";
import Payment from "./components/pages/Payment";
import DashboardLayout from "./components/layout/DashboardLayout";
import Home from "./components/pages/dashboard/Home";
import StudentHome from "./components/pages/dashboard/student/StudentHome";
import CoachHome from "./components/pages/dashboard/coach/CoachHome";
import Students from "./components/pages/dashboard/coach/Students";
import Sessions from "./components/pages/dashboard/coach/Sessions";
import NewTrainingSession from "./components/pages/dashboard/NewTrainingSession";
import TrainingHistory from "./components/pages/dashboard/TrainingHistory";
import Measurements from "./components/pages/dashboard/Measurements";
import MeasurementsCoach from "./components/pages/dashboard/coach/MeasurementsCoach";
import ProfilePage from "./components/pages/dashboard/ProfilePage";
import SettingsPage from "./components/pages/dashboard/SettingsPage";
import StudentReservations from "./components/pages/dashboard/student/Reservations";
import CoachReservations from "./components/pages/dashboard/coach/Reservations";
import CoachAvailabilities from "./components/pages/dashboard/coach/Availabilities";
import NotFound from "./components/pages/NotFound";

// Component to redirect to the correct dashboard based on user role
const DashboardHome = () => {
  const { user } = useAuth();
  const userRole = user?.role || "personnel";

  if (userRole === "eleve") {
    return <StudentHome />;
  } else if (userRole === "coach") {
    return <CoachHome />;
  } else {
    return <Home />;
  }
};

// Component to redirect to the correct measurements page based on user role
const MeasurementsPage = () => {
  const { user } = useAuth();
  const userRole = user?.role || "personnel";

  if (userRole === "coach") {
    return <MeasurementsCoach />;
  } else {
    return <Measurements />;
  }
};

// Component to redirect to the correct reservations page based on user role
const ReservationsPage = () => {
  const { user } = useAuth();
  const userRole = user?.role || "personnel";

  if (userRole === "coach") {
    return <CoachReservations />;
  }

  if (userRole === "eleve") {
    return <StudentReservations />;
  }

  return <NotFound />;
};

// Component for calendar (coach only for now)
const CalendarPage = () => {
  const { user } = useAuth();
  const userRole = user?.role || "personnel";

  if (userRole === "coach") {
    return <CoachReservations />;
  }

  return <Navigate to="/dashboard" replace />;
};

// Soon Component for unimplemented features
const SoonPage = ({ title }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{title}</h1>
        <p className="text-muted-foreground">
          Cette fonctionnalité arrive bientôt. Restez connecté !
        </p>
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-sm font-medium text-primary">En développement</span>
        </div>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />
      <Route path="/email-confirmation" element={<EmailConfirmation />} />
      <Route path="/confirm-email" element={<ConfirmEmail />} />
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />
      <Route path="/plans" element={<Plans />} />
      <Route path="/payment" element={<Payment />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="students" element={<Students />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="training/new" element={<NewTrainingSession />} />
        <Route path="training/history" element={<TrainingHistory />} />
        <Route path="measurements" element={<MeasurementsPage />} />
        <Route path="reservations" element={<ReservationsPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="availabilities" element={<CoachAvailabilities />} />
        {/* Profile & Settings */}
        <Route path="profile" element={<ProfilePage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="habits" element={<SoonPage title="Habitudes" />} />
        <Route path="statistics" element={<SoonPage title="Statistiques" />} />
        <Route path="programs" element={<SoonPage title="Programmes" />} />
        <Route path="chat" element={<SoonPage title="Discussion" />} />
        <Route path="messagerie" element={<SoonPage title="Messagerie" />} />
        {/* 404 pour les routes non définies dans le dashboard */}
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* 404 - Catch all unmatched routes */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
