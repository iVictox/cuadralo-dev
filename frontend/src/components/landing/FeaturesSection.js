"use client";

import { motion } from "framer-motion";
import { Heart, Users, Video, ShieldCheck, MessageCircle, Zap } from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "Swipe Inteligente",
    description: "Nuestro algoritmo aprende tus preferencias y te muestra personas compatibles cerca de ti.",
    color: "text-cuadralo-pink",
    bgColor: "bg-cuadralo-pink/10",
  },
  {
    icon: Users,
    title: "Social Feed",
    description: "Comparte momentos, no solo fotos. Publica, comenta y mantente conectado con tu comunidad.",
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
  {
    icon: Video,
    title: "Video Llamadas",
    description: "Conecta cara a cara de forma segura. Conoce a la persona antes de encontrarte en persona.",
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
  },
  {
    icon: ShieldCheck,
    title: "Verificación Real",
    description: "Tecnología facial avanzada para verificar que los usuarios son quienes dicen ser.",
    color: "text-green-400",
    bgColor: "bg-green-400/10",
  },
  {
    icon: MessageCircle,
    title: "Chat en Tiempo Real",
    description: "Mensajería instantánea con notificaciones push. Nunca te pierdas una conversación.",
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
  },
  {
    icon: Zap,
    title: "Icebreakers",
    description: "Rompe el hielo con mensajes divertidos y creativos diseñados para generar conversaciones.",
    color: "text-orange-400",
    bgColor: "bg-orange-400/10",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-[#0B0410] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cuadralo-pink/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cuadralo-purple/5 rounded-full blur-3xl" />
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
            <Zap size={16} />
            Características
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
            Todo lo que necesitas para
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cuadralo-pink to-cuadralo-purple">
              conectar
            </span>
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Herramientas diseñadas para hacer que conocer gente nueva sea fácil, seguro y divertido.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              whileHover={{ y: -5, transition: { duration: 0.3 } }}
              className="relative group bg-[#150A21] rounded-3xl p-6 border border-white/10 hover:border-cuadralo-pink/30 transition-all duration-500 overflow-hidden"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-cuadralo-pink/5 to-cuadralo-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cuadralo-pink/20 to-cuadralo-purple/20 mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/60">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
