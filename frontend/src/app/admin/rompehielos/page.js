"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import { Search, Sparkles, X, Plus, Minus, User } from "lucide-react";

export default function AdminRompehielos() {
  const { showToast } = useToast();
  const [rompehielos, setRompehielos] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

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



  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-subtle pb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Sparkles className="text-accent-primary" size={26} /> Gestión de Rompehielos
          </h1>
          <p className="text-sm text-muted mt-1">
            Verifica los mensajes de rompehielo enviados.
          </p>
        </div>
      </div>


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