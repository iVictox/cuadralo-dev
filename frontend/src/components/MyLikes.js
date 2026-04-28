"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Heart, Loader2, Zap, Crown, Sparkles, MessageCircle, ArrowRight } from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import PrimeModal from "@/components/PrimeModal"; 
import FlashModal from "@/components/FlashModal"; 
import ProfileDetailsModal from "@/components/ProfileDetailsModal";

export default function MyLikes({ onLoaded }) {
  const { showToast } = useToast();
  const [likes, setLikes] = useState([]);
  const [rompehielos, setRompehielos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [view, setView] = useState("likes");
  
  const [showPrime, setShowPrime] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [flashInfo, setFlashInfo] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchData();
    fetchFlashInfo();

    const handleSocketEvent = (e) => {
        const data = e.detail;
        if (data.type === "new_like" || data.type === "new_icebreaker" || data.type === "new_match") {
            fetchData();
        }
    };
    
    window.addEventListener("socket_event", handleSocketEvent);
    return () => window.removeEventListener("socket_event", handleSocketEvent);
  }, []);

  const fetchFlashInfo = async () => {
    try {
      const res = await api.get("/flash/info");
      if (res.has_flash) {
        setFlashInfo(res.flash);
      }
    } catch (error) {
      console.error("Error cargando flash:", error);
    }
  };

  const formatFlashTime = (seconds) => {
    if (!seconds || seconds <= 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!flashInfo?.is_active) return;
    const interval = setInterval(() => {
      setFlashInfo(prev => {
        if (!prev) return prev;
        const newTime = Math.max(0, prev.time_remaining - 1);
        return { ...prev, time_remaining: newTime, is_active: newTime > 0 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [flashInfo?.is_active]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [likesData, messagesData] = await Promise.all([
          api.get("/likes-received"),
          api.get("/rompehielos/requests")
      ]);
      setLikes(likesData || []);
      setRompehielos(messagesData || []);
    } catch (error) {
      console.error("Error cargando bandeja:", error);
    } finally {
      setLoading(false);
            if (onLoaded) onLoaded();
    }
  };

  // ✅ NUEVO: Función para responder a un Rompehielo o Like desde el Inbox
  const handleAction = async (targetId, action, type) => {
      try {
          // action puede ser "right" (Match) o "left" (Descartar)
          await api.post("/swipe", { target_id: targetId, action: action });
          
          if (type === "inbox") {
              setRompehielos((prev) => prev.filter((r) => r.id !== targetId));
          } else {
              setLikes((prev) => prev.filter((r) => r.id !== targetId));
          }
          
          if (action === "right") {
              showToast("¡Es un Match! Ahora pueden chatear gratis.", "success");
          }
      } catch (error) {
          console.error(error);
          showToast("Error procesando la solicitud", "error");
      }
  };

  if (loading) {
    return (
        <div className="flex h-full items-center justify-center text-cuadralo-pink">
            <Loader2 className="animate-spin" size={32}/>
        </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="w-full h-full text-cuadralo-textLight dark:text-white pt-20 pb-28 px-4 overflow-y-auto max-w-5xl mx-auto scrollbar-hide [&::-webkit-scrollbar]:hidden transition-colors duration-300"
    >
      <div className="text-center mb-6 animate-fade-in">
          <h2 className="text-2xl font-black tracking-tighter mb-1">Tu radar de conexiones</h2>
          {flashInfo?.is_active && (
            <motion.button
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => setShowFlash(true)}
              className="mt-2 mx-auto inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full"
            >
              <Zap size={14} className="text-yellow-400" fill="currentColor" />
              <span className="text-yellow-400 text-xs font-bold">{flashInfo.type_name}</span>
              <span className="text-white/60 text-xs">{formatFlashTime(flashInfo.time_remaining)}</span>
            </motion.button>
          )}
      </div>

      <div className="flex bg-gray-100 dark:bg-[#1a1a1a] p-1 rounded-2xl mb-8 max-w-md mx-auto">
          <button 
              onClick={() => setView("likes")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${view === 'likes' ? 'bg-white dark:bg-black shadow-md text-cuadralo-pink' : 'text-gray-500'}`}
          >
              Likes ({likes.length})
          </button>
          <button 
              onClick={() => setView("messages")}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${view === 'messages' ? 'bg-white dark:bg-black shadow-md text-blue-500' : 'text-gray-500'}`}
          >
              <MessageCircle size={16} /> Inbox ({rompehielos.length})
          </button>
      </div>

      {view === "likes" && (
          likes.length > 0 ? (
            <>
                {likes.some(l => l.locked) && (
                    <div className="bg-gradient-to-r from-neutral-900 to-black border border-yellow-500/30 p-4 rounded-3xl mb-8 flex items-center justify-between shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-[40px] rounded-full -mr-10 -mt-10 pointer-events-none" />
                        <div className="flex gap-4 items-center z-10 relative">
                            <div className="p-3 bg-gradient-to-br from-yellow-400/20 to-amber-600/20 rounded-2xl text-yellow-400 border border-yellow-500/20 shadow-inner">
                                <Crown size={22} />
                            </div>
                            <div>
                                <h3 className="font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-yellow-500 text-sm tracking-tight drop-shadow-sm">Descubre a quién le gustas</h3>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mt-0.5">Hazte VIP para desbloquear sus fotos.</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setShowPrime(true)}
                            className="z-10 px-5 py-3 bg-gradient-to-r from-yellow-400 to-amber-600 text-black font-black text-[10px] uppercase tracking-widest rounded-2xl shadow-[0_5px_20px_rgba(234,179,8,0.4)] transition-all hover:scale-[1.03] active:scale-95"
                        >
                            Obtener Pase VIP
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 animate-fade-in-up">
                    {likes.map((user) => (
                    <div 
                        key={user.id} 
                        className="relative aspect-[3/4] rounded-[2rem] overflow-hidden bg-cuadralo-cardLight dark:bg-cuadralo-cardDark group border border-black/5 dark:border-white/5 transition-all shadow-glass-light dark:shadow-glass-dark hover:shadow-[0_8px_30px_rgba(242,19,142,0.15)]"
                    >
                        <div className="absolute inset-0 cursor-pointer" onClick={() => { if (user.locked) setShowPrime(true); else setSelectedUser(user); }}>
                            <img 
                                src={user.img || "https://via.placeholder.com/300"} 
                                alt="User" 
                                className={`w-full h-full object-cover transition-all duration-700 ${user.locked ? "blur-2xl scale-125 opacity-40" : "group-hover:scale-110"}`} 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                        </div>

                        {user.locked ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4 text-center pointer-events-none">
                                <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-14 h-14 bg-gradient-to-tr from-yellow-400 via-yellow-200 to-amber-600 rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(234,179,8,0.5)] mb-3 p-0.5">
                                    <div className="w-full h-full bg-[#111] rounded-full flex items-center justify-center">
                                        <Lock size={20} className="text-yellow-400" />
                                    </div>
                                </motion.div>
                                <span className="text-xs font-black text-yellow-400 uppercase tracking-[0.2em] mb-1 shadow-black drop-shadow-md">VIP</span>
                            </div>
                        ) : (
                            <div className="absolute bottom-0 left-0 right-0 p-4 z-10 pointer-events-none">
                                <h3 className="text-xl font-black text-white flex items-center gap-2 leading-none mb-1 drop-shadow-lg">
                                    {user.name}, {user.age}
                                </h3>
                                <div className="flex items-center gap-1.5 text-[10px] text-cuadralo-pink font-black uppercase tracking-widest drop-shadow-md mb-4">
                                    <Heart size={12} fill="currentColor" /> Le gustas
                                </div>
                                <div className="flex gap-2 pointer-events-auto opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                   <button 
                                      onClick={(e) => { e.stopPropagation(); handleAction(user.id, "left", "like"); }}
                                      className="flex-1 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white py-2.5 rounded-xl text-xs font-bold transition-colors"
                                   >
                                      Ocultar
                                   </button>
                                   <button 
                                      onClick={(e) => { e.stopPropagation(); handleAction(user.id, "right", "like"); }}
                                      className="flex-[2] bg-gradient-to-r from-cuadralo-pink to-purple-600 shadow-[0_4px_15px_rgba(242,19,142,0.4)] hover:scale-105 active:scale-95 text-white py-2.5 rounded-xl text-xs font-bold transition-all"
                                   >
                                      Dar Like
                                   </button>
                                </div>
                            </div>
                        )}
                    </div>
                    ))}
                </div>
            </>
          ) : (
            <EmptyState title="Buscando tu media naranja..." subtitle="Aún no hay likes nuevos." onBoost={() => setShowFlash(true)} />
          )
      )}

      {/* === BANDEJA DE ROMPEHIELOS === */}
      {view === "messages" && (
          rompehielos.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in-up">
                  {rompehielos.map((req) => (
                      <div 
                          key={req.id} 
                          className="bg-white/40 dark:bg-[#1a0b2e]/60 backdrop-blur-2xl border border-blue-500/30 rounded-3xl p-5 shadow-[0_10px_40px_rgba(59,130,246,0.1)] hover:shadow-[0_15px_50px_rgba(59,130,246,0.2)] transition-all flex flex-col sm:flex-row gap-5 items-start relative overflow-hidden group cursor-pointer"
                          onClick={() => setSelectedUser(req)}
                      >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 blur-[50px] rounded-full -mr-10 -mt-10 pointer-events-none transition-transform group-hover:scale-150" />
                          
                          <div className="relative shrink-0">
                             <img src={req.img || "https://via.placeholder.com/150"} alt={req.name} className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shadow-xl z-10 border-2 border-white/10 dark:border-white/5 group-hover:scale-105 transition-transform" />
                             <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white p-1.5 rounded-xl shadow-lg rotate-12 group-hover:rotate-0 transition-transform">
                                <Sparkles size={14} fill="currentColor" />
                             </div>
                          </div>
                          
                          <div className="flex-1 z-10 w-full flex flex-col h-full">
                              <div className="flex justify-between items-start mb-2">
                                 <div>
                                    <h3 className="font-black text-xl leading-none text-cuadralo-textLight dark:text-white group-hover:text-blue-500 transition-colors">{req.name}, <span className="text-cuadralo-textMutedLight dark:text-gray-400 font-medium">{req.age}</span></h3>
                                    <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mt-1 opacity-80">Rompehielo Directo</p>
                                 </div>
                              </div>
                              
                              <div className="bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 rounded-2xl p-3 text-sm text-cuadralo-textLight dark:text-gray-200 font-medium italic relative mb-4 flex-1">
                                  <div className="absolute -left-1 -top-2 text-2xl text-blue-500 opacity-30 pointer-events-none">"</div>
                                  <span className="relative z-10">{req.message}</span>
                                  <div className="absolute -right-1 -bottom-4 text-2xl text-blue-500 opacity-30 pointer-events-none">"</div>
                              </div>

                              <div className="flex gap-2 w-full mt-auto">
                                  <button 
                                      onClick={(e) => { e.stopPropagation(); handleAction(req.id, "left", "inbox"); }}
                                      className="flex-1 bg-black/5 dark:bg-white/5 hover:bg-red-500/10 dark:hover:bg-red-500/20 text-gray-500 hover:text-red-500 font-bold text-xs py-2.5 rounded-xl transition-all border border-transparent hover:border-red-500/30 backdrop-blur-sm"
                                  >
                                      Descartar
                                  </button>
                                  <button 
                                      onClick={(e) => { e.stopPropagation(); handleAction(req.id, "right", "inbox"); }}
                                      className="flex-[2] flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-[0_5px_15px_rgba(59,130,246,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
                                  >
                                      Dar Like <ArrowRight size={14} />
                                  </button>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          ) : (
              <EmptyState title="Tu bandeja está limpia" subtitle="Los Rompehielos directos aparecerán aquí." onBoost={() => setShowFlash(true)} />
          )
      )}

      <AnimatePresence>
        {showPrime && <PrimeModal onClose={() => setShowPrime(false)} />}
        {showFlash && <FlashModal onClose={() => { setShowFlash(false); fetchFlashInfo(); }} />}
        {selectedUser && <ProfileDetailsModal profile={selectedUser} onClose={() => setSelectedUser(null)} hideIcebreaker={true} />}
      </AnimatePresence>
    </motion.div>
  );
}

function EmptyState({ title, subtitle, onBoost }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-6">
            <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                <motion.div animate={{ scale: [1, 1.5, 2], opacity: [0.3, 0.1, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 rounded-full bg-cuadralo-pink/50"/>
                <div className="relative z-10 w-16 h-16 bg-gradient-to-tr from-cuadralo-pink to-purple-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-cuadralo-pink/30">
                    <Heart size={24} className="text-white fill-white animate-pulse" />
                </div>
            </div>

            <h2 className="text-xl font-black tracking-tighter mb-2 text-cuadralo-textLight dark:text-white">{title}</h2>
            <p className="text-gray-500 text-sm max-w-xs mb-10 font-medium">{subtitle}</p>

            <div className="w-full max-w-sm bg-cuadralo-cardLight dark:bg-[#150a21] border border-black/5 dark:border-white/5 rounded-[2rem] p-6 relative overflow-hidden group shadow-glass-light dark:shadow-glass-dark">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/10 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none" />
                <div className="relative z-10 text-left">
                    <div className="flex items-center gap-2 mb-1.5">
                        <Sparkles size={16} className="text-yellow-600 dark:text-yellow-400" />
                        <span className="text-[10px] font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-widest">Consejo VIP</span>
                    </div>
                    <h3 className="text-lg font-black tracking-tight mb-2">Consigue 3x más Likes</h3>
                    <button onClick={onBoost} className="w-full py-3.5 mt-2 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-xl text-black font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2">
                        <Zap size={16} fill="currentColor" /> Activar Destello
                    </button>
                </div>
            </div>
        </div>
    );
}