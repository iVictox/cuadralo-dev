"use client";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { CheckCircle, XCircle, Clock, Eye, Receipt, User } from "lucide-react";
import PaymentDetailModal from "./PaymentDetailModal";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => { fetchPayments(); }, []);

  const fetchPayments = async () => {
    try {
      const data = await api.get("/admin/payments");
      setPayments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action, grantVip = false) => {
    if (!confirm(`¿Procesar pago como ${action.toUpperCase()}?`)) return;
    try {
      await api.put(`/admin/payments/${id}/verify`, { action, grant_vip: grantVip });
      fetchPayments();
    } catch (error) {
      console.error(error);
      alert("Error al procesar.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-primary flex items-center gap-2">
          <Receipt className="text-success" /> Verificación de Pagos
        </h1>
        <p className="text-xs text-muted mt-0.5">Revisa los reportes de pagos.</p>
      </div>

      <div className="bg-card border border-subtle rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-card-hover text-muted font-medium border-b border-subtle text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Ref.</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Capture</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-8 text-muted">Cargando...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-8 text-muted">No hay pagos pendientes.</td></tr>
              ) : payments.map((p) => (
                <tr key={p.id} className="hover:bg-card-hover transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-primary">#{p.id}</div>
                    <div className="text-xs text-muted">{new Date(p.created_at).toLocaleString()}</div>
                  </td>
                  <td className="px-4 py-3">
                    {p.user ? (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-accent-bg overflow-hidden">
                                {p.user.photo ? <img src={p.user.photo} alt={p.user.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-muted text-xs"><User size={14}/></div>}
                            </div>
                            <div>
                                <div className="text-sm text-primary">{p.user.name}</div>
                                <div className="text-xs text-muted">@{p.user.username}</div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-muted text-xs italic">Usuario ID: {p.user_id}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-success font-medium">€{p.amount_usd}</div>
                    <div className="text-xs text-muted">({p.amount_ves} Bs)</div>
                  </td>
                  <td className="px-4 py-3">
                    {p.receipt ? (
                      <button onClick={() => setSelectedPayment(p)} className="text-xs text-accent-primary hover:underline">
                        <Eye size={14} className="inline mr-1"/> Ver
                      </button>
                    ) : (
                      <span className="text-muted text-xs italic">Sin imagen</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.status === 'pending' && <span className="text-[10px] font-medium px-2 py-1 rounded bg-warning/10 text-warning"><Clock size={10} className="inline mr-1"/> Pendiente</span>}
                    {p.status === 'approved' && <span className="text-[10px] font-medium px-2 py-1 rounded bg-success/10 text-success"><CheckCircle size={10} className="inline mr-1"/> Aprobado</span>}
                    {p.status === 'rejected' && <span className="text-[10px] font-medium px-2 py-1 rounded bg-error/10 text-error"><XCircle size={10} className="inline mr-1"/> Rechazado</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setSelectedPayment(p)} className="bg-card-hover hover:bg-accent-primary/10 text-primary px-3 py-1.5 rounded-lg text-xs font-medium">
                      Gestionar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {selectedPayment && (
        <PaymentDetailModal payment={selectedPayment} onClose={() => setSelectedPayment(null)} onAction={handleAction} />
      )}
    </div>
  );
}