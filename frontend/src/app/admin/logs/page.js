"use client";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { FileText } from "lucide-react";

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    try {
      const data = await api.get("/admin/logs");
      setLogs(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-subtle pb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <FileText className="text-accent-primary" size={26} /> Historial de Actividad
          </h1>
          <p className="text-sm text-muted mt-1">Registro y auditoría de todas las acciones del sistema.</p>
        </div>
      </div>
      
      <div className="bg-card border border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-card-hover text-muted font-bold border-b border-subtle text-xs uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4">Fecha</th>
                <th className="px-5 py-4">Admin</th>
                <th className="px-5 py-4">Acción</th>
                <th className="px-5 py-4">Detalles</th>
              </tr>
            </thead>
          <tbody className="divide-y divide-subtle">
            {loading ? (
              <tr><td colSpan="4" className="text-center py-10 text-muted font-medium">Cargando...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-10 text-muted font-medium">Sin actividad.</td></tr>
            ) : logs.map((log) => (
              <tr key={log.id} className="hover:bg-card-hover transition-none">
                <td className="px-5 py-4 text-xs font-bold text-muted">{new Date(log.created_at).toLocaleString('es-VE')}</td>
                <td className="px-5 py-4 text-sm font-bold text-primary">{log.admin?.name || `Admin #${log.admin_id}`}</td>
                <td className="px-5 py-4">
                  <span className="text-xs font-bold text-accent-primary uppercase tracking-wide bg-accent-bg px-2 py-1 border border-accent-primary/20 inline-block">
                    {(log.action || "").replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-secondary font-medium">{log.details}</td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}