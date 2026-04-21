"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/utils/api";
import { Search, Ban, User, CheckCircle2, ShieldAlert } from "lucide-react";
import { useDebounce } from 'use-debounce';
import UserDetailModal from "../UserDetailModal";
import { useConfirm } from "@/context/ConfirmContext";

export default function AdminSuspendedUsers() {
  const { confirm } = useConfirm();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchSuspended = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/admin/users/suspended?page=${page}&limit=${limit}&search=${debouncedSearch}`);
      setUsers(data.users || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => { fetchSuspended(); }, [fetchSuspended]);

  const formatDate = (dateStr) => {
      if (!dateStr) return "Permanente";
      return new Date(dateStr).toLocaleString('es-VE', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
      });
  };

  const liftSuspension = async (id) => {
    const isConfirmed = await confirm({
      title: "Restaurar cuenta",
      message: "¿Estás seguro de levantar la suspensión?",
      confirmText: "Sí, restaurar",
      cancelText: "Cancelar",
      variant: "success"
    });
    if (!isConfirmed) return;
    try {
      await api.put("/admin/users/" + id + "/suspend", { is_suspended: false, days: 0, reason: "" });
      fetchSuspended();
    } catch (error) {
      alert("Error al restaurar.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-primary flex items-center gap-2">
             <ShieldAlert className="text-warning" size={24} /> Cuentas Suspendidas
          </h1>
          <p className="text-xs text-muted mt-0.5">Usuarios con acceso bloqueado.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            type="text"
            placeholder="Buscar..."
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
                <th className="px-4 py-3">Motivo</th>
                <th className="px-4 py-3">Expira</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-8 text-muted">Cargando...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-8 text-muted">No hay cuentas suspendidas.</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-card-hover transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => setSelectedUser(u)}>
                      <div className="w-10 h-10 rounded-lg bg-card-hover overflow-hidden shrink-0">
                        {u.photo ? <img src={u.photo} alt={u.name} className="w-full h-full object-cover opacity-50 grayscale" /> : <div className="w-full h-full flex items-center justify-center text-muted"><User size={16}/></div>}
                      </div>
                      <div>
                        <div className="font-medium text-primary text-sm">{u.name}</div>
                        <div className="text-xs text-muted">@{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-secondary text-sm">{u.suspension_reason || "Sin especificar"}</td>
                  <td className="px-4 py-3">
                     <span className="text-[10px] font-medium px-2 py-1 rounded bg-warning/10 text-warning">
                        <Ban size={10} className="inline mr-1"/> {formatDate(u.suspended_until)}
                     </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                      <button onClick={() => liftSuspension(u.id)} className="bg-card-hover hover:bg-success/10 text-primary px-3 py-1.5 rounded-lg text-xs font-medium">
                          <CheckCircle2 size={14} className="inline mr-1"/> Restaurar
                      </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && (
         <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}