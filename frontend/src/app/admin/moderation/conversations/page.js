"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { api } from "@/utils/api";
import { MessageCircle, Trash2, Search, Eye, X, User, Send } from "lucide-react";
import { useDebounce } from 'use-debounce';

export default function AdminConversations() {
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);
  const [loading, setLoading] = useState(true);
  const [selectedConv, setSelectedConv] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const chatEndRef = useRef(null);

  const fetchConvs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get(`/admin/moderation/conversations?search=${debouncedSearch}`);
      setConversations(data.conversations || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  useEffect(() => { fetchConvs(); }, [fetchConvs]);

  const handleDelete = async (u1, u2) => {
    if (!confirm("¿Eliminar todos los mensajes entre estos usuarios?")) return;
    try {
      await api.delete(`/admin/moderation/conversations?u1=${u1}&u2=${u2}`);
      fetchConvs();
    } catch (error) {
      alert("Error al eliminar.");
    }
  };

  const handleOpenChat = async (conv) => {
      setSelectedConv(conv);
      setLoadingChat(true);
      try {
          const data = await api.get(`/admin/moderation/conversations/history?u1=${conv.user1_id}&u2=${conv.user2_id}`);
          setChatHistory(data.messages || []);
      } catch (error) {
          alert("Error al cargar historial.");
      } finally {
          setLoadingChat(false);
      }
  };

  useEffect(() => {
      if (chatEndRef.current && chatHistory.length > 0) {
          chatEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
  }, [chatHistory]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-primary flex items-center gap-2">
            <MessageCircle className="text-accent-primary" size={24}/> Conversaciones
          </h1>
          <p className="text-xs text-muted mt-0.5">Moderación de chats.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <input type="text" placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-card border border-subtle rounded-lg text-sm text-primary focus:outline-none" />
        </div>
      </div>

      <div className="bg-card border border-subtle rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-card-hover text-muted font-medium border-b border-subtle text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Usuario 1</th>
                <th className="px-4 py-3">Usuario 2</th>
                <th className="px-4 py-3">Último Mensaje</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle">
              {loading ? (
                <tr><td colSpan="4" className="text-center py-8 text-muted">Cargando...</td></tr>
              ) : conversations.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-8 text-muted">No hay conversaciones.</td></tr>
              ) : conversations.map((conv, idx) => (
                <tr key={idx} className="hover:bg-card-hover">
                  <td className="px-4 py-3 text-primary">@{conv.user1_name}</td>
                  <td className="px-4 py-3 text-primary">@{conv.user2_name}</td>
                  <td className="px-4 py-3 text-xs text-muted">{conv.last_msg}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleOpenChat(conv)} className="p-2 text-muted hover:text-primary hover:bg-card-hover rounded-lg" title="Ver">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => handleDelete(conv.user1_id, conv.user2_id)} className="p-2 text-error hover:bg-error/10 rounded-lg" title="Eliminar">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedConv && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-subtle rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-subtle shrink-0">
              <div className="flex items-center gap-2">
                <User size={16} className="text-muted"/>
                <span className="font-medium text-primary">@{selectedConv.user1_name}</span>
                <span className="text-muted">↔</span>
                <span className="font-medium text-primary">@{selectedConv.user2_name}</span>
              </div>
              <button onClick={() => setSelectedConv(null)} className="p-2 text-muted hover:text-primary hover:bg-card-hover rounded-lg">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {loadingChat ? (
                <div className="text-center py-10 text-muted">Cargando...</div>
              ) : chatHistory.length === 0 ? (
                <div className="text-center py-10 text-muted">Sin mensajes.</div>
              ) : chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender_id === selectedConv.user1_id ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[70%] p-3 rounded-lg ${msg.sender_id === selectedConv.user1_id ? 'bg-card-hover' : 'bg-accent-bg text-accent-primary'}`}>
                    <p className="text-sm text-primary">{msg.content}</p>
                    <p className="text-[10px] text-muted mt-1">{new Date(msg.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 border-t border-subtle shrink-0 text-center text-xs text-muted">
              Historial de conversación
            </div>
          </div>
        </div>
      )}
    </div>
  );
}