"use client";

import { motion } from "framer-motion";
import { ChevronRight, Shield, Heart, Users } from "lucide-react";
import Link from "next/link";
import VideoBackground from "@/components/landing/VideoBackground";

export default function TerminosContent() {
  return (
    <section className="pt-32 pb-20 relative">
      {/* Animated background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0410] via-[#1a0a2e] to-[#0B0410]" />
        <motion.div
          animate={{
            x: [0, 90, 0],
            y: [0, -40, 0],
          }}
          transition={{ duration: 19, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 right-10 w-96 h-96 bg-cuadralo-pink/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -50, 0],
            y: [0, 70, 0],
          }}
          transition={{ duration: 23, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-10 left-20 w-80 h-80 bg-cuadralo-purple/10 rounded-full blur-3xl"
        />
        <VideoBackground />
        <div className="absolute inset-0 bg-[#0B0410]/80" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <Shield size={16} />
            Legal
          </span>

          <h1 className="text-4xl sm:text-5xl font-black text-white mb-6">
            Términos y
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cuadralo-pink to-cuadralo-purple"> Condiciones</span>
          </h1>

          <p className="text-white/60 mb-12">
            Última actualización: 4 de mayo de 2026. Estos términos regulan tu uso de Cuadralo. Al registrarte, aceptas estas condiciones. L?alas con calma (prometemos que no son aburridas).
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-10 text-white/80"
        >
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">1. Uso de la App</h2>
            <p className="leading-relaxed">
              Cuadralo es una app social para jóvenes (+18). Te comprometes a usar la app de forma responsable, sin subir contenido ofensivo, ilegal o que viole los derechos de otros. Si te portas mal, podemos suspender o eliminar tu cuenta. Simple.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">2. Registro y Cuenta</h2>
            <p className="leading-relaxed">
              Debes tener al menos 18 años para usar Cuadralo. Eres responsable de mantener la confidencialidad de tu cuenta. No compartas tu contraseña ni dejes que otros usen tu perfil. Cada uno tiene el suyo.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">3. Contenido Generado</h2>
            <p className="leading-relaxed">
              Eres dueño del contenido que publicas (fotos, posts, historias). Al subirlo, nos das permiso para mostrarlo dentro de la app. No vendemos tus fotos a nadie, palabra de honor. No subas contenido sexual explícito, acoso o spam. Haz de Cuadralo un lugar cool para conectar.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">4. Privacidad y Datos</h2>
            <p className="leading-relaxed">
              Recopilamos datos necesarios para que la app funcione (perfil, ubicación para mostrarte gente cercana, preferencias). Usamos tus datos para mejorar tu experiencia social, no para espiarte. Consulta nuestra{' '}
              <Link href="/politica" className="text-cuadralo-pink hover:underline">
                Política de Privacidad
              </Link>{' '}
              para más detalles.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">5. Conducta Prohibida</h2>
            <p className="leading-relaxed">
              No se permite: bullying, odio, discriminación, suplantación de identidad, uso de bots, o cualquier actividad fraudulenta. Si te pillamos, adiós cuenta. Queremos una comunidad segura y divertida.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">6. Suscripciones y Pagos</h2>
            <p className="leading-relaxed">
              Ofrecemos funciones Premium de pago. Al suscribirte, aceptas los cargos recurrentes según el plan elegido. Puedes cancelar cuando quieras desde la configuración de tu cuenta. No hacemos reembolsos parciales por meses no usados.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">7. Cancelación de Cuenta</h2>
            <p className="leading-relaxed">
              Puedes eliminar tu cuenta en cualquier momento desde la configuración. Una vez eliminada, tus datos se borran de nuestra base de datos (excepto los requeridos por ley). Si fuiste baneado, no puedes crear una nueva cuenta con los mismos datos.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">8. Limitación de Responsabilidad</h2>
            <p className="leading-relaxed">
              Cuadralo no garantiza matches infinitos ni que encuentres la amistad de tu vida (aunque ojalá sí). No somos responsables por encuentros fuera de la app. Tú eres responsable de tus propias reuniones y seguridad personal. Usa el sentido común.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">9. Cambios en los Términos</h2>
            <p className="leading-relaxed">
              Podemos actualizar estos términos ocasionalmente. Te avisaremos por la app o email. Si sigues usando Cuadralo después de los cambios, significa que aceptas los nuevos términos.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">10. Contacto</h2>
            <p className="leading-relaxed">
              ¿Dudas? Escríbenos a{' '}
              <a href="mailto:legal@cuadralo.com" className="text-cuadralo-pink hover:underline">
                legal@cuadralo.com
              </a>{' '}
              o visita nuestra{' '}
              <Link href="/contacto" className="text-cuadralo-pink hover:underline">
                página de contacto
              </Link>.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 pt-8 border-t border-white/10 text-center"
        >
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} Cuadralo Club. Todos los derechos reservados.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
