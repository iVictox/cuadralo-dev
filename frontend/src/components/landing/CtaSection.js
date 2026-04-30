"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Heart, ChevronRight, Users, Star } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="py-20 bg-gradient-to-br from-[#0B0410] via-[#1a0a2e] to-[#0B0410] relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cuadralo-pink/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-cuadralo-purple/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Floating icons */}
          <div className="flex justify-center gap-8 mb-8">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="w-16 h-16 bg-cuadralo-pink/20 rounded-2xl flex items-center justify-center"
            >
              <Heart size={28} className="text-cuadralo-pink fill-current" />
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              className="w-16 h-16 bg-cuadralo-purple/20 rounded-2xl flex items-center justify-center"
            >
              <Users size={28} className="text-cuadralo-purple" />
            </motion.div>
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.75 }}
              className="w-16 h-16 bg-yellow-400/20 rounded-2xl flex items-center justify-center"
            >
              <Star size={28} className="text-yellow-400 fill-current" />
            </motion.div>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6">
            ¿Listo para encontrar a
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cuadralo-pink to-cuadralo-purple"> alguien especial</span>?
          </h2>

          <p className="text-lg text-white/60 mb-8 max-w-2xl mx-auto">
            Únete a miles de personas en Venezuela que ya están conectando en Cuadralo Club. Es rápido y seguro.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="group bg-gradient-to-r from-cuadralo-pink to-cuadralo-pinkDark text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-cuadralo-pink/25 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Heart size={20} className="fill-current" />
              Registrarse Gratis
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/login"
              className="bg-white/5 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 border border-white/10"
            >
              Iniciar Sesión
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
