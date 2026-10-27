import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Shield, Users, MapPin, Zap, CheckCircle2 } from 'lucide-react';

const WhyCommuteX = () => {
  const features = [
    {
      icon: MapPin,
      title: 'Smart Commuter Matching',
      description: 'Easily discover fellow commuters traveling along your daily route with verified pickup points.',
      color: 'from-emerald-400 to-teal-500',
    },
    {
      icon: Shield,
      title: 'Verified Driver & Rider Profiles',
      description: 'Vehicle checks and profile authentications prioritize passenger and driver safety.',
      color: 'from-blue-400 to-cyan-500',
    },
    {
      icon: Zap,
      title: 'Transparent Split Fares',
      description: 'Fair per-seat cost contributions calculated by distance. No surprise surge multipliers.',
      color: 'from-indigo-400 to-purple-500',
    },
    {
      icon: Users,
      title: 'Community Safety & SOS',
      description: 'Share journey status with close contacts and travel with peace of mind every kilometer.',
      color: 'from-amber-400 to-rose-500',
    }
  ];

  const highlights = [
    { label: 'Real-time Seat Tracking', desc: 'Automatic seat decrementing prevents overbooking.' },
    { label: 'Instant Approval Workflow', desc: 'Drivers can review passenger requests seamlessly.' },
    { label: 'Cleaner Air, Less Traffic', desc: 'Reduce urban single-occupancy vehicles.' },
    { label: 'Zero Platform Hidden Fees', desc: 'Direct driver-passenger cooperative model.' }
  ];

  return (
    <section id="why-commutex" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Section Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-widest block mb-2">
            Engineered for Modern Mobility
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Why Choose <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">CommuteX</span>?
          </h2>
          <p className="text-lg text-slate-300 font-light max-w-2xl mx-auto">
            Experience reliable, pocket-friendly, and eco-conscious daily commutes with verified community drivers.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="glass p-6 rounded-2xl border-white/10 hover:border-cyan-400/30 transition-all duration-300 h-full flex flex-col justify-between">
                  <div>
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${feature.color} flex items-center justify-center text-slate-950 mb-5 shadow-lg`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-slate-300 text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Key Highlights Banner */}
        <div className="glass p-6 md:p-8 rounded-2xl border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((h, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-white mb-0.5">{h.label}</h4>
                <p className="text-xs text-slate-400 leading-normal">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyCommuteX;
