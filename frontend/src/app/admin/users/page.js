"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/utils/api";
import { Search, Trash2, Ban, Eye, CheckCircle2, AlertOctagon } from "lucide-react";
import { useDebounce } from 'use-debounce';
import UserDetailModal from "./UserDetailModal";
import { useConfirm } from "@/context/ConfirmContext";

export default function AdminUsers() {
  const { confirm } = useConfirm();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [suspendModal, setSuspendModal] = useState(null);
  const [suspendDays, setSuspendDays] = useState(7);
  const [suspendReason, setSuspendReason] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/admin/users?page=${page}&limit=${limit}&search=${debouncedSearch}`);
      setUsers(data.users);
      setTotalPages(Math.ceil(data.total / limit));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const executeSuspension = async () => {
    if (!suspendModal) return;
    try {
      await api.put(`/admin/users/${suspendModal.id}/suspend`, { 
        is_suspended: true,
        days: parseInt(suspendDays),
        reason: suspendReason
      });
      setSuspendModal(null);
      setSuspendReason("");
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.error || "Error al suspender.");
    }
  };

  const liftSuspension = async (id) => {
    const isConfirmed = await confirm({
      title: "Levantar suspensión",
      message: "¿Estás seguro de levantar la suspensión de este usuario?",
      confirmText: "Sí, levantar",
      cancelText: "Cancelar",
      variant: "success"
    });
    if (!isConfirmed) return;
    try {
      await api.put(`/admin/users/${id}/suspend`, { is_suspended: false, days: 0, reason: "" });
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    const isConfirmed = await confirm({
      title: "ACCIÓN DESTRUCTIVA",
      message: "Borrará al usuario y todos sus datos de forma permanente. ¿Continuar?",
      confirmText: "Purgar",
      cancelText: "Cancelar",
      variant: "danger"
    });
    if (!isConfirmed) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.error || "Error al eliminar");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-primary">Gestión de Comunidad</h1>
          <p className="text-xs text-muted mt-0.5">Busca, audita y modera todas las cuentas.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            type="text"
            placeholder="Buscar por ID, nombre o @usuario..."
            value={search}
            onChange={(e) => {setSearch(e.target.value); setPage(1);}}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-subtle rounded-lg text-sm text-primary focus:outline-none focus:border-accent-primary"
          />
        </div>
      </div>

      <div className="bg-card border border-subtle rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-card-hover text-muted font-medium border-b border-subtle text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8 text-muted">Cargando...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-muted">Ningún usuario encontrado.</td></tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-card-hover transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent-bg overflow-hidden shrink-0">
                        {user.photo ? <img src={user.photo} alt={user.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted text-xs">{user.name?.charAt(0)}</div>}
                      </div>
                      <div>
                        <div className="font-medium text-primary">{user.name}</div>
                        <div className="text-xs text-muted">@{user.username} <span className="text-muted">ID:{user.id}</span></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-secondary">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] font-medium px-2 py-1 rounded ${['admin', 'superadmin', 'moderator', 'support'].includes(user.role) ? 'bg-accent-bg text-accent-primary' : 'bg-card-hover text-muted'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.is_suspended ? (
                      <span className="text-[10px] font-medium px-2 py-1 rounded bg-error/10 text-error">
                        <Ban size={10} className="inline mr-1"/> Suspendido
                      </span>
                    ) : (
                      <span className="text-[10px] font-medium px-2 py-1 rounded bg-success/10 text-success">
                        <CheckCircle2 size={10} className="inline mr-1"/> Activo
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setSelectedUser(user)} className="p-2 text-muted hover:text-primary hover:bg-card-hover rounded-lg" title="Ver">
                        <Eye size={16} />
                      </button>
                      {user.is_suspended ? (
                         <button onClick={() => liftSuspension(user.id)} className="p-2 text-success hover:bg-success/10 rounded-lg" title="Restaurar">
                            <CheckCircle2 size={16} />
                         </button>
                      ) : (
                         <button onClick={() => setSuspendModal(user)} className="p-2 text-warning hover:bg-warning/10 rounded-lg" title="Suspender">
                            <Ban size={16} />
                         </button>
                      )}
                      <button onClick={() => handleDelete(user.id)} className="p-2 text-muted hover:text-error hover:bg-error/10 rounded-lg" title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {suspendModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-subtle rounded-lg max-w-md w-full p-5">
            <div className="flex items-center gap-2 text-error mb-4">
               <AlertOctagon size={24} />
               <h3 className="text-lg font-semibold text-primary">Sancionar Usuario</h3>
            </div>
            <p className="text-sm text-secondary mb-4">Vas a sancionar a <span className="font-medium text-primary">@{suspendModal.username}</span>.</p>
            
            <div className="space-y-3">
              <div>
                  <label className="block text-xs font-medium text-muted mb-1">Duración</label>
                  <select value={suspendDays} onChange={e => setSuspendDays(e.target.value)} className="w-full bg-card-hover border border-subtle rounded-lg px-3 py-2 text-primary text-sm">
                     <option value={1}>1 Día</option>
                     <option value={3}>3 Días</option>
                     <option value={7}>7 Días</option>
                     <option value={30}>30 Días</option>
                     <option value={0}>PERMANENTE</option>
                  </select>
              </div>
              <div>
                  <label className="block text-xs font-medium text-muted mb-1">Motivo</label>
                  <textarea value={suspendReason} onChange={e => setSuspendReason(e.target.value)} rows={3} className="w-full bg-card-hover border border-subtle rounded-lg px-3 py-2 text-primary text-sm resize-none" placeholder="Motivo..."></textarea>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
               <button onClick={() => setSuspendModal(null)} className="flex-1 bg-card-hover py-2 rounded-lg text-sm font-medium text-secondary hover:text-primary">Cancelar</button>
               <button onClick={executeSuspension} disabled={!suspendReason} className="flex-1 bg-error text-white py-2 rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">Ejecutar</button>
            </div>
          </div>
        </div>
      )}

      {selectedUser && (
        <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}