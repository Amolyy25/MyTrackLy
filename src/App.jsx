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
        <Route
          path="measurements"
          element={
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900">Mensurations</h2>
              <p className="mt-2 text-gray-600">À venir...</p>
            </div>
          }
        />
        <Route
          path="habits"
          element={
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900">Habitudes</h2>
              <p className="mt-2 text-gray-600">À venir...</p>
            </div>
          }
        />
        <Route
          path="statistics"
          element={
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900">Statistiques</h2>
              <p className="mt-2 text-gray-600">À venir...</p>
            </div>
          }
        />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to="/" replace />} />
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
