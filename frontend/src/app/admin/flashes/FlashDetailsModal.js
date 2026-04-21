"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Zap, Clock, Eye, User, AlertTriangle } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function FlashDetailsModal({ flash, user, onClose }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  if (!flash) return null;

  const formatTime = (seconds) => {
    if (!seconds || seconds <= 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeRemaining = () => {
    if (!flash.ends_at) return "N/A";
    const end = new Date(flash.ends_at);
    const now = new Date();
    const diff = end - now;
    if (diff <= 0) return "Expirado";
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await fetch("http://localhost:8080/api/admin/flash/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ id: flash.id })
      });
      showToast("Destello eliminado", "success");
      onClose();
    } catch (error) {
      showToast("Error al eliminar destello", "error");
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "flash": return "from-blue-400 to-cyan-400";
      case "clasico": return "from-purple-500 to-pink-500";
      case "estelar": return "from-yellow-400 to-orange-500";
      default: return "from-gray-400 to-gray-500";
    }
  };

  const getTypeName = (type) => {
    switch (type) {
      case "flash": return "Flash ⚡";
      case "clasico": return "Clásico ✨";
      case "estelar": return "Estelar 🌟";
      default: return type;
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-[#150a21] rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white z-10">
          <X size={20} />
        </button>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${getTypeColor(flash.type)} flex items-center justify-center mb-4 mx-auto shadow-lg`}>
              <Zap size={32} className="text-white" fill="currentColor" />
            </div>
            <h2 className="text-2xl font-bold text-white">{getTypeName(flash.type)}</h2>
            <p className="text-white/60 text-sm">Detalle del Destello</p>
          </div>

          {user && (
            <div className="bg-white/5 rounded-xl p-4 mb-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden">
                {user.photo ? (
                  <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/50">
                    <User size={20} />
                  </div>
                )}
              </div>
              <div>
                <p className="text-white font-bold">{user.name}</p>
                <p className="text-white/50 text-sm">@{user.username}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <Clock size={20} className="text-blue-400 mx-auto mb-2" />
              <p className="text-white/50 text-xs mb-1">Tiempo Restante</p>
              <p className="text-xl font-bold text-white">{getTimeRemaining()}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <Eye size={20} className="text-green-400 mx-auto mb-2" />
              <p className="text-white/50 text-xs mb-1">Personas Alcanzadas</p>
              <p className="text-xl font-bold text-white">{flash.reached_count || 0}</p>
            </div>
          </div>

          <div className="bg-white/5 rounded-xl p-4 mb-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/50">Iniciado</span>
              <span className="text-white">{flash.starts_at ? new Date(flash.starts_at).toLocaleString() : "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Finaliza</span>
              <span className="text-white">{flash.ends_at ? new Date(flash.ends_at).toLocaleString() : "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Duración</span>
              <span className="text-white">{flash.duration ? `${flash.duration} min` : "N/A"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">ID</span>
              <span className="text-white/40 text-xs">#{flash.id}</span>
            </div>
          </div>

          {showDelete ? (
            <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 text-red-400 mb-2">
                <AlertTriangle size={16} />
                <span className="font-medium">¿Eliminar este destello?</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowDelete(false)}
                  className="flex-1 py-2 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition-all"
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? "Eliminando..." : "Confirmar"}
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setShowDelete(true)}
              className="w-full py-3 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl font-medium hover:bg-red-500/30 transition-all"
            >
              Eliminar Destello
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}