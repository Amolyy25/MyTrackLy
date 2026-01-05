import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleStartClick = () => {
    navigate("/plans");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3">
            <img src="/logo.svg" alt="MyTrackLy" className="h-10 w-auto" />
            <span className="text-xl font-bold text-gray-900">MyTrackLy</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#features"
              className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
            >
              Fonctionnalités
            </a>
            <a
              href="#benefits"
              className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
            >
              Avantages
            </a>
            <a
              href="#testimonials"
              className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
            >
              Témoignages
            </a>
            <a
              href="#pricing"
              className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
            >
              Tarifs
            </a>
            <a
              href="#faq"
              className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
            >
              FAQ
            </a>
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:shadow-indigo-600/40"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <button
                  onClick={handleLoginClick}
                  className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
                >
                  Connexion
                </button>
                <button
                  onClick={handleStartClick}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-semibold transition-all shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:shadow-indigo-600/40"
                >
                  Commencer
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
