"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, FileText, MessageCircle, Users, MessageSquare, CheckCircle, ChevronRight } from "lucide-react";

export default function AdminReportsOverview() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     setTimeout(() => setLoading(false), 300);
  }, []);

  const reportCategories = [
      { id: "posts", title: "Posts Reportados", desc: "Publicaciones denunciadas.", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10", path: "/admin/reports/posts" },
      { id: "comments", title: "Comentarios Reportados", desc: "Comentarios que infringen normas.", icon: MessageCircle, color: "text-pink-500", bg: "bg-pink-500/10", path: "/admin/reports/comments" },
      { id: "users", title: "Usuarios Reportados", desc: "Perfiles denunciados.", icon: Users, color: "text-warning", bg: "bg-warning/10", path: "/admin/reports/users" },
      { id: "messages", title: "Mensajes Privados", desc: "Reportes de conversaciones.", icon: MessageSquare, color: "text-accent-primary", bg: "bg-accent-bg", path: "/admin/reports/messages" }
  ];

  if (loading) {
    return <div className="text-center py-20 text-muted">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-subtle pb-4">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <AlertTriangle className="text-error" size={26}/> Central de Denuncias
          </h1>
          <p className="text-sm text-muted mt-1">Revisa y toma acción sobre contenido reportado.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reportCategories.map((cat) => (
              <div 
                  key={cat.id} 
                  onClick={() => router.push(cat.path)}
                  className="bg-card border border-subtle p-6 cursor-pointer hover:border-accent-primary/50 transition-none"
              >
                  <div className="flex justify-between items-start mb-4">
                      <div className={`w-12 h-12 ${cat.bg} border border-subtle flex items-center justify-center`}>
                          <cat.icon size={22} className={cat.color} />
                      </div>
                      <span className="text-xs font-bold px-2 py-1 bg-error/10 text-error uppercase tracking-wide border border-error/20">Revisar</span>
                  </div>
                  <h3 className="font-bold text-base text-primary mb-1">{cat.title}</h3>
                  <p className="text-sm text-muted">{cat.desc}</p>
              </div>
          ))}
      </div>

      <div onClick={() => router.push('/admin/reports/resolved')} className="bg-card border border-subtle border-dashed p-6 flex items-center justify-between cursor-pointer hover:border-accent-primary/50 transition-none mt-6">
          <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success/10 border border-success/20 flex items-center justify-center text-success">
                  <CheckCircle size={22} />
              </div>
              <div>
                  <h4 className="font-bold text-base text-primary">Historial de Resueltos</h4>
                  <p className="text-sm text-muted">Acciones tomadas anteriormente.</p>
              </div>
          </div>
          <ChevronRight size={22} className="text-muted" />
      </div>
    </div>
  );
}