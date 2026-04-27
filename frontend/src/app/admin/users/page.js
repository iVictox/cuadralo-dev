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
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-subtle pb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Gestión de Comunidad</h1>
          <p className="text-sm text-muted mt-1">Busca, audita y modera todas las cuentas.</p>
        </div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="Buscar por ID, nombre o @usuario..."
            value={search}
            onChange={(e) => {setSearch(e.target.value); setPage(1);}}
            className="w-full pl-10 pr-4 py-2 bg-card border border-subtle text-sm text-primary focus:outline-none focus:border-accent-primary transition-none"
          />
        </div>
      </div>

      <div className="bg-card border border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-card-hover text-muted font-bold border-b border-subtle text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4">Usuario</th>
                <th className="px-5 py-4">Contacto</th>
                <th className="px-5 py-4">Rol</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle">
              {loading ? (
                <tr><td colSpan="5" className="text-center py-8 text-muted font-medium">Cargando...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-muted font-medium">Ningún usuario encontrado.</td></tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-card-hover transition-none">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-accent-bg border border-subtle overflow-hidden shrink-0 flex items-center justify-center font-bold text-accent-primary text-sm">
                        {user.photo ? <img src={user.photo} alt={user.name} className="w-full h-full object-cover" /> : user.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-primary">{user.name}</div>
                        <div className="text-xs text-muted font-medium">@{user.username} <span className="ml-2 px-1 bg-subtle text-muted text-[10px]">ID: {user.id}</span></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-secondary font-medium">{user.email}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs font-bold px-2 py-1 uppercase tracking-wide border ${['admin', 'superadmin', 'moderator', 'support'].includes(user.role) ? 'bg-accent-bg text-accent-primary border-accent-primary/20' : 'bg-card-hover text-muted border-subtle'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {user.is_suspended ? (
                      <span className="text-xs font-bold px-2 py-1 bg-error/10 text-error border border-error/20 flex items-center inline-flex">
                        <Ban size={12} className="mr-1.5"/> Suspendido
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-2 py-1 bg-success/10 text-success border border-success/20 flex items-center inline-flex">
                        <CheckCircle2 size={12} className="mr-1.5"/> Activo
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setSelectedUser(user)} className="p-2 text-muted hover:text-primary hover:bg-card-hover border border-transparent hover:border-subtle transition-none" title="Ver">
                        <Eye size={18} />
                      </button>
                      {user.is_suspended ? (
                         <button onClick={() => liftSuspension(user.id)} className="p-2 text-success hover:bg-success/10 border border-transparent hover:border-success/20 transition-none" title="Restaurar">
                            <CheckCircle2 size={18} />
                         </button>
                      ) : (
                         <button onClick={() => setSuspendModal(user)} className="p-2 text-warning hover:bg-warning/10 border border-transparent hover:border-warning/20 transition-none" title="Suspender">
                            <Ban size={18} />
                         </button>
                      )}
                      <button onClick={() => handleDelete(user.id)} className="p-2 text-muted hover:text-error hover:bg-error/10 border border-transparent hover:border-error/20 transition-none" title="Eliminar">
                        <Trash2 size={18} />
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
          <div className="bg-card border border-subtle max-w-md w-full p-6 shadow-lg">
            <div className="flex items-center gap-3 text-error mb-5 border-b border-subtle pb-3">
               <AlertOctagon size={24} />
               <h3 className="text-xl font-bold text-primary">Sancionar Usuario</h3>
            </div>
            <p className="text-sm text-secondary mb-5">Vas a sancionar a <span className="font-bold text-primary">@{suspendModal.username}</span>.</p>
            
            <div className="space-y-4">
              <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-2">Duración</label>
                  <select value={suspendDays} onChange={e => setSuspendDays(e.target.value)} className="w-full bg-card-hover border border-subtle px-3 py-2 text-primary text-sm focus:outline-none focus:border-accent-primary">
                     <option value={1}>1 Día</option>
                     <option value={3}>3 Días</option>
                     <option value={7}>7 Días</option>
                     <option value={30}>30 Días</option>
                     <option value={0}>PERMANENTE</option>
                  </select>
              </div>
              <div>
                  <label className="block text-xs font-bold text-muted uppercase tracking-wide mb-2">Motivo</label>
                  <textarea value={suspendReason} onChange={e => setSuspendReason(e.target.value)} rows={3} className="w-full bg-card-hover border border-subtle px-3 py-2 text-primary text-sm resize-none focus:outline-none focus:border-accent-primary" placeholder="Motivo de la sanción..."></textarea>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
               <button onClick={() => setSuspendModal(null)} className="flex-1 bg-card-hover border border-subtle py-2.5 text-sm font-bold text-secondary hover:text-primary hover:bg-subtle transition-none">Cancelar</button>
               <button onClick={executeSuspension} disabled={!suspendReason} className="flex-1 bg-error border border-error/50 text-white py-2.5 text-sm font-bold hover:bg-error/90 disabled:opacity-50 transition-none">Ejecutar Sanción</button>
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