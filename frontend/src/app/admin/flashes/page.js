"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/utils/api";
import { Search, Zap, Clock, Eye, Filter, TrendingUp, RefreshCw } from "lucide-react";
import { useDebounce } from 'use-debounce';
import FlashDetailsModal from "./FlashDetailsModal";

const FLASH_TYPES = {
  flash: { name: "Flash ⚡", color: "from-blue-400 to-cyan-400", bgColor: "bg-blue-500/20", textColor: "text-blue-400" },
  clasico: { name: "Clásico ✨", color: "from-purple-500 to-pink-500", bgColor: "bg-purple-500/20", textColor: "text-purple-400" },
  estelar: { name: "Estelar 🌟", color: "from-yellow-400 to-orange-500", bgColor: "bg-yellow-500/20", textColor: "text-yellow-400" }
};

export default function AdminFlashes() {
  const [flashes, setFlashes] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [filter, setFilter] = useState("active");
  const [selectedFlash, setSelectedFlash] = useState(null);
  const [stats, setStats] = useState({ total: 0, active: 0, expired: 0, totalReach: 0 });

  const fetchFlashes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/admin/flash/list?filter=${filter}&search=${debouncedSearch}`);
      const flashesData = data.flashes || [];
      setFlashes(flashesData);
      setStats(data.stats || { total: 0, active: 0, expired: 0, totalReach: 0 });

      const userIds = [...new Set(flashesData.map(f => f.user_id).filter(Boolean))];
      if (userIds.length > 0) {
        setLoadingUsers(true);
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
        setLoadingUsers(false);
      }
    } catch (error) {
      console.error("Error cargando destellos:", error);
    } finally {
      setLoading(false);
    }
  }, [filter, debouncedSearch]);

  useEffect(() => { fetchFlashes(); }, [fetchFlashes]);

  const formatTimeRemaining = (endsAt) => {
    if (!endsAt) return "N/A";
    const end = new Date(endsAt);
    const now = new Date();
    const diff = end - now;
    if (diff <= 0) return "Expirado";
    const mins = Math.floor(diff / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isActive = (endsAt) => {
    if (!endsAt) return false;
    return new Date(endsAt) > new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <Zap className="text-yellow-400" size={24} /> Gestión de Destellos
          </h1>
          <p className="text-xs text-white/50 mt-0.5">Visualiza y gestiona los destellos activos de los usuarios.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); }}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-yellow-500/50"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-yellow-500/50"
          >
            <option value="active">Activos</option>
            <option value="all">Todos</option>
            <option value="expired">Expirados</option>
          </select>
          <button 
            onClick={fetchFlashes}
            className="p-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
          >
            <RefreshCw size={16} className={`text-white/60 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 text-white/50 text-xs mb-2">
            <TrendingUp size={14} />
            Total Destellos
          </div>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 text-green-400 text-xs mb-2">
            <Zap size={14} />
            Activos Ahora
          </div>
          <p className="text-2xl font-bold text-green-400">{stats.active}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-400 text-xs mb-2">
            <Clock size={14} />
            Expirados
          </div>
          <p className="text-2xl font-bold text-red-400">{stats.expired}</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 text-yellow-400 text-xs mb-2">
            <Eye size={14} />
            Total Alcanzados
          </div>
          <p className="text-2xl font-bold text-yellow-400">{stats.totalReach}</p>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 text-white/50 border-b border-white/10 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Tiempo Restante</th>
                <th className="px-4 py-3">Alcanzados</th>
                <th className="px-4 py-3">Inicio</th>
                <th className="px-4 py-3">Fin</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan="7" className="text-center py-8 text-white/40">Cargando destellos...</td></tr>
              ) : flashes.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-8 text-white/40">No hay destellos {filter === "active" ? "activos" : filter === "expired" ? "expirados" : ""}.</td></tr>
              ) : flashes.map((flash) => {
                const user = users[flash.user_id];
                const type = FLASH_TYPES[flash.type] || FLASH_TYPES.flash;
                const active = isActive(flash.ends_at);
                
                return (
                  <tr key={flash.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 overflow-hidden shrink-0">
                          {user?.photo ? (
                            <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/40 text-xs">?</div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-white">{user?.name || `Usuario #${flash.user_id}`}</div>
                          <div className="text-xs text-white/40">@{user?.username || "unknown"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-medium px-2 py-1 rounded ${type.bgColor} ${type.textColor}`}>
                        {type.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {active ? (
                        <span className="text-green-400 font-medium">{formatTimeRemaining(flash.ends_at)}</span>
                      ) : (
                        <span className="text-red-400">Expirado</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-white font-medium">{flash.reached_count || 0}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-white/40">
                      {flash.starts_at ? new Date(flash.starts_at).toLocaleString() : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-xs text-white/40">
                      {flash.ends_at ? new Date(flash.ends_at).toLocaleString() : "N/A"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => setSelectedFlash(flash)}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs transition-all"
                      >
                        Ver Detalle
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
        {selectedFlash && (
          <FlashDetailsModal 
            flash={selectedFlash} 
            user={users[selectedFlash.user_id]}
            onClose={() => {
              setSelectedFlash(null);
              fetchFlashes();
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}