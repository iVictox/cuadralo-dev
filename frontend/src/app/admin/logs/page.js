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
      <h1 className="text-xl font-semibold text-primary">Historial de Actividad</h1>
      <div className="bg-card border border-subtle rounded-lg overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-card-hover text-muted font-medium border-b border-subtle text-xs uppercase">
            <tr>
              <th className="px-4 py-3">Fecha</th>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3">Acción</th>
              <th className="px-4 py-3">Detalles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-subtle">
            {loading ? (
              <tr><td colSpan="4" className="text-center py-8 text-muted">Cargando...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-8 text-muted">Sin actividad.</td></tr>
            ) : logs.map((log) => (
              <tr key={log.id} className="hover:bg-card-hover">
                <td className="px-4 py-3 text-xs text-muted">{new Date(log.created_at).toLocaleString('es-VE')}</td>
                <td className="px-4 py-3 text-primary">{log.admin?.name || `Admin #${log.admin_id}`}</td>
                <td className="px-4 py-3 text-accent-primary font-medium text-xs">{(log.action || "").replace(/_/g, ' ')}</td>
                <td className="px-4 py-3 text-secondary text-xs">{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}