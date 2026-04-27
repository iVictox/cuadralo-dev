"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Flame, Check, ShoppingCart, Crown, ArrowRight, Sparkles, Plus, Minus, Eye, Heart, TrendingUp, Users, MessageCircle } from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import CheckoutModal from "@/components/CheckoutModal";

const MOTIVATIONAL_MESSAGES = [
  "Ese mensaje personalizado puede cambiar todo...",
  "Destaca sobre los demás con un mensaje único",
  "La primera impresión es la que cuenta",
  "Rompe el hielo y llama su atención",
  "Single más memorable de todas",
  "Sé el primero en causar impacto"
];

const ICEBREAKER_OPTIONS = [
  { id: "rompehielo", name: "Rompehielo", quantity: 1, price: 0.99, benefit: "1 mensaje", color: "from-cyan-400 to-blue-400", icon: Sparkles, popular: false },
  { id: "fuego", name: "Fuego", quantity: 5, price: 3.99, benefit: "5 mensajes", color: "from-orange-400 to-red-400", icon: Flame, popular: false },
  { id: "incendio", name: "Incendio", quantity: 10, price: 6.99, benefit: "10 mensajes", color: "from-red-500 to-pink-500", icon: Flame, popular: true }
];

const PACKAGES = [
  { id: "rompehielo", name: "Rompehielo x1", quantity: 1, price: 0.99, originalPrice: 0.99, discount: 0, popular: false },
  { id: "fuego", name: "Fuego x5", quantity: 5, price: 3.99, originalPrice: 4.95, discount: 20, popular: false },
  { id: "incendio", name: "Incendio x10", quantity: 10, price: 6.99, originalPrice: 9.90, discount: 30, popular: true },
  { id: "top", name: "Pack Top x20", quantity: 20, price: 12.99, originalPrice: 19.80, discount: 35, popular: false },
  { id: "mega", name: "Pack Mega x50", quantity: 50, price: 24.99, originalPrice: 49.50, discount: 50, popular: false }
];

const BENEFITS = [
  { icon: MessageCircle, text: "Mensaje Personalizado", desc: "Envía tu propio mensaje" },
  { icon: Heart, text: "Llega Directly", desc: "A su bandeja de entrada" },
  { icon: TrendingUp, text: "Mayor Engagement", desc: "Más respuestas que un like" },
  { icon: Eye, text: "Visibilidad Extra", desc: "Se nota más pronto" }
];

export default function IcebreakerModal({ onClose, targetProfile, onSuccess }) {
  const { showToast } = useToast();
  const [mode, setMode] = useState("write");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [icebreakerCount, setIcebreakerCount] = useState(0);
  const [motivationalMsg, setMotivationalMsg] = useState("");
  const [message, setMessage] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null);

  const MAX_CHARS = 150;

  useEffect(() => {
    setMotivationalMsg(MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const infoRes = await api.get("/icebreaker/info");
      setIcebreakerCount(infoRes?.count || 0);
    } catch (error) { console.warn("Error:", error); }
    finally { setLoadingData(false); }
  };

  const handleSendIcebreaker = async () => {
    if (!message.trim() || icebreakerCount <= 0) return;

    setLoading(true);
    try {
      const response = await api.post("/swipe", {
        target_id: targetProfile.id,
        action: "rompehielo",
        message: message
      });

      showToast("Mensaje enviado!", "success");
      if (onSuccess) onSuccess(response);
      if (onClose) onClose();
    } catch (error) {
      if (error.needs_purchase) {
        setMode("buy");
      } else {
        showToast(error?.message || "Error enviando mensaje", "error");
      }
    } finally { setLoading(false); }
  };

  const handleBuyPackage = () => {
    if (!selectedPackage) return;
    setCheckoutProduct({
      id: `icebreaker_${selectedPackage.id}`,
      name: `${selectedPackage.name}`,
      desc: `${selectedPackage.quantity} rompehielos`,
      price: selectedPackage.price,
      type: "icebreaker",
      quantity: selectedPackage.quantity
    });
    setShowCheckout(true);
  };

  const handleActivateFree = async () => {
    setLoading(true);
    try {
      console.log("Activating free icebreakers...");
      const result = await api.post("/icebreaker/activate-free");
      console.log("Result:", result);
      await fetchData();
      setMode("write");
      showToast("Rompehielo gratis activado!", "success");
    } catch (error) {
      console.error("Error activating:", error);
      showToast(error?.message || error?.error || "Error activating free icebreakers", "error");
    } finally { setLoading(false); }
  };

  if (loadingData) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="animate-pulse text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <>
      <div 
        className="fixed inset-0 z-[100] items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-sm"
        style={{ display: showCheckout ? 'none' : 'flex' }}
      >
        <motion.div 
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
          className="relative w-full max-w-4xl bg-cuadralo-cardDark dark:bg-[#150A21]/95 backdrop-blur-2xl rounded-[2rem] overflow-hidden border border-white/10 shadow-xl"
        >
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-cyan-500/20 rounded-full blur-[80px]" />
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-[80px]" />
          
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white/60 hover:text-white transition-colors z-20 backdrop-blur-md">
            <X size={20} />
          </button>

          <div className="flex flex-col lg:flex-row">
            <div className="flex-1 lg:flex-[0.4] p-6 lg:p-8 border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex flex-col items-center lg:items-start mb-6"
              >
                <div className="relative mb-4">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-cyan-500 p-[3px]"
                  >
                    <div className="w-full h-full bg-[#0f0f1a] rounded-full flex items-center justify-center">
                      <Sparkles className="w-8 h-8 text-cyan-400" strokeWidth={2} />
                    </div>
                  </motion.div>
                </div>

                <h2 className="text-2xl font-black text-white flex items-center gap-2">
                  Rompehielos <span className="text-cyan-400">❄️</span>
                </h2>
                
                <motion.p 
                  key={motivationalMsg}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-white/60 text-sm mt-2 text-center italic"
                >
                  &ldquo;{motivationalMsg}&rdquo;
                </motion.p>
              </motion.div>

              {targetProfile && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-4 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center gap-4"
                >
                  <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-700">
                    <img src={targetProfile.photos?.[0] || targetProfile.photo || targetProfile.img} alt={targetProfile.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="text-white font-bold">{targetProfile.name}</p>
                    <p className="text-white/40 text-xs">{targetProfile.age ? `${targetProfile.age} años` : targetProfile.location}</p>
                  </div>
                </motion.div>
              )}

              <div className="hidden lg:block flex-1">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-3 font-semibold">Beneficios</p>
                <div className="space-y-2">
                  {BENEFITS.map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                        <item.icon size={14} className="text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">{item.text}</p>
                        <p className="text-white/40 text-xs">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {icebreakerCount > 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-auto pt-4 flex items-center justify-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/30"
                >
                  <Check size={14} className="text-green-400" />
                  <span className="text-green-400 text-sm font-medium">{icebreakerCount} disponibles</span>
                </motion.div>
              ) : (
                <div className="mt-auto pt-4 flex items-center justify-center gap-2 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                  <Sparkles size={14} className="text-cyan-400" />
                  <span className="text-cyan-400 text-xs font-medium">Compra rompehielos</span>
                </div>
              )}
            </div>

            <div className="flex-1 lg:flex-[0.6] p-6 lg:p-8 flex flex-col">
              {mode === "buy" ? (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-black text-white">Compra Rompehielos</h3>
                    <button onClick={() => setMode("write")} className="text-white/60 text-sm hover:text-white">
                      Ya tengo
                    </button>
                  </div>

                  <p className="text-white/60 text-sm mb-4">
                    En fase de prueba: los rompehielos son <span className="text-green-400 font-bold">gratuitos</span>. Actívalos para probar.
                  </p>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleActivateFree}
                    disabled={loading}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold flex items-center justify-center gap-2"
                  >
                    <Sparkles size={18} />
                    Activar 5 Rompehielos Gratis
                  </motion.button>

                  <div className="relative py-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"/></div>
                    <div className="relative flex justify-center"><span className="bg-cuadralo-cardDark px-3 text-xs text-white/40">ó</span></div>
                  </div>

                  <div className="space-y-2 overflow-y-auto max-h-[35vh]">
                    {PACKAGES.map((pkg) => (
                      <motion.div 
                        key={pkg.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectedPackage(pkg)}
                        className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                          selectedPackage?.id === pkg.id ? "border-cyan-500 bg-cyan-500/10" : "border-white/10 bg-white/5 hover:border-white/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {pkg.popular && <Crown size={12} className="text-yellow-400" />}
                          <div>
                            <p className="text-white font-semibold text-sm">{pkg.name}</p>
                            <p className="text-white/40 text-xs">{pkg.quantity} mensajes</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-400">${pkg.price}</p>
                          {pkg.discount > 0 && <p className="text-white/30 text-xs">-${pkg.discount}%</p>}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {selectedPackage && (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBuyPackage}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold flex items-center justify-center gap-2"
                    >
                      <>Comprar <ArrowRight size={18} /></>
                    </motion.button>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex flex-col h-full"
                >
                  <h3 className="text-xl font-black text-white mb-4">Escribe tu mensaje</h3>
                  
                  <p className="text-white/60 text-sm mb-4">
                    Envía un mensaje personalizado a <span className="text-white font-semibold">{targetProfile?.name}</span> que aparecerá en su bandeja de "Le Gustas".
                  </p>

                  {icebreakerCount <= 0 && (
                    <div className="mb-4 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                      <p className="text-yellow-400 text-xs font-medium">
                        No tienes rompehielos. <button onClick={() => setMode("buy")} className="underline">Compra aquí</button>
                      </p>
                    </div>
                  )}

                  <div className="relative flex-1 mb-4">
                    <textarea
                      autoFocus
                      value={message}
                      onChange={(e) => {
                        if (e.target.value.length <= MAX_CHARS) {
                          setMessage(e.target.value);
                          setCharCount(e.target.value.length);
                        }
                      }}
                      placeholder="Escribe algo ingenioso para capturar su atención..."
                      className="w-full h-full min-h-[120px] bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/30 resize-none outline-none focus:border-cyan-500 focus:bg-white/10 transition-all"
                      disabled={icebreakerCount <= 0}
                    />
                    <div className="absolute bottom-3 right-3 text-xs font-medium">
                      <span className={charCount === MAX_CHARS ? "text-red-400" : charCount > 100 ? "text-yellow-400" : "text-white/40"}>
                        {charCount}/{MAX_CHARS}
                      </span>
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSendIcebreaker}
                    disabled={loading || !message.trim() || icebreakerCount <= 0}
                    className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 ${
                      message.trim() && icebreakerCount > 0 
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white" 
                        : "bg-white/10 text-white/50 cursor-not-allowed"
                    }`}
                  >
                    {loading ? (
                      <span>Cargando...</span>
                    ) : (
                      <>
                        <Sparkles size={18} />
                        Enviar y Dar Like
                      </>
                    )}
                  </motion.button>

                  {icebreakerCount > 0 && icebreakerCount <= 2 && (
                    <p className="text-center text-white/40 text-xs mt-3">
                      Te quedan {icebreakerCount} rompehielos. <button onClick={() => setMode("buy")} className="text-cyan-400 underline">Recargar</button>
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {showCheckout && checkoutProduct && (
          <CheckoutModal 
            product={checkoutProduct} 
            onClose={() => {
              setShowCheckout(false);
              setCheckoutProduct(null);
            }} 
            onSuccess={async () => {
              showToast("¡Compra exitosa! Rompehielos agregados.", "success");
              await fetchData();
              setMode("write");
            }} 
          />
        )}
      </AnimatePresence>
    </>
  );
}