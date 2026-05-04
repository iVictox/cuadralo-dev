"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronRight, Play } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import VideoBackground from "./VideoBackground";

export default function HeroSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0B0410]">
      {/* Video Background - ONLY in Hero section */}
      <div className="absolute inset-0 z-0">
        <VideoBackground />
        <div className="absolute inset-0 bg-[#0B0410]/50" />
      </div>

      {/* Floating hearts */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-cuadralo-pink/40 text-2xl"
            style={{
              left: `${Math.random() * 90}%`,
              top: `${Math.random() * 90}%`,
            }}
            animate={{
              y: [0, -120, 0],
              opacity: [0, 1, 0],
              scale: [0.5, 1.2, 0.5]
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          >
            ♥
          </motion.div>
        ))}
      </div>

      {/* Animated orbs behind content */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-5">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-10 w-20 h-20 bg-cuadralo-pink/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-40 right-20 w-32 h-32 bg-cuadralo-purple/10 rounded-full blur-xl"
        />
      </div>

      {/* Main content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-8 inline-block"
          >
            <Image
              src="/logo.svg"
              alt="Cuadralo"
              width={280}
              height={70}
              className="drop-shadow-2xl mx-auto"
              priority
            />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-xl sm:text-2xl text-white/80 mb-4 font-light"
          >
            La app para conocer gente y vivir experiencias épicas
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-base sm:text-lg text-white/60 mb-10 max-w-2xl mx-auto"
          >
            Conecta, chatea y descubre personas increíbles cerca de ti. La vibra que buscabas.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {isLoggedIn ? (
              <Link
                href="/app"
                className="group bg-gradient-to-r from-cuadralo-pink to-cuadralo-pinkDark text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-cuadralo-pink/25 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Play size={20} className="fill-current" />
                Acceder a la app
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link
                href="/register"
                className="group bg-gradient-to-r from-cuadralo-pink to-cuadralo-pinkDark text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-cuadralo-pink/25 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span className="animate-pulse">✨</span>
                Descubre Cuadralo
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="flex flex-wrap justify-center gap-8 text-sm text-white/50 mt-12"
          >
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-cuadralo-pink to-cuadralo-purple border-2 border-[#0B0410] flex items-center justify-center">
                    <span className="text-xs text-white font-bold">{i}</span>
                  </div>
                ))}
              </div>
              <span>+50K usuarios</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="text-yellow-400">★</div>
              ))}
              <span className="ml-1">4.8/5</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:block z-20"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2 text-white/30"
        >
          <span className="text-xs">Descubre más</span>
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-3 bg-cuadralo-pink rounded-full mt-2"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
