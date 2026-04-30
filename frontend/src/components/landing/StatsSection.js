"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { Users, Heart, Star, TrendingUp } from "lucide-react";

function AnimatedCounter({ end, duration = 2000, suffix = "", decimals = 0 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      
      if (decimals > 0) {
        setCount((eased * end).toFixed(decimals));
      } else {
        setCount(Math.floor(eased * end));
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [isInView, end, duration, decimals]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

const stats = [
  {
    icon: Users,
    label: "Usuarios Activos",
    value: 50000,
    suffix: "+",
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: Heart,
    label: "Matches Creados",
    value: 100000,
    suffix: "+",
    color: "text-cuadralo-pink",
    bgColor: "bg-cuadralo-pink/10",
  },
  {
    icon: Star,
    label: "Calificación",
    value: 4.8,
    suffix: "/5",
    decimals: 1,
    color: "text-yellow-400",
    bgColor: "bg-yellow-500/10",
  },
];

export default function StatsSection() {
  return (
    <section className="py-20 bg-[#0f0518] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              whileHover={{ scale: 1.05 }}
              className="relative bg-[#150A21] rounded-3xl p-6 border border-white/10 hover:border-cuadralo-pink/30 transition-all duration-300 group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cuadralo-pink/5 to-purple-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${stat.bgColor} mb-4 group-hover:scale-110 transition-transform`}>
                  <stat.icon size={24} className={stat.color} />
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-white mb-1">
                  <AnimatedCounter end={stat.value} duration={2000} suffix={stat.suffix} decimals={stat.decimals || 0} />
                </h3>
                <p className="text-sm text-white/60">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
