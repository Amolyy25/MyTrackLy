import React, { useEffect } from "react";
import { ThemeProvider } from "../../../contexts/ThemeContext";
import { PricingSection } from "./main";
import { Navbar } from "../../landing/Navbar";
import { Footer as FooterComponent } from "../../landing/Footer";
import { useTheme } from "../../../contexts/ThemeContext";

const PlansPageContent = () => {
  const { theme } = useTheme();

  // On scroll top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-slate-50 text-slate-900'} overflow-x-hidden selection:bg-indigo-500/30`}>
      <Navbar />
      <div className="pt-20">
         <PricingSection theme={theme} />
      </div>
      <FooterComponent />
    </div>
  );
};

export default function PlansPage() {
  return (
    <ThemeProvider>
      <PlansPageContent />
    </ThemeProvider>
  );
}
