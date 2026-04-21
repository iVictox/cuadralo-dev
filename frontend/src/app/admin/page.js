"use client";
import { useEffect, useState } from "react";
import { api } from "@/utils/api";
import { Users, Crown, CreditCard, Heart, TrendingUp, TrendingDown, Activity, DollarSign, UserPlus, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";
import { useTheme } from "@/context/ThemeContext";

const StatCard = ({ title, value, icon: Icon, change }) => {
  const isPositive = change >= 0;
  const changeValue = change !== undefined ? Math.abs(change).toFixed(1) : "0.0";
  
  return (
    <div className="bg-card border border-subtle rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-muted uppercase tracking-wide">{title}</p>
        <div className="p-2 bg-card-hover rounded-md">
          <Icon size={16} className="text-accent-primary" />
        </div>
      </div>
      <p className="text-2xl font-semibold text-primary mb-1">
        {value !== undefined ? value.toLocaleString() : 0}
      </p>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-medium ${isPositive ? "text-success" : "text-error"}`}>
          {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{changeValue}%</span>
          <span className="text-muted">vs mes ant.</span>
        </div>
      )}
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-subtle rounded-md p-2 shadow-sm">
        <p className="text-[10px] font-medium text-muted">{label}</p>
        <p className="text-xs font-semibold text-primary">{payload[0].value?.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const formatTimeAgo = (dateStr) => {
  if (!dateStr) return "Hace un momento";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return "Apenas";
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString('es-VE');
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, logsData] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/admin/logs")
        ]);
        setStats(statsData);
        setLogs(logsData.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 rounded-full border-2 border-accent-primary border-t-transparent animate-spin"></div>
          <p className="text-xs text-muted font-medium">Cargando métricas...</p>
        </div>
      </div>
    );
  }

  const chartColor = isDark ? "#8B5CF6" : "#7C3AED";
  const gridColor = isDark ? "#27272A" : "#E5E7EB";
  const textMuted = isDark ? "#71717A" : "#9CA3AF";
  const successColor = isDark ? "#34D399" : "#10B981";
  const warningColor = isDark ? "#FBBF24" : "#D97706";

  const userGrowthData = stats?.user_growth?.map(d => ({
    name: d.name || d.Date || "Día",
    users: d.users || d.Users || 0
  })) || [];

  const revenueData = stats?.revenue?.map(d => ({
    name: d.month || d.name || "Mes",
    ingresos: d.amount || d.Amount || d.ingresos || 0
  })) || [];

  const distributionData = stats?.distribution?.map(d => ({
    name: d.name,
    value: d.value
  })) || [
    { name: "VIP", value: stats?.prime_users || 0 },
    { name: "Gratuitas", value: (stats?.total_users || 0) - (stats?.prime_users || 0) }
  ];

  const recentUsersData = stats?.recent_users?.map(u => ({
    id: u.id,
    name: u.name || "Usuario",
    email: u.email || "",
    time: formatTimeAgo(u.created_at),
    status: u.status || "active"
  })) || [];

  const usersChange = stats?.users_change || 0;
  const primeChange = stats?.prime_change || 0;
  const revenueChange = stats?.revenue_change || 0;
  const matchesChange = stats?.matches_change || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-primary">Dashboard General</h1>
          <p className="text-xs text-muted mt-0.5">Resumen del sistema</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted bg-card border border-subtle px-3 py-1.5 rounded-md">
          <Activity size={12} className="text-success" />
          <span>Actualizado: {new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Usuarios Totales" value={stats?.total_users || 0} icon={Users} change={usersChange} />
        <StatCard title="VIP Activos" value={stats?.prime_users || 0} icon={Crown} change={primeChange} />
        <StatCard title="Ingresos Mes" value={Math.round(stats?.current_revenue || 0)} icon={DollarSign} change={revenueChange} />
        <StatCard title="Matches" value={stats?.total_matches || 0} icon={Heart} change={matchesChange} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card border border-subtle rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-medium text-primary">Crecimiento de Usuarios</h2>
              <p className="text-[10px] text-muted">Últimos 7 días</p>
            </div>
            <span className="text-xs font-medium text-success">+{Math.abs(usersChange).toFixed(1)}%</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: textMuted, fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: textMuted, fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke={chartColor}
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorUsers)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card border border-subtle rounded-lg p-4">
            <h3 className="text-xs font-medium text-muted mb-3">Distribución de Usuarios</h3>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={25}
                    outerRadius={40}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={index === 0 ? chartColor : successColor} 
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-1">
              {distributionData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: idx === 0 ? chartColor : successColor }}
                  ></div>
                  <span className="text-[10px] text-muted">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-subtle rounded-lg p-4">
            <h3 className="text-xs font-medium text-muted mb-3">Ingresos Mensuales</h3>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: textMuted, fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: textMuted, fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="ingresos" fill={successColor} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-card border border-subtle rounded-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UserPlus size={16} className="text-accent-primary" />
              <h2 className="text-sm font-medium text-primary">Usuarios Recientes</h2>
            </div>
            <span className="text-[10px] text-success font-medium">{recentUsersData.length} nuevos</span>
          </div>
          <div className="space-y-2">
            {recentUsersData.length > 0 ? recentUsersData.map((user) => (
              <div key={user.id} className="flex items-center justify-between py-2 border-b border-subtle last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-md bg-accent-bg flex items-center justify-center font-medium text-accent-primary text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-primary">{user.name}</p>
                    <p className="text-[10px] text-muted">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                    user.status === 'active' 
                      ? 'bg-success/10 text-success' 
                      : 'bg-warning/10 text-warning'
                  }`}>
                    {user.status === 'active' ? 'Activo' : 'Pend.'}
                  </span>
                  <p className="text-[9px] text-muted mt-0.5 flex items-center gap-1">
                    <Clock size={9} />{user.time}
                  </p>
                </div>
              </div>
            )) : (
              <div className="flex items-center justify-center py-4 text-muted text-xs">
                No hay usuarios recientes
              </div>
            )}
          </div>
          <button onClick={() => router.push('/admin/users')} className="w-full mt-3 py-2 text-xs font-medium text-muted bg-card-hover hover:text-primary border border-subtle rounded-md transition-colors">
            Ver Todos los Usuarios
          </button>
        </div>

        <div className="bg-card border border-subtle rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={16} className="text-accent-primary" />
            <h2 className="text-sm font-medium text-primary">Actividad Reciente</h2>
          </div>
          <div className="space-y-3">
            {logs.length > 0 ? logs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 pb-2 border-b border-subtle last:border-0">
                <div className="w-1.5 h-1.5 mt-1.5 rounded-full bg-accent-primary shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-primary">
                    <span className="text-accent-primary">#{log.admin_id}</span>
                    <span className="text-muted"> · {(log.action || "").replace(/_/g, ' ')}</span>
                  </p>
                  <p className="text-[11px] text-secondary truncate">{log.details}</p>
                  <p className="text-[9px] text-muted mt-0.5">{new Date(log.created_at).toLocaleString('es-VE')}</p>
                </div>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center py-6 text-muted">
                <Activity size={20} className="opacity-30"/>
                <p className="text-xs mt-2">Sin actividad reciente</p>
              </div>
            )}
          </div>
          <button onClick={() => router.push('/admin/logs')} className="w-full mt-3 py-2 text-xs font-medium text-muted bg-card-hover hover:text-primary border border-subtle rounded-md transition-colors">
            Ver Registro Completo
          </button>
        </div>
      </div>
    </div>
  );
}