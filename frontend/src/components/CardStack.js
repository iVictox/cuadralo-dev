"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from "framer-motion";
import { X, Heart, MapPin, Info, RotateCcw, Zap, Crown, User, ChevronLeft, ChevronRight, MessageCircle, Sliders, Eye, EyeOff, Sparkles, Gift } from "lucide-react";
import Image from "next/image";
import { api } from "@/utils/api";
import MatchModal from "@/components/MatchModal";
import ProfileDetailsModal from "@/components/ProfileDetailsModal";
import VipModal from "@/components/VipModal";
import FlashModal from "@/components/FlashModal";
import IcebreakerModal from "@/components/IcebreakerModal";
import { getInterestInfo } from "@/utils/interests";
import SquareLoader from "./SquareLoader";

export default function CardStack({ onOpenFilters, onLoaded }) {
    const [cards, setCards] = useState([]);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    const [selectedProfile, setSelectedProfile] = useState(null);
    const [matchData, setMatchData] = useState(null);

    const [showVip, setShowVip] = useState(false);
    const [showBoost, setShowBoost] = useState(false);
    const [showFlash, setShowFlash] = useState(false);

    const [showIcebreaker, setShowIcebreaker] = useState(null);
    const [icebreakerMsg, setIcebreakerMsg] = useState("");

    const [isPrime, setIsPrime] = useState(false);
    const [myPhoto, setMyPhoto] = useState(null);
    const [flashInfo, setFlashInfo] = useState(null);

    const [swipeDir, setSwipeDir] = useState("right");

    useEffect(() => {
        fetchFeed();
        fetchMyData();
        fetchFlashInfo();
    }, []);

const fetchMyData = async () => {
        try {
            const me = await api.get("/me");
            setIsPrime(me.is_prime || false);
            setMyPhoto(me.photo || null);
        } catch (e) { console.warn(e); }
    };

    const fetchFlashInfo = async () => {
        try {
            const info = await api.get("/flash/info");
            setFlashInfo(info?.flash || null);
        } catch (e) { console.warn(e); }
    };

    const formatTime = (seconds) => {
        if (!seconds || seconds <= 0) return "0:00";
        return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, "0")}`;
    };

    useEffect(() => {
        if (!flashInfo?.is_active) return;
        const interval = setInterval(async () => {
            setFlashInfo(prev => {
                if (!prev) return prev;
                const newTime = Math.max(0, prev.time_remaining - 1);
                return { ...prev, time_remaining: newTime, is_expiring: newTime <= 300, is_active: newTime > 0 };
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [flashInfo?.is_active]);

    const fetchFeed = async () => {
        try {
            setLoading(true);
            const [users, me] = await Promise.all([
                api.get("/feed"),
                api.get("/me")
            ]);

            let prefs = null;
            if (me.preferences) {
                prefs = typeof me.preferences === 'string' ? JSON.parse(me.preferences) : me.preferences;
            }

            let formattedCards = users.map(u => ({
                id: u.id,
                name: u.name,
                age: u.age,
                gender: u.gender,
                bio: u.bio || "Sin descripción...",
                interests: typeof u.interests === 'string' ? JSON.parse(u.interests || "[]") : u.interests || [],
                img: u.photo || "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=600",
                photos: Array.isArray(u.photos) ? u.photos.filter(p => p && p.trim() !== "") : [u.photo].filter(p => p && p.trim() !== ""),
                location: "Valencia, Carabobo",
                is_prime: u.is_prime
            }));

            if (prefs) {
                formattedCards = formattedCards.filter(u => {
                    if (prefs.show && prefs.show !== "Todos") {
                        const userGender = u.gender?.toLowerCase() || "";
                        const wantMen = prefs.show === "Hombres";
                        const wantWomen = prefs.show === "Mujeres";

                        if (wantMen && !["hombre", "masculino", "male"].includes(userGender)) return false;
                        if (wantWomen && !["mujer", "femenino", "female"].includes(userGender)) return false;
                    }

                    if (prefs.ageRange && prefs.ageRange.length === 2) {
                        const [minAge, maxAge] = prefs.ageRange;
                        if (u.age < minAge || u.age > maxAge) return false;
                    }

                    if (prefs.interests && prefs.interests.length > 0) {
                        const hasCommonInterest = u.interests.some(interest => prefs.interests.includes(interest));
                        if (!hasCommonInterest) return false;
                    }

                    return true;
                });
            }

            setCards(formattedCards);
        } catch (error) {
            console.error("Error cargando feed:", error);
        } finally {
            setLoading(false);
            if (onLoaded) onLoaded();
        }
    };

    const removeCard = async (id, direction) => {
        setSwipeDir(direction);

        const cardToRemove = cards.find(c => c.id === id);
        const action = direction === "right" ? "right" : "left";

        try {
            const response = await api.post("/swipe", { target_id: id, action: action });

            setHistory(prev => [...prev, cardToRemove]);
            setCards((prev) => prev.filter((card) => card.id !== id));

            if (response.match) {
                setMatchData(cardToRemove);
                window.dispatchEvent(new CustomEvent("socket_event", { detail: { type: "new_match", payload: { user_id: cardToRemove.id } } }));
            }
        } catch (error) {
            if (error.needs_prime) {
                setShowVip(true);
            } else {
                console.error(error);
            }
        }
    };

    const sendIcebreaker = async () => {
        if (!icebreakerMsg.trim() || !showIcebreaker) return;

        setSwipeDir("right");

        try {
            const response = await api.post("/swipe", {
                target_id: showIcebreaker.id,
                action: "rompehielo",
                message: icebreakerMsg
            });

            setHistory(prev => [...prev, showIcebreaker]);
            setCards((prev) => prev.filter((card) => card.id !== showIcebreaker.id));

            if (response.match) setMatchData(showIcebreaker);

            setShowIcebreaker(null);
            setIcebreakerMsg("");
        } catch (error) {
            if (error.needs_purchase || error.needs_prime) {
                alert("Te has quedado sin Rompehielos. Ve a la tienda para conseguir más.");
            } else {
                console.error(error);
            }
        }
    };

    const handleRewind = async () => {
        if (!isPrime) {
            setShowVip(true);
            return;
        }
        if (history.length === 0) return;

        try {
            await api.delete("/swipe/undo");
            const lastCard = history[history.length - 1];
            setHistory(prev => prev.slice(0, -1));
            setCards(prev => [...prev, lastCard]);
        } catch (error) {
            if (error.needs_prime) setShowVip(true);
        }
    };

    if (loading) return (
        <div className="flex h-[75vh] w-full items-center justify-center flex-col gap-4">
            <SquareLoader size="medium" />
            <p className="mt-4 text-cuadralo-textMutedLight dark:text-cuadralo-textMutedDark text-sm font-medium animate-pulse">Buscando perfiles cerca de ti...</p>
        </div>
    );

    return (
        <div className="relative w-full h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] lg:h-screen flex flex-col items-center mt-0 overflow-hidden">
            {/* Fondo glass con gradientes animados */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-cuadralo-pink/5 via-transparent to-cuadralo-purple/5 dark:from-cuadralo-pink/10 dark:to-cuadralo-purple/10" />
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-cuadralo-pink/20 dark:bg-cuadralo-pink/15 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cuadralo-purple/20 dark:bg-cuadralo-purple/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
                {/* Partículas glass */}
                <div className="absolute top-20 left-1/4 w-2 h-2 bg-white/30 rounded-full blur-sm animate-float" />
                <div className="absolute top-40 right-1/3 w-3 h-3 bg-white/20 rounded-full blur-sm animate-float" style={{ animationDelay: '0.5s' }} />
                <div className="absolute bottom-32 left-1/3 w-2 h-2 bg-white/25 rounded-full blur-sm animate-float" style={{ animationDelay: '1s' }} />
            </div>

            {/* Botón de filtros glass */}
            {onOpenFilters && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    onClick={onOpenFilters}
                    className="absolute top-4 left-4 z-50 p-3.5 bg-white/40 dark:bg-white/10 backdrop-blur-2xl rounded-2xl shadow-glass-light dark:shadow-glass-dark border border-white/30 dark:border-white/20 text-cuadralo-textMutedLight dark:text-gray-300 hover:text-cuadralo-pink hover:scale-110 active:scale-95 transition-all group"
                    title="Filtros de Búsqueda"
                >
                    <Sliders size={22} strokeWidth={2.5} />
                </motion.button>
            )}

            {/* Estado sin resultados */}
            {cards.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center w-full text-center px-6 animate-fade-in z-10">
                    <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
                        <motion.div animate={{ scale: [1, 1.5, 2], opacity: [0.4, 0.1, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute inset-0 bg-cuadralo-pink/30 rounded-full blur-2xl" />
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="relative w-32 h-32 z-10">
                            <Image src="/globe.svg" fill alt="Buscando" className="object-contain opacity-80 dark:invert-0 invert" />
                        </motion.div>
                    </div>
                    <h3 className="text-2xl font-bold text-cuadralo-textLight dark:text-white mb-2">No hay nadie más cerca</h3>
                    <p className="text-cuadralo-textMutedLight dark:text-gray-400 text-sm mb-8 max-w-xs mx-auto leading-relaxed">
                        Hemos agotado los perfiles en tu área con tus filtros actuales. Usa un Destello para expandir tu alcance o cambia los filtros.
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowFlash(true)}
                        className="px-8 py-3.5 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl font-bold flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                    >
                        <Zap size={20} className="fill-current" />
                        Usar Destello
                    </motion.button>

                    <button onClick={() => window.location.reload()} className="mt-8 text-cuadralo-pink text-sm font-semibold hover:underline transition-all">
                        Volver a buscar
                    </button>
                </div>
            ) : (
                <>
                    {/* Área de tarjetas - más grandes y centrado */}
                    <div className="relative w-full h-full flex justify-center items-center px-2 pt-2 pb-32 md:pb-28 lg:pb-24 mx-auto z-10 max-w-md lg:max-w-lg">
                        <AnimatePresence>
                            {cards.map((card, index) => {
                                const isFront = index === cards.length - 1;
                                return (
                                    <TinderCard
                                        key={card.id}
                                        data={card}
                                        isFront={isFront}
                                        onSwipe={removeCard}
                                        onInfo={() => setSelectedProfile(card)}
                                        swipeDir={swipeDir}
                                    />
                                );
                            })}
                        </AnimatePresence>
                    </div>

                    {/* Botones de acción estilo glass premium */}
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-3 sm:gap-4 z-40 px-2 md:bottom-4 lg:bottom-6"
                    >
                        {/* Rewind */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={handleRewind}
                            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex flex-shrink-0 items-center justify-center backdrop-blur-xl border transition-all shadow-md ${(history.length === 0 && !isPrime) ? 'bg-gray-200/40 dark:bg-gray-800/40 opacity-40 border-transparent cursor-not-allowed' : 'bg-white/50 dark:bg-white/10 border-white/40 dark:border-white/20 hover:bg-yellow-50 dark:hover:bg-yellow-500/20 cursor-pointer'}`}
                        >
                            <RotateCcw size={20} className="text-yellow-500" strokeWidth={2.5} />
                        </motion.button>

                        {/* Nope */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeCard(cards[cards.length - 1].id, "left")}
                            className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-white/60 dark:bg-white/15 backdrop-blur-xl rounded-full flex items-center justify-center shadow-md border border-gray-200/30 dark:border-white/20 hover:scale-110 active:scale-95 transition-all"
                        >
                            <X size={26} className="text-gray-600 dark:text-gray-300" />
                        </motion.button>

                        {/* Icebreaker */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowIcebreaker(cards[cards.length - 1])}
                            className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 bg-white/50 dark:bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center shadow-md border border-white/40 dark:border-white/20 hover:scale-110 hover:bg-blue-50 dark:hover:bg-blue-900/30 active:scale-95 transition-all"
                        >
                            <Sparkles size={20} className="text-blue-500" strokeWidth={2.5} />
                        </motion.button>

                        {/* Like - Principal */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeCard(cards[cards.length - 1].id, "right")}
                            className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 bg-gradient-to-r from-cuadralo-pink to-cuadralo-purple rounded-full flex items-center justify-center shadow-md hover:shadow-lg hover:scale-110 active:scale-95 transition-all"
                        >
                            <Heart size={28} className="text-white fill-current" strokeWidth={2} />
                        </motion.button>

                        {/* Flash (Destellos) - Con animación cuando está activo */}
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowFlash(true)}
                            className={`w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 backdrop-blur-xl rounded-full flex items-center justify-center shadow-md border border-white/40 dark:border-white/20 hover:scale-110 active:scale-95 transition-all relative overflow-hidden ${
                                flashInfo?.is_active 
                                    ? "bg-gradient-to-br from-green-500 to-emerald-600 animate-pulse" 
                                    : "bg-gradient-to-br from-yellow-500/80 to-orange-500/80"
                            }`}
                        >
                            {flashInfo?.is_active ? (
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="flex flex-col items-center justify-center"
                                >
                                    <Zap size={16} className="text-white fill-current" strokeWidth={2.5} />
                                    <span className="text-[10px] text-white font-bold leading-none">
                                        {formatTime(flashInfo?.time_remaining || 0)}
                                    </span>
                                </motion.div>
                            ) : (
                                <Zap size={20} className="text-white fill-current" strokeWidth={2.5} />
                            )}
                        </motion.button>
                    </motion.div>
                </>
            )}

            {/* Modal Icebreaker - Nuevo estilo Cuadralo Glass */}
            <AnimatePresence>
                {showIcebreaker && (
                    <IcebreakerModal 
                        targetProfile={showIcebreaker}
                        onClose={() => setShowIcebreaker(null)}
                        onSuccess={() => {
                            const cardToRemove = showIcebreaker;
                            setHistory(prev => [...prev, cardToRemove]);
                            setCards((prev) => prev.filter((card) => card.id !== showIcebreaker.id));
                        }}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedProfile && <ProfileDetailsModal profile={selectedProfile} onClose={() => setSelectedProfile(null)} />}
            </AnimatePresence>
            <AnimatePresence>
                {showVip && <VipModal onClose={() => setShowVip(false)} />}
            </AnimatePresence>
            <AnimatePresence>
                {showBoost && <FlashModal onClose={() => { setShowBoost(false); fetchFlashInfo(); }} />}
            </AnimatePresence>
            <AnimatePresence>
                {showFlash && <FlashModal onClose={() => { setShowFlash(false); fetchFlashInfo(); }} />}
            </AnimatePresence>
            <AnimatePresence>
                {matchData && (
                    <MatchModal
                        key="match-modal-premium"
                        myPhoto={myPhoto}
                        matchedUser={matchData}
                        onClose={() => setMatchData(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function TinderCard({ data, isFront, onSwipe, onInfo, swipeDir }) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-300, 300], [-18, 18]);
    const opacity = useTransform(x, [-300, -150, 0, 150, 300], [0.6, 0.8, 1, 0.8, 0.6]);
    const scale = useTransform(x, [-300, 0, 300], [0.85, 1, 0.85]);

    const [activePhoto, setActivePhoto] = useState(0);
    const [showInfo, setShowInfo] = useState(true);

    const SWIPE_THRESHOLD = 120;

    const nextPhoto = useCallback((e) => {
        e.stopPropagation();
        if (activePhoto < data.photos.length - 1) setActivePhoto(activePhoto + 1);
    }, [activePhoto, data.photos.length]);

    const prevPhoto = useCallback((e) => {
        e.stopPropagation();
        if (activePhoto > 0) setActivePhoto(activePhoto - 1);
    }, [activePhoto]);

    // Indicadores de like/nope mientras arrastras
    const likeOpacity = useTransform(x, [0, 100], [0, 1]);
    const nopeOpacity = useTransform(x, [-100, 0], [1, 0]);

    return (
        <motion.div
            style={{ x, rotate, opacity: isFront ? opacity : 0.6, scale: isFront ? 1 : scale }}
            drag={isFront ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragEnd={(e, i) => {
                if (i.offset.x > SWIPE_THRESHOLD) {
                    onSwipe(data.id, "right");
                } else if (i.offset.x < -SWIPE_THRESHOLD) {
                    onSwipe(data.id, "left");
                } else {
                    animate(x, 0, { type: "spring", stiffness: 300, damping: 20 });
                }
            }}
            initial={{ scale: 0.9, y: 50, opacity: 0 }}
            animate={{ 
                scale: isFront ? 1 : 0.9, 
                y: isFront ? 0 : 40, 
                opacity: isFront ? 1 : 0.6 
            }}
            exit={{
                x: swipeDir === "right" ? 800 : -800,
                opacity: 0,
                rotate: swipeDir === "right" ? 30 : -30,
                transition: { duration: 0.4, ease: "easeOut" }
            }}
            className={`absolute w-[95%] sm:w-[95%] max-w-[480px] h-[88%] sm:h-[92%] lg:h-[90%] bg-cuadralo-cardDark dark:bg-[#0B0410] rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-xl ${!isFront && 'pointer-events-none'} cursor-grab active:cursor-grabbing`}
        >
            {/* Imagen principal */}
            <img 
                src={data.photos[activePhoto]} 
                alt={data.name} 
                className="absolute inset-0 w-full h-full object-cover"
                draggable={false}
            />

            {/* Overlay gradiente para texto */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />

            {/* Navegación de fotos */}
            <div className="absolute inset-0 flex z-10">
                <div 
                    className="w-1/3 h-full cursor-pointer flex items-center justify-start px-6 opacity-0 hover:opacity-100 transition-opacity" 
                    onClick={prevPhoto}
                >
                    {activePhoto > 0 && (
                        <div className="bg-black/40 backdrop-blur-xl p-4 rounded-full border border-white/20 shadow-md">
                            <ChevronLeft size={32} className="text-white" />
                        </div>
                    )}
                </div>
                <div className="w-1/3 h-full" />
                <div 
                    className="w-1/3 h-full cursor-pointer flex items-center justify-end px-6 opacity-0 hover:opacity-100 transition-opacity" 
                    onClick={nextPhoto}
                >
                    {activePhoto < data.photos.length - 1 && (
                        <div className="bg-black/40 backdrop-blur-xl p-4 rounded-full border border-white/20 shadow-md">
                            <ChevronRight size={32} className="text-white" />
                        </div>
                    )}
                </div>
            </div>



            {/* Indicadores de foto */}
            {data.photos.length > 1 && (
                <div className="absolute top-5 inset-x-24 flex gap-1.5 z-20 pointer-events-none">
                    {data.photos.map((_, i) => (
                        <div 
                            key={i} 
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i === activePhoto ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.9)]' : 'bg-white/30'}`} 
                        />
                    ))}
                </div>
            )}

            {/* Botones de información */}
            <div className="absolute top-5 right-5 flex gap-2 z-20">
                <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); setShowInfo(!showInfo); }} 
                    className="w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-xl rounded-full text-white hover:bg-black/60 transition-colors shadow-sm border border-white/20"
                    title={showInfo ? "Ocultar información" : "Mostrar información"}
                >
                    {showInfo ? <EyeOff size={18} /> : <Eye size={18} />}
                </motion.button>

                <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={(e) => { e.stopPropagation(); onInfo(); }} 
                    className="w-10 h-10 flex items-center justify-center bg-black/40 backdrop-blur-xl rounded-full text-white hover:bg-black/60 transition-colors shadow-sm border border-white/20"
                    title="Ver更多信息"
                >
                    <Info size={18} />
                </motion.button>
            </div>

            {/* Badge de fotos restantes */}
            {data.photos.length > 1 && (
                <div className="absolute top-5 left-5 z-20">
                    <div className="px-3 py-1.5 bg-black/40 backdrop-blur-2xl rounded-full border border-white/20 flex items-center gap-2">
                        <span className="text-white text-xs font-semibold">{data.photos.length} fotos</span>
                    </div>
                </div>
            )}

            {/* Información del perfil - Estilo glass premium */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: showInfo ? 1 : 0, y: showInfo ? 0 : 30 }}
                transition={{ duration: 0.3 }}
                className={`absolute bottom-0 w-full pb-6 sm:pb-8 pt-32 px-5 sm:px-6 text-white z-10`}
            >
                {/* Badge de género */}
                {data.gender && (
                    <motion.div 
                        initial={{ opacity: 0, x: -15 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-2xl rounded-full text-[11px] uppercase tracking-widest font-bold text-gray-100 w-max mb-3 border border-white/20"
                    >
                        <User size={14} className="text-cuadralo-pink" />
                        <span>{data.gender}</span>
                    </motion.div>
                )}

                {/* Nombre y edad */}
                <h2 className="text-4xl sm:text-5xl font-black flex items-end gap-3 mb-1 drop-shadow-md">
                    {data.name} 
                    <span className="text-3xl sm:text-4xl text-white/70 font-semibold">{data.age}</span>
                    {data.is_prime && (
                        <Crown size={28} fill="#fbbf24" className="text-yellow-400 mb-1" />
                    )}
                </h2>

                {data.is_prime && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1.5 text-yellow-400 mb-2"
                    >
                        <span className="text-xs font-bold uppercase tracking-wider">Premium VIP</span>
                    </motion.div>
                )}

                {/* Ubicación */}
                <div className="flex items-center gap-2 text-white/90 text-base mb-4 font-semibold drop-shadow-sm">
                    <MapPin size={18} className="text-cuadralo-pink" fill="currentColor" /> 
                    {data.location}
                </div>

                {/* Bio */}
                <p className="text-white/85 text-base leading-relaxed drop-shadow-sm mb-5 font-medium max-w-lg">
                    {data.bio}
                </p>

                {/* Intereses - máximo 3 con indicador de más */}
                <div className="flex gap-2 flex-wrap">
                    {data.interests.slice(0, 3).map((id, idx) => {
                        const info = getInterestInfo(id);
                        return (
                            <motion.span 
                                key={id}
                                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="flex items-center gap-1.5 text-xs px-3 py-2 bg-white/15 backdrop-blur-2xl rounded-full text-white border border-white/25 shadow-sm"
                            >
                                <span className="text-sm">{info.icon}</span>
                                <span className="font-semibold tracking-wide uppercase">{info.name}</span>
                            </motion.span>
                        );
                    })}
                    {data.interests.length > 3 && (
                        <motion.span 
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center gap-1.5 text-xs px-3 py-2 bg-white/10 backdrop-blur-2xl rounded-full text-white/70 border border-white/20"
                        >
                            <span className="font-semibold">+{data.interests.length - 3}</span>
                        </motion.span>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}
