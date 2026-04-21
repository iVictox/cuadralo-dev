"use client";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { Users, CheckCircle, Ban, AlertTriangle, X, Eye } from "lucide-react";
import Link from "next/link";

export default function AdminReportedUsers() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await api.get("/admin/reports/users");
      setReports(data.reports || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleAction = async (id, action) => {
    if (!confirm(`¿${action === 'dismiss' ? 'Ignorar' : 'Banear'} este reporte?`)) return;
    try {
      await api.put(`/admin/reports/${id}/resolve`, { action });
      fetchReports();
    } catch (error) {
      alert("Error al procesar.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-primary flex items-center gap-2">
           <Users className="text-warning" size={24}/> Usuarios Denunciados
        </h1>
        <p className="text-xs text-muted mt-0.5">Perfiles reportados.</p>
      </div>

      {loading ? (
          <div className="text-center py-10 text-muted">Cargando...</div>
      ) : reports.length === 0 ? (
          <div className="text-center py-10 text-muted bg-card border border-subtle rounded-lg">No hay reportes.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((rep) => (
            <div key={rep.id} className="bg-card border border-subtle rounded-lg p-4 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-[10px] font-medium text-warning uppercase">Motivo:</span>
                      <p className="text-sm text-primary line-clamp-2">{rep.reason}</p>
                    </div>
                    <button onClick={() => { setSelectedUser(rep); setShowDetail(true); }} className="p-1.5 text-muted hover:text-primary hover:bg-card-hover rounded-lg">
                      <Eye size={16} />
                    </button>
                </div>

                <div className="flex items-center gap-3 mb-3 p-2 bg-card-hover rounded-lg">
                    <div className="w-12 h-12 rounded-lg bg-card overflow-hidden">
                        {rep.reported_user?.photo ? <img src={rep.reported_user.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted"><Users size={20}/></div>}
                    </div>
                    <div className="min-w-0">
                        <p className="font-medium text-primary truncate">@{rep.reported_user?.username || "Unknown"}</p>
                        <p className="text-xs text-muted truncate">{rep.reported_user?.name}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="bg-card-hover p-2 rounded">
                        <span className="text-muted block">Por:</span>
                        <span className="text-accent-primary">@{rep.reporter?.username}</span>
                    </div>
                    <div className="bg-card-hover p-2 rounded">
                        <span className="text-muted block">Fecha:</span>
                        <span className="text-secondary">{new Date(rep.created_at).toLocaleDateString("es")}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-auto">
                    <button onClick={() => handleAction(rep.id, 'dismiss')} className="bg-card-hover hover:bg-success/10 text-primary py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                        <CheckCircle size={14} className="text-success"/> Ignorar
                    </button>
                    <button onClick={() => handleAction(rep.id, 'ban')} className="bg-error/10 hover:bg-error/20 text-error py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                        <Ban size={14} /> Banear
                    </button>
                </div>
                
                <Link href={`/u/${rep.reported_user?.username}`} target="_blank" className="mt-2 text-center text-xs text-accent-primary hover:underline">
                    Ver Perfil
                </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}