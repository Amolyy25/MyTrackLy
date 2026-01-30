import React from 'react';
import { Dumbbell, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from "../../contexts/ThemeContext";

export const Footer = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();

    const footerSections = [
        {
            title: "Produit",
            links: [
                { label: "Fonctionnalités", path: "/#features" },
                { label: "Tarifs", path: "/features/pricing" },
                { label: "Coachs", path: "/features/coaching" },
            ]
        },
        {
            title: "Ressources",
            links: [
                { label: "Blog", path: "#" },
                { label: "Communauté", path: "#" },
                { label: "Aide", path: "#" },
            ]
        },
        {
            title: "Légal",
            links: [
                { label: "Confidentialité", path: "#" },
                { label: "CGU", path: "#" },
                { label: "Mentions légales", path: "#" },
            ]
        }
    ];

    return (
        <footer className={`py-16 border-t ${theme === 'dark' ? 'bg-slate-950 border-slate-900' : 'bg-slate-50 border-slate-200'}`}>
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="grid md:grid-cols-4 gap-12 mb-12">
                 {/* Brand */}
                 <div className="md:col-span-1">
                   <div className="flex items-center gap-3 mb-4">
                     <img src="/logo.svg" alt="MyTrackLy Logo" className="w-10 h-10" />
                     <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>MyTrackLy</span>
                   </div>
                   <p className="text-slate-500 text-sm mb-6">
                     La plateforme ultime pour les athlètes qui veulent progresser et les coachs qui veulent exceller.
                   </p>
                   <div className="flex gap-4">
                       {/* Socials Placeholders */}
                       <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                       <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                       <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800" />
                   </div>
                 </div>

                 {/* Links */}
                 {footerSections.map((section, idx) => (
                     <div key={idx}>
                         <h4 className={`font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{section.title}</h4>
                         <ul className="space-y-2">
                             {section.links.map((link, lIdx) => (
                                 <li key={lIdx}>
                                     <a 
                                        href={link.path} 
                                        className="text-slate-500 hover:text-indigo-500 transition-colors text-sm"
                                        onClick={(e) => {
                                            if(link.path.startsWith('/')) {
                                                e.preventDefault();
                                                navigate(link.path);
                                            }
                                        }}
                                     >
                                         {link.label}
                                     </a>
                                 </li>
                             ))}
                         </ul>
                     </div>
                 ))}
             </div>

             <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                 <p className="text-slate-500 text-sm">© 2026 MyTrackLy. Tous droits réservés.</p>
                 <div className="flex items-center gap-2 text-sm text-slate-500">
                     <span>Fait avec ❤️ par des passionnés</span>
                 </div>
             </div>
           </div>
        </footer>
    );
}
