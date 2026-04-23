"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import { Search, Heart, X, ThumbsDown, ThumbsUp, Trash2 } from "lucide-react";

export default function AdminLikes() {
  const { showToast } = useToast();
  const [likes, setLikes] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/admin/likes/list?search=${search}`);
      setLikes(data.likes || []);
      
      const userIds = [...new Set([
        ...(data.likes?.map(r => r.from_user_id).filter(Boolean) || []),
        ...(data.likes?.map(r => r.to_user_id).filter(Boolean) || [])
      ])];
      
      if (userIds && userIds.length > 0) {
        const usersData = {};
        await Promise.all(userIds.map(async (id) => {
          try {
            const userData = await api.get(`/users/${id}`);
            usersData[id] = userData;
          } catch (e) {
            usersData[id] = { id, name: `Usuario #${id}`, username: "unknown" };
          }
        }));
        setUsers(usersData);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { 
    const timer = setTimeout(() => fetchData(), 300);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <Heart className="text-pink-500" size={24} /> Gestión de Likes
          </h1>
          <p className="text-xs text-white/50 mt-0.5">Administra todos los likes y dislikes de los usuarios.</p>
        </div>
        
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
          <input
            type="text"
            placeholder="Buscar por ID, nombre, usuario..."
            value={search}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40"
          />
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/50 border-b border-white/10 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">De</th>
                <th className="px-4 py-3">Para</th>
                <th className="px-4 py-3">Acción</th>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8 text-white/40">Cargando...</td></tr>
              ) : likes.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-white/40">Sin registros.</td></tr>
              ) : likes.map((item) => {
                const fromUser = users[item.from_user_id];
                const toUser = users[item.to_user_id];
                return (
                  <tr key={item.id} className="hover:bg-white/5">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden">
                          {fromUser?.photo && <img src={fromUser.photo} alt={fromUser.name} className="w-full h-full object-cover" />}
                        </div>
                        <div>
                          <p className="text-white text-xs">{fromUser?.name}</p>
                          <p className="text-white/40 text-[10px]">@{fromUser?.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden">
                          {toUser?.photo ? <img src={toUser.photo} alt={toUser.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/40">?</div>}
                        </div>
                        <div>
                          <p className="text-white text-xs">{toUser?.name || `#${item.to_user_id}`}</p>
                          {toUser?.username ? <p className="text-white/40 text-[10px]">@{toUser.username}</p> : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {item.action === "right" ? (
                        <span className="flex items-center gap-1 text-green-400 text-xs">
                          <ThumbsUp size={14} /> Like
                        </span>
                      ) : item.action === "left" ? (
                        <span className="flex items-center gap-1 text-red-400 text-xs">
                          <ThumbsDown size={14} /> Dislike
                        </span>
                      ) : item.action === "rompehielo" ? (
                        <span className="flex items-center gap-1 text-cyan-400 text-xs">
                          <Heart size={14} className="fill-cyan-400" /> Rompehielo
                        </span>
                      ) : (
                        <span className="text-white/40 text-xs">{item.action}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-white/40 text-xs">
                      {item.created_at ? new Date(item.created_at).toLocaleString("es-VE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      }) : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setSelectedItem(item)} className="px-3 py-1 bg-white/10 text-white rounded text-xs hover:bg-white/20">
                        Ver
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedItem && (
          <LikeDetailsModal 
            item={selectedItem} 
            fromUser={users[selectedItem.from_user_id]}
            toUser={users[selectedItem.to_user_id]}
            onClose={() => { setSelectedItem(null); fetchData(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function LikeDetailsModal({ item, fromUser, toUser, onClose }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("¿Eliminar esta acción de like?")) return;
    setLoading(true);
    try {
      await api.delete(`/admin/likes/${item.id}`);
      showToast("Acción eliminada", "success");
      onClose();
    } catch (error) {
      showToast("Error al eliminar", "error");
    } finally { setLoading(false); }
  };

  const formatFecha = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString("es-VE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getActionIcon = (action) => {
    switch (action) {
      case "right": return <ThumbsUp size={16} className="text-green-400" />;
      case "left": return <ThumbsDown size={16} className="text-red-400" />;
      case "rompehielo": return <Heart size={16} className="text-cyan-400 fill-cyan-400" />;
      default: return null;
    }
  };

  const getActionLabel = (action) => {
    switch (action) {
      case "right": return "Like";
      case "left": return "Dislike";
      case "rompehielo": return "Rompehielo";
      default: action;
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg bg-[#150a21] rounded-2xl overflow-hidden border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white z-10">
          <X size={20} />
        </button>

        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 p-[3px]">
              <div className="w-full h-full bg-[#150a21] rounded-lg flex items-center justify-center">
                <Heart className="w-7 h-7 text-pink-400" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Detalle del Like</h3>
              <p className="text-white/50 text-xs">ID: #{item.id}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-white/40 text-xs mb-3 uppercase font-bold">DE (QUIEN DIO LIKE)</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden">
                  {fromUser?.photo && <img src={fromUser.photo} alt={fromUser.name} className="w-full h-full object-cover" />}
                </div>
                <div>
                  <p className="text-white font-semibold">{fromUser?.name}</p>
                  <p className="text-pink-400 text-xs">@{fromUser?.username}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-white/40 text-xs mb-3 uppercase font-bold">PARA (QUIEN RECIBE)</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden">
                  {toUser?.photo ? <img src={toUser.photo} alt={toUser.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/40">?</div>}
                </div>
                <div>
                  <p className="text-white font-semibold">{toUser?.name || `#${item.to_user_id}`}</p>
                  {toUser?.username ? <p className="text-pink-400 text-xs">@{toUser.username}</p> : <p className="text-white/40 text-xs">Usuario #{item.to_user_id}</p>}
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-white/40 text-xs mb-2 uppercase font-bold">ACCIÓN</p>
              <div className="flex items-center gap-2">
                {getActionIcon(item.action)}
                <span className="text-white font-medium">{getActionLabel(item.action)}</span>
              </div>
            </div>

            {item.message && (
              <div className="bg-white/5 rounded-xl p-4">
                <p className="text-white/40 text-xs mb-2 uppercase font-bold">MENSAJE</p>
                <p className="text-white italic text-sm">&ldquo;{item.message}&rdquo;</p>
              </div>
            )}

            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-white/40 text-xs mb-2 uppercase font-bold">FECHA Y HORA</p>
              <p className="text-white text-sm">{formatFecha(item.created_at)}</p>
            </div>

            <button onClick={handleDelete} disabled={loading} className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
              <Trash2 size={18} /> Eliminar Acción
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}