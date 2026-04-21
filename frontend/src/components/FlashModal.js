"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Clock, Eye, Sparkles, TrendingUp, Check, Gift, Timer } from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";

const FLASH_TYPES = {
  flash: {
    name: "Flash",
    emoji: "⚡",
    duration: "15 min",
    price: 0.79,
    color: "from-blue-400 to-cyan-400",
    colorBg: "bg-blue-500/20",
    borderColor: "border-blue-500/30",
    popular: false,
    description: "Perfecto para destacar rápido cuando tienes poco tiempo."
  },
  clasico: {
    name: "Clásico",
    emoji: "✨",
    duration: "30 min",
    price: 1.49,
    color: "from-purple-500 to-pink-500",
    colorBg: "bg-purple-500/20",
    borderColor: "border-purple-500/30",
    popular: true,
    description: "El balance perfecto entre tiempo y alcance."
  },
  estelar: {
    name: "Estelar",
    emoji: "🌟",
    duration: "1 hora",
    price: 2.49,
    color: "from-yellow-400 to-orange-500",
    colorBg: "bg-yellow-500/20",
    borderColor: "border-yellow-500/30",
    popular: false,
    description: "Máxima exposición por más tiempo."
  }
};

const PACKAGES = [
  { 
    type: "flash", 
    name: "Paquete Clásico", 
    quantity: 5, 
    price: 2.99,
    emoji: "📦",
    description: "5 destellos Flash"
  },
  { 
    type: "clasico", 
    name: "Paquete Fiestero", 
    quantity: 10, 
    price: 8.99,
    emoji: "🎉",
    description: "10 destellos Clásicos"
  },
  { 
    type: "estelar", 
    name: "Paquete Fin de Semana", 
    quantity: 3, 
    price: 5.99,
    emoji: "🌴",
    description: "3 destellos Estelares"
  }
];

export default function FlashModal({ onClose, onSuccess }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState("clasico");
  const [flashInfo, setFlashInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [showPackages, setShowPackages] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const infoRes = await api.get("/flash/info");
        if (infoRes?.has_flash) {
          setFlashInfo(infoRes.flash);
        }
      } catch (error) {
        console.warn("Error cargando info de flash:", error?.message || error);
      } finally {
        setLoadingInfo(false);
      }
    };
    fetchInfo();
  }, []);

  const formatTime = useCallback((seconds) => {
    if (!seconds || seconds <= 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  useEffect(() => {
    if (!flashInfo?.is_active) return;

    const interval = setInterval(() => {
      setFlashInfo(prev => {
        if (!prev) return prev;
        const newTime = Math.max(0, prev.time_remaining - 1);
        return {
          ...prev,
          time_remaining: newTime,
          is_expiring: newTime <= 300,
          is_active: newTime > 0
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [flashInfo?.is_active]);

  const handleActivate = async () => {
    setLoading(true);
    try {
      const result = await api.post("/flash/activate", { type: selected });
      if (result.success) {
        setFlashInfo(result.flash);
        showToast(`¡Destello ${FLASH_TYPES[selected].name} activado!`, "success");
        if (onSuccess) onSuccess(result);
        if (onClose) onClose();
      }
    } catch (error) {
      let errorMsg = "Error al activar destello";
      if (error && typeof error === 'object') {
        errorMsg = error.error || error.message || errorMsg;
      } else if (typeof error === 'string') {
        errorMsg = error;
      }
      showToast(errorMsg, "error");
    } finally {
      setLoading(false);
    }
  };

  if (loadingInfo) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div className="animate-pulse text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-[#150a21] dark:bg-[#0f0518] rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white z-10 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-all">
          <X size={20} />
        </button>

        <div className="p-6 md:p-8">
          <AnimatePresence mode="wait">
            {flashInfo?.is_active && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30"
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${flashInfo.is_expiring ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}>
                      <Timer size={24} className="text-white" fill="currentColor" />
                    </div>
                    <div>
                      <p className="text-white font-bold text-lg">{FLASH_TYPES[flashInfo.type]?.name || flashInfo.type_name} Activo</p>
                      <p className="text-white/60 text-xs flex items-center gap-1">
                        <Clock size={12} />
                        {formatTime(flashInfo.time_remaining)} restante
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <p className={`text-2xl font-bold ${flashInfo.is_expiring ? 'text-red-400' : 'text-green-400'}`}>
                        {formatTime(flashInfo.time_remaining)}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/50 text-xs flex items-center gap-1 justify-end">
                        <Eye size={12} />
                        {flashInfo.reached_count} alcanzados
                      </p>
                    </div>
                  </div>
                </div>
                
                {flashInfo.is_expiring && (
                  <div className="mt-3 p-2 rounded-lg bg-red-500/20 flex items-center gap-2">
                    <Zap size={14} className="text-red-400 animate-pulse" />
                    <p className="text-red-300 text-xs">¡Tu destello está por finalizar!</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 mb-4 shadow-lg shadow-orange-500/30">
              <Sparkles size={32} className="text-white" fill="currentColor" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-white mb-2">Destellos ⚡</h2>
            <p className="text-white/60 text-sm max-w-md mx-auto">
              Activa un Destello y tu perfil aparecerá primero en el feed de todos. ¡Más visibilidad, más matches!
            </p>
          </div>

          <AnimatePresence mode="wait">
            {showPackages ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                key="packages"
              >
                <button 
                  onClick={() => setShowPackages(false)}
                  className="mb-4 text-white/50 hover:text-white text-sm flex items-center gap-1 transition-colors"
                >
                  ← Volver a destellos individuales
                </button>
                
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Gift size={20} className="text-purple-400" />
                  Paquetes con Descuento
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {PACKAGES.map((pkg) => (
                    <div 
                      key={pkg.type}
                      onClick={() => { setSelected(pkg.type); setShowPackages(false); }}
                      className="relative cursor-pointer rounded-2xl p-5 bg-white/5 border border-white/10 hover:border-purple-500/50 transition-all hover:bg-white/10 group"
                    >
                      <div className="text-3xl mb-2">{pkg.emoji}</div>
                      <h4 className="text-white font-bold text-sm mb-1">{pkg.name}</h4>
                      <p className="text-white/50 text-xs mb-3">{pkg.description}</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-green-400">${pkg.price.toFixed(2)}</span>
                        <span className="text-white/40 text-xs line-through">${(FLASH_TYPES[pkg.type].price * pkg.quantity).toFixed(2)}</span>
                      </div>
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                        AHORRA {(100 - (pkg.price / (FLASH_TYPES[pkg.type].price * pkg.quantity) * 100)).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                key="single"
              >
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {Object.entries(FLASH_TYPES).map(([key, type]) => (
                    <div 
                      key={key}
                      onClick={() => setSelected(key)}
                      className={`relative cursor-pointer rounded-2xl p-4 transition-all duration-200 border ${
                        selected === key 
                        ? `${type.colorBg} ${type.borderColor} scale-[1.02] shadow-lg` 
                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {type.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                          Popular
                        </div>
                      )}
                      
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${type.color} flex items-center justify-center mb-3 mx-auto shadow-lg`}>
                        <Zap size={22} className="text-white" fill="currentColor" />
                      </div>
                      
                      <h3 className="text-white font-bold text-center text-base mb-1">{type.emoji} {type.name}</h3>
                      <p className="text-white/50 text-xs text-center mb-3">{type.duration}</p>
                      
                      <div className="text-center">
                        <span className="text-xl font-bold text-white">${type.price.toFixed(2)}</span>
                      </div>
                      
                      {selected === key && (
                        <div className="absolute top-2 right-2">
                          <Check size={16} className="text-green-400" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <button 
                  onClick={() => setShowPackages(true)}
                  className="w-full mb-6 py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 text-sm font-medium hover:from-purple-500/30 hover:to-pink-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Gift size={16} />
                  Ver Paquetes con Descuento →
                </button>

                <div className="bg-white/5 rounded-2xl p-4 mb-6">
                  <div className="flex items-center gap-2 text-white/80 text-sm mb-3">
                    <TrendingUp size={16} />
                    <span className="font-bold">¿Cómo funciona?</span>
                  </div>
                  <ul className="space-y-2 text-xs text-white/60">
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Tu perfil aparece primero en el feed de otros usuarios</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Cuando alguien te da like, tu reach aumenta</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check size={14} className="text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Te notificamos 5 min antes y al finalizar</span>
                    </li>
                  </ul>
                </div>

                <button 
                  onClick={handleActivate}
                  disabled={loading || flashInfo?.is_active}
                  className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                    FLASH_TYPES[selected].color
                  } text-white hover:opacity-90`}
                >
                  {loading ? (
                    <span className="animate-pulse">Activando...</span>
                  ) : flashInfo?.is_active ? (
                    <>
                      <Zap size={20} className="text-white" fill="currentColor"/>
                      {FLASH_TYPES[flashInfo.type]?.name || flashInfo.type_name} Activo
                    </>
                  ) : (
                    <>
                      <Zap size={20} className="text-white" fill="currentColor"/>
                      Activar {FLASH_TYPES[selected].name} • ${FLASH_TYPES[selected].price.toFixed(2)}
                    </>
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}