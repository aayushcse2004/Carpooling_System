import React from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Car, Users, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Logo from "@/components/ui/Logo";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

export default function RoleSelectionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 py-16 px-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        className="relative z-10 text-center max-w-4xl mx-auto w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="flex justify-center mb-6">
          <Logo size="lg" />
        </motion.div>

        <motion.h1
          className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight"
          variants={itemVariants}
        >
          Choose Your Journey
        </motion.h1>

        <motion.p
          className="text-slate-400 text-lg max-w-xl mx-auto mb-10"
          variants={itemVariants}
        >
          Join thousands of commuters sharing daily rides across verified routes in India. Select how you want to get started.
        </motion.p>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto"
          variants={containerVariants}
        >
          {/* Driver Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="cursor-pointer"
            onClick={() => navigate("/driver-register")}
          >
            <Card className="bg-slate-900/90 border-slate-800 hover:border-emerald-500/50 transition-all shadow-xl rounded-2xl h-full text-left p-6 flex flex-col justify-between group">
              <CardContent className="p-0">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Car className="w-7 h-7" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-white">Offer Rides</h2>
                  <span className="text-xs uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Driver
                  </span>
                </div>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  Have empty seats in your car? Publish routes, set seat costs, review passenger requests, and offset your travel expenses.
                </p>
                <div className="space-y-2 mb-6 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Publish scheduled or daily commute rides</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Accept or decline booking requests with 1-click</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Track earnings and cost-sharing balance</span>
                  </div>
                </div>
              </CardContent>
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-emerald-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                <span>Register as Driver</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Card>
          </motion.div>

          {/* Passenger Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="cursor-pointer"
            onClick={() => navigate("/register")}
          >
            <Card className="bg-slate-900/90 border-slate-800 hover:border-cyan-500/50 transition-all shadow-xl rounded-2xl h-full text-left p-6 flex flex-col justify-between group">
              <CardContent className="p-0">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-7 h-7" />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold text-white">Find a Ride</h2>
                  <span className="text-xs uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Passenger
                  </span>
                </div>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                  Looking for a comfortable, budget-friendly lift? Search verified city-to-city rides, view routes, and request seats instantly.
                </p>
                <div className="space-y-2 mb-6 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Search routes across 50+ verified cities</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Real-time route maps, distance & travel duration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                    <span>Instant booking request and status tracking</span>
                  </div>
                </div>
              </CardContent>
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-cyan-400 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                <span>Register as Passenger</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Existing Accounts Quick Switch */}
        <motion.div variants={itemVariants} className="mt-10 text-sm text-slate-400">
          Already have an account?{" "}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium hover:underline">
            Passenger Sign In
          </Link>
          <span className="mx-2 text-slate-600">•</span>
          <Link to="/driver-login" className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline">
            Driver Sign In
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
