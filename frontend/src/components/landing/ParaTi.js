"use client";

import { motion } from "framer-motion";
import { Heart, MessageCircle, Shield, Star } from "lucide-react";

const benefits = [
  {
    icon: Heart,
    title: "Matches Reales",
    description: "Algoritmo inteligente que aprende lo que te gusta",
    gradient: "from-cuadralo-pink to-pink-500",
    emoji: "💘",
  },
  {
    icon: MessageCircle,
    title: "Chat Sin Límites",
    description: "Habla libremente cuando haya match",
    gradient: "from-cuadralo-purple to-purple-500",
    emoji: "💬",
  },
  {
    icon: Shield,
    title: "Verificación Facial",
    description: "Solo personas reales, nada de bots ni gatos",
    gradient: "from-green-400 to-emerald-500",
    emoji: "✅",
  },
  {
    icon: Star,
    title: "Premium Exclusivo",
    description: "Destaca tu perfil y aparece primero",
    gradient: "from-yellow-400 to-orange-500",
    emoji: "⭐",
  },
];

export default function ParaTi() {
  return (
    <section className="py-20 bg-[#150A21]/50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-72 h-72 bg-cuadralo-pink/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-cuadralo-purple/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-cuadralo-pink/10 text-cuadralo-pink px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Star size={16} />
            Para ti
          </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
            Todo lo que
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cuadralo-pink to-cuadralo-purple"> necesitas</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Todo lo que necesitas para conectar, compartir y vivir la vida al máximo.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="relative group bg-[#150A21] rounded-3xl p-6 border border-white/10 hover:border-cuadralo-pink/30 transition-all duration-500 overflow-hidden"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${benefit.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

              <div className="relative z-10 text-center">
                <div className="mb-4 text-4xl">{benefit.emoji}</div>
                <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${benefit.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <benefit.icon size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {benefit.title}
                </h3>
                <p className="text-white/60 text-sm">
                  {benefit.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
