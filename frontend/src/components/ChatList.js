"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MessageCircle, Zap, Crown, Sparkles, Heart } from "lucide-react";
import { api } from "@/utils/api";
import FlashModal from "@/components/FlashModal";
import PrimeModal from "@/components/PrimeModal";
import SquareLoader from "./SquareLoader";

export default function ChatList({ onChatSelect, onLoaded }) {
  const [newMatches, setNewMatches] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [likes, setLikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [showFlash, setShowFlash] = useState(false);
  const [showPrime, setShowPrime] = useState(false);
  const [flashInfo, setFlashInfo] = useState(null);

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

  // ✅ NUEVO: La lista se actualiza automáticamente si entra un mensaje o leen uno tuyo
  useEffect(() => {
    fetchData();
    fetchFlashInfo();

    const handleSocketEvent = (e) => {
        const data = e.detail;
        if (data.type === "new_message" || data.type === "messages_read" || data.type === "new_match" || data.type === "new_icebreaker") {
            fetchData();
        }
    };
    
    window.addEventListener("socket_event", handleSocketEvent);
    return () => window.removeEventListener("socket_event", handleSocketEvent);
  }, []);

  const fetchData = async () => {
    try {
      const data = await api.get("/matches");
      if (Array.isArray(data)) {
        const news = data.filter(u => !u.last_message);
        const chats = data.filter(u => u.last_message).sort((a, b) => new Date(b.last_message_time) - new Date(a.last_message_time));
        
        setNewMatches(news);
        setConversations(chats);
      }
      
      const likesData = await api.get("/likes/pending");
      setLikes((likesData || []).filter(l => l.is_icebreaker));
    } catch (error) {
      console.error("Error chats:", error);
    } finally {
      setLoading(false);
      if (onLoaded) onLoaded();
    }
  };

  const filteredNewMatches = newMatches.filter(match => 
    match.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredConversations = conversations.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLikes = likes.filter(like => 
    like.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-cuadralo-bgLight dark:bg-cuadralo-bgDark text-cuadralo-textLight dark:text-cuadralo-textDark transition-colors duration-300">
      <div className="px-6 pt-16 pb-4 flex justify-between items-center bg-cuadralo-bgLight/95 dark:bg-cuadralo-bgDark/95 backdrop-blur-md sticky top-0 z-10 border-b border-black/5 dark:border-white/5">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-black tracking-tighter uppercase italic">Chats</h1>
          {flashInfo?.is_active && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowFlash(true)}
              className="w-10 h-10 flex-shrink-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-md border border-white/40 animate-pulse overflow-hidden"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="flex flex-col items-center justify-center"
              >
                <Zap size={14} className="text-white fill-current" strokeWidth={2.5} />
                <span className="text-[9px] text-white font-bold leading-none">
                  {formatFlashTime(flashInfo?.time_remaining || 0)}
                </span>
              </motion.div>
            </motion.button>
          )}
        </div>
        <button onClick={() => setShowPrime(true)} className="p-2 bg-yellow-500/10 rounded-full hover:bg-yellow-500/20 transition-colors border border-yellow-500/20">
            <Crown size={20} className="text-yellow-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
        
        <div className="px-6 py-4">
            <div className="relative">
                <Search className="absolute left-4 top-3.5 text-cuadralo-textMutedLight dark:text-gray-500" size={18} />
                <input 
                    type="text" 
                    placeholder="Buscar..." 
                    className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-cuadralo-pink/50 transition-all placeholder:text-cuadralo-textMutedLight dark:placeholder:text-gray-600 text-cuadralo-textLight dark:text-white"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </div>
        
        {conversations.length < 5 && (
            <div 
                onClick={() => setShowFlash(true)}
                className="mx-6 mb-6 p-4 rounded-2xl bg-gradient-to-r from-cuadralo-pink/10 to-purple-600/10 border border-cuadralo-pink/20 flex items-center gap-4 cursor-pointer hover:scale-[1.01] transition-all"
            >
                <div className="p-2.5 bg-cuadralo-pink rounded-xl text-white shadow-lg shadow-cuadralo-pink/20">
                    <Zap size={18} fill="currentColor" />
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-bold">¿Pocos matches?</h4>
                    <p className="text-[10px] uppercase font-black tracking-widest opacity-60">Usa un destello ahora</p>
                </div>
            </div>
        )}

        {filteredLikes.length > 0 && (
            <div className="px-6 mb-6">
                <h2 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    <Heart size={14} className="fill-cyan-500" /> Le Gustas 💌
                </h2>
                <div className="space-y-2">
                    {filteredLikes.map((like) => (
                        <motion.div 
                            key={like.id}
                            className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 flex items-center gap-4 cursor-pointer hover:scale-[1.01] transition-all"
                            onClick={() => onChatSelect(like)}
                        >
                            <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-gray-700 border-2 border-cyan-500/30">
                                <img src={like.photo || like.img} alt={like.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-sm font-bold text-white">{like.name}</h3>
                                    {like.is_prime && <Crown size={12} className="text-yellow-400 fill-yellow-400" />}
                                </div>
                                <p className="text-xs text-cyan-400 line-clamp-1">
                                    <Sparkles size={10} className="inline mr-1" />
                                    {like.message || "Te envió un rompehielo"}
                                </p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onChatSelect({...like, action: 'approve'}); }}
                                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full"
                                >
                                    Aprobar
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        )}

        {filteredNewMatches.length > 0 && (
            <div className="px-6 mb-8">
                <h2 className="text-[10px] font-black text-cuadralo-pink uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    Nuevos Matches 🔥
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {filteredNewMatches.map((match, i) => (
                        <motion.div 
                            key={match.id}
                            className="flex flex-col items-center gap-2 cursor-pointer group min-w-[75px]"
                            onClick={() => onChatSelect(match)}
                        >
                            <div className="relative w-16 h-16 rounded-2xl p-[2px] bg-gradient-to-tr from-cuadralo-pink to-purple-600 shadow-lg">
                                <div className="w-full h-full rounded-[14px] border-2 border-cuadralo-bgLight dark:border-cuadralo-bgDark overflow-hidden bg-gray-200 dark:bg-gray-800 relative">
                                    <img src={match.photo || "https://via.placeholder.com/150"} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                </div>
                            </div>
                            <span className="text-[11px] font-bold truncate w-full text-center opacity-80">{match.name.split(" ")[0]}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        )}

        <div className="px-2">
            <h2 className="text-[10px] font-black text-cuadralo-textMutedLight dark:text-gray-500 uppercase tracking-[0.2em] mb-3 px-4">Conversaciones</h2>
            
            {loading && <div className="flex justify-center py-10"><SquareLoader size="small" /></div>}
            
            {!loading && filteredConversations.length === 0 && (
                <div className="text-center py-12 flex flex-col items-center opacity-40">
                    <MessageCircle size={32} className="mb-2" />
                    <p className="text-sm font-bold uppercase tracking-widest">
                        {searchQuery ? "Sin resultados" : "Sin mensajes"}
                    </p>
                </div>
            )}

            <div className="space-y-1">
                {filteredConversations.map((chat) => {
                    const hasUnread = chat.unread_count > 0;
                    return (
                        <motion.div
                            key={chat.id}
                            onClick={() => onChatSelect(chat)}
                            className={`flex items-center gap-4 p-4 mx-2 rounded-2xl cursor-pointer transition-all group ${hasUnread ? 'bg-cuadralo-pink/5 border border-cuadralo-pink/10' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}
                        >
                            <div className="relative flex-shrink-0">
                                <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800 border border-black/5 dark:border-white/5 shadow-sm">
                                    <img src={chat.photo || "https://via.placeholder.com/150"} className="w-full h-full object-cover" />
                                </div>
                                {hasUnread && <div className="absolute -top-1 -right-1 w-4 h-4 bg-cuadralo-pink rounded-full border-2 border-cuadralo-bgLight dark:border-cuadralo-bgDark" />}
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <div className="flex justify-between items-center mb-0.5">
                                    <h3 className={`text-sm truncate pr-2 ${hasUnread ? "font-black text-cuadralo-textLight dark:text-white" : "font-bold"}`}>
                                        {chat.name}
                                    </h3>
                                    <span className={`text-[9px] font-black uppercase flex-shrink-0 ${hasUnread ? "text-cuadralo-pink" : "opacity-40"}`}>
                                        {new Date(chat.last_message_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center">
                                    <p className={`text-xs truncate pr-4 ${hasUnread ? "font-bold opacity-100" : "opacity-50"}`}>
                                        {chat.last_message}
                                    </p>
                                    {hasUnread && (
                                        <span className="min-w-[18px] h-4.5 px-1.5 bg-cuadralo-pink rounded-lg flex items-center justify-center text-[9px] font-black text-white shadow-lg shadow-cuadralo-pink/20">
                                            {chat.unread_count}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
      </div>

      <AnimatePresence>
         {showFlash && <FlashModal onClose={() => setShowFlash(false)} />}
         {showPrime && <PrimeModal onClose={() => setShowPrime(false)} />}
      </AnimatePresence>
    </div>
  );
}