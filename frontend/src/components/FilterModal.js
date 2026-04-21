"use client";

import { useState, useEffect } from "react";
import { X, Save, Loader2, SlidersHorizontal, Users, Calendar, MapPin, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/utils/api";
import { INTERESTS_LIST } from "@/utils/interests";

export default function FilterModal({ onClose }) {
  const [loading, setLoading] = useState(false);
  const [prefs, setPrefs] = useState({
    distance: 50,
    show: "Todos",
    ageRange: [18, 30],
    interests: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await api.get("/me");
        if (user.preferences) {
          const savedPrefs = typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences;
          setPrefs(prev => ({ ...prev, ...savedPrefs, interests: savedPrefs.interests || [] }));
        }
      } catch (error) { console.error(error); }
    };
    fetchData();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const prefsToSend = { ...prefs };
      if (prefsToSend.ageRange[1] >= 60) prefsToSend.ageRange[1] = 100;
      await api.put("/me", { preferences: prefsToSend });
      window.location.reload(); 
      onClose();
    } catch (error) { alert("Error al guardar filtros"); } 
    finally { setLoading(false); }
  };

  const toggleInterest = (slug) => {
    setPrefs(prev => {
        const current = prev.interests || [];
        if (current.includes(slug)) {
            return { ...prev, interests: current.filter(i => i !== slug) };
        } else {
            return { ...prev, interests: [...current, slug] };
        }
    });
  };

  return (
    <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-md p-4"
        onClick={onClose}
    >
        <motion.div 
            initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-cuadralo-cardDark dark:bg-[#150A21]/95 backdrop-blur-2xl rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 border border-white/10 shadow-xl max-h-[90vh] overflow-hidden flex flex-col"
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-cuadralo-pink rounded-xl flex items-center justify-center">
                        <SlidersHorizontal size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-cuadralo-textLight dark:text-white">Filtros</h2>
                        <p className="text-xs text-cuadralo-textMutedLight dark:text-gray-400">Personaliza tu búsqueda</p>
                    </div>
                </div>
                <button onClick={onClose} className="w-9 h-9 flex items-center justify-center bg-black/5 dark:bg-white/10 rounded-full hover:bg-black/10 dark:hover:bg-white/20 transition-colors">
                    <X size={18} className="text-cuadralo-textMutedLight dark:text-gray-400" />
                </button>
            </div>

            {/* Contenido scrollable */}
            <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
                {/* Género */}
                <div className="bg-white/5 dark:bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-4">
                        <Users size={16} className="text-cuadralo-pink" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-cuadralo-textMutedLight dark:text-gray-400">Mostrar</span>
                    </div>
                    <div className="flex gap-2">
                        {['Hombres', 'Mujeres', 'Todos'].map((opt) => (
                            <button 
                                key={opt} 
                                onClick={() => setPrefs({...prefs, show: opt})} 
                                className={`flex-1 py-2.5 text-sm font-medium rounded-xl transition-all ${prefs.show === opt ? 'bg-cuadralo-pink text-white shadow-md' : 'bg-black/5 dark:bg-white/10 text-cuadralo-textMutedLight dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/20'}`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Edad */}
                <div className="bg-white/5 dark:bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-cuadralo-pink" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-cuadralo-textMutedLight dark:text-gray-400">Edad máxima</span>
                        </div>
                        <span className="text-2xl font-bold text-cuadralo-pink">
                            {prefs.ageRange[1] >= 60 ? "60+" : prefs.ageRange[1]}
                        </span>
                    </div>
                    <input 
                        type="range" 
                        min="18" 
                        max="60" 
                        value={Math.min(prefs.ageRange[1], 60)} 
                        onChange={(e) => setPrefs({...prefs, ageRange: [18, parseInt(e.target.value)]})} 
                        className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-cuadralo-pink"
                    />
                    <div className="flex justify-between mt-2 text-xs text-cuadralo-textMutedLight dark:text-gray-500">
                        <span>18</span>
                        <span>60+</span>
                    </div>
                </div>

                {/* Distancia */}
                <div className="bg-white/5 dark:bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-cuadralo-pink" />
                            <span className="text-xs font-semibold uppercase tracking-wider text-cuadralo-textMutedLight dark:text-gray-400">Distancia</span>
                        </div>
                        <span className="text-2xl font-bold text-cuadralo-pink">
                            {prefs.distance} km
                        </span>
                    </div>
                    <input 
                        type="range" 
                        min="1" 
                        max="100" 
                        value={prefs.distance} 
                        onChange={(e) => setPrefs({...prefs, distance: parseInt(e.target.value)})} 
                        className="w-full h-2 bg-black/10 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-cuadralo-pink"
                    />
                    <div className="flex justify-between mt-2 text-xs text-cuadralo-textMutedLight dark:text-gray-500">
                        <span>1 km</span>
                        <span>100 km</span>
                    </div>
                </div>

                {/* Intereses */}
                <div className="bg-white/5 dark:bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles size={16} className="text-cuadralo-pink" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-cuadralo-textMutedLight dark:text-gray-400">Intereses en común</span>
                    </div>
                    <div className="flex flex-wrap gap-2 max-h-[25vh] overflow-y-auto pr-1 custom-scrollbar">
                        {INTERESTS_LIST.map(interest => {
                            const isSelected = prefs.interests?.includes(interest.slug);
                            return (
                                <button
                                    key={interest.slug}
                                    onClick={() => toggleInterest(interest.slug)}
                                    className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium transition-all ${isSelected ? 'bg-cuadralo-pink text-white shadow-sm' : 'bg-black/5 dark:bg-white/10 text-cuadralo-textMutedLight dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/20'}`}
                                >
                                    <span>{interest.icon}</span>
                                    {interest.name}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="pt-4 mt-2 border-t border-black/5 dark:border-white/10">
                <button 
                    onClick={handleSave} 
                    disabled={loading} 
                    className="w-full py-4 rounded-2xl bg-cuadralo-pink text-white font-bold shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <Loader2 className="animate-spin" size={20} />
                    ) : (
                        <>
                            <Save size={18} />
                            Aplicar Filtros
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    </motion.div>
  );
}
