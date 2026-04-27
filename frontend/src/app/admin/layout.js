"use client";
import { useEffect, useState, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api } from "@/utils/api";
import Link from "next/link";
import { 
  LayoutDashboard, Users, Shield, AlertTriangle, CreditCard,
  Settings, Crown, FileText, ChevronDown, LogOut, Menu, X, 
  Bell, Search, ChevronRight, Moon, Sun, Zap, Sparkles, Heart
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/context/ThemeContext";
import { ConfirmProvider } from "@/context/ConfirmContext";

const menuCategories = [
  {
    title: "DASHBOARD",
    icon: LayoutDashboard,
    items: [{ name: "Dashboard Principal", path: "/admin" }]
  },
  {
    title: "USUARIOS",
    icon: Users,
    items: [
      { name: "Todos los Usuarios", path: "/admin/users" },
      { name: "Usuarios VIP", path: "/admin/vip" },
      { name: "Usuarios Suspendidos", path: "/admin/users/suspended" },
      { name: "Usuarios Eliminados", path: "/admin/users/deleted" }
    ]
  },
  {
    title: "INVENTARIO",
    icon: Sparkles,
    items: [
      { name: "Gestión de Inventario", path: "/admin/inventory" }
    ]
  },
{
    title: "ROMPEHIELOS",
    icon: Sparkles,
    items: [
      { name: "Gestionar Rompehielos", path: "/admin/rompehielos" }
    ]
  },
  /*{
    title: "MODERACIÓN",
    icon: Shield,
    items: [
      { name: "Conversaciones", path: "/admin/moderation/conversations" },
      { name: "Mensajes", path: "/admin/moderation/messages" },
      { name: "Fotos y Media", path: "/admin/moderation/media" },
      { name: "Matches", path: "/admin/moderation/matches" },
      { name: "Comentarios", path: "/admin/moderation/comments" },
      { name: "Posts", path: "/admin/moderation/posts" },
      { name: "Contenido Marcado", path: "/admin/moderation/flagged" }
    ]
  },*/
  {
    title: "MODERACIÓN",
    icon: Shield,
    items: [
      { name: "Conversaciones", path: "/admin/moderation/conversations" },
      { name: "Mensajes", path: "/admin/moderation/messages" },
      { name: "Fotos y Media", path: "/admin/moderation/media" },
      { name: "Likes", path: "/admin/likes" },
      { name: "Matches", path: "/admin/moderation/matches" },
      { name: "Comentarios", path: "/admin/moderation/comments" },
      { name: "Posts", path: "/admin/moderation/posts" },
      { name: "Contenido Marcado", path: "/admin/moderation/flagged" }
    ]
  },
  {
    title: "REPORTES",
    icon: AlertTriangle,
    items: [
      { name: "Bandeja Principal", path: "/admin/reports" },
      { name: "Posts Reportados", path: "/admin/reports/posts" },
      { name: "Comentarios Reportados", path: "/admin/reports/comments" },
      { name: "Usuarios Reportados", path: "/admin/reports/users" },
      { name: "Reportes Resueltos", path: "/admin/reports/resolved" }
    ]
  },
  {
    title: "PAGOS",
    icon: CreditCard,
    items: [{ name: "Verificación y Auditoría", path: "/admin/payments" }]
  },
  {
    title: "CONFIGURACIÓN",
    icon: Settings,
    items: [{ name: "Ajustes Globales", path: "/admin/settings" }]
  },
  {
    title: "GESTIÓN DE ADMINS",
    icon: Crown,
    roles: ['superadmin'], 
    items: [{ name: "Equipo y Solicitudes", path: "/admin/management" }]
  },
  {
    title: "LOGS Y AUDITORÍA",
    icon: FileText,
    items: [{ name: "Registro del Sistema", path: "/admin/logs" }]
  }
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark, toggleMode } = useTheme();

  const [isAdmin, setIsAdmin] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const initialCategory = useMemo(() => {
    if (pathname === "/admin") return "DASHBOARD";
    const foundCategory = menuCategories.find(cat => 
      cat.items.some(item => item.path !== "/admin" && (pathname === item.path || pathname.startsWith(item.path + '/')))
    );
    return foundCategory ? foundCategory.title : "DASHBOARD";
  }, [pathname]);

  const [openCategory, setOpenCategory] = useState(initialCategory);

  useEffect(() => {
    setOpenCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          router.push("/login");
          return;
        }

        const user = JSON.parse(userStr);
        const validRoles = ['superadmin', 'admin', 'moderator', 'support'];
        
        if (!validRoles.includes(user.role)) {
          router.push("/");
          return;
        }

        await api.get("/admin/stats"); 
        setIsAdmin(true);
        setUserRole(user.role);
        setCurrentUser(user);
      } catch (error) {
        console.error(error);
        if (error.response?.status === 403) {
            alert(error.response.data.error || "Acceso denegado");
        }
        router.push("/");
      } finally {
        setLoading(false);
      }
    };
    checkAdmin();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app">
        <div className="w-6 h-6 rounded-full border-2 border-accent-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="flex h-screen bg-app text-primary overflow-hidden">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-[240px] h-full bg-sidebar border-r border-subtle flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="p-4 flex justify-between items-center border-b border-subtle shrink-0">
          <div className="flex flex-col">
            <span className="text-lg font-semibold tracking-tight">CUADRALO</span>
            <span className="text-[10px] font-medium text-muted uppercase tracking-wider">Control Panel</span>
          </div>
          <button className="lg:hidden text-secondary p-1.5" onClick={() => setSidebarOpen(false)}>
            <X size={16} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3 custom-scrollbar px-2.5 space-y-0.5">
          {menuCategories.map((category, idx) => {
            if (category.roles && !category.roles.includes(userRole)) return null;

            const isCategoryActive = category.title === initialCategory;
            const isOpen = openCategory === category.title;

            return (
              <div key={idx} className="mb-0.5">
                <button 
                  onClick={() => setOpenCategory(isOpen ? "" : category.title)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-150 text-[12px] font-medium ${
                    isCategoryActive
                      ? "bg-accent-bg text-accent-primary"
                      : isOpen 
                        ? "bg-card-hover text-primary" 
                        : "text-secondary hover:bg-card-hover hover:text-primary"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <category.icon size={15} />
                    <span>{category.title}</span>
                  </div>
                  <ChevronDown size={12} className={`transition-transform duration-150 ${isOpen ? "rotate-180" : ""}`} />
                </button>

                <div className={`overflow-hidden transition-all duration-200 ${isOpen ? "max-h-[500px] mt-0.5" : "max-h-0"}`}>
                  <ul className="pl-6 pr-2 py-1 space-y-0.5 border-l border-subtle ml-1.5">
                    {category.items.map((item) => {
                      const isItemActive = pathname === item.path;
                      return (
                        <li key={item.path}>
                          <Link href={item.path}>
                            <span
                              className={`block px-2.5 py-1.5 rounded-md transition-colors text-[11.5px] font-medium ${
                                isItemActive
                                  ? "bg-accent-primary text-white"
                                  : "text-muted hover:text-primary hover:bg-card-hover"
                              }`}
                              onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                            >
                              {item.name}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            );
          })}
        </nav>

        <div className="p-3 border-t border-subtle bg-sidebar shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-muted text-xs font-medium bg-card-hover hover:bg-error/10 hover:text-error border border-subtle rounded-lg transition-colors"
          >
            <LogOut size={13} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-header border-b border-subtle px-5 py-2.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-secondary p-1.5 hover:bg-card-hover rounded-lg">
              <Menu size={18} />
            </button>
            <div className="hidden md:flex items-center gap-2 text-xs text-muted">
              <span className="font-medium">Panel</span>
              <ChevronRight size={12} />
              <span className="text-secondary font-medium">{initialCategory}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-card-hover border border-subtle rounded-lg text-xs text-muted">
              <Search size={14} />
              <span className="font-medium">Buscar</span>
            </button>

            <button 
              onClick={toggleMode}
              className="p-2 bg-card-hover border border-subtle rounded-lg text-secondary hover:text-primary transition-colors"
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button className="p-2 bg-card-hover border border-subtle rounded-lg text-secondary hover:text-primary transition-colors relative">
              <Bell size={16} />
            </button>

            <div className="flex items-center gap-2 pl-2 border-l border-subtle">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-medium text-primary">
                  {currentUser?.username || 'Admin'}
                </p>
                <p className="text-[9px] font-medium text-accent-primary uppercase">
                  {currentUser?.role || 'admin'}
                </p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-accent-primary flex items-center justify-center font-semibold text-white text-xs">
                {currentUser?.username?.charAt(0).toUpperCase() || 'A'}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-5 lg:p-6 custom-scrollbar">
          <div className="max-w-7xl mx-auto pb-10">
             <ConfirmProvider>{children}</ConfirmProvider>
          </div>
        </div>
      </main>
    </div>
  );
}