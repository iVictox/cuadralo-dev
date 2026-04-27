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
      setVerifications(data);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-cuadralo-textLight dark:text-white uppercase tracking-tighter">
            Verificaciones de Identidad
          </h1>
          <p className="text-sm text-cuadralo-textMutedLight dark:text-gray-400 font-medium">
            Historial de intentos de verificación facial y gestión manual
          </p>
        </div>
      </div>

      <div className="bg-cuadralo-cardLight dark:bg-cuadralo-cardDark rounded-3xl border border-black/5 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cuadralo-bgLight dark:bg-white/5 text-[10px] font-black uppercase text-cuadralo-textMutedLight dark:text-gray-400 tracking-widest border-b border-black/5 dark:border-white/5">
                <th className="px-6 py-4">Usuario</th>
                <th className="px-6 py-4">Foto Escaneada</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Puntuación</th>
                <th className="px-6 py-4">Fecha / Razón</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {verifications.map((v) => (
                <tr key={v.id} className="hover:bg-cuadralo-bgLight/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-cuadralo-pink text-white flex items-center justify-center font-bold">
                        {v.user?.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-cuadralo-textLight dark:text-white flex items-center gap-1">
                          @{v.user?.username}
                          {v.user?.is_verified && <ShieldCheck size={14} className="text-blue-500" />}
                        </div>
                        <div className="text-xs text-cuadralo-textMutedLight dark:text-gray-400">ID: {v.user_id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {v.photo_url && v.photo_url.length > 50 ? (
                      <img src={v.photo_url} alt="Captura" className="w-12 h-16 object-cover rounded-lg border border-black/10 dark:border-white/10" />
                    ) : (
                      <span className="text-xs text-gray-400 italic">Sin captura</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${v.success ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                      {v.success ? 'Aprobado' : 'Fallido'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-cuadralo-textLight dark:text-white">
                    {v.score ? (v.score * 100).toFixed(1) + '%' : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-cuadralo-textLight dark:text-white font-medium">
                      {format(new Date(v.created_at), "dd MMM yyyy, HH:mm", { locale: es })}
                    </div>
                    <div className="text-xs text-cuadralo-textMutedLight dark:text-gray-400 max-w-[200px] truncate" title={v.reason}>
                      {v.reason}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {!v.user?.is_verified && (
                        <button 
                          onClick={() => handleAction("approve", v.id, v.user_id)}
                          className="p-2 bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white rounded-xl transition-colors"
                          title="Aprobar manualmente"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      {v.user?.is_verified && (
                        <button 
                          onClick={() => handleAction("reject", v.id, v.user_id)}
                          className="p-2 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white rounded-xl transition-colors"
                          title="Remover verificación"
                        >
                          <X size={16} />
                        </button>
                      )}
                      {v.user?.last_verification_attempt && (
                        <button 
                          onClick={() => handleAction("reset-lock", v.id, v.user_id)}
                          className="p-2 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500 hover:text-white rounded-xl transition-colors"
                          title="Resetear bloqueo de 24h"
                        >
                          <RefreshCw size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {verifications.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-sm text-cuadralo-textMutedLight dark:text-gray-400">
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
