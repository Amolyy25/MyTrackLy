import React from "react";

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
  size?: "sm" | "md" | "lg";
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Chargement...",
  fullScreen = true,
  size = "md",
}) => {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  const spinner = (
    <div className="text-center">
      <div
        className={`animate-spin rounded-full border-b-2 border-indigo-600 mx-auto mb-4 ${sizeClasses[size]}`}
      />
      {message && <p className="text-gray-600">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">{spinner}</div>
  );
};

export default LoadingSpinner;

