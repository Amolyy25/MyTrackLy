import { useEffect } from "react";
import { PricingSection } from "./main";
import { GlobalStyle, Nav, BigFooter } from "./kit";

export default function PlansPage() {
  // Scroll en haut au montage
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="crn-root min-h-screen overflow-x-hidden antialiased">
      <GlobalStyle />
      <Nav />
      <main className="pt-10">
        <PricingSection />
      </main>
      <BigFooter />
    </div>
  );
}
