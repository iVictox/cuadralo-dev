"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/utils/api";
import { Search, Trash2, FileText, Image as ImageIcon, ExternalLink } from "lucide-react";
import { useDebounce } from 'use-debounce';
import Link from "next/link";

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/admin/moderation/posts?search=${debouncedSearch}`);
      setPosts(data.posts || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (id) => {
    if (!confirm("¿Eliminar este post?")) return;
    try {
      await api.delete(`/admin/moderation/posts/${id}`);
      fetchPosts();
    } catch (error) {
      alert("Error al eliminar.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-primary flex items-center gap-2">
            <FileText className="text-accent-primary" /> Moderación de Posts
          </h1>
          <p className="text-xs text-muted mt-0.5">Revisa las publicaciones.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-card border border-subtle rounded-lg text-sm text-primary focus:outline-none focus:border-accent-primary" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? <div className="col-span-3 text-center py-8 text-muted">Cargando...</div> : posts.length === 0 ? <div className="col-span-3 text-center py-8 text-muted">No hay posts.</div> : posts.map((post) => (
          <div key={post.id} className="bg-card border border-subtle rounded-lg p-4 flex flex-col">
            <div className="flex justify-between items-start mb-2">
               <div className="font-medium text-primary text-sm">@{post.user?.username}</div>
               <div className="flex items-center gap-1">
                   <Link href={`/post/${post.id}`} target="_blank" className="p-1.5 text-muted hover:text-primary hover:bg-card-hover rounded-lg" title="Ver">
                       <ExternalLink size={14}/>
                   </Link>
                   <button onClick={() => handleDelete(post.id)} className="p-1.5 text-error hover:bg-error/10 rounded-lg" title="Eliminar">
                       <Trash2 size={14}/>
                   </button>
               </div>
            </div>
            
            <p className="text-sm text-secondary mb-3 flex-1 line-clamp-3">{post.caption || post.content}</p>
            
            {post.image_url && (
                <div className="h-32 bg-card-hover rounded-lg mb-3 overflow-hidden">
                    <img src={post.image_url} alt="Post" className="w-full h-full object-cover opacity-80" />
                </div>
            )}
            
            <div className="text-[10px] text-muted border-t border-subtle pt-2 flex justify-between">
                <span>{post.likes_count || 0} Likes</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}