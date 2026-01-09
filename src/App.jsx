import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
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

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
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
        <Route path="availabilities" element={<CoachAvailabilities />} />
        {/* Routes non implémentées - affichent la page 404 */}
        <Route path="habits" element={<NotFound />} />
        <Route path="statistics" element={<NotFound />} />
        <Route path="programs" element={<NotFound />} />
        <Route path="chat" element={<NotFound />} />
        <Route path="messagerie" element={<NotFound />} />
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
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
