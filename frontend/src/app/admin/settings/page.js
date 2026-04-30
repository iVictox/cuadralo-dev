"use client";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { Settings, Save, Server, DollarSign, ShieldAlert, Sparkles, RefreshCw } from "lucide-react";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    platform_name: "Cuadralo",
    maintenance_mode: "false",
    vip_price_usd: "4.99",
    bs_exchange_rate: "45.00",
    vip_duration_days: "30"
  });
  const [saving, setSaving] = useState(false);
  const [fetchingRate, setFetchingRate] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await api.get("/admin/settings");
        if (data && Object.keys(data).length > 0) {
          setSettings(prev => ({ 
              ...prev, 
              ...data,
              vip_price_usd: data.vip_price_usd || data.vip_price_eur || "4.99"
          }));
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const fetchExternalRate = async () => {
    setFetchingRate(true);
    try {
        const data = await api.post("/admin/settings/sync-bcv");
        if (data && data.rate) {
            setSettings(prev => ({ ...prev, bs_exchange_rate: data.rate }));
        }
    } catch (err) {
        console.error("Error syncing BCV rate:", err);
        alert("Error sincronizando la tasa BCV");
    } finally {
        setFetchingRate(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await api.put("/admin/settings", settings);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error) {
      alert(error.response?.data?.error || "Error guardando.");
    } finally {
      setSaving(false);
    }
  };

  const calculatedBs = (parseFloat(settings.vip_price_usd || 0) * parseFloat(settings.bs_exchange_rate || 0)).toFixed(2);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-primary flex items-center gap-2">
          <Settings className="text-accent-primary" size={24}/> Configuración Global
        </h1>
        <p className="text-xs text-muted mt-0.5">Cambios se reflejan inmediatamente.</p>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
            <div className="bg-card border border-subtle rounded-lg">
                <div className="bg-card-hover px-4 py-3 border-b border-subtle flex items-center gap-2">
                    <Server className="text-accent-primary" size={16} />
                    <h2 className="font-medium text-primary">Identidad del Servidor</h2>
                </div>
                <div className="p-4">
                    <label className="block text-xs font-medium text-muted mb-2">Nombre</label>
                    <input type="text" name="platform_name" value={settings.platform_name} onChange={handleChange} className="w-full bg-card-hover border border-subtle rounded-lg px-3 py-2 text-primary text-sm" />
                </div>
            </div>

            <div className="bg-card border border-subtle rounded-lg">
                <div className="bg-card-hover px-4 py-3 border-b border-subtle flex items-center gap-2">
                    <ShieldAlert className="text-error" size={16} />
                    <h2 className="font-medium text-error">Modo Mantenimiento</h2>
                </div>
                <div className="p-4">
                    <select name="maintenance_mode" value={settings.maintenance_mode} onChange={handleChange} className="w-full bg-card-hover border border-subtle rounded-lg px-3 py-2 text-primary text-sm">
                        <option value="false">Desactivado</option>
                        <option value="true">Activado (Bloquea usuarios)</option>
                    </select>
                </div>
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-card border border-subtle rounded-lg">
                <div className="bg-card-hover px-4 py-3 border-b border-subtle flex items-center gap-2">
                    <Sparkles className="text-warning" size={16} />
                    <h2 className="font-medium text-primary">Monetización (USD)</h2>
                </div>
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-muted mb-2">Precio VIP</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
                                <input type="number" step="0.01" name="vip_price_usd" value={settings.vip_price_usd} onChange={handleChange} className="w-full bg-card-hover border border-subtle rounded-lg pl-7 pr-3 py-2 text-success text-sm" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-muted mb-2">Duración (días)</label>
                            <input type="number" name="vip_duration_days" value={settings.vip_duration_days} onChange={handleChange} className="w-full bg-card-hover border border-subtle rounded-lg px-3 py-2 text-primary text-sm" />
                        </div>
                    </div>

                    <div className="bg-card-hover p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-medium text-muted flex items-center gap-2">
                            <DollarSign size={14} className="text-success"/> Tasa BCV
                            </label>
                            <button type="button" onClick={fetchExternalRate} disabled={fetchingRate} className="text-xs bg-card hover:bg-accent-primary/10 text-accent-primary px-2 py-1 rounded flex items-center gap-1">
                                <RefreshCw size={12} className={fetchingRate ? "animate-spin" : ""} /> Sincronizar
                            </button>
                        </div>
                        <input type="number" step="0.01" name="bs_exchange_rate" value={settings.bs_exchange_rate} onChange={handleChange} className="w-full bg-card border border-subtle rounded-lg px-3 py-2 text-primary text-sm mb-2" />
                        <div className="flex justify-between items-center bg-success/10 p-2 rounded-lg">
                            <span className="text-xs text-secondary">Total:</span>
                            <span className="font-medium text-success">{calculatedBs} Bs</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {savedSuccess && <div className="bg-success/10 border border-success text-success p-3 rounded-lg text-center text-sm">¡Guardado!</div>}
                <button type="submit" disabled={saving} className="bg-accent-primary hover:opacity-90 text-white w-full py-3 rounded-lg font-medium disabled:opacity-50">
                    {saving ? "Guardando..." : "Aplicar Cambios"}
                </button>
            </div>
        </div>
      </form>
    </div>
  );
}