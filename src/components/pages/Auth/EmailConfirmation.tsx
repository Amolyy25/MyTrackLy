import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import API_URL from "../../../config/api";

const EmailConfirmation: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate("/register");
      return;
    }

    // Envoyer l'email de confirmation automatiquement
    const sendConfirmationEmail = async () => {
      try {
        const response = await fetch(
          `${API_URL}/email/sendEmailConfirmation`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Erreur lors de l'envoi de l'email");
          setIsLoading(false);
          return;
        }

        // Afficher la notification
        setIsLoading(false);
        setShowNotification(true);

        // Masquer la notification après 5 secondes
        setTimeout(() => {
          setShowNotification(false);
        }, 5000);
      } catch (err) {
        setError("Erreur de connexion. Vérifiez votre connexion internet.");
        setIsLoading(false);
      }
    };

    sendConfirmationEmail();
  }, [email, navigate]);

  const handleResendEmail = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${API_URL}/email/sendEmailConfirmation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Erreur lors de l'envoi de l'email");
        setIsLoading(false);
        return;
      }

      setIsLoading(false);
      setShowNotification(true);

      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    } catch (err) {
      setError("Erreur de connexion. Vérifiez votre connexion internet.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center px-4 py-12">
      {/* Notification Toast */}
      <div
        className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
          showNotification
            ? "translate-y-0 opacity-100"
            : "translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 px-6 py-4 flex items-center gap-3 min-w-[320px] max-w-md">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <svg
                className="w-5 h-5 text-green-600"
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
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">
              Email envoyé !
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              Vérifiez votre boîte de réception
            </p>
          </div>
          <button
            onClick={() => setShowNotification(false)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-5 h-5"
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
          </button>
        </div>
      </div>

      <div className="max-w-md w-full">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/logo.svg" alt="MyTrackLy" className="h-12 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Confirmez votre email
          </h1>
          <p className="text-gray-600">
            Nous avons envoyé un email de confirmation
          </p>
        </div>

        {/* Carte principale */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Envoi de l'email en cours...</p>
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
              <button
                onClick={handleResendEmail}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-xl transition-colors"
              >
                Réessayer
              </button>
            </div>
          ) : (
            <>
              {/* Icône email */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-indigo-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Vérifiez votre boîte de réception
                </h2>
                <p className="text-gray-600 mb-2">
                  Nous avons envoyé un email de confirmation à
                </p>
                <p className="text-indigo-600 font-semibold">{email}</p>
              </div>

              {/* Instructions */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Prochaines étapes :
                </h3>
                <ol className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-semibold">
                      1
                    </span>
                    <span>
                      Ouvrez votre boîte de réception et cherchez l'email de
                      MyTrackLy
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-semibold">
                      2
                    </span>
                    <span>
                      Cliquez sur le bouton "Confirmer mon email" dans l'email
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-semibold">
                      3
                    </span>
                    <span>
                      Vous serez automatiquement redirigé vers votre tableau de
                      bord
                    </span>
                  </li>
                </ol>
              </div>

              {/* Bouton renvoyer */}
              <div className="space-y-4">
                <button
                  onClick={handleResendEmail}
                  disabled={isLoading}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Envoi..." : "Renvoyer l'email"}
                </button>

                <div className="text-center">
                  <Link
                    to="/login"
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
                  >
                    Retour à la connexion
                  </Link>
                </div>
              </div>
            </>
          )}
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

export default EmailConfirmation;



