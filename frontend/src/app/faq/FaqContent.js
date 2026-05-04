"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, HelpCircle, Heart, Users, Shield, Zap, MessageCircle, Star } from "lucide-react";
import Link from "next/link";
import VideoBackground from "@/components/landing/VideoBackground";

const faqs = [
  {
    question: "¿Cuadralo es gratis?",
    answer: "¡Sí! Cuadralo es gratis para usar. Puedes hacer swipe, chatear y conectar con gente nueva sin pagar nada. Tenemos funciones Premium opcionales si quieres destacar tu perfil, pero lo básico es 100% gratis.",
    icon: Heart,
  },
  {
    question: "¿Cómo funciona el swipe?",
    answer: "Desliza a la derecha si te interesa alguien, a la izquierda si no. Si ambos dan like, ¡es un match! Entonces se habilita el chat para que puedan conocerse mejor. Simple y divertido.",
    icon: Zap,
  },
  {
    question: "¿Es seguro usar Cuadralo?",
    answer: "Tu seguridad es prioridad. Usamos verificación facial para confirmar identidades, tenemos un sistema de reportes y moderación activa. Además, nunca compartimos tu ubicación exacta, solo un radio aproximado.",
    icon: Shield,
  },
  {
    question: "¿Puedo usar Cuadralo fuera de Venezuela?",
    answer: "Por ahora Cuadralo está enfocado en Venezuela, pero si te vas de viaje o te mudas, puedes seguir usando la app. ¡Las amistades no tienen fronteras! Estamos trabajando para expandirnos en Latinoamérica.",
    icon: Users,
  },
  {
    question: "¿Cómo elimino mi cuenta?",
    answer: "Ve a Configuración > Privacidad > Eliminar Cuenta. Ten en cuenta que esto borra todos tus datos permanentemente. Si solo quieres un descanso, mejor cámbiate a modo invisible o simplemente no entres a la app por un tiempo.",
    icon: MessageCircle,
  },
  {
    question: "¿Qué pasa si me siento acosado?",
    answer: "Usa el botón de 'Bloquear y Reportar' en el perfil o chat de la persona. Nuestro equipo revisa cada reporte y toma medidas inmediatas. También puedes escribirnos directo a hola@cuadralo.com para casos urgentes.",
    icon: Star,
  },
  {
    question: "¿Cómo activo Cuadralo Premium?",
    answer: "Ve a tu perfil y toca 'Mejorar a Premium'. Elige el plan que mejor te funcione (mensual o anual) y sigue los pasos de pago. Una vez activado, disfrutarás de funciones exclusivas como ver quién te dio like y boosts de visibilidad.",
    icon: Star,
  },
];

export default function FaqContent() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="pt-32 pb-20 relative">
      {/* Animated background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0410] via-[#1a0a2e] to-[#0B0410]" />
        <motion.div
          animate={{
            x: [0, 80, 0],
            y: [0, -60, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 right-20 w-96 h-96 bg-cuadralo-pink/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -70, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 21, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 left-10 w-80 h-80 bg-cuadralo-purple/10 rounded-full blur-3xl"
        />
        <div className="absolute inset-0 bg-[#0B0410]/80" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <HelpCircle size={16} />
            FAQ
          </span>

          <h1 className="text-4xl sm:text-5xl font-black text-white mb-6">
            Preguntas
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cuadralo-pink to-cuadralo-purple"> Frecuentes</span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Resuelve tus dudas rápido. Si no encuentras lo que buscas, contáctanos.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-[#150A21] rounded-3xl border border-white/10 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-cuadralo-pink/10 flex items-center justify-center flex-shrink-0">
                    <faq.icon size={20} className="text-cuadralo-pink" />
                  </div>
                  <span className="font-semibold text-white">{faq.question}</span>
                </div>
                <motion.div
                  animate={{ rotate: openIndex === index ? 90 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronRight size={20} className="text-white/40" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 pl-20 text-white/60 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 text-center bg-[#150A21] rounded-3xl p-8 border border-white/10"
        >
          <h3 className="text-2xl font-bold text-white mb-4">¿Tienes más preguntas?</h3>
          <p className="text-white/60 mb-6">Nuestro equipo está listo para ayudarte con lo que necesites.</p>
          <Link
            href="/contacto"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-cuadralo-pink to-cuadralo-pinkDark text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-2xl hover:shadow-cuadralo-pink/25 transition-all duration-300"
          >
            <MessageCircle size={20} />
            Contáctanos
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
