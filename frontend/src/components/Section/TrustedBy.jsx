import React from 'react';
import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

const TrustedBy = () => {
  const corridors = [
    { name: 'Delhi NCR', route: 'Delhi - Gurgaon - Noida' },
    { name: 'Tricity', route: 'Chandigarh - Mohali - Panchkula' },
    { name: 'Mumbai MMR', route: 'Mumbai - Thane - Navi Mumbai' },
    { name: 'Bengaluru', route: 'Electronic City - Whitefield' },
    { name: 'Hyderabad', route: 'Hitech City - Gachibowli' },
    { name: 'Pune', route: 'Hinjewadi - Shivaji Nagar' },
  ];

  return (
    <section className="py-12 px-4 border-y border-white/10 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest">
            Popular Commuter Corridors & Regions
          </h2>
        </motion.div>

        {/* Corridor Badges */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {corridors.map((corridor, index) => (
            <motion.div
              key={corridor.name}
              className="glass p-3 rounded-xl text-center group hover:border-cyan-500/50 transition-all duration-300"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              viewport={{ once: true }}
              whileHover={{ y: -3 }}
            >
              <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span className="text-sm font-semibold text-white">{corridor.name}</span>
              </div>
              <p className="text-[11px] text-gray-400 truncate">{corridor.route}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default TrustedBy;
