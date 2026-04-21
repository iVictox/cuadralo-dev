"use client";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { ShieldCheck, ShieldAlert, CheckCircle, XCircle, Users } from "lucide-react";

export default function AdminManagement() {
  const [requests, setRequests] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [reqData, staffData] = await Promise.all([
        api.get("/admin/requests"),
        api.get("/admin/staff")
      ]);
      setRequests(reqData || []);
      setStaff(staffData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleRequest = async (id, action) => {
    let reason = "Aprobado";
    if (action === 'deny') {
      reason = prompt("Motivo del rechazo:");
      if (!reason) return;
    } else {
      if (!confirm("¿Otorgar acceso administrativo?")) return;
    }
    try {
      await api.put(`/admin/requests/${id}`, { action, reason });
      fetchData();
    } catch (error) {
      alert("Error al procesar");
    }
  };

  const handleRevoke = async (id) => {
    const confirmText = prompt("Escribe 'REVOCAR' para degradar:");
    if (confirmText !== 'REVOCAR') return;
    try {
      await api.put(`/admin/staff/${id}/revoke`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.error || "Error al revocar");
    }
  };

  if (loading) return <div className="text-center py-10 text-muted">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-primary flex items-center gap-2">
          <ShieldCheck className="text-accent-primary" size={24}/> Gestión de Credenciales
        </h1>
        <p className="text-xs text-muted mt-0.5">Controla el acceso al panel.</p>
      </div>

      <div className="bg-card border border-subtle rounded-lg p-4">
        <h2 className="font-medium text-primary mb-4 border-b border-subtle pb-2">Solicitudes Pendientes</h2>
        {requests.length === 0 ? (
          <p className="text-muted text-sm italic">No hay solicitudes.</p>
        ) : (
          <div className="space-y-3">
            {requests.map(req => (
              <div key={req.id} className="bg-card-hover border border-subtle p-3 rounded-lg flex flex-col md:flex-row items-center justify-between gap-3">
                <div>
                  <p className="text-primary font-medium">{req.user?.name} <span className="text-muted text-xs">@{req.user?.username}</span></p>
                  <p className="text-xs text-accent-primary font-medium uppercase">Solicita: {req.requested_role}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleRequest(req.id, 'approve')} className="bg-success/10 hover:bg-success/20 text-success px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1">
                    <CheckCircle size={14}/> Aprobar
                  </button>
                  <button onClick={() => handleRequest(req.id, 'deny')} className="bg-error/10 hover:bg-error/20 text-error px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1">
                    <XCircle size={14}/> Denegar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card border border-subtle rounded-lg p-4">
        <h2 className="font-medium text-primary mb-4 border-b border-subtle pb-2 flex items-center gap-2">
          <Users size={16}/> Staff Activo
        </h2>
        <div className="space-y-2">
          {staff.map(member => (
            <div key={member.id} className="flex items-center justify-between py-2 border-b border-subtle last:border-0">
              <div>
                <p className="text-sm text-primary font-medium">{member.name}</p>
                <p className="text-xs text-muted">@{member.username} · {member.role}</p>
              </div>
              <button onClick={() => handleRevoke(member.id)} className="text-error hover:bg-error/10 px-2 py-1 rounded text-xs font-medium">
                Revocar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}