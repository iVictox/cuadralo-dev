"use client";

import { useEffect, useState, useCallback } from "react";
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
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-subtle pb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Sparkles className="text-accent-primary" size={26} /> Gestión de Rompehielos
          </h1>
          <p className="text-sm text-muted mt-1">
            {mode === "messages" ? "Verifica los mensajes de rompehielo enviados." : "Gestiona el inventario de rompehielos de usuarios."}
          </p>
        </div>
        
        <div className="flex bg-card-hover border border-subtle">
          <button 
            onClick={() => setMode("messages")}
            className={`px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition-none ${mode === "messages" ? "bg-accent-primary text-white" : "text-secondary hover:text-primary"}`}
          >
            Mensajes
          </button>
          <button 
            onClick={() => setMode("inventory")}
            className={`px-5 py-2.5 text-sm font-bold uppercase tracking-wide transition-none ${mode === "inventory" ? "bg-accent-primary text-white" : "text-secondary hover:text-primary"}`}
          >
            Inventario
          </button>
        </div>
      </div>

      {mode === "messages" && (
        <>
          <div className="relative w-full md:w-96 mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card border border-subtle text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent-primary transition-none"
            />
          </div>

          <div className="bg-card border border-subtle overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-card-hover text-muted font-bold border-b border-subtle text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-4">De</th>
                    <th className="px-5 py-4">Para</th>
                    <th className="px-5 py-4">Mensaje</th>
                    <th className="px-5 py-4">Fecha</th>
                    <th className="px-5 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle">
                  {loading ? (
                    <tr><td colSpan="5" className="text-center py-10 font-medium text-muted">Cargando...</td></tr>
                  ) : rompehielos.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-10 font-medium text-muted">Sin registros.</td></tr>
                  ) : rompehielos.map((item) => {
                    const fromUser = users[item.from_user_id];
                    const toUser = users[item.to_user_id];
                    return (
                      <tr key={item.id} className="hover:bg-card-hover transition-none">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-accent-bg border border-subtle overflow-hidden flex items-center justify-center font-bold text-accent-primary text-sm">
                              {fromUser?.photo ? <img src={fromUser.photo} alt={fromUser.name} className="w-full h-full object-cover" /> : fromUser?.name?.charAt(0) || "?"}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-primary">{fromUser?.name}</p>
                              <p className="text-xs font-medium text-muted">@{fromUser?.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-accent-bg border border-subtle overflow-hidden flex items-center justify-center font-bold text-accent-primary text-sm">
                              {toUser?.photo ? <img src={toUser.photo} alt={toUser.name} className="w-full h-full object-cover" /> : <span className="text-muted">?</span>}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-primary">{toUser?.name || `#${item.to_user_id}`}</p>
                              {toUser?.username && <p className="text-xs font-medium text-muted">@{toUser.username}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-secondary font-medium text-sm max-w-[200px] truncate">{item.message}</td>
                        <td className="px-5 py-4 text-muted font-bold text-xs">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : "N/A"}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <button onClick={() => setSelectedItem(item)} className="px-4 py-2 bg-card-hover border border-subtle text-primary font-bold text-xs uppercase tracking-wide hover:bg-subtle transition-none">
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
          <div className="bg-card border border-subtle p-6 mb-6">
            <h3 className="text-base font-bold text-primary mb-4 border-b border-subtle pb-2">Buscar Usuario</h3>
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
                <input
                  type="text"
                  placeholder="Buscar por nombre o username..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-card-hover border border-subtle text-sm text-primary focus:outline-none focus:border-accent-primary transition-none"
                />
              </div>
            </div>
          </div>

          {allUsers.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {allUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => loadUserInventory(u)}
                  className={`p-4 border text-left transition-none ${
                    selectedUser?.id === u.id 
                      ? "border-accent-primary bg-accent-bg" 
                      : "border-subtle bg-card hover:border-accent-primary/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-accent-bg border border-subtle overflow-hidden shrink-0 flex items-center justify-center font-bold text-accent-primary">
                      {u.photo ? <img src={u.photo} alt={u.name} className="w-full h-full object-cover" /> : u.name?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-primary truncate">{u.name}</p>
                      <p className="text-xs font-medium text-muted truncate">@{u.username}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedUser && userInventory && (
            <div className="bg-card border border-subtle p-6 mt-6">
              <div className="flex items-center gap-6 mb-6 pb-4 border-b border-subtle">
                <div className="w-16 h-16 bg-accent-bg border border-subtle overflow-hidden flex items-center justify-center font-bold text-accent-primary text-xl">
                  {selectedUser.photo ? <img src={selectedUser.photo} alt={selectedUser.name} className="w-full h-full object-cover" /> : selectedUser.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-primary font-bold text-2xl">{selectedUser.name}</p>
                  <p className="text-muted font-medium text-sm">@{selectedUser.username}</p>
                </div>
                <div className="ml-auto text-right p-4 bg-card-hover border border-subtle">
                  <p className="text-accent-primary font-black text-4xl">{userInventory.total}</p>
                  <p className="text-muted font-bold text-xs uppercase tracking-widest mt-1">Total Rompehielos</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                {[
                  { key: "flash", label: "Flash", color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/30", btnGreen: "bg-green-500/10 text-green-500 border border-transparent hover:border-green-500/30", btnRed: "bg-red-500/10 text-red-500 border border-transparent hover:border-red-500/30" },
                  { key: "clasico", label: "Clásico", color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/30", btnGreen: "bg-green-500/10 text-green-500 border border-transparent hover:border-green-500/30", btnRed: "bg-red-500/10 text-red-500 border border-transparent hover:border-red-500/30" },
                  { key: "estelar", label: "Estelar", color: "text-yellow-500", bg: "bg-yellow-500/10 border-yellow-500/30", btnGreen: "bg-green-500/10 text-green-500 border border-transparent hover:border-green-500/30", btnRed: "bg-red-500/10 text-red-500 border border-transparent hover:border-red-500/30" }
                ].map((type) => (
                  <div key={type.key} className="text-center p-6 border border-subtle bg-card-hover">
                    <div className={`border ${type.bg} p-6 mb-4`}>
                      <p className={`${type.color} text-5xl font-black`}>{userInventory[type.key]}</p>
                    </div>
                    <p className="text-muted font-bold text-sm uppercase tracking-wider mb-6">{type.label}</p>
                    <div className="flex justify-center gap-4">
                      <button 
                        onClick={() => updateInventory(type.key, -1)}
                        disabled={userInventory[type.key] <= 0 || loading}
                        className={`p-3 ${type.btnRed} disabled:opacity-30 transition-none`}
                      >
                        <Minus size={24} />
                      </button>
                      <button 
                        onClick={() => updateInventory(type.key, 1)}
                        disabled={loading}
                        className={`p-3 ${type.btnGreen} transition-none`}
                      >
                        <Plus size={24} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

        {selectedItem && (
          <RompehieloDetailsModal 
            item={selectedItem} 
            fromUser={users[selectedItem.from_user_id]}
            toUser={users[selectedItem.to_user_id]}
            onClose={() => { setSelectedItem(null); fetchData(); }}
          />
        )}
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
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="relative w-full max-w-lg bg-card border border-subtle shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted hover:text-primary z-10 p-2 bg-card-hover border border-subtle">
          <X size={24} />
        </button>

        <div className="p-8">
          <div className="flex items-center gap-4 mb-8 border-b border-subtle pb-4">
            <div className="w-16 h-16 bg-accent-bg border border-accent-primary flex items-center justify-center text-accent-primary">
                <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-primary">Detalle del Rompehielo</h3>
              <p className="text-muted font-bold text-sm">ID: #{item.id}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card-hover border border-subtle p-5">
              <p className="text-muted text-xs mb-3 uppercase font-bold tracking-wider">DE (REMITE)</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent-bg border border-subtle overflow-hidden flex items-center justify-center font-bold text-accent-primary">
                  {fromUser?.photo ? <img src={fromUser.photo} alt={fromUser.name} className="w-full h-full object-cover" /> : fromUser?.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-primary font-bold text-base">{fromUser?.name}</p>
                  <p className="text-muted font-medium text-sm">@{fromUser?.username}</p>
                </div>
              </div>
            </div>

            <div className="bg-card-hover border border-subtle p-5">
              <p className="text-muted text-xs mb-3 uppercase font-bold tracking-wider">PARA (DESTINATARIO)</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-accent-bg border border-subtle overflow-hidden flex items-center justify-center font-bold text-accent-primary">
                  {toUser?.photo ? <img src={toUser.photo} alt={toUser.name} className="w-full h-full object-cover" /> : "?"}
                </div>
                <div>
                  <p className="text-primary font-bold text-base">{toUser?.name || `#${item.to_user_id}`}</p>
                  {toUser?.username ? <p className="text-muted font-medium text-sm">@{toUser.username}</p> : <p className="text-muted text-sm">Usuario #{item.to_user_id}</p>}
                </div>
              </div>
            </div>

            <div className="bg-card-hover border border-subtle p-5">
              <p className="text-muted text-xs mb-3 uppercase font-bold tracking-wider">MENSAJE</p>
              <p className="text-primary italic text-base font-medium">&ldquo;{item.message || "Sin mensaje"}&rdquo;</p>
            </div>

            <div className="bg-card-hover border border-subtle p-5">
              <p className="text-muted text-xs mb-2 uppercase font-bold tracking-wider">FECHA Y HORA</p>
              <p className="text-primary font-bold text-sm">{formatFecha(item.created_at)}</p>
            </div>

            <button onClick={handleDelete} disabled={loading} className="w-full py-4 mt-6 bg-error text-white font-bold uppercase tracking-wider hover:bg-error/90 transition-none disabled:opacity-50">
              Eliminar Mensaje
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}