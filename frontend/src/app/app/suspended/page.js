"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { AlertTriangle, Clock, Mail, ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function SuspendedPage() {
  const router = useRouter();
  const [suspensionData, setSuspensionData] = useState({
    reason: "",
    suspendedUntil: null,
    isPermanent: true
  });

  useEffect(() => {
    const stored = localStorage.getItem("suspension_data");
    if (stored) {
      try {
        setSuspensionData(JSON.parse(stored));
      } catch (e) {
        console.error("Error parsing suspension data:", e);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("suspension_data");
    router.push("/login");
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-VE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen w-full flex bg-cuadralo-bgLight dark:bg-[#0f0518] overflow-hidden text-cuadralo-textLight dark:text-white transition-colors duration-500 relative">
      
      {/* LEFT PANEL - Branding (Desktop Only) */}
      <div className="hidden lg:flex w-[45%] relative bg-black items-center justify-center p-16 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cuadralo-pink/20 via-[#0f0518] to-purple-900/40 z-0" />
        <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-cuadralo-pink/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
        
        <div className="relative z-10 w-full max-w-md">
          <div className="w-48 h-12 relative mb-16">
            <Image src="/logo.svg" fill className="object-contain dark:invert-0 invert" alt="Cuadralo" priority />
          </div>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <h1 className="text-5xl xl:text-6xl font-black text-white tracking-tighter mb-6 leading-[1.1]">
              Cuenta Suspendida
            </h1>
            <p className="text-gray-400 text-lg font-medium leading-relaxed">
              Tu cuenta ha sido suspendida y no puedes acceder a la plataforma en este momento.
            </p>
          </motion.div>
        </div>

        <div className="absolute bottom-12 left-16 text-white/30 text-sm font-bold tracking-widest uppercase">
          © {new Date().getFullYear()} Cuadralo
        </div>
      </div>

      {/* ANIMATED BACKGROUNDS - Mobile */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none lg:hidden z-0">
        <div className="absolute top-[-10%] left-[20%] w-[400px] h-[400px] bg-cuadralo-pink/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[20%] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      {/* RIGHT PANEL - Content */}
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center p-6 sm:p-12 md:p-20 relative z-10 bg-white/40 dark:bg-black/10 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none">
        
        <div className="w-full max-w-md mt-10 lg:mt-0">
          {/* Mobile Logo */}
          <div className="flex justify-center mb-10 lg:hidden relative z-10">
            <div className="w-56 h-16 relative">
              <Image src="/logo.svg" fill className="object-contain dark:invert" alt="Cuadralo" priority />
            </div>
          </div>

          {/* Mobile Title */}
          <div className="mb-8 lg:hidden">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <h2 className="text-3xl sm:text-4xl font-black text-cuadralo-textLight dark:text-white tracking-tighter mb-3 leading-[1.1]">
                Cuenta Suspendida
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base font-medium leading-relaxed">
                Tu cuenta ha sido suspendida y no puedes acceder a la plataforma.
              </p>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/30">
                <AlertTriangle size={40} className="text-red-500" />
              </div>
            </div>

            {/* Reason */}
            {suspensionData.reason && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-red-400 mb-1">Motivo:</h3>
                    <p className="text-sm text-gray-300">{suspensionData.reason}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Expiration - Temporary */}
            {!suspensionData.isPermanent && suspensionData.suspendedUntil && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <Clock size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-yellow-400 mb-1">Suspensión temporal</h3>
                    <p className="text-sm text-gray-300">
                      Podrás acceder nuevamente el:<br />
                      <span className="font-bold text-white">{formatDate(suspensionData.suspendedUntil)}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Permanent */}
            {suspensionData.isPermanent && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-red-400 mb-1">Suspensión permanente</h3>
                    <p className="text-sm text-gray-300">
                      Esta suspensión es permanente. Si crees que es un error, contacta a soporte.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Contact */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <Mail size={20} className="text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-bold text-blue-400 mb-1">¿Necesitas ayuda?</h3>
                  <p className="text-sm text-gray-300">
                    Contacta a nuestro equipo de soporte en:<br />
                    <a href="mailto:soporte@cuadralo.com" className="text-blue-400 hover:underline font-bold">
                      soporte@cuadralo.com
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={handleLogout}
              className="w-full py-5 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl font-black text-white text-lg shadow-xl shadow-red-500/30 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95"
            >
              <ArrowLeft size={24} />
              Cerrar Sesión
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
