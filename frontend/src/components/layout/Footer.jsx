import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/ui/Logo';
import { ShieldCheck, HeartHandshake, Leaf, Navigation } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative bg-slate-950 text-slate-300 border-t border-white/10 pt-16 pb-12 px-4 mt-20">
      <div className="max-w-6xl mx-auto">
        {/* Value Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 mb-12 border-b border-white/10">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">Verified Community</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Govt ID, vehicle registration, and phone verified profiles for trusted shared rides.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0 text-indigo-400">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">Fair Cost Sharing</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Split fuel and toll expenses transparently. No surge pricing, just cooperative commuting.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 text-emerald-400">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-1">Greener Commutes</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Fewer empty seats on the road means reduced urban congestion and lower carbon emissions.
              </p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <Logo light={true} />
            <p className="text-xs text-slate-400 leading-relaxed">
              Connecting daily commuters and intercity travelers for safer, affordable, and sustainable shared journeys.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/rides" className="hover:text-cyan-400 transition-colors">
                  Find a Ride
                </Link>
              </li>
              <li>
                <Link to="/rider-dashboard/offer-ride" className="hover:text-cyan-400 transition-colors">
                  Offer a Ride
                </Link>
              </li>
              <li>
                <Link to="/role-selection" className="hover:text-cyan-400 transition-colors">
                  Register / Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-cyan-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-cyan-400 transition-colors">
                  Commute Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-cyan-400 transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Safety & Legal */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Guidelines</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-cyan-400 transition-colors">
                  Community Standards
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-cyan-400 transition-colors">
                  Carpool Safety Rules
                </Link>
              </li>
              <li>
                <span className="text-slate-400 text-xs">
                  Zero Tolerance Safety & Emergency Guidelines
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Attribution & Copyright */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <p>© 2026 CommuteX Platform. Built for modern commuters.</p>
          <p className="text-slate-400">
            Open Source under the{" "}
            <a 
              href="https://opensource.org/licenses/MIT" 
              target="_blank" 
              rel="noreferrer" 
              className="text-slate-300 underline hover:text-white"
            >
              MIT License
            </a>
            . Original repository by{" "}
            <a 
              href="https://github.com/Nishant-0203/carpooling" 
              target="_blank" 
              rel="noreferrer" 
              className="text-slate-300 underline hover:text-white"
            >
              Nishant Bhalla
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
