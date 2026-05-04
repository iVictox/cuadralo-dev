"use client";

import { motion } from "framer-motion";
import { Heart, Zap, Users } from "lucide-react";

const phrases = [
  {
    icon: Heart,
    text: "Swipe y conecta con gente real cerca de ti",
    color: "from-cuadralo-pink to-pink-500",
  },
  {
    icon: Zap,
    text: "Chatea, compartir y vive experiencias épicas",
    color: "from-cuadralo-purple to-purple-500",
  },
  {
    icon: Users,
    text: "La comunidad joven más grande de Venezuela",
    color: "from-blue-500 to-cuadralo-pink",
  },
];

export default function QueEsCuadralo() {
  return (
    <section className="py-20 bg-[#0B0410] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-cuadralo-pink/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-cuadralo-purple/5 rounded-full blur-3xl" />
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
            <Heart size={16} />
            ¿Qué es Cuadralo?
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
            La app social hecha para
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cuadralo-pink to-cuadralo-purple"> ti</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Conecta, haz amigos y vive experiencias épicas con jóvenes como tú.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {phrases.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2, ease: "easeOut" }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="relative group bg-[#150A21] rounded-3xl p-8 border border-white/10 hover:border-cuadralo-pink/30 transition-all duration-500 overflow-hidden text-center"
            >
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

              <div className="relative z-10">
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.5,
                  }}
                  className={`w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg`}
                >
                  <item.icon size={36} className="text-white" />
                </motion.div>
                <p className="text-lg text-white/80 font-medium leading-relaxed">
                  {item.text}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
