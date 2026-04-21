"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation"; 
import { Lock, Eye, EyeOff, ArrowRight, AlertCircle, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { api } from "@/utils/api"; 

const INVALID_CHARS_REGEX = /[^\p{L}\p{N}\s$#"!&()=?%.\-_]/u;

function hasInvalidChars(value) {
    if (!value) return false;
    return INVALID_CHARS_REGEX.test(value);
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [invalidNew, setInvalidNew] = useState(false);
  const [invalidConfirm, setInvalidConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tokenValidated, setTokenValidated] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  const handleNewPasswordChange = (value) => {
      const invalid = hasInvalidChars(value);
      setInvalidNew(invalid);
      setNewPassword(value);
  };

  const handleConfirmPasswordChange = (value) => {
      const invalid = hasInvalidChars(value);
      setInvalidConfirm(invalid);
      setConfirmPassword(value);
  };

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("Token inválido o expirado");
        setValidatingToken(false);
        return;
      }
      
      try {
        const res = await api.post("/validate-reset-token", { token });
        setTokenValidated(true);
        setUserEmail(res.email || "");
      } catch (err) {
        router.push("/login?error=token_invalido");
      } finally {
        setValidatingToken(false);
      }
    };
    
    validateToken();
  }, [token, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (invalidNew || invalidConfirm) {
      setError("Caracteres no válidos detectados. Evita emojis y símbolos especiales.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      await api.post("/reset-password", { token, newPassword });
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
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
                ¡Contraseña actualizada!
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-base font-medium leading-relaxed text-center mb-8">
                Tu contraseña ha sido cambiada exitosamente. Serás redirigido al login...
              </p>

              <Link href="/login" className="block w-full py-4 bg-cuadralo-textLight dark:bg-white text-cuadralo-bgLight dark:text-black rounded-2xl font-black text-center">
                Ir al login ahora
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (!token || validatingToken) {
    return (
      <div className="min-h-screen w-full flex bg-cuadralo-bgLight dark:bg-[#0f0518] overflow-hidden text-cuadralo-textLight dark:text-white transition-colors duration-500 relative">
        <div className="w-full flex flex-col items-center justify-center p-6 relative z-10">
          <div className="w-full max-w-md">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-center">
                <Loader2 size={40} className="animate-spin text-cuadralo-pink" />
              </div>
              <p className="text-center mt-4 text-gray-500">Verificando enlace...</p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValidated) {
    return (
      <div className="min-h-screen w-full flex bg-cuadralo-bgLight dark:bg-[#0f0518] overflow-hidden text-cuadralo-textLight dark:text-white transition-colors duration-500 relative">
        <div className="w-full flex flex-col items-center justify-center p-6 relative z-10">
          <div className="w-full max-w-md">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-center mb-8">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertCircle size={40} className="text-red-500" />
                </div>
              </div>
              
              <h1 className="text-3xl sm:text-4xl font-black text-cuadralo-textLight dark:text-white tracking-tighter mb-4 text-center">
                Enlace inválido
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-base font-medium leading-relaxed text-center mb-8">
                Este enlace de restauración ha expirado o es inválido.
              </p>

              <Link href="/forgot-password" className="block w-full py-4 bg-cuadralo-textLight dark:bg-white text-cuadralo-bgLight dark:text-black rounded-2xl font-black text-center">
                Solicitar nuevo enlace
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
                   Nueva Contraseña
                </h1>
                <p className="text-gray-400 text-lg font-medium leading-relaxed">
                   Restableces la contraseña de <span className="text-pink-400 font-bold">{userEmail}</span>
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
                       Nueva Contraseña
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base font-medium leading-relaxed">
                       Restableces la contraseña de <span className="text-cuadralo-pink font-bold">{userEmail}</span>
                    </p>
                </motion.div>
              </div>

              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="relative group">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cuadralo-pink transition-colors z-10 pointer-events-none">
                              <Lock size={20} />
                          </div>
                          <div className="relative">
                              <input
                                  type={showPassword ? "text" : "password"}
                                  className={`peer w-full bg-black/5 dark:bg-white/5 border-2 ${invalidNew ? 'border-red-500' : 'border-transparent'} focus:border-cuadralo-pink/50 rounded-2xl pt-7 pb-3 pl-14 pr-14 text-base font-bold text-cuadralo-textLight dark:text-white outline-none transition-all`}
                                  placeholder=" "
                                  value={newPassword}
                                  onChange={(e) => handleNewPasswordChange(e.target.value)}
                                  required
                              />
                              <label className={`absolute left-14 text-gray-500 font-black uppercase tracking-widest transition-all duration-200 pointer-events-none ${newPassword ? 'top-2.5 text-[9px]' : 'top-1/2 -translate-y-1/2 text-xs peer-focus:top-2.5 peer-focus:text-[9px] peer-focus:text-cuadralo-pink'}`}>
                                  Nueva contraseña
                              </label>
                          </div>
                          <div className="absolute right-14 top-1/2 -translate-y-1/2 flex items-center gap-2">
                              {invalidNew && <XCircle size={16} className="text-red-500" />}
                              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-cuadralo-pink transition-colors focus:outline-none">
                                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                              </button>
                          </div>
                      </div>

                      <div className="relative group">
                          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-cuadralo-pink transition-colors z-10 pointer-events-none">
                              <Lock size={20} />
                          </div>
                          <div className="relative">
                              <input
                                  type={showPassword ? "text" : "password"}
                                  className={`peer w-full bg-black/5 dark:bg-white/5 border-2 ${invalidConfirm ? 'border-red-500' : 'border-transparent'} focus:border-cuadralo-pink/50 rounded-2xl pt-7 pb-3 pl-14 pr-14 text-base font-bold text-cuadralo-textLight dark:text-white outline-none transition-all`}
                                  placeholder=" "
                                  value={confirmPassword}
                                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                                  required
                              />
                              <label className={`absolute left-14 text-gray-500 font-black uppercase tracking-widest transition-all duration-200 pointer-events-none ${confirmPassword ? 'top-2.5 text-[9px]' : 'top-1/2 -translate-y-1/2 text-xs peer-focus:top-2.5 peer-focus:text-[9px] peer-focus:text-cuadralo-pink'}`}>
                                  Confirmar contraseña
                              </label>
                          </div>
                          <div className="absolute right-5 top-1/2 -translate-y-1/2">
                              {invalidConfirm && <XCircle size={16} className="text-red-500" />}
                          </div>
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
                              <>Guardar Contraseña <ArrowRight size={24} /></>
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