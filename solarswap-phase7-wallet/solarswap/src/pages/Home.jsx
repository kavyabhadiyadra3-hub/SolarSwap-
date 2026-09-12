import Hero from "../components/landing/Hero.jsx";
import Stats from "../components/landing/Stats.jsx";
import FinalCTA from "../components/landing/FinalCTA.jsx";

// The "/" route — trimmed to just Hero + Stats + CTA.
// Detailed sections (How It Works, Marketplace, About, Prosumer/Consumer)
// now live only on their own dedicated pages/routes.
export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <FinalCTA />
    </>
  );
}
