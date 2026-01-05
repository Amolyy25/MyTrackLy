import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img src="/logo.svg" alt="MyTrackLy" className="h-10 w-auto" />
              <span className="text-xl font-bold text-gray-900">MyTrackLy</span>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              La solution moderne pour suivre et améliorer vos performances
              sportives
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Produit</h4>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>
                <a
                  href="#features"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Fonctionnalités
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="hover:text-indigo-600 transition-colors"
                >
                  Tarifs
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600 transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600 transition-colors">
                  Nouveautés
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Ressources</h4>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>
                <a href="#" className="hover:text-indigo-600 transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600 transition-colors">
                  Guides
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600 transition-colors">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600 transition-colors">
                  API
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-gray-900">Support</h4>
            <ul className="space-y-2 text-gray-600 text-sm">
              <li>
                <a href="#" className="hover:text-indigo-600 transition-colors">
                  Aide
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600 transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600 transition-colors">
                  Partenariats
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-600 transition-colors">
                  À propos
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; 2025 MyTrackLy. Tous droits réservés.
          </p>
          <div className="flex space-x-6 text-sm text-gray-500">
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Mentions légales
            </a>
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Confidentialité
            </a>
            <a href="#" className="hover:text-indigo-600 transition-colors">
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
