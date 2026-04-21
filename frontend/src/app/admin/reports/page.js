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
      <div>
        <h1 className="text-xl font-semibold text-primary flex items-center gap-2">
            <AlertTriangle className="text-error" size={24}/> Central de Denuncias
        </h1>
        <p className="text-xs text-muted mt-0.5">Revisa y toma acción sobre contenido reportado.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportCategories.map((cat) => (
              <div 
                  key={cat.id} 
                  onClick={() => router.push(cat.path)}
                  className="bg-card border border-subtle rounded-lg p-4 cursor-pointer hover:border-accent-primary/50 transition-colors"
              >
                  <div className="flex justify-between items-start mb-3">
                      <div className={`w-10 h-10 rounded-lg ${cat.bg} flex items-center justify-center`}>
                          <cat.icon size={20} className={cat.color} />
                      </div>
                      <span className="text-[10px] font-medium px-2 py-1 rounded bg-error/10 text-error">Revisar</span>
                  </div>
                  <h3 className="font-medium text-primary mb-1">{cat.title}</h3>
                  <p className="text-xs text-muted">{cat.desc}</p>
              </div>
          ))}
      </div>

      <div onClick={() => router.push('/admin/reports/resolved')} className="bg-card border border-subtle border-dashed rounded-lg p-4 flex items-center justify-between cursor-pointer hover:border-accent-primary/50 transition-colors">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center text-success">
                  <CheckCircle size={20} />
              </div>
              <div>
                  <h4 className="font-medium text-primary">Historial de Resueltos</h4>
                  <p className="text-xs text-muted">Acciones tomadas anteriormente.</p>
              </div>
          </div>
          <ChevronRight size={18} className="text-muted" />
      </div>
    </div>
  );
}