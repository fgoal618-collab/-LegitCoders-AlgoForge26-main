import { Link } from "react-router";
import { MapPin, Github, Heart, Mail } from "lucide-react";
import { transitLines } from "../data/transitData";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 rounded-t-[3rem] mt-20 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-brand-primary/20 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 bg-brand-primary rounded-full flex items-center justify-center shadow-lg shadow-brand-primary/20 group-hover:scale-110 transition-transform">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-white tracking-tighter">Transit<span className="text-brand-primary">Twin</span></span>
            </Link>
            <p className="text-[11px] font-bold text-gray-500 leading-relaxed uppercase tracking-widest">
              Smart multi-modal transit architecture for Mumbai. Compare routes, save money, and commute with intelligence.
            </p>
          </div>

          {/* Navigate */}
          <div>
            <h3 className="text-[10px] font-black text-white mb-6 uppercase tracking-[0.2em]">Navigate</h3>
            <ul className="space-y-3 text-[11px] font-black uppercase tracking-widest">
              <li><Link to="/" className="text-gray-500 hover:text-brand-primary transition-colors">Home Intelligence</Link></li>
              <li><Link to="/routes" className="text-gray-500 hover:text-brand-primary transition-colors">Route Planning</Link></li>
              <li><Link to="/trips" className="text-gray-500 hover:text-brand-primary transition-colors">Journey History</Link></li>
              <li><Link to="/profile" className="text-gray-500 hover:text-brand-primary transition-colors">User Profile</Link></li>
            </ul>
          </div>

          {/* Lines */}
          <div>
            <h3 className="text-[10px] font-black text-white mb-6 uppercase tracking-[0.2em]">Active Lines</h3>
            <ul className="space-y-4">
              {transitLines.map((line) => (
                <li key={line.id} className="flex items-center gap-3">
                  <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: line.color }} />
                  <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{line.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Data */}
          <div>
            <h3 className="text-[10px] font-black text-white mb-6 uppercase tracking-[0.2em]">Platform Stats</h3>
            <div className="bg-white/5 border border-white/10 rounded-[2rem] p-6 space-y-4">
              <div>
                <p className="text-2xl font-black text-brand-primary tracking-tighter">53</p>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Strategic Stations</p>
              </div>
              <div className="h-px bg-white/5" />
              <div>
                <p className="text-2xl font-black text-brand-success tracking-tighter">3</p>
                <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Active Networks</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-20 pt-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
            Made with <Heart className="w-3 h-3 text-brand-cta fill-brand-cta" /> for Mumbai Architecture
          </p>
          <div className="flex items-center gap-6">
            <Link to="#" className="text-gray-500 hover:text-white transition-colors"><Github className="w-4 h-4" /></Link>
            <Link to="#" className="text-gray-500 hover:text-white transition-colors"><Mail className="w-4 h-4" /></Link>
          </div>
          <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">© 2026 TransitTwin. Real Mumbai Transit Data.</p>
        </div>
      </div>
    </footer>
  );
}
