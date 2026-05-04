"use client";

import { motion } from "framer-motion";
import { ChevronRight, Shield, Lock, Eye, Database } from "lucide-react";
import Link from "next/link";
import VideoBackground from "@/components/landing/VideoBackground";

export default function PoliticaContent() {
  return (
    <section className="pt-32 pb-20 relative">
      {/* Animated background */}
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B0410] via-[#1a0a2e] to-[#0B0410]" />
        <motion.div
          animate={{
            x: [0, 70, 0],
            y: [0, -60, 0],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute top-10 left-20 w-96 h-96 bg-cuadralo-pink/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 50, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-20 right-10 w-80 h-80 bg-cuadralo-purple/10 rounded-full blur-3xl"
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
            Privacidad
          </span>

          <h1 className="text-4xl sm:text-5xl font-black text-white mb-6">
            Política de
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cuadralo-pink to-cuadralo-purple"> Privacidad</span>
          </h1>

          <p className="text-white/60 mb-12">
            Última actualización: 4 de mayo de 2026. Tu privacidad importa. Aquí te explicamos qué datos recopilamos y cómo los usamos. Spoiler: no somos espías.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="space-y-10 text-white/80"
        >
          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Database size={24} className="text-cuadralo-pink" />
              1. Datos que Recopilamos
            </h2>
            <p className="leading-relaxed mb-3">
              Para que Cuadralo funcione, necesitamos algunos datos básicos: nombre, edad, fotos, ubicación (para mostrarte gente cercana), intereses y preferencias sociales. También recopilamos datos de uso para mejorar la app.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Eye size={24} className="text-cuadralo-purple" />
              2. Cómo Usamos tus Datos
            </h2>
            <p className="leading-relaxed mb-3">
              Usamos tus datos para: mostrarte perfiles compatibles, enviarte notificaciones de matches y mensajes, mejorar el algoritmo de recomendación social, y mantener la seguridad de la comunidad. Nunca vendemos tu información personal a terceros.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">3. Ubicación</h2>
            <p className="leading-relaxed mb-3">
              La función de ubicación es clave para mostrarte personas cerca de ti. Puedes desactivarla en tu configuración, pero entonces no podremos mostrarte matches en tu zona. La ubicación se actualiza solo cuando usas la app activamente.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">4. Fotos y Contenido</h2>
            <p className="leading-relaxed mb-3">
              Tus fotos y publicaciones se almacenan de forma segura. Usamos tecnología de verificación facial para confirmar que eres tú en tus fotos (nada de gatos). Si eliminas tu cuenta, borramos este contenido de nuestros servidores activos.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">5. Compartir Datos</h2>
            <p className="leading-relaxed mb-3">
              No compartimos tu info personal con extraños. Solo compartimos datos con proveedores de servicios esenciales (hosting, notificaciones push) bajo estrictos acuerdos de confidencialidad. Si un tribunal lo exige por ley, tendremos que cooperar (ojalá nunca pase).
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">6. Tus Derechos</h2>
            <p className="leading-relaxed mb-3">
              Tienes derecho a: acceder a tus datos, corregirlos, eliminar tu cuenta, o descargar tu información. Todo esto lo puedes hacer desde la configuración de la app. Si necesitas ayuda extra, escríbenos a{' '}
              <a href="mailto:privacy@cuadralo.com" className="text-cuadralo-pink hover:underline">
                privacy@cuadralo.com
              </a>.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
              <Lock size={24} className="text-green-400" />
              7. Seguridad
            </h2>
            <p className="leading-relaxed mb-3">
              Protegemos tus datos con cifrado de grado militar (bueno, casi). Usamos HTTPS, tokens JWT seguros y bases de datos protegidas. Tu contraseña se guarda hasheada, ni nosotros la conocemos.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">8. Menores de Edad</h2>
            <p className="leading-relaxed mb-3">
              Cuadralo es estrictamente para mayores de 18 años. Si detectamos perfiles de menores, los eliminamos inmediatamente y tomamos medidas legales si es necesario. La seguridad de los jóvenes es prioridad.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">9. Cambios en esta Política</h2>
            <p className="leading-relaxed mb-3">
              Si actualizamos esta política, te avisaremos por email o notificación en la app. Te recomendamos leer las actualizaciones. Si sigues usando Cuadralo después de los cambios, aceptas la nueva política.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">10. Contacto</h2>
            <p className="leading-relaxed">
              ¿Preguntas sobre privacidad? Escríbenos a{' '}
              <a href="mailto:privacy@cuadralo.com" className="text-cuadralo-pink hover:underline">
                privacy@cuadralo.com
              </a>{' '}
              o visita{' '}
              <Link href="/contacto" className="text-cuadralo-pink hover:underline">
                nuestra página de contacto
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
