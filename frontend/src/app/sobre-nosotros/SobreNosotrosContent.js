"use client";

import { motion } from "framer-motion";
import { Heart, Users, Zap, Shield, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import VideoBackground from "@/components/landing/VideoBackground";

const values = [
  {
    icon: Heart,
    title: "Conexión Real",
    description: "Creemos en conexiones auténticas, no en algoritmos fríos. Queremos que conozcas personas reales.",
  },
  {
    icon: Shield,
    title: "Seguridad Primero",
    description: "Tu seguridad es nuestra prioridad. Verificación facial y chat seguro para que conectes sin miedo.",
  },
  {
    icon: Sparkles,
    title: "Diversión Garantizada",
    description: "Swipe, chatea, comparte historias. Hazlo todo con una experiencia diseñada para divertirte.",
  },
];

export default function SobreNosotrosContent() {
  return (
    <section className="pt-32 pb-20 overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#0B0410]" />
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 left-10 w-96 h-96 bg-cuadralo-pink/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-20 w-[500px] h-[500px] bg-cuadralo-purple/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-cuadralo-pink transition-colors mb-8"
          >
            <ChevronRight size={16} className="rotate-180" />
            Volver al inicio
          </Link>

          <span className="inline-flex items-center gap-2 bg-cuadralo-pink/10 text-cuadralo-pink px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Sparkles size={16} />
            Sobre Nosotros
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6">
            Conectando jóvenes en
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cuadralo-pink to-cuadralo-purple"> Venezuela</span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Somos una app social creada por jóvenes, para jóvenes. Conecta, haz amigos y vive experiencias épicas.
          </p>
        </motion.div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-white/60 hover:text-cuadralo-pink transition-colors mb-8"
          >
            <Sparkles size={16} className="rotate-180" />
            Volver al inicio
          </Link>

          <span className="inline-flex items-center gap-2 bg-cuadralo-pink/10 text-cuadralo-pink px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Sparkles size={16} />
            Sobre Nosotros
          </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white mb-6">
            Conectando jóvenes en
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cuadralo-pink to-cuadralo-purple"> Venezuela</span>
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Somos una app social creada por jóvenes, para jóvenes. Conecta, haz amigos y vive experiencias épicas con personas increíbles.
          </p>
        </motion.div>
      </div>

      {/* Mission & Vision */}
      <section className="py-20 bg-[#150A21]/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-[#150A21] rounded-3xl p-8 border border-white/10"
            >
              <div className="w-14 h-14 rounded-2xl bg-cuadralo-pink/20 flex items-center justify-center mb-6">
                <Zap size={28} className="text-cuadralo-pink" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Nuestra Misión</h2>
              <p className="text-white/60 leading-relaxed">
                Revolucionar la forma en que los jóvenes venezolanos se conectan. Queremos eliminar la awkwardness del primer contacto y crear un espacio donde puedas ser tú mismo, hacer amigos y vivir experiencias únicas. Todo con la tecnología más cool y un diseño que enamora.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-[#150A21] rounded-3xl p-8 border border-white/10"
            >
              <div className="w-14 h-14 rounded-2xl bg-cuadralo-purple/20 flex items-center justify-center mb-6">
                <MapPin size={28} className="text-cuadralo-purple" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Nuestra Visión</h2>
              <p className="text-white/60 leading-relaxed">
                Ser la app social #1 en Venezuela y Latinoamérica. Soñamos con una comunidad donde la conexión humana sea genuina, donde cada swipe sea una oportunidad real y donde miles de amistades y experiencias únicas comiencen con un simple "match". El futuro de la vida social es ahora, y es Cuadralo.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Nuestros
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cuadralo-pink to-cuadralo-purple"> Valores</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-[#150A21] rounded-3xl p-8 border border-white/10 text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cuadralo-pink/20 to-cuadralo-purple/20 flex items-center justify-center mx-auto mb-6">
                  <value.icon size={28} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                <p className="text-white/60">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-[#150A21]/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { number: "50K+", label: "Usuarios activos" },
              { number: "100K+", label: "Matches realizados" },
              { number: "4.8", label: "Rating promedio" },
              { number: "24/7", label: "Soporte activo" },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cuadralo-pink to-cuadralo-purple mb-2">
                  {stat.number}
                </p>
                <p className="text-white/60 text-sm sm:text-base">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">
              ¿Listo para ser parte de la
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cuadralo-pink to-cuadralo-purple"> comunidad</span>?
            </h2>
            <p className="text-lg text-white/60 mb-8">
              Miles de jóvenes ya están conectando. ¡No te quedes fuera!
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-cuadralo-pink to-cuadralo-pinkDark text-white px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl hover:shadow-cuadralo-pink/25 transition-all duration-300"
            >
              <Users size={20} />
              Únete a Cuadralo
            </Link>
          </motion.div>
        </div>
      </section>
    </section>
  );
}
