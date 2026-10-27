import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, PlusCircle, LayoutDashboard, LogOut, Search, User } from "lucide-react";
import Logo from "@/components/ui/Logo";
import { toast } from "sonner";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const pathname = location.pathname;
  const navigate = useNavigate();

  const [driverId, setDriverId] = useState(sessionStorage.getItem("driverId"));
  const [userId, setUserId] = useState(sessionStorage.getItem("userId"));
  const isLoggedIn = !!(driverId || userId);

  useEffect(() => {
    setDriverId(sessionStorage.getItem("driverId"));
    setUserId(sessionStorage.getItem("userId"));
  }, [location]);

  useEffect(() => {
    const handleStorage = () => {
      setDriverId(sessionStorage.getItem("driverId"));
      setUserId(sessionStorage.getItem("userId"));
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem("token");
    setDriverId(null);
    setUserId(null);
    setIsOpen(false);
    toast.success("Logged out successfully");
    navigate("/");
  };

  const navItems = [
    { name: "Find a Ride", href: "/rides" },
    { name: "Offer a Ride", href: "/rider-dashboard/offer-ride" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-xl bg-slate-900/90 border-b border-white/10 shadow-lg text-white"
          : "bg-slate-900/80 backdrop-blur-md border-b border-white/5 text-white"
      }`}
      initial={{ y: -60 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.4 }}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Logo light={true} />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-7">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors duration-200 relative py-1 ${
                  pathname === item.href
                    ? "text-cyan-400 font-semibold"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {item.name}
                {pathname === item.href && (
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                    layoutId="activeTab"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Desktop Auth / User Controls */}
          <div className="hidden md:flex items-center gap-3">
            {!isLoggedIn ? (
              <>
                <Link to="/role-selection">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-slate-200 hover:text-white hover:bg-white/10 rounded-xl"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/rides">
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl shadow-md gap-1.5 font-medium"
                  >
                    <Search className="w-4 h-4" />
                    Explore Rides
                  </Button>
                </Link>
              </>
            ) : driverId ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/30">
                  Driver
                </span>
                <Link to="/rider-dashboard">
                  <Button 
                    variant="outline"
                    size="sm" 
                    className="border-white/20 text-white hover:bg-white/10 rounded-xl gap-1.5"
                  >
                    <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                    Dashboard
                  </Button>
                </Link>
                <Link to="/rider-dashboard/offer-ride">
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl gap-1.5 shadow-md"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Offer Ride
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-full border border-cyan-500/30">
                  Passenger
                </span>
                <Link to="/user-dashboard">
                  <Button 
                    variant="outline"
                    size="sm" 
                    className="border-white/20 text-white hover:bg-white/10 rounded-xl gap-1.5"
                  >
                    <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                    My Bookings
                  </Button>
                </Link>
                <Link to="/rides">
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white rounded-xl gap-1.5 shadow-md"
                  >
                    <Search className="w-4 h-4" />
                    Find Rides
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden fixed inset-0 top-16 bg-slate-950/95 backdrop-blur-2xl z-40 p-6 flex flex-col justify-between border-t border-white/10"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <div className="space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block text-lg font-medium p-3 rounded-xl transition-colors ${
                    pathname === item.href
                      ? "text-cyan-400 bg-white/5 border border-cyan-500/20"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="pt-6 border-t border-white/10 space-y-3">
              {!isLoggedIn ? (
                <>
                  <Link to="/role-selection" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full border-white/20 text-white rounded-xl py-2.5 mb-2">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/rides" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl py-2.5">
                      Find a Ride
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to={driverId ? "/rider-dashboard" : "/user-dashboard"} onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-xl py-2.5 mb-2 gap-2">
                      <LayoutDashboard className="w-4 h-4" />
                      {driverId ? "Driver Dashboard" : "Passenger Dashboard"}
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    className="w-full border-rose-500/30 text-rose-400 hover:bg-rose-500/10 rounded-xl py-2.5 gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
