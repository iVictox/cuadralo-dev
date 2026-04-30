"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Camera, Hand, MessageCircle, ArrowRight } from "lucide-react";

const steps = [
  {
    icon: Camera,
    title: "Crea tu perfil",
    description: "Sube tus mejores fotos, verifica tu identidad con nuestra tecnología facial y completa tu información.",
    step: "01",
    color: "from-cuadralo-pink to-pink-600",
    bgColor: "bg-cuadralo-pink/10",
  },
  {
    icon: Hand,
    title: "Descubre personas",
    description: "Swipe a la derecha si te gusta, a la izquierda para pasar. Nuestro algoritmo te mostrará personas compatibles.",
    step: "02",
    color: "from-cuadralo-purple to-purple-600",
    bgColor: "bg-cuadralo-purple/10",
  },
  {
    icon: MessageCircle,
    title: "Conecta y chatea",
    description: "Si hay match, podrán chatear, hacer video llamadas y conocerse mejor antes de verse en persona.",
    step: "03",
    color: "from-blue-500 to-blue-700",
    bgColor: "bg-blue-500/10",
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section id="how-it-works" className="py-20 bg-[#0f0518] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-cuadralo-purple/10 text-cuadralo-purple px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <ArrowRight size={16} />
            Cómo funciona
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
            Empieza en solo
            <span className="text-cuadralo-pink"> 3 pasos</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Es tan fácil que en minutos estarás conectando con personas increíbles.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-1">
            <div className="h-full bg-gradient-to-r from-cuadralo-pink via-cuadralo-purple to-blue-500 opacity-20" />
            <motion.div
              initial={{ width: "0%" }}
              animate={isInView ? { width: "100%" } : { width: "0%" }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cuadralo-pink via-cuadralo-purple to-blue-500"
            />
          </div>

          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="relative text-center"
            >
              {/* Step Number Badge */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 + 0.3, type: "spring" }}
                className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-cuadralo-pink to-cuadralo-purple mb-6 shadow-2xl z-10"
              >
                <step.icon size={32} className="text-white" />
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#150A21] shadow-lg flex items-center justify-center border-2 border-cuadralo-pink">
                  <span className="text-xs font-black text-cuadralo-pink">{step.step}</span>
                </div>
              </motion.div>

              {/* Mobile connector */}
              {index < steps.length - 1 && (
                <div className="md:hidden flex justify-center my-4">
                  <ArrowRight size={24} className="text-cuadralo-pink/50 rotate-90" />
                </div>
              )}

              <h3 className="text-xl font-bold text-white mb-3">
                {step.title}
              </h3>
              <p className="text-white/60 max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
