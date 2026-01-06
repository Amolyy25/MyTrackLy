import React from "react";

interface ErrorDisplayProps {
  error: string | null | undefined;
  onRetry?: () => void | Promise<void>;
  fullScreen?: boolean;
  retryLabel?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  fullScreen = true,
  retryLabel,
}) => {
  const handleReload = async () => {
    if (onRetry) {
      try {
        await onRetry();
      } catch (err) {
        console.error("Error during retry:", err);
      }
    } else {
      window.location.reload();
    }
  };

  const buttonText = retryLabel || (onRetry ? "Réessayer" : "Recharger la page");

  const content = (
    <div className="text-center">
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-8 h-8 text-orange-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        Pas de panique, ça arrive ! 😊
      </h2>
      <p className="text-gray-600 mb-2">
        {error || "Une erreur est survenue lors du chargement des données."}
      </p>
      <p className="text-sm text-gray-500 mb-6">
        Essayez de recharger la page pour réessayer.
      </p>
      <button
        onClick={handleReload}
        className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/30 hover:shadow-xl hover:shadow-indigo-600/40"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
        {buttonText}
      </button>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        {content}
      </div>
    );
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
      {content}
    </div>
  );
};

export default ErrorDisplay;

