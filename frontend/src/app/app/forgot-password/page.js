"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; 
import { Mail, ArrowRight, AlertCircle, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { api } from "@/utils/api"; 

const INVALID_CHARS_REGEX = /[^\p{L}\p{N}\s$#"!&()=?%.\-_@]/u;

function hasInvalidChars(value) {
    if (!value) return false;
    return INVALID_CHARS_REGEX.test(value);
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleEmailChange = (value) => {
      const invalid = hasInvalidChars(value);
      setInvalidEmail(invalid);
      setEmail(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (invalidEmail) {
      setError("Caracteres no válidos detectados. Evita emojis y símbolos especiales.");
      return;
    }
    
    setIsLoading(true);
    setError("");

    try {
      await api.post("/forgot-password", { email });
      setSuccess(true);
    } catch (err) {
      setError(err.error || "Hubo un problema. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen w-full flex bg-cuadralo-bgLight dark:bg-[#0f0518] overflow-hidden text-cuadralo-textLight dark:text-white transition-colors duration-500 relative">
        <div className="hidden lg:flex w-[45%] relative bg-black items-center justify-center p-16 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cuadralo-pink/20 via-[#0f0518] to-purple-900/40 z-0" />
          <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-cuadralo-pink/30 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse delay-1000" />
          
          <div className="relative z-10 w-full max-w-md">
            <div className="w-48 h-12 relative mb-16">
              <Image src="/logo.svg" fill className="object-contain dark:invert-0 invert" alt="Cuadralo" priority />
            </div>
          </div>
        </div>

        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none lg:hidden z-0">
          <div className="absolute top-[-10%] -left-[20%] w-[400px] h-[400px] bg-cuadralo-pink/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-[-10%] -right-[20%] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse delay-1000" />
        </div>

        <div className="w-full lg:w-[55%] flex flex-col items-center justify-center p-6 sm:p-12 md:p-20 relative z-10 bg-white/40 dark:bg-black/10 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none">
          <div className="w-full max-w-md mt-10 lg:mt-0">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <CheckCircle2 size={40} className="text-green-500" />
                </div>
              </div>
              
<h1 className="text-3xl sm:text-4xl font-black text-cuadralo-textLight dark:text-white tracking-tighter mb-4 text-center">
                 ¡Listo, email enviado!
               </h1>
               <p className="text-gray-500 dark:text-gray-400 text-base font-medium leading-relaxed text-center mb-4">
                 Revisa tu bandeja de entrada (o spam) en <strong>{email}</strong>. Te hemos enviado un enlace mágico para restaurar tu contraseña.
               </p>
               <p className="text-gray-400 dark:text-gray-500 text-sm font-medium leading-relaxed text-center">
                 El enlace expira en 24 horas. Si no lo recibes, espera unos minutos o verifica que el correo sea correcto.
               </p>

              <Link href="/login" className="block w-full py-4 bg-cuadralo-textLight dark:bg-white text-cuadralo-bgLight dark:text-black rounded-2xl font-black text-center">
                Volver al inicio de sesión
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex bg-cuadralo-bgLight dark:bg-[#0f0518] overflow-hidden text-cuadralo-textLight dark:text-white transition-colors duration-500 relative">
      
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
                   ¿Olvidaste tu contraseña?
                </h1>
                <p className="text-gray-400 text-lg font-medium leading-relaxed">
                   Tranquilo, nos pasa a todos. Ingresa tu correo y te enviaremos un enlace mágico para restaurar tu contraseña.
                </p>
            </motion.div>
          </div>

          <div className="absolute bottom-12 left-16 text-white/30 text-sm font-bold tracking-widest uppercase">
              © {new Date().getFullYear()} Cuadralo App
          </div>
      </div>

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none lg:hidden z-0">
          <div className="absolute top-[-10%] -left-[20%] w-[400px] h-[400px] bg-cuadralo-pink/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-[-10%] -right-[20%] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center p-6 sm:p-12 md:p-20 relative z-10 bg-white/40 dark:bg-black/10 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none">
          <div className="w-full max-w-md mt-10 lg:mt-0">
              <div className="flex justify-center mb-10 lg:hidden relative z-10">
                  <div className="w-56 h-16 relative">
                      <Image src="/logo.svg" fill className="object-contain dark:invert-0 invert" alt="Cuadralo" priority />
                  </div>
              </div>

              <div className="mb-8 lg:hidden">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <h2 className="text-3xl sm:text-4xl font-black text-cuadralo-textLight dark:text-white tracking-tighter mb-3 leading-[1.1]">
                       ¿Olvidaste tu contraseña?
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base font-medium leading-relaxed">
                       Tranquilo, nos pasa a todos. Ingresa tu correo y te enviaremos un enlace mágico para restaurar tu contraseña.
                    </p>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="relative group">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cuadralo-pink transition-colors z-10 pointer-events-none">
                              <Mail size={20} />
                          </div>
                          <div className="relative">
                              <input
                                  type="email"
                                  className={`peer w-full bg-black/5 dark:bg-white/5 border-2 ${invalidEmail ? 'border-red-500' : 'border-transparent'} focus:border-cuadralo-pink/50 rounded-2xl pt-7 pb-3 pl-14 ${invalidEmail ? 'pr-14' : 'pr-5'} text-base font-bold text-cuadralo-textLight dark:text-white outline-none transition-all`}
                                  placeholder=" "
                                  value={email}
                                  onChange={(e) => handleEmailChange(e.target.value)}
                                  required
                              />
                              <label className={`absolute left-14 text-gray-500 font-black uppercase tracking-widest transition-all duration-200 pointer-events-none ${email ? 'top-2.5 text-[9px]' : 'top-1/2 -translate-y-1/2 text-xs peer-focus:top-2.5 peer-focus:text-[9px] peer-focus:text-cuadralo-pink'}`}>
                                  Correo electrónico
                              </label>
                          </div>
                          {invalidEmail && (
                              <div className="absolute right-5 top-1/2 -translate-y-1/2 z-10">
                                  <XCircle size={16} className="text-red-500" />
                              </div>
                          )}
                      </div>

                      {error && (
                          <div className="w-full bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-bold mb-6">
                              <AlertCircle size={18} /> {error}
                          </div>
                      )}

                      <button 
                          type="submit" 
                          disabled={isLoading}
                          className={`w-full py-5 bg-gradient-to-r from-cuadralo-pink to-purple-600 rounded-2xl font-black text-white text-lg shadow-xl shadow-cuadralo-pink/30 flex items-center justify-center gap-3 transition-all relative overflow-hidden ${isLoading ? 'opacity-80 cursor-wait' : 'hover:scale-[1.02] active:scale-95'}`}
                      >
                          {isLoading ? (
                              <Loader2 className="animate-spin" size={24} />
                          ) : (
                              <>Enviar <ArrowRight size={24} /></>
                          )}
                      </button>
                  </form>
                  
                  <p className="text-center text-gray-500 font-medium mt-8">
                      <Link href="/login" className="text-cuadralo-pink font-bold hover:underline">← Volver al inicio de sesión</Link>
                  </p>
              </motion.div>
          </div>
      </div>
    </div>
  );
}