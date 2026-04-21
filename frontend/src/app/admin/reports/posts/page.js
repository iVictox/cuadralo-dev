"use client";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { FileText, CheckCircle, Trash2, ExternalLink, User, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function AdminReportedPosts() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/admin/reports/posts`);
      setReports(data.reports || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

  const handleAction = async (id, action) => {
    const isDismiss = action === 'dismiss';
    if (!confirm(`¿${isDismiss ? 'Ignorar' : 'Eliminar'} esta denuncia?`)) return;
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
           <AlertTriangle className="text-error" size={24}/> Posts Denunciados
        </h1>
        <p className="text-xs text-muted mt-0.5">Publicaciones reportadas.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {loading ? (
            <div className="col-span-2 text-center py-10 text-muted">Cargando...</div>
        ) : reports.length === 0 ? (
            <div className="col-span-2 text-center py-10 text-muted bg-card border border-subtle rounded-lg">No hay denuncias.</div>
        ) : reports.map((rep) => (
          <div key={rep.id} className="bg-card border border-subtle rounded-lg p-4 flex flex-col">
              <div className="flex justify-between items-start mb-3 border-b border-subtle pb-3">
                  <div>
                     <span className="text-[10px] font-medium text-error uppercase">Motivo:</span>
                     <span className="text-sm font-medium text-primary ml-2">{rep.reason || "Violación"}</span>
                  </div>
                  <div className="text-right">
                     <span className="text-[10px] text-muted uppercase">Por:</span>
                     <span className="text-xs text-accent-primary ml-2">@{rep.reporter?.username}</span>
                  </div>
              </div>

              <div className="bg-card-hover p-3 rounded-lg mb-3">
                  <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-card overflow-hidden">
                          {rep.post?.user?.photo ? <img src={rep.post.user.photo} className="w-full h-full object-cover"/> : <User size={14} className="m-auto text-muted"/>}
                      </div>
                      <span className="text-xs text-muted">@{rep.post?.user?.username || "Desconocido"}</span>
                  </div>
                  <p className="text-sm text-secondary mb-2">"{rep.post?.caption || "Sin texto"}"</p>
                  {rep.post?.image_url && <img src={rep.post.image_url} alt="Evidencia" className="w-full h-32 object-cover rounded-lg" />}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-auto">
                  <button onClick={() => handleAction(rep.id, 'dismiss')} className="bg-card-hover hover:bg-success/10 text-primary py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                      <CheckCircle size={14} className="text-success"/> Ignorar
                  </button>
                  <button onClick={() => handleAction(rep.id, 'delete')} className="bg-error/10 hover:bg-error/20 text-error py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                      <Trash2 size={14} /> Eliminar
                  </button>
              </div>
              
              <Link href={`/post/${rep.post_id}`} target="_blank" className="mt-2 text-center text-xs text-accent-primary hover:underline">
                  <ExternalLink size={12} className="inline mr-1"/> Ver
              </Link>
          </div>
        ))}
      </div>
    </div>
  );
}