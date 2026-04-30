"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ShieldCheck, Eye, Lock, Fingerprint, Award } from "lucide-react";

const safetyFeatures = [
  {
    icon: ShieldCheck,
    title: "Verificación Facial",
    description: "Tecnología avanzada que verifica tu identidad en segundos usando reconocimiento facial.",
    color: "text-cuadralo-pink",
    bgColor: "bg-cuadralo-pink/10",
  },
  {
    icon: Eye,
    title: "Moderación 24/7",
    description: "Equipo de moderación activo las 24 horas del día para mantener la comunidad segura.",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
  {
    icon: Lock,
    title: "Datos Encriptados",
    description: "Toda tu información personal está protegida con encriptación de nivel bancario.",
    color: "text-green-400",
    bgColor: "bg-green-400/10",
  },
  {
    icon: Fingerprint,
    title: "Perfiles Verificados",
    description: "Badge de verificación visible en perfiles que han pasado nuestro proceso de validación.",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
  },
];

export default function SafetySection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section id="safety" className="py-20 bg-[#0B0410] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cuadralo-pink/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 bg-cuadralo-pink/10 text-cuadralo-pink px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <ShieldCheck size={16} />
            Seguridad
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
            Tu seguridad es nuestra
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cuadralo-pink to-cuadralo-purple"> prioridad</span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Implementamos las mejores prácticas de seguridad para que te sientas protegido mientras conectas con otros.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {safetyFeatures.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              whileHover={{ scale: 1.02 }}
              className="flex gap-4 bg-[#150A21] rounded-3xl p-6 border border-white/10 hover:border-cuadralo-pink/30 transition-all duration-300 group"
            >
              <div className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-cuadralo-pink/20 to-cuadralo-purple/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <feature.icon size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/60">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full px-6 py-3">
            <Award size={20} className="text-cuadralo-pink" />
            <span className="text-sm text-white/60">
              Powered by <span className="text-cuadralo-pink font-semibold">FaceAPI</span> Technology
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
