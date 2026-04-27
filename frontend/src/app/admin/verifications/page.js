"use client";

import { useState, useEffect } from "react";
import { api } from "@/utils/api";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Check, X, RefreshCw, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function AdminVerificationsPage() {
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/verifications");
      setVerifications(data.verifications || (Array.isArray(data) ? data : []));
    } catch (error) {
      showToast("Error cargando verificaciones", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action, id, userId) => {
    try {
      if (action === "approve") {
        await api.put(`/admin/verifications/${userId}/approve`);
        showToast("Usuario verificado", "success");
      } else if (action === "reject") {
        await api.put(`/admin/verifications/${userId}/reject`);
        showToast("Verificación rechazada", "success");
      } else if (action === "reset-lock") {
        await api.put(`/admin/verifications/user/${userId}/reset-lock`);
        showToast("Bloqueo de 24h removido", "success");
      }
      fetchVerifications();
    } catch (error) {
      showToast(error.response?.data?.error || "Error al ejecutar acción", "error");
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-cuadralo-pink" size={40} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-subtle pb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Verificaciones de Identidad</h1>
          <p className="text-sm text-muted mt-1">
            Historial de intentos de verificación facial y gestión manual.
          </p>
        </div>
      </div>

      <div className="bg-card border border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-card-hover text-muted font-bold border-b border-subtle text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4">Usuario</th>
                <th className="px-5 py-4">Foto Escaneada</th>
                <th className="px-5 py-4">Estado</th>
                <th className="px-5 py-4">Puntuación</th>
                <th className="px-5 py-4">Fecha / Razón</th>
                <th className="px-5 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle">
              {(verifications || []).map((v) => (
                <tr key={v.id} className="hover:bg-card-hover transition-none">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-accent-bg border border-subtle text-accent-primary flex items-center justify-center font-bold text-sm">
                        {v.user?.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-primary flex items-center gap-1">
                          @{v.user?.username}
                          {v.user?.is_verified && <ShieldCheck size={14} className="text-success" />}
                        </div>
                        <div className="text-xs text-muted font-medium">ID: {v.user_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    {v.photo_url && v.photo_url.length > 50 ? (
                      <img src={v.photo_url} alt="Captura" className="w-12 h-16 object-cover border border-subtle" />
                    ) : (
                      <span className="text-xs text-muted italic">Sin captura</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2 py-1 text-xs font-bold uppercase tracking-wide border flex items-center inline-flex ${v.success ? 'bg-success/10 text-success border-success/20' : 'bg-error/10 text-error border-error/20'}`}>
                      {v.success ? 'Aprobado' : 'Fallido'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm font-bold text-primary">
                    {v.score ? (v.score * 100).toFixed(1) + '%' : '-'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-xs text-primary font-bold">
                      {format(new Date(v.created_at), "dd MMM yyyy, HH:mm", { locale: es })}
                    </div>
                    <div className="text-xs text-muted mt-0.5 max-w-[200px] truncate" title={v.reason}>
                      {v.reason}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!v.user?.is_verified && (
                        <button 
                          onClick={() => handleAction("approve", v.id, v.user_id)}
                          className="p-2 text-success hover:bg-success/10 border border-transparent hover:border-success/20 transition-none"
                          title="Aprobar manualmente"
                        >
                          <Check size={18} />
                        </button>
                      )}
                      {v.user?.is_verified && (
                        <button 
                          onClick={() => handleAction("reject", v.id, v.user_id)}
                          className="p-2 text-error hover:bg-error/10 border border-transparent hover:border-error/20 transition-none"
                          title="Remover verificación"
                        >
                          <X size={18} />
                        </button>
                      )}
                      {v.user?.last_verification_attempt && (
                        <button 
                          onClick={() => handleAction("reset-lock", v.id, v.user_id)}
                          className="p-2 text-warning hover:bg-warning/10 border border-transparent hover:border-warning/20 transition-none"
                          title="Resetear bloqueo de 24h"
                        >
                          <RefreshCw size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {(!verifications || verifications.length === 0) && (
                <tr>
                  <td colSpan="6" className="px-5 py-10 text-center text-sm font-medium text-muted">
                    No hay registros de verificaciones
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
