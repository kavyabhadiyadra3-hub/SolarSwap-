import { Link } from "react-router-dom";
import { Sun } from "lucide-react";

const FOOTER_LINKS = [
  { label: "Home", to: "/" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "Marketplace", to: "/marketplace" },
  { label: "About", to: "/about" },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-solar-400 to-eco-500 flex items-center justify-center">
              <Sun className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-ink-900">SolarSwap</span>
          </div>

          <nav className="flex flex-wrap justify-center gap-6 text-sm text-slate-600">
            {FOOTER_LINKS.map((link) => (
              <Link key={link.to} to={link.to} className="hover:text-eco-600 transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="border-t border-slate-100 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <span>© 2026 SolarSwap. College Hackathon Project.</span>
          <span>Simulated peer-to-peer energy trading — not a real electricity/payment system.</span>
        </div>
      </div>
    </footer>
  );
}
