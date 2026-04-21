"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/utils/api";
import { Search, Trash2, User, RefreshCw, AlertOctagon } from "lucide-react";
import { useDebounce } from 'use-debounce';
import { useConfirm } from "@/context/ConfirmContext";

export default function AdminDeletedUsers() {
  const { confirm } = useConfirm();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const fetchDeleted = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/admin/users/deleted?page=${page}&limit=${limit}&search=${debouncedSearch}`);
      setUsers(data.users || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch]);

  useEffect(() => { fetchDeleted(); }, [fetchDeleted]);

  const formatDate = (dateStr) => {
      if (!dateStr) return "N/A";
      return new Date(dateStr).toLocaleString('es-VE', {
          day: '2-digit', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit'
      });
  };

  const handleRestore = async (id) => {
    const isConfirmed = await confirm({
      title: "Restaurar usuario",
      message: "¿Seguro que deseas restaurar este usuario de la papelera?",
      confirmText: "Sí, restaurar",
      cancelText: "Cancelar",
      variant: "info"
    });
    if (!isConfirmed) return;
    try {
      await api.put(`/admin/users/${id}/restore`);
      fetchDeleted();
    } catch (error) {
      alert("Error al restaurar.");
    }
  };

  const handleForceDelete = async (id) => {
    const confirmation = prompt("ATENCIÓN: Escribe PURGAR para eliminar permanentemente");
    if (confirmation !== "PURGAR") return;
    try {
      await api.delete("/admin/users/" + id + "/force");
      alert("Usuario purgado.");
      fetchDeleted();
    } catch (error) {
      alert(error.response?.data?.error || "Error al purgar.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-primary flex items-center gap-2">
             <Trash2 className="text-error" size={24} /> Papelera
          </h1>
          <p className="text-xs text-muted mt-0.5">Usuarios eliminados. Restaura o purga.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => {setSearch(e.target.value); setPage(1);}}
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-subtle rounded-lg text-sm text-primary focus:outline-none focus:border-error"
          />
        </div>
      </div>

      <div className="bg-card border border-subtle rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-card-hover text-muted font-medium border-b border-subtle text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Eliminado</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle">
              {loading ? (
                <tr><td colSpan="3" className="text-center py-8 text-muted">Cargando...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="3" className="text-center py-8 text-muted flex items-center justify-center gap-2"><Trash2 size={20}/> Papelera vacía.</td></tr>
              ) : users.map((u) => (
                <tr key={u.id} className="hover:bg-card-hover transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-card-hover overflow-hidden shrink-0 flex items-center justify-center text-muted">
                         <User size={16}/>
                      </div>
                      <div>
                        <div className="font-medium text-secondary text-sm line-through">{u.name}</div>
                        <div className="text-xs text-muted">@{u.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">
                     {formatDate(u.deleted_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleRestore(u.id)} className="bg-card-hover hover:bg-success/10 text-primary px-3 py-1.5 rounded-lg text-xs font-medium">
                              <RefreshCw size={14} className="inline mr-1"/> Restaurar
                          </button>
                          <button onClick={() => handleForceDelete(u.id)} className="bg-error/10 hover:bg-error/20 text-error px-3 py-1.5 rounded-lg text-xs font-medium">
                              <AlertOctagon size={14} className="inline mr-1"/> Purgar
                          </button>
                      </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}