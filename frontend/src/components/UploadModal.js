"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon, MapPin, Loader2, Send, Smile, Filter, Globe, Plus, ChevronLeft, ChevronRight, SmilePlus } from "lucide-react";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";

const EMOJIS = [
    "😀", "😃", "😄", "😁", "😆", "😅", "🤣", "😂", "🙂", "🙃", "😉", "😊", "😇", 
    "🥰", "😍", "🤩", "😘", "😗", "😚", "😙", "🥲", "😋", "😛", "😜", "🤪", "😝", 
    "🤑", "🤗", "🤭", "🤫", "🤔", "🤐", "🤨", "😐", "😑", "😶", "😏", "😒", "🙄", "😬", 
    "🤥", "😌", "😔", "😪", "🤤", "😴", "😷", "🤒", "🤕", "🤢", "🤧", "🥵", "🥶", 
    "🥴", "😵", "🤯", "🤰", "🥳", "🤴", "🤵", "🤶", "🎅", "🤸", "🤺", "🤾", "🏌", 
    "🏇", "🧘", "🛀", "🛌", "👭", "👫", "👬", "💑", "💏", "❤️", "💕", "💔", "💖", 
    "💗", "💘", "💙", "💚", "💛", "💜", "💝", "💞", "💟", "🔥", "💯", "✨", "🎉", "🎊", 
    "🎈", "⭐", "🌟", "💫", "🌙", "☀️", "🌈", "☁️", "❄️", "🌊", "💥", "💢", "💨", 
    "🧡", "🧣", "🧤", "🧥", "🧦", "🧡", "👑", "👒", "🧢", "🕶", "💍", "💎", "🎤", 
    "🎧", "🎼", "🎹", "🥁", "🎷", "🎺", "🎸", "🪕", "📱", "💻", "🖥", "🖨", "⌨", 
    "🖱", "💽", "💾", "💿", "📀", "📼", "📷", "📸", "🎥", "📽", "🎞", "📞", "☎", 
    "📟", "📠", "📺", "📻", "🎙", "🎚", "🎛", "⏰", "⏱", "⏲", "📡", "🔋", "🔌", 
    "💡", "🔦", "🕯", "🪔", "🧯", "🛢", "💸", "💵", "💳", "💰", "🪙", "🏆", "🎖", 
    "🏅", "🥇", "🥈", "🥉", "⚽", "⚾", "🏀", "🏐", "🏉", "🎾", "🏓", "🏸", "🥊", 
    "🥋", "🎽", "🎿", "🛷", "⛷", "🏂", "🪂", "🏆", "🎯", "🎱", "🎮", "🎰", "🧩", 
    "🎲", "♟️", "🎭", "🎪", "🎬", "🎨", "🎤", "🎧", "🎼", "🎹", "🥁", "🎷", "🎺", 
    "🎸", "🪕", "❤️", "💕", "💖", "💗", "💘", "💝", "💟", "❣️", "💔", "🩷", "🩵", 
    "🩶", "💋", "💯", "💢", "💥", "💫", "💦", "💪", "🧠", "🫀", "🫁", "🦴", "👀", 
    "👁", "👅", "���", "👋", "🤚", "🖐", "✋", "🖖", "👌", "🤏", "✌️", "🤞", "🤟", 
    "🤘", "🤙", "👈", "👉", "👆", "🖕", "👇", "☝️", "👍", "👊", "✊", "🤛", "🤜", 
    "👏", "🙌", "👐", "🤲", "🗣", "💅", "🤳", "💪", "👣", "👣", "🧱", "🧲", "🧼", 
    "🚿", "🛁", "🛀", "🧽", "🧾", "🪣", "🧺", "🧻", "🪥", "🪒", "🧹", "🪚", 
    "🔒", "🔓", "🔏", "🔐", "🔑", "🗝", "🔒", "🧰", "🧱", "⛓", "🧲", "🔗", "📎", 
    "🖇", "📌", "📍", "🗜", "🔧", "🔨", "⚒", "🛠", "⛏", "🪚", "🔩", "⚙️", "🗜", 
    "⚖️", "🦾", "🦿", "🦵", "🦿", "🧊", "🧊", "🍏", "🍎", "🍐", "🍊", "🍋", "🍌", 
    "🍍", "🥭", "🍓", "🍇", "🍈", "🍉", "🍄", "🥜", "🥐", "🥯", "🍞", "🥖", "🥨", 
    "🧀", "🥚", "🍳", "🧈", "🥞", "🥓", "🥩", "🍗", "🍖", "🌭", "🍔", "🍟", "🍕", 
    "🌮", "🌯", "🥙", "🧆", "🧇", "🥗", "🥘", "🍝", "🍜", "🍲", "🍛", "🍣", "🍱", 
    "🥟", "🦪", "🍤", "🍙", "🍚", "🍘", "🍥", "🥠", "🥢", "🍽", "🍴", "🥄", "🔪", 
    "🧫", "🧽", "🥣", "🥤", "🍶", "🍺", "🍻", "🥂", "🥃", "🫗", "🥤", "🧋", "🧃", 
    "🧉", "🧊", "☕", "🫖", "🍵", "🫘", "🥛", "🍼", "🧴", "🧷", "🧹", "🧺", 
    "🧻", "🧼", "🧽", "🪒", "🧽", "🧺", "🪣", "🚬", "⚰️", "⚱️", "🪦", "⚱️", 
    "🏺", "🎰", "🎱", "🎳", "🏏", "🏑", "🏒", "🏓", "🏸", "🥅", "⛳", "⛱️", "🎾", 
    "🎱", "🛼", "🛷", "⛸", "🥌", "🎿", "🚣", "🧊", "🚤", "🛥", "🛳", "⛴", "🚢", 
    "✈️", "🛩", "🛫", "🛬", "🪂", "🚁", "🚂", "🚃", "🚄", "🚅", "🚆", "🚇", "🚈", 
    "🚉", "🚊", "🚝", "🚞", "🚋", "🚍", "🚔", "🚘", "🚙", "🛻", "🚚", "🚛", "🚎", 
    "🏎", "🏍", "🚲", "🚏", "🚦", "🚥", "🗺️", "🗺️", "🗿", "🎊", "🎉", "🎎", 
    "🎐", "🎏", "🎃", "🎄", "🎅", "🎁", "🧨", "🎈", "🎇", "🎆", "🧧", "🎎", "🏮", 
    "🎭", "🧐", "👺", "👻", "👽", "👾", "🤖", "💩", "☠️", "💀", "🙈", "🙉", "🙊", 
    "💣", "💣", "🪓", "🔪", "🗡️", "⚔️", "🛡️", "🚬", "☠️", "💥", "💫", "🦠", "🦠", 
    "🧼", "🦷", "🦴", "👁️", "👀", "👂", "👃", "🧠", "🫀", "🫁", "🦴", "🩸", "🩹", 
    "🩺", "💊", "💉", "🩻", "💇", "💇", "🚴", "🚵", "🧗", "🧘", "🛀", "🏋", "🤼", 
    "🤸", "⛹️", "🤺", "🏌️", "🤾", "🏇", "🧊", "🧱", "🧿", "🧖", "🧗", "🧘", "🧑‍⚕️", 
    "🧑‍⚖️", "🧑‍🚒", "🧑‍🩼", "🧑‍⚔️", "🧑‍🌾", "🧑‍🍳", "🧑‍🎤", "🧑‍🎨", "🧑‍🔬", "🧑‍💻", 
    "🧑‍🏭", "🧑‍🔧", "🧑‍🚀", "🧑‍🚣", "🦸", "🦹", "✨", "🌟", "💫", "⭐", "🌠", "☄️", 
    "🪐", "🌋", "🌉", "🗽", "🗿", "🗑", "🗝", "🗜", "🗡", "🛡", "🗒", "🗓", "📔", 
    "📚", "📖", "📝", "📁", "📂", "🗂️", "📅", "📆", "🗒", "🗃", "📎", "🖇", "📐", 
    "📏", "📍", "📌", "🔗", "📏", "📎", "🖊", "🖋", "✒️", "🖌", "🖍", "📝", "✏️", 
    "🔍", "🔎", "🔬", "🔭", "📡", "💡", "🔦", "🕯", "🕰", "⏰", "⏱", "⏲", "🕹"
];

const FILTER_PRESETS = [
    { name: "Normal", filter: "none" },
    { name: "Clásico", filter: "contrast(1.2) saturate(1.2)" },
    { name: "Cálido", filter: "sepia(0.5) contrast(1.1) brightness(1.1)" },
    { name: "Frío", filter: "saturate(1.5) hue-rotate(180deg)" },
    { name: "B&N", filter: "grayscale(1) contrast(1.2)" },
    { name: "Vintage", filter: "sepia(0.8) hue-rotate(-30deg) contrast(1.2)" }
];

export default function UploadModal({ onClose }) {
    const { showToast } = useToast();
    const fileInputRef = useRef(null);
    const emojiRef = useRef(null);
    const filterRef = useRef(null);
    
    const [files, setFiles] = useState([]);
    const [previews, setPreviews] = useState([]);
    const [filters, setFilters] = useState({});
    const [caption, setCaption] = useState("");
    const [location, setLocation] = useState("");
    const [loading, setLoading] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [showEmojis, setShowEmojis] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const currentFilter = filters[currentSlide] || "none";
    const userStr = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const userPhoto = currentUser?.photo || currentUser?.photos?.[0];

    useEffect(() => {
        document.body.style.overflow = "hidden";
        document.body.style.paddingTop = "0";
        return () => { 
            document.body.style.overflow = "unset";
            document.body.style.paddingTop = ""; 
        };
    }, []);

    const handleFileSelect = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (files.length + selectedFiles.length > 4) {
            showToast("Máximo 4 fotos", "error");
            return;
        }
        
        const newFiles = [...files, ...selectedFiles];
        setFiles(newFiles);
        
        const newPreviews = newFiles.map(f => URL.createObjectURL(f));
        setPreviews(newPreviews);
    };

    const setPhotoFilter = (filter) => {
        setFilters(prev => ({ ...prev, [currentSlide]: filter }));
        setShowFilters(false);
    };

    const removePhoto = (index) => {
        const newFiles = files.filter((_, i) => i !== index);
        const newPreviews = newFiles.map((f, i) => i < previews.length ? previews[i] : URL.createObjectURL(f));
        setFiles(newFiles);
        setPreviews(previews.filter((_, i) => i !== index));
        setFilters(prev => {
            const newFilters = { ...prev };
            delete newFilters[index];
            Object.keys(newFilters).forEach(key => {
                if (parseInt(key) > index) {
                    newFilters[parseInt(key) - 1] = newFilters[key];
                    delete newFilters[key];
                }
            });
            return newFilters;
        });
        if (currentSlide >= newFiles.length && newFiles.length > 0) {
            setCurrentSlide(newFiles.length - 1);
        }
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            showToast("Tu navegador no soporta geolocalización", "error");
            return;
        }
        setGettingLocation(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&accept-language=es`);
                    const data = await res.json();
                    const city = data.address.city || data.address.town || data.address.village || "Ciudad";
                    const country = data.address.country || "País";
                    setLocation(`${city}, ${country}`);
                } catch (error) {
                    showToast("Error al obtener ubicación", "error");
                } finally {
                    setGettingLocation(false);
                }
            },
            (error) => {
                showToast("Permiso denegado", "error");
                setGettingLocation(false);
            }
        );
    };

    const handlePublish = async () => {
        if (!caption.trim() && files.length === 0) {
            showToast("Escribe algo o añade fotos", "error");
            return;
        }
        setLoading(true);
        try {
            const imageUrls = await Promise.all(files.map(f => api.upload(f)));
            await api.post("/social/posts", { image_url: imageUrls.join(","), caption, location });
            showToast("¡Post publicado!");
            onClose();
            setTimeout(() => { window.location.reload(); }, 300);
        } catch (error) { 
            showToast("Error al publicar", "error"); 
            setLoading(false); 
        }
    };

    const addEmoji = (emoji) => {
        setCaption(prev => prev + emoji);
    };

    const charCount = caption.length;
    const maxChars = 500;
    const canPublish = (caption.trim() || files.length > 0) && !loading && charCount <= maxChars;

    return (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center md:p-3 md:pt-20">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
                onClick={onClose}
            />
            
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full md:max-w-5xl md:max-h-[90vh] h-[100dvh] md:h-[85vh] bg-[#150a21] md:rounded-3xl border-t-2 md:border border-[#8b1a93]/30 overflow-hidden flex flex-col md:flex-row"
            >
                {/* Header */}
                <div className="hidden md:flex absolute top-0 left-0 right-0 z-50 items-center justify-between px-6 py-4 border-b border-[#8b1a93]/30 bg-[#150a21]">
                    <div className="flex items-center gap-3">
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-[#8b1a93]/20 transition-all">
                            <X size={20} className="text-purple-300" />
                        </button>
                        <span className="text-lg font-bold text-white">Nueva publicación</span>
                    </div>
                    <button
                        onClick={handlePublish}
                        disabled={!canPublish}
                        className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all flex items-center gap-2 ${
                            canPublish 
                            ? "bg-[#f2158e] text-white" 
                            : "bg-[#8b1a93]/30 text-purple-500 cursor-not-allowed"
                        }`}
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        Publicar
                    </button>
                </div>

                {/* Panel Izquierdo - Fotos */}
                <div className="w-full md:w-[55%] flex-1 md:flex-none md:h-full bg-black relative flex items-center justify-center overflow-hidden order-1 md:order-1">
                    <AnimatePresence mode="wait">
                        {previews.length > 0 ? (
                            <motion.div 
                                key="slides"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="relative w-full h-full flex items-center justify-center bg-black"
                            >
                                <img 
                                    src={previews[currentSlide]} 
                                    alt={`Foto ${currentSlide + 1}`} 
                                    className="w-full h-full object-cover"
                                    style={{ filter: currentFilter }}
                                />
                                
                                {/* Slider Controls */}
                                {previews.length > 1 && (
                                    <>
                                        <button 
                                            onClick={() => setCurrentSlide(c => c > 0 ? c - 1 : previews.length - 1)}
                                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <button 
                                            onClick={() => setCurrentSlide(c => c < previews.length - 1 ? c + 1 : 0)}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full text-white"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-1.5">
                                            {previews.map((_, i) => (
                                                <button 
                                                    key={i}
                                                    onClick={() => setCurrentSlide(i)}
                                                    className={`w-2 h-2 rounded-full transition-all ${
                                                        i === currentSlide ? "bg-white w-4" : "bg-white/40"
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                                
                                {/* Botones de acción */}
                                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                                    <button 
                                        onClick={() => { setFiles([]); setPreviews([]); setCurrentSlide(0); }} 
                                        className="px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full font-medium text-sm"
                                    >
                                        Eliminar
                                    </button>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => fileInputRef.current.click()} 
                                            className="px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-full font-medium text-sm flex items-center gap-1"
                                        >
                                            <Plus size={16} /> Añadir
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="empty"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex flex-col items-center justify-center p-8 text-center"
                            >
                                <div className="w-24 h-24 rounded-full bg-[#8b1a93]/20 flex items-center justify-center mb-6 border-2 border-dashed border-[#8b1a93]/40">
                                    <ImageIcon size={40} className="text-[#f2158e]" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Sube tus fotos</h3>
                                <p className="text-sm text-purple-400 mb-6 max-w-xs">Añade hasta 4 imágenes</p>
                                <button 
                                    onClick={() => fileInputRef.current.click()} 
                                    className="w-full max-w-xs bg-[#f2158e] hover:bg-[#d9107a] text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    <ImageIcon size={20} /> Elegir de galería
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    
                    {/* Filtros */}
                    {showFilters && previews.length > 0 && (
                        <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            className="absolute bottom-24 left-4 right-4 flex gap-3 overflow-x-auto pb-2 z-20"
                        >
                            {FILTER_PRESETS.map((f, i) => (
                                <button
                                    key={i}
                                    onClick={() => setPhotoFilter(f.filter)}
                                    className={`flex flex-col items-center gap-1 transition-all min-w-[60px] ${
                                        currentFilter === f.filter ? "scale-110 opacity-100" : "scale-100 opacity-60 hover:opacity-100"
                                    }`}
                                >
                                    <div className={`w-14 h-14 rounded-full overflow-hidden border-2 shadow-lg ${
                                        currentFilter === f.filter ? "border-[#f2158e] shadow-[#f2158e]/50" : "border-white/20"
                                    }`}>
                                        <img 
                                            src={previews[currentSlide]} 
                                            alt={f.name}
                                            className="w-full h-full object-cover"
                                            style={{ filter: f.filter }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-bold text-white drop-shadow-md">{f.name}</span>
                                </button>
                            ))}
                        </motion.div>
                    )}
                    
                    <input type="file" ref={fileInputRef} hidden accept="image/*" multiple onChange={handleFileSelect} />
                </div>

                {/* Panel Derecho - Formulario */}
                <div className="w-full md:w-[45%] h-[50vh] md:h-full flex flex-col border-t md:border-t-0 md:border-l border-[#8b1a93]/30 order-2 md:order-2">
                    {/* Info del usuario */}
                    <div className="px-5 py-4 border-b border-[#8b1a93]/30 flex items-center gap-3">
                        {userPhoto ? (
                            <img src={userPhoto} alt="Perfil" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f2158e] to-[#8b1a93] flex items-center justify-center text-white font-bold text-sm">
                                {currentUser?.username?.charAt(0)?.toUpperCase()}
                            </div>
                        )}
                        <div>
                            <p className="font-bold text-white text-sm">{currentUser?.name}</p>
                            <p className="text-xs text-purple-400">@{currentUser?.username}</p>
                        </div>
                    </div>

                    {/* Textarea Descripción */}
                    <div className="flex-1 p-4 relative">
                        <textarea
                            placeholder="¿Qué tienes en mente?"
                            className="w-full h-full bg-transparent text-base text-white placeholder-purple-500/50 outline-none resize-none leading-relaxed"
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                        />
                        <div className="absolute bottom-4 right-4">
                            <span className={`text-xs ${charCount > maxChars ? "text-red-400" : "text-purple-500"}`}>
                                {charCount}/{maxChars}
                            </span>
                        </div>
                    </div>

                    {/* Emojis - above form on mobile */}
                    {showEmojis && (
                        <div className="md:hidden absolute bottom-24 left-4 right-4 z-30">
                            <div className="flex gap-1 flex-wrap max-h-32 overflow-y-auto bg-[#1a0b2e] p-3 rounded-xl border border-[#8b1a93]/30">
                                {EMOJIS.map((emoji, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => addEmoji(emoji)}
                                        className="text-2xl hover:scale-125 transition-transform p-1"
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ubicación */}
                    <div className="px-4 py-3 border-y border-[#8b1a93]/30">
                        {location ? (
                            <div className="flex items-center gap-2 px-3 py-2 bg-[#8b1a93]/20 rounded-xl border border-[#8b1a93]/30">
                                <Globe size={16} className="text-[#f2158e]" />
                                <span className="flex-1 text-sm text-white">{location}</span>
                                <button onClick={() => setLocation("")} className="p-1 hover:bg-[#8b1a93]/30 rounded-full">
                                    <X size={14} className="text-purple-400" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <button 
                                    onClick={handleGetLocation} 
                                    disabled={gettingLocation}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-[#8b1a93]/20 hover:bg-[#8b1a93]/30 rounded-xl text-sm text-purple-200 transition-colors border border-[#8b1a93]/30"
                                >
                                    {gettingLocation ? <Loader2 size={16} className="animate-spin text-[#f2158e]" /> : <MapPin size={16} />}
                                    {gettingLocation ? "Obteniendo..." : "Ubicación"}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Herramientas */}
                    <div className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => { setShowEmojis(!showEmojis); setShowFilters(false); }} 
                                className={`p-2.5 rounded-full transition-colors ${showEmojis ? "bg-[#f2158e] text-white" : "text-[#f2158e] hover:bg-[#f2158e]/20"}`}
                                title="Emojis"
                            >
                                <Smile size={20} />
                            </button>
                            <button 
                                onClick={() => { setShowFilters(!showFilters); setShowEmojis(false); }} 
                                disabled={previews.length === 0}
                                className={`p-2.5 rounded-full transition-colors ${showFilters ? "bg-[#f2158e] text-white" : "text-[#f2158e] hover:bg-[#f2158e]/20"} ${previews.length === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                                title="Filtros"
                            >
                                <Filter size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Header */}
                <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[#8b1a93]/30 bg-[#150a21]">
                    <button onClick={onClose} className="p-2">
                        <X size={24} className="text-white" />
                    </button>
                    <span className="font-bold text-white">Nueva publicación</span>
                    <button
                        onClick={handlePublish}
                        disabled={!canPublish}
                        className={`px-4 py-2 rounded-full font-bold text-sm ${
                            canPublish 
                            ? "bg-[#f2158e] text-white" 
                            : "bg-[#8b1a93]/30 text-purple-500"
                        }`}
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : "Publicar"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}