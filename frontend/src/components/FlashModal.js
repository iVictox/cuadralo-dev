"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Flame, Check, ShoppingCart, Crown, ArrowRight, Sparkles, Plus, Minus, Eye, Heart, TrendingUp, Users, MessageCircle, ArrowUp, Gift, Star, Gauge, Rocket, Clock } from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import CheckoutModal from "@/components/CheckoutModal";

const MOTIVATIONAL_MESSAGES = [
  "Tu alma gemela esta esperando... dejate ver",
  "Hoy podria ser el dia... destaca y conquista",
  "No dejes que te ignoren... hazte visible",
  "Miles de personas buscan... hacete encontrar",
  "Esa persona especial te busca... aparecete",
  "El amor esta en el aire... destacate",
  "No esperes mas... relucete hoy",
  "Tu match esta esperando... destacate"
];

const FLASH_OPTIONS = [
  { id: "flash", name: "Flash", duration: 15, durationText: "15 min", price: 0.79, benefit: "Rapido", color: "from-blue-400 to-cyan-400", icon: Zap, popular: false },
  { id: "clasico", name: "Clasico", duration: 30, durationText: "30 min",  price: 1.49, benefit: "Balance", color: "from-purple-400 to-pink-400", icon: Flame, popular: true },
  { id: "estelar", name: "Estelar", duration: 60, durationText: "1 hora",  price: 2.49, benefit: "Maximo", color: "from-yellow-400 to-orange-400", icon: Star, popular: false }
];

const PACKAGES = [
  { id: "flash", name: "Pack Flash", type: "Flash", quantity: 5, price: 2.99, originalPrice: 3.95, discount: 25, popular: false },
  { id: "clasico", name: "Pack Clasico", type: "Clásico", quantity: 10, price: 8.99, originalPrice: 14.90, discount: 40, popular: true },
  { id: "estelar", name: "Pack Estelar", type: "Estelar", quantity: 5, price: 9.99, originalPrice: 12.45, discount: 20, popular: false },
  { id: "top", name: "Pack Top", type: "Clásico", quantity: 20, price: 15.99, originalPrice: 29.80, discount: 46, popular: false },
  { id: "mega", name: "Pack Mega", type: "Estelar", quantity: 50, price: 34.99, originalPrice: 74.50, discount: 53, popular: false }
];

const BENEFITS = [
  { icon: Eye, text: "Visibilidad maxima", desc: "Aparece primero" },
  { icon: Users, text: "3x mas matches", desc: "Mas oportunidades" },
  { icon: TrendingUp, text: "Top del feed", desc: "Posicion prioritaria" },
  { icon: Heart, text: "Mas favoritos", desc: "Guardan tu perfil" }
];

export default function FlashModal({ onClose, onSuccess }) {
  const { showToast } = useToast();
  const [mode, setMode] = useState("flash");
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedType, setSelectedType] = useState("clasico");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [flashInfo, setFlashInfo] = useState(null);
  const [inventory, setInventory] = useState({ flash: 0, clasico: 0, estelar: 0 });
  const [motivationalMsg, setMotivationalMsg] = useState("");
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState(null);

  useEffect(() => {
    setMotivationalMsg(MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)]);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      const infoRes = await api.get("/flash/info");
      setFlashInfo(infoRes?.flash || null);
      setInventory(infoRes?.inventory || { flash: 0, clasico: 0, estelar: 0 });
    } catch (error) { console.warn("Error:", error); }
    finally { setLoadingData(false); }
  };

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return "0:00";
    return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!flashInfo?.is_active) return;
    const interval = setInterval(() => {
      setFlashInfo(prev => {
        if (!prev) return prev;
        const newTime = Math.max(0, prev.time_remaining - 1);
        return { ...prev, time_remaining: newTime, is_expiring: newTime <= 300, is_active: newTime > 0 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [flashInfo?.is_active]);

  const handleActivate = async () => {
    setLoading(true);
    try {
      const result = await api.post("/flash/activate", { type: selectedType });
      if (result.success) {
        setFlashInfo(result.flash);
        setInventory(result.inventory);
        showToast(`Destello activado!`, "success");
        if (onSuccess) onSuccess(result);
        if (onClose) onClose();
      }
    } catch (error) {
      showToast(error?.needs_purchase ? "Compra destellos primero" : error?.message || "Error", "error");
    } finally { setLoading(false); }
  };

  const handleBuySingle = () => {
    const flashOption = FLASH_OPTIONS.find(f => f.id === selectedType);
    const totalPrice = (flashOption?.price || 0) * buyQuantity;
    setCheckoutProduct({
      id: `flash_${selectedType}`,
      name: `Destello ${flashOption?.name || ''}`,
      desc: `${buyQuantity} destello(s) de ${flashOption?.durationText} - ${buyQuantity} unidad(es)`,
      price: totalPrice,
      type: "flash",
      quantity: buyQuantity,
      flashType: selectedType
    });
    setShowCheckout(true);
  };

  const handleBuyPackage = () => {
    if (!selectedPackage) return;
    const flashOption = FLASH_OPTIONS.find(f => f.id === selectedPackage.id);
    setCheckoutProduct({
      id: `flash_${selectedPackage.id}`,
      name: `${selectedPackage.name}`,
      desc: `${selectedPackage.quantity} destellos ${selectedPackage.type} - ${selectedPackage.quantity} unidades`,
      price: selectedPackage.price,
      type: "flash",
      quantity: selectedPackage.quantity,
      flashType: selectedPackage.id
    });
    setShowCheckout(true);
  };

  const currentFlash = FLASH_OPTIONS.find(f => f.id === selectedType);
  const currentCount = inventory[selectedType] || 0;
  const totalFlashes = inventory.flash + inventory.clasico + inventory.estelar;

  if (loadingData) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="animate-pulse text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
        className="relative w-full max-w-4xl bg-cuadralo-cardDark dark:bg-[#150A21]/95 backdrop-blur-2xl rounded-[2rem] overflow-hidden border border-white/10 shadow-xl"
      >
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cuadralo-pink/50 to-transparent" />
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-cuadralo-pink/20 rounded-full blur-[80px]" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-[80px]" />
        
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
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 p-[3px]"
                >
                  <div className="w-full h-full bg-[#0f0f1a] rounded-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" strokeWidth={2} />
                  </div>
                </motion.div>
                {flashInfo?.is_active && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#0f0f1a]"
                  >
                    <Flame size={12} className="text-white" fill="currentColor" />
                  </motion.div>
                )}
              </div>

              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                Destellos <span className="text-cuadralo-pink">⚡</span>
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

            {flashInfo?.is_active ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${flashInfo.is_expiring ? 'bg-red-500' : 'bg-green-500'}`}>
                      <Flame size={20} className="text-white" fill="currentColor" />
                    </div>
                    <div>
                      <p className="text-white font-bold">{flashInfo.type_name} Activo</p>
                      <p className="text-white/50 text-xs">{flashInfo.time_remaining > 0 ? formatTime(flashInfo.time_remaining) : '0:00'} restante</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-black ${flashInfo.is_expiring ? 'text-red-400' : 'text-green-400'}`}>
                      {formatTime(flashInfo.time_remaining)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {FLASH_OPTIONS.map((type) => (
                  <div key={type.id} className="relative p-3 rounded-2xl bg-white/5 border border-white/10">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center mb-2 mx-auto`}>
                      <type.icon size={18} className="text-white" fill="currentColor" />
                    </div>
                    <p className="text-white text-center font-semibold text-sm">{type.name}</p>
                    <p className="text-white/40 text-xs text-center">{type.durationText}</p>
                  </div>
                ))}
              </div>
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
                    <div className="w-8 h-8 rounded-full bg-cuadralo-pink/20 flex items-center justify-center">
                      <item.icon size={14} className="text-cuadralo-pink" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">{item.text}</p>
                      <p className="text-white/40 text-xs">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="lg:hidden mt-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {BENEFITS.slice(0, 3).map((item, i) => (
                  <div key={i} className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/20">
                    <item.icon size={14} className="text-cuadralo-pink" />
                    <span className="text-white/80 text-xs">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {totalFlashes > 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-auto pt-4 flex items-center justify-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/30"
              >
                <Check size={14} className="text-green-400" />
                <span className="text-green-400 text-sm font-medium">{totalFlashes} destellos disponibles</span>
              </motion.div>
            ) : (
              <div className="mt-auto pt-4 flex items-center justify-center gap-2 p-3 rounded-xl bg-cuadralo-pink/10 border border-cuadralo-pink/30">
                <Sparkles size={14} className="text-cuadralo-pink" />
                <span className="text-cuadralo-pink text-xs font-medium">Compra y destaca</span>
              </div>
            )}
          </div>

          <div className="flex-1 lg:flex-[0.6] p-6 lg:p-8 flex flex-col">
            <div className="flex rounded-xl bg-white/5 p-0.5 mb-4">
              <button 
                onClick={() => setMode("flash")} 
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${mode === "flash" ? "bg-gradient-to-r from-cuadralo-pink to-cuadralo-purple text-white" : "text-white/50 hover:text-white"}`}
              >
                Unitario
              </button>
              <button 
                onClick={() => setMode("packages")} 
                className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-all ${mode === "packages" ? "bg-gradient-to-r from-cuadralo-pink to-cuadralo-purple text-white" : "text-white/50 hover:text-white"}`}
              >
                Combos
              </button>
            </div>

            <AnimatePresence mode="wait">
              {mode === "packages" ? (
                <motion.div 
                  key="packages" 
                  initial={{ opacity: 0, x: 20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: -20 }} 
                  className="space-y-2 overflow-y-auto max-h-[50vh]"
                >
                  {PACKAGES.map((pkg) => (
                    <motion.div 
                      key={pkg.id}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedPackage(pkg)}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedPackage?.id === pkg.id ? "border-cuadralo-pink bg-cuadralo-pink/10" : "border-white/10 bg-white/5 hover:border-white/30"}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {pkg.popular && <Crown size={12} className="text-yellow-400" />}
                          <div>
                            <p className="text-white font-semibold text-sm">{pkg.name}</p>
                            <p className="text-white/40 text-xs">{pkg.quantity} destellos {pkg.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-400">${pkg.price}</p>
                          <p className="text-white/30 text-xs line-through">${pkg.originalPrice}</p>
                        </div>
                      </div>
                      {selectedPackage?.id === pkg.id && (
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">-{pkg.discount}%</span>
                          <Check size={12} className="text-cuadralo-pink" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                  {selectedPackage && (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleBuyPackage}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold flex items-center justify-center gap-2"
                    >
                      <>Comprar <ArrowRight size={18} /></>
                    </motion.button>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  key="flash" 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  exit={{ opacity: 0, x: 20 }}
                >
                  <div className="space-y-2 mb-3">
                    {FLASH_OPTIONS.map((type) => {
                      const count = inventory[type.id] || 0;
                      const isSelected = selectedType === type.id;
                      return (
                        <motion.div 
                          key={type.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSelectedType(type.id)}
                          className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                            isSelected ? "border-white/50 bg-white/10" : "border-white/10 bg-white/5 hover:border-white/30"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {type.popular && <span className="text-[10px] bg-gradient-to-r from-cuadralo-pink to-cuadralo-purple text-white font-bold px-2 py-0.5 rounded-full">TOP</span>}
                            <div>
                              <p className="text-white font-semibold">{type.name}</p>
                              <p className="text-white/40 text-xs">{type.durationText}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-lg font-bold ${count > 0 ? "text-green-400" : "text-white/60"}`}>{count}</p>
                            {count === 0 && <p className="text-white/30 text-xs">${type.price}</p>}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="bg-white/5 rounded-2xl p-3 mb-3">
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <button onClick={() => setBuyQuantity(Math.max(1, buyQuantity - 1))} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20"><Minus size={14} /></button>
                      <span className="text-2xl font-bold text-white w-12 text-center">{buyQuantity}</span>
                      <button onClick={() => setBuyQuantity(Math.min(10, buyQuantity + 1))} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20"><Plus size={14} /></button>
                    </div>
<motion.p 
                      key={buyQuantity}
                      initial={{ scale: 1.1 }}
                      className="text-center text-green-400 font-bold text-lg mb-2"
                    >
                      ${(currentFlash?.price * buyQuantity).toFixed(2)}
                    </motion.p>
                    <button onClick={handleBuySingle} className="w-full py-2 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 flex items-center justify-center gap-2">
                      <ShoppingCart size={14} /> Comprar más
                    </button>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleActivate}
                    disabled={loading || flashInfo?.is_active || currentCount <= 0}
                    className={`w-full py-4 rounded-2xl font-bold disabled:opacity-50 flex items-center justify-center gap-2 ${
                      currentCount > 0 && !flashInfo?.is_active ? "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white" : "bg-gradient-to-r from-cuadralo-pink to-cuadralo-purple text-white opacity-50 cursor-not-allowed"
                    }`}
                  >
                    {flashInfo?.is_active ? <><Flame size={18} /> Destello Activo</> : currentCount > 0 ? <><Zap size={18} /> Activar {currentFlash?.name}</> : <><ShoppingCart size={18} /> Compra destellos para activar</>}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showCheckout && checkoutProduct && (
          <CheckoutModal 
            product={checkoutProduct} 
            onClose={() => {
              setShowCheckout(false);
              setCheckoutProduct(null);
            }} 
            onSuccess={async () => {
              showToast("¡Compra exitosa! Destellos agregados.", "success");
              await fetchData();
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}