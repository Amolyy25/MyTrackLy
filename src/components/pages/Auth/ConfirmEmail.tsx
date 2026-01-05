import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import API_URL from "../../../config/api";

const ConfirmEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Token de confirmation manquant");
      setIsLoading(false);
      return;
    }

    const confirmEmail = async () => {
      try {
        const response = await fetch(
          `${API_URL}/email/confirm?token=${encodeURIComponent(
            token
          )}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Erreur lors de la confirmation");
          setIsLoading(false);
          return;
        }

        setSuccess(true);
        setIsLoading(false);

        // Rediriger vers le dashboard après 3 secondes
        setTimeout(() => {
          navigate("/dashboard");
        }, 3000);
      } catch (err) {
        setError("Erreur de connexion. Vérifiez votre connexion internet.");
        setIsLoading(false);
      }
    };

    confirmEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/logo.svg" alt="MyTrackLy" className="h-12 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Confirmation d'email
          </h1>
        </div>

        {/* Carte principale */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Confirmation en cours...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Erreur
              </h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link
                to="/login"
                className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-xl transition-colors"
              >
                Retour à la connexion
              </Link>
            </div>
          ) : success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Email confirmé !
              </h2>
              <p className="text-gray-600 mb-6">
                Votre adresse email a été confirmée avec succès. Vous allez être
                redirigé vers votre tableau de bord...
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : null}
        </div>

        {/* Retour à l'accueil */}
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-gray-600 hover:text-gray-700">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ConfirmEmail;
