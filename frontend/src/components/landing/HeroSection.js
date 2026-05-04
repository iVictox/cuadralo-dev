"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Play, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function HeroSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0B0410]">
      {/* Video Background with overlay */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-30"
        >
          <source src="/videos/dating-vibes.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B0410]/80 via-[#0B0410]/60 to-[#0B0410]" />
        <div className="absolute inset-0 bg-[url('/patterns/noise.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      {/* Animated floating elements - more "fiestero" */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-10 w-20 h-20 bg-cuadralo-pink/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            rotate: [0, -180, -360]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-40 right-20 w-32 h-32 bg-cuadralo-purple/10 rounded-full blur-xl"
        />
        {/* Floating hearts animation */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-cuadralo-pink/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: i * 0.5,
            }}
          >
            ♥
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            {/* Logo grande como en Login */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8 inline-block"
            >
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="w-16 h-16 relative">
                  <Image
                    src="/logo.svg"
                    alt="Cuadralo Club"
                    width={64}
                    height={64}
                    className="drop-shadow-2xl"
                  />
                </div>
                <div>
                  <h1 className="text-4xl sm:text-5xl font-black text-white leading-none">
                    uadralo
                  </h1>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cuadralo-pink to-cuadralo-purple text-3xl sm:text-4xl font-black">
                    Club
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl sm:text-2xl text-white/80 mb-4 font-light"
            >
              La app de citas de Venezuela
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-base sm:text-lg text-white/60 mb-10 max-w-lg mx-auto lg:mx-0"
            >
              Conecta con personas reales. Haz swipe, chatea y encuentra a alguien especial 
              en tu ciudad.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
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
                <>
                  <Link
                    href="/register"
                    className="group bg-gradient-to-r from-cuadralo-pink to-cuadralo-pinkDark text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-cuadralo-pink/25 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Play size={20} className="fill-current" />
                    Comenzar Ahora
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href="/login"
                    className="bg-white/5 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 border border-white/10"
                  >
                    Iniciar Sesión
                  </Link>
                </>
              )}
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.7 }}
              className="flex flex-wrap justify-center lg:justify-start gap-8 text-sm text-white/50 mt-12"
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

          {/* Right Side - Phone with Swipe Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
            className="relative hidden lg:flex justify-center"
          >
            <div className="relative w-[300px] h-[600px]">
              {/* Phone frame */}
              <div className="absolute inset-0 bg-gray-900 rounded-[3rem] border-4 border-gray-700 shadow-2xl z-10">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-20" />
                
                {/* Screen content */}
                <div className="relative w-full h-full overflow-hidden rounded-[2.5rem] bg-[#0B0410]">
                  {/* Status bar */}
                  <div className="flex justify-between items-center p-4 text-white/50 text-xs">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-2 bg-white/20 rounded-sm" />
                      <div className="w-4 h-2 bg-white/20 rounded-sm" />
                      <div className="w-4 h-2 bg-cuadralo-pink rounded-sm" />
                    </div>
                  </div>

                  {/* Swipe animation area */}
                  <div className="relative px-4 h-[450px] overflow-hidden">
                    {/* Card stack with swipe animation */}
                    <motion.div
                      className="absolute inset-x-4 top-0"
                      animate={{
                        x: [0, 150, 0, -150, 0],
                        rotate: [0, 15, 0, -15, 0],
                        opacity: [1, 0.7, 1, 0.7, 1]
                      }}
                      transition={{
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    >
                      <div className="bg-[#150A21] rounded-2xl overflow-hidden border border-white/10">
                        <div className="h-48 bg-gradient-to-br from-cuadralo-pink/30 to-cuadralo-purple/30 flex items-center justify-center">
                          <div className="w-20 h-20 rounded-full bg-gray-700 border-4 border-cuadralo-pink flex items-center justify-center">
                            <span className="text-3xl">👤</span>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="text-white font-bold text-lg">María, 24</h3>
                          <p className="text-gray-400 text-sm">📍 Caracas, Venezuela</p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Action buttons swipe animation */}
                    <motion.div
                      className="absolute bottom-4 left-0 right-0 flex justify-center gap-4"
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center"
                      >
                        <span className="text-2xl">✕</span>
                      </motion.div>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                        className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center"
                      >
                        <span className="text-2xl">💫</span>
                      </motion.div>
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
                        className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center"
                      >
                        <span className="text-2xl">❤️</span>
                      </motion.div>
                    </motion.div>
                  </div>
                </div>
              </div>

              {/* Floating badges */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 bg-cuadralo-pink text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg"
              >
                💕 100K+ Matches
              </motion.div>
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                className="absolute -bottom-4 -left-4 bg-cuadralo-purple text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg"
              >
                🔥 50K+ Usuarios
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:block"
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
