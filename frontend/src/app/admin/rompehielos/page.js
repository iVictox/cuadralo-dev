"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import { Search, Sparkles, X, Plus, Minus, User } from "lucide-react";

export default function AdminRompehielos() {
  const { showToast } = useToast();
  const [mode, setMode] = useState("messages");
  
  const [rompehielos, setRompehielos] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [allUsers, setAllUsers] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userInventory, setUserInventory] = useState(null);

  // Fetch messages
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/admin/rompehielos/list?search=${search}`);
      setRompehielos(data.rompehielos || []);
      
      const userIds = [...new Set([
        ...(data.rompehielos?.map(r => r.from_user_id).filter(Boolean) || []),
        ...(data.rompehielos?.map(r => r.to_user_id).filter(Boolean) || [])
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

  useEffect(() => { fetchData(); }, [fetchData]);

  // Fetch users for inventory
  const fetchUsers = useCallback(async () => {
    try {
      const data = await api.get(`/admin/users?search=${userSearch}&limit=20`);
      setAllUsers(data.users || data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, [userSearch]);

  useEffect(() => {
    if (mode === "inventory") {
      const timer = setTimeout(() => fetchUsers(), 300);
      return () => clearTimeout(timer);
    }
  }, [mode, fetchUsers]);

  const loadUserInventory = async (user) => {
    setSelectedUser(user);
    try {
      const data = await api.get(`/users/${user.id}`);
      setUserInventory({
        flash: data.flash_count || 0,
        clasico: data.clasico_count || 0,
        estelar: data.estelar_count || 0,
        total: (data.flash_count || 0) + (data.clasico_count || 0) + (data.estelar_count || 0)
      });
    } catch (error) {
      console.error("Error loading:", error);
    }
  };

  const updateInventory = async (type, amount) => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      await api.post(`/admin/rompehielos/update-inventory`, {
        user_id: selectedUser.id,
        type: type,
        amount: amount
      });
      showToast("Inventario actualizado", "success");
      await loadUserInventory(selectedUser);
    } catch (error) {
      showToast("Error al actualizar", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-white flex items-center gap-2">
            <Sparkles className="text-cyan-400" size={24} /> Gestión de Rompehielos
          </h1>
          <p className="text-xs text-white/50 mt-0.5">
            {mode === "messages" ? "Verifica los mensajes de rompehielo enviados." : "Gestiona el inventario de rompehielos de usuarios."}
          </p>
        </div>
        
        <div className="flex bg-white/5 rounded-lg p-1">
          <button 
            onClick={() => setMode("messages")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${mode === "messages" ? "bg-cyan-500 text-white" : "text-white/60 hover:text-white"}`}
          >
            Mensajes
          </button>
          <button 
            onClick={() => setMode("inventory")}
            className={`px-4 py-2 rounded-md text-sm font-medium ${mode === "inventory" ? "bg-cyan-500 text-white" : "text-white/60 hover:text-white"}`}
          >
            Inventario
          </button>
        </div>
      </div>

      {mode === "messages" && (
        <>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40"
            />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-white/50 border-b border-white/10 text-xs uppercase">
                  <tr>
                    <th className="px-4 py-3">De</th>
                    <th className="px-4 py-3">Para</th>
                    <th className="px-4 py-3">Mensaje</th>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan="5" className="text-center py-8 text-white/40">Cargando...</td></tr>
                  ) : rompehielos.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-8 text-white/40">Sin registros.</td></tr>
                  ) : rompehielos.map((item) => {
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
                              {toUser?.username && <p className="text-white/40 text-[10px]">@{toUser.username}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-white/60 text-xs max-w-[150px] truncate">{item.message}</td>
                        <td className="px-4 py-3 text-white/40 text-xs">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button onClick={() => setSelectedItem(item)} className="px-3 py-1 bg-white/10 text-white rounded text-xs">
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
        </>
      )}

      {mode === "inventory" && (
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-4">Buscar Usuario</h3>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
                <input
                  type="text"
                  placeholder="Buscar por nombre o username..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white"
                />
              </div>
            </div>
          </div>

          {allUsers.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
              {allUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => loadUserInventory(u)}
                  className={`p-3 rounded-xl border text-left ${
                    selectedUser?.id === u.id 
                      ? "border-cyan-500 bg-cyan-500/10" 
                      : "border-white/10 bg-white/5 hover:border-white/30"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden">
                      {u.photo && <img src={u.photo} alt={u.name} className="w-full h-full object-cover" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-xs font-medium truncate">{u.name}</p>
                      <p className="text-white/40 text-[10px] truncate">@{u.username}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedUser && userInventory && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-xl p-6"
            >
              <div className="flex items-center gap-4 mb-6 pb-4 border-b border-white/10">
                <div className="w-14 h-14 rounded-full bg-white/10 overflow-hidden">
                  {selectedUser.photo && <img src={selectedUser.photo} alt={selectedUser.name} className="w-full h-full object-cover" />}
                </div>
                <div>
                  <p className="text-white font-semibold text-lg">{selectedUser.name}</p>
                  <p className="text-cyan-400 text-sm">@{selectedUser.username}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-cyan-400 font-bold text-3xl">{userInventory.total}</p>
                  <p className="text-white/40 text-xs">Total Rompehielos</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {[
                  { key: "flash", label: "Flash", color: "text-blue-400", bg: "bg-blue-500/20", btnGreen: "bg-green-500/20 hover:bg-green-500/40", btnRed: "bg-red-500/20 hover:bg-red-500/40" },
                  { key: "clasico", label: "Clásico", color: "text-purple-400", bg: "bg-purple-500/20", btnGreen: "bg-green-500/20 hover:bg-green-500/40", btnRed: "bg-red-500/20 hover:bg-red-500/40" },
                  { key: "estelar", label: "Estelar", color: "text-yellow-400", bg: "bg-yellow-500/20", btnGreen: "bg-green-500/20 hover:bg-green-500/40", btnRed: "bg-red-500/20 hover:bg-red-500/40" }
                ].map((type) => (
                  <div key={type.key} className="text-center">
                    <div className={`${type.bg} rounded-xl p-4 mb-3`}>
                      <p className={`${type.color} text-3xl font-bold`}>{userInventory[type.key]}</p>
                    </div>
                    <p className="text-white/60 text-sm mb-4">{type.label}</p>
                    <div className="flex justify-center gap-3">
                      <button 
                        onClick={() => updateInventory(type.key, -1)}
                        disabled={userInventory[type.key] <= 0 || loading}
                        className={`p-3 rounded-xl ${type.btnRed} disabled:opacity-30 transition-colors`}
                      >
                        <Minus size={18} className={type.color.replace("400", "500")} />
                      </button>
                      <button 
                        onClick={() => updateInventory(type.key, 1)}
                        disabled={loading}
                        className={`p-3 rounded-xl ${type.btnGreen} transition-colors`}
                      >
                        <Plus size={18} className="text-green-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}

      <AnimatePresence>
        {selectedItem && (
          <RompehieloDetailsModal 
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

function RompehieloDetailsModal({ item, fromUser, toUser, onClose }) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("¿Eliminar este mensaje de rompehielo?")) return;
    setLoading(true);
    try {
      await api.delete(`/admin/rompehielos/${item.id}`);
      showToast("Mensaje eliminado", "success");
      onClose();
    } catch (error) {
      showToast("Error", "error");
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
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 p-[3px]">
              <div className="w-full h-full bg-[#150a21] rounded-lg flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-cyan-400" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Detalle del Rompehielo</h3>
              <p className="text-white/50 text-xs">ID: #{item.id}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-white/40 text-xs mb-3 uppercase font-bold">DE (REMITE)</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden">
                  {fromUser?.photo && <img src={fromUser.photo} alt={fromUser.name} className="w-full h-full object-cover" />}
                </div>
                <div>
                  <p className="text-white font-semibold">{fromUser?.name}</p>
                  <p className="text-cyan-400 text-xs">@{fromUser?.username}</p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-white/40 text-xs mb-3 uppercase font-bold">PARA (DESTINATARIO)</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white/10 overflow-hidden">
                  {toUser?.photo ? <img src={toUser.photo} alt={toUser.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-white/40">?</div>}
                </div>
                <div>
                  <p className="text-white font-semibold">{toUser?.name || `#${item.to_user_id}`}</p>
                  {toUser?.username ? <p className="text-cyan-400 text-xs">@{toUser.username}</p> : <p className="text-white/40 text-xs">Usuario #{item.to_user_id}</p>}
                </div>
              </div>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-white/40 text-xs mb-2 uppercase font-bold">MENSAJE</p>
              <p className="text-white italic text-sm">&ldquo;{item.message || "Sin mensaje"}&rdquo;</p>
            </div>

            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-white/40 text-xs mb-2 uppercase font-bold">FECHA Y HORA</p>
              <p className="text-white text-sm">{formatFecha(item.created_at)}</p>
            </div>

            <button onClick={handleDelete} disabled={loading} className="w-full py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors">
              Eliminar Mensaje
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}