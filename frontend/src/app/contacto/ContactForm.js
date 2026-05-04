"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Mail, Send, Instagram, Twitter, MapPin, CheckCircle } from "lucide-react";
import Link from "next/link";
import VideoBackground from "@/components/landing/VideoBackground";

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section className="pt-32 pb-20 relative">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#0B0410]" />
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-20 w-80 h-80 bg-cuadralo-pink/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -60, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-40 right-10 w-96 h-96 bg-cuadralo-purple/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-cuadralo-pink transition-colors mb-8"
          >
            <ChevronRight size={16} className="rotate-180" />
            Volver al inicio
          </Link>

          <span className="inline-flex items-center gap-2 bg-cuadralo-pink/10 text-cuadralo-pink px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Mail size={16} />
            Contacto
          </span>

          <h1 className="text-4xl sm:text-5xl font-black text-white mb-6">
            Hablemos
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cuadralo-pink to-cuadralo-purple"> Contigo</span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            ¿Tienes dudas, sugerencias o simplemente quieres saludar? Escríbenos. Somos humanos, te responderemos pronto.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="bg-[#150A21] rounded-3xl p-8 border border-white/10">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <CheckCircle size={64} className="text-green-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-4">¡Mensaje Enviado!</h3>
                  <p className="text-white/60 mb-6">Gracias por escribirnos. Te responderemos pronto.</p>
                  <button
                    onClick={() => { setSubmitted(false); setFormData({ name: "", email: "", message: "" }); }}
                    className="text-cuadralo-pink hover:underline"
                  >
                    Enviar otro mensaje
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Tu Nombre</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cuadralo-pink transition-colors"
                      placeholder="Ej: María González"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cuadralo-pink transition-colors"
                      placeholder="Ej: maria@email.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">Mensaje</label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cuadralo-pink transition-colors resize-none"
                      placeholder="Cuéntanos qué tienes en mente..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cuadralo-pink to-cuadralo-pinkDark text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-cuadralo-pink/25 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Send size={20} />
                    Enviar Mensaje
                  </button>
                </form>
              )}
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="bg-[#150A21] rounded-3xl p-8 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6">Otras formas de contacto</h3>
              <div className="space-y-6">
                <a
                  href="mailto:hola@cuadralo.com"
                  className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-cuadralo-pink/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail size={24} className="text-cuadralo-pink" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <p className="text-sm text-white/60">hola@cuadralo.com</p>
                  </div>
                </a>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5">
                  <div className="w-12 h-12 rounded-2xl bg-purple-400/20 flex items-center justify-center">
                    <MapPin size={24} className="text-purple-400" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Ubicación</p>
                    <p className="text-sm text-white/60">Venezuela 🇻🇪</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#150A21] rounded-3xl p-8 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-6">Síguenos</h3>
              <div className="flex gap-4">
                <a
                  href="https://instagram.com/cuadralo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-2xl bg-cuadralo-pink/20 flex items-center justify-center hover:bg-cuadralo-pink/40 transition-colors hover:scale-110"
                >
                  <Instagram size={24} className="text-cuadralo-pink" />
                </a>
                <a
                  href="https://twitter.com/cuadralo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-2xl bg-blue-400/20 flex items-center justify-center hover:bg-blue-400/40 transition-colors hover:scale-110"
                >
                  <Twitter size={24} className="text-blue-400" />
                </a>
                <a
                  href="https://t.me/cuadralo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-2xl bg-sky-400/20 flex items-center justify-center hover:bg-sky-400/40 transition-colors hover:scale-110"
                >
                  <Send size={24} className="text-sky-400" />
                </a>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cuadralo-pink/10 to-cuadralo-purple/10 rounded-3xl p-8 border border-cuadralo-pink/20">
              <h3 className="text-xl font-bold text-white mb-3">¿Necesitas ayuda rápida?</h3>
              <p className="text-white/60 mb-4">Visita nuestra sección de preguntas frecuentes para respuestas inmediatas.</p>
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 text-cuadralo-pink hover:underline font-medium"
              >
                Ir a FAQ
                <ChevronRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
