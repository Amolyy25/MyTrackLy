import React from "react";
import { Link, useLocation } from "react-router-dom";

const NotFound: React.FC = () => {
  const location = useLocation();

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-white to-indigo-50/30 px-4 overflow-hidden">
      {/* Background effects - Soft */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-50/30 rounded-full blur-3xl"></div>
      </div>

      <div className="text-center max-w-4xl mx-auto relative z-10">
        {/* Personnages Google style autour du 404 */}
        <div className="mb-2 relative">
          {/* Large 404 text avec personnages */}
          <div className="relative flex items-center justify-center">
            {/* Course - Gauche */}
            <div className="absolute -left-24 md:-left-16 lg:-left-20 top-1/2 -translate-y-1/2">
              <img 
                src="/icon/course.png" 
                alt="Course" 
                className="w-20 h-20 md:w-24 md:h-24 drop-shadow-md opacity-80"
              />
            </div>

            {/* Texte 404 */}
            <h1 className="text-[140px] md:text-[180px] font-black text-gray-900 leading-none relative z-10">
              404
            </h1>

            {/* Cyclisme - En haut */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12">
              <img 
                src="/icon/cyclisme.png" 
                alt="Cyclisme" 
                className="w-16 h-16 md:w-20 md:h-20 drop-shadow-md opacity-80"
              />
            </div>
            
            {/* Faire de l'exercice - Droite */}
            <div className="absolute -right-14 md:-right-20 lg:-right-24 top-1/2 -translate-y-1/2">
              <img 
                src="/icon/faire-de-lexercice.png" 
                alt="Exercice" 
                className="w-20 h-20 md:w-24 md:h-24 drop-shadow-md opacity-80"
              />
            </div>

          </div>
        </div>

        {/* Musculation - Entre le 404 et le message */}
        <div className="flex justify-center mb-2">
          <img 
            src="/icon/musculation.png" 
            alt="Musculation" 
            className="w-20 h-20 md:w-24 md:h-24 drop-shadow-md opacity-80"
          />
        </div>

        {/* Error message - Style doux */}
        <div className="mb-8">
          <p className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
            Page introuvable !
          </p>
          <p className="text-base md:text-lg text-gray-600">
            Cette page n'existe pas ou a été déplacée.
          </p>
          <p className="text-sm text-gray-500 mt-2 font-mono bg-gray-100/50 px-3 py-1 rounded-md inline-block">
            {location.pathname}
          </p>
        </div>

        {/* Action button - Style doux */}
        <div className="flex justify-center">
          <Link
            to="/"
            className="group relative px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-indigo-200/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
          >
            <span className="relative z-10 flex items-center space-x-2">
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span>Retour à l'accueil</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </Link>
        </div>
      </div>

      {/* Logo en bas */}
      <div className="absolute bottom-8 text-center">
        <Link
          to="/"
          className="text-sm text-gray-500 hover:text-indigo-600 transition-colors duration-200 font-semibold"
        >
          MyTrackLy
        </Link>
      </div>
    </div>
  );
};

export default NotFound;

