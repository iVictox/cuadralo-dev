"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Send, Image as ImageIcon, Camera, Phone, Video, Info,
  MoreVertical, Check, CheckCheck, X, Clock, ShieldAlert,
  Download, Copy, Forward, Shield, User, ImageOff, Lock, Bookmark,
  Flag, Eye, Trash2, EyeOff
} from "lucide-react";
import { useSocket } from "@/context/SocketContext";
import { api } from "@/utils/api";
import ReportModal from "./ReportModal";
import SquareLoader from "./SquareLoader";

// Componente para el mensaje individual
const MessageItem = ({ msg, isMe, isLastMessage, onDelete, onToggleSave, onReport, onOpenPhoto }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isSystemAlert = msg.type === "screenshot_alert";
  const isImage = msg.type === "image" || msg.type === "image_once";
  const isImageOnce = msg.type === "image_once";
  const isImageExpired = (isImage && !msg.saved && new Date(msg.expires_at) < new Date()) || (isImageOnce && msg.is_viewed && !isMe);
  
  if (isSystemAlert) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full flex items-center gap-2">
          <ShieldAlert size={14} />
          {msg.content}
        </div>
      </div>
    );
  }

  if (msg.is_deleted) {
    return (
      <div className={`flex mb-4 relative ${isMe ? 'justify-end' : 'justify-start'}`}>
        <div className="flex items-center gap-2 px-4 py-2 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl text-gray-400 dark:text-gray-500 text-sm italic">
          <Trash2 size={14} className="opacity-50" /> El mensaje fue eliminado
        </div>
      </div>
    );
  }

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = () => {
    if (!isMe) return null;
    if (msg.is_read) return <CheckCheck size={14} className="text-[#3b82f6]" />;
    return <Check size={14} className="text-gray-400" />;
  };

  const MessageContent = () => {
    if (isImage) {
      if (isImageExpired) {
        return (
          <div className="flex flex-col items-center justify-center p-4 bg-black/5 dark:bg-black/20 rounded-xl gap-2 w-48 h-48 border border-black/10 dark:border-white/5">
            <ImageOff size={32} className="text-gray-400" />
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Foto Expirada</span>
          </div>
        );
      }

      if (isImageOnce) {
        if (isMe && msg.is_viewed) {
          return (
            <div className="flex items-center gap-3 py-2 px-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-inner bg-white/10 text-white/50">
                <EyeOff size={22} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] font-black tracking-wide text-white/50">Abierta</span>
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/40">Vista única</span>
              </div>
            </div>
          );
        }

        return (
          <div 
            className="flex items-center gap-3 py-2 px-3 cursor-pointer group"
            onClick={() => onOpenPhoto(msg)}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-inner transition-colors ${isMe ? 'bg-white/20 group-hover:bg-white/30 text-white' : 'bg-cuadralo-pink/10 group-hover:bg-cuadralo-pink/20 text-cuadralo-pink dark:text-cuadralo-pink'}`}>
              <Eye size={22} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className={`text-[15px] font-black tracking-wide ${isMe ? 'text-white' : 'text-gray-900 dark:text-white'}`}>Foto</span>
              <span className={`text-[11px] font-bold uppercase tracking-widest ${isMe ? 'text-white/70' : 'text-gray-500'}`}>Vista única</span>
            </div>
          </div>
        );
      }

      return (
        <div className="relative group cursor-pointer overflow-hidden rounded-xl" onClick={() => onOpenPhoto(msg)}>
          <img src={msg.content} alt="Media" className="w-48 sm:w-64 aspect-square md:aspect-auto md:max-h-80 object-cover" />
          {!msg.saved && (
            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 text-[10px] text-white font-bold tracking-widest">
              <Clock size={10} /> 24H
            </div>
          )}
          {msg.saved && (
            <div className="absolute top-2 right-2 bg-blue-500/80 backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 text-[10px] text-white font-bold tracking-widest shadow-lg">
              <Bookmark size={10} /> GUARDADA
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-md">Ver foto</span>
          </div>
        </div>
      );
    }

    return <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>;
  };

  // Menú Contextual
  const MenuDropdown = () => (
    <AnimatePresence>
      {showMenu && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`absolute z-20 w-48 bg-white dark:bg-[#150a21] border border-black/5 dark:border-[#8b1a93]/30 rounded-xl shadow-xl overflow-hidden py-1 ${
            isLastMessage 
              ? (isMe ? 'right-0 bottom-full mb-1' : 'left-0 bottom-full mb-1')
              : (isMe ? 'right-0 top-full mt-1' : 'left-0 top-full mt-1')
          }`}
        >
          {isMe && (
            <button onClick={() => { onDelete(msg.id); setShowMenu(false); }} className="w-full text-left px-4 py-3 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 text-red-500 text-xs font-bold uppercase tracking-widest transition-colors">
              <Trash2 size={14} /> Eliminar
            </button>
          )}
          {(!isImageOnce) && (
            <button onClick={() => { onToggleSave(msg); setShowMenu(false); }} className="w-full text-left px-4 py-3 hover:bg-black/5 dark:hover:bg-[#8b1a93]/20 flex items-center gap-2 text-cuadralo-textLight dark:text-gray-300 text-xs font-bold uppercase tracking-widest transition-colors">
              <Bookmark size={14} className={msg.saved ? "fill-cuadralo-textLight dark:fill-gray-300" : ""} /> {msg.saved ? 'Quitar guardado' : 'Guardar mensaje'}
            </button>
          )}
          
          {!isMe && (
            <button onClick={() => { onReport(msg); setShowMenu(false); }} className="w-full text-left px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-500/10 flex items-center gap-2 text-orange-500 text-xs font-bold uppercase tracking-widest border-t border-black/5 dark:border-white/5 transition-colors">
                <Flag size={14} /> Reportar
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex mb-4 relative ${isMe ? 'justify-end' : 'justify-start'}`}
      ref={menuRef}
    >
      <div className={`group flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[75%]`}>
        <div className="flex items-center gap-2">
          {!isMe && (
            <button onClick={() => setShowMenu(!showMenu)} className="p-1 text-gray-400 hover:text-cuadralo-pink opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical size={16} />
            </button>
          )}
          
          <div className={`relative px-4 py-2.5 shadow-sm ${
            isMe 
              ? 'bg-gradient-to-br from-cuadralo-pink to-[#c20e72] text-white rounded-[1.25rem] rounded-tr-sm shadow-[0_4px_15px_rgba(242,19,142,0.2)]' 
              : 'bg-white dark:bg-[#1a0b2e] text-cuadralo-textLight dark:text-white border border-black/5 dark:border-[#8b1a93]/30 rounded-[1.25rem] rounded-tl-sm shadow-glass-light dark:shadow-none'
          } ${isImage ? '!p-1' : ''}`}>
            <MessageContent />
          </div>

          {isMe && (
            <button onClick={() => setShowMenu(!showMenu)} className="p-1 text-gray-400 hover:text-cuadralo-pink opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical size={16} />
            </button>
          )}
        </div>

        <div className={`flex items-center gap-1.5 mt-1 px-1 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-[10px] text-gray-400 font-medium">
            {formatTime(msg.created_at)}
          </span>
          {getStatusIcon()}
          {msg.saved && <Bookmark size={10} className="text-cuadralo-pink fill-cuadralo-pink" />}
        </div>
      </div>
      <MenuDropdown />
    </motion.div>
  );
};


// Modal Previsualizador antes de Enviar
const ImagePreviewModal = ({ file, previewUrl, onClose, onSend }) => {
  const [caption, setCaption] = useState("");
  const [isOnceMode, setIsOnceMode] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleSend = async () => {
    setUploading(true);
    await onSend(file, caption, isOnceMode);
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/95 backdrop-blur-xl">
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors shadow-lg">
          <X size={24} />
        </button>
      </div>
      
      <div className="flex flex-col items-center w-full h-full justify-center max-w-2xl mx-auto p-4 pt-16 pb-24">
        <motion.img 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          src={previewUrl} 
          alt="Preview" 
          className="w-full max-h-[60vh] object-contain rounded-2xl mb-8"
        />

        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="w-full flex items-center gap-3 bg-white/10 dark:bg-[#150a21]/80 backdrop-blur-xl p-2 rounded-[2rem] border border-white/20 dark:border-[#8b1a93]/30 shadow-2xl"
        >
          <button 
            type="button" 
            onClick={() => setIsOnceMode(!isOnceMode)}
            className={`w-12 h-12 flex items-center justify-center rounded-full transition-all text-sm font-black tracking-tighter shrink-0 border-2 ${isOnceMode ? 'bg-cuadralo-pink border-transparent text-white shadow-[0_0_15px_rgba(242,19,142,0.4)]' : 'bg-transparent border-white/20 text-white hover:bg-white/10'}`}
            title="Foto de vista única"
          >
            1x
          </button>

          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Añadir un mensaje..."
            className="flex-1 bg-transparent text-white placeholder-gray-300 focus:outline-none px-4 text-[15px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
          />

          <button 
            onClick={handleSend}
            disabled={uploading}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-cuadralo-pink to-[#c20e72] text-white hover:scale-105 active:scale-95 transition-all shadow-md shrink-0 flex items-center justify-center disabled:opacity-50"
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <Send size={22} />
            )}
          </button>
        </motion.div>

        {isOnceMode && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex items-center gap-2 text-cuadralo-pink font-bold text-sm bg-cuadralo-pink/10 px-4 py-2 rounded-full backdrop-blur-md"
          >
            <Eye size={16} /> La foto solo podrá verse una vez
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Modal Visor de Fotos
const PhotoModal = ({ photo, onClose, isMe, onToggleSave, onDelete, onReport }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl">
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
        <button onClick={onClose} className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-3">
          {(!photo.is_image_once || isMe) && (
            <button onClick={() => onToggleSave(photo)} className={`p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-colors ${photo.saved ? 'text-cuadralo-pink' : 'text-white'}`}>
              <Bookmark size={20} className={photo.saved ? "fill-cuadralo-pink" : ""} />
            </button>
          )}
          {isMe ? (
            <button onClick={() => { onDelete(photo.id); onClose(); }} className="p-3 bg-white/10 hover:bg-red-500/40 text-white hover:text-red-300 rounded-full backdrop-blur-md transition-colors">
              <Trash2 size={20} />
            </button>
          ) : (
            <button onClick={() => onReport(photo)} className="p-3 bg-white/10 hover:bg-orange-500/40 text-white hover:text-orange-300 rounded-full backdrop-blur-md transition-colors">
              <Flag size={20} />
            </button>
          )}
        </div>
      </div>
      
      <motion.img 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        src={photo.content} 
        alt="Foto" 
        className="max-w-full max-h-screen object-contain"
      />
      
      {!photo.saved && !photo.is_image_once && (
        <div className="absolute bottom-8 bg-black/50 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-bold tracking-widest flex items-center gap-2">
          <Clock size={14} /> FOTO DE 24 HORAS
        </div>
      )}
      {photo.is_image_once && (
        <div className="absolute bottom-8 bg-cuadralo-pink text-white px-4 py-2 rounded-full text-xs font-bold tracking-widest flex items-center gap-2">
          <Eye size={14} /> VISTA ÚNICA
        </div>
      )}
    </div>
  );
};


export default function ChatWindow({ user, onClose }) {
  const router = useRouter();
  const { socket, onlineUsers } = useSocket();
  const isOnline = onlineUsers ? onlineUsers.has(String(user.id)) : false;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  });
  
  const [reportingMsg, setReportingMsg] = useState(null);
  const [showChatOptions, setShowChatOptions] = useState(false);
  const [viewingPhoto, setViewingPhoto] = useState(null);

  // Estados para previsualización de imagen
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const chatOptionsRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const isInitialLoad = useRef(true);

  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  // Cerrar menú de opciones al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatOptionsRef.current && !chatOptionsRef.current.contains(event.target)) {
        setShowChatOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await api.get(`/messages/${user.id}`);
        setMessages(data || []);
        
        const unreadIds = data.filter(m => !m.is_read && m.sender_id === user.id).map(m => m.id);
        if (unreadIds.length > 0 && socket) {
          socket.send(JSON.stringify({
            type: "mark_chat_read",
            payload: { chat_id: user.id }
          }));
          
          setMessages(prev => prev.map(m => 
            unreadIds.includes(m.id) ? { ...m, is_read: true } : m
          ));
        }

      } catch (error) {
        console.error("Error cargando mensajes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user.id, socket]);

  useEffect(() => {
    if (loading) return;
    if (isInitialLoad.current) {
      scrollToBottom("auto");
      // Use setTimeout to ensure DOM has rendered messages before marking as loaded
      setTimeout(() => { isInitialLoad.current = false; }, 50);
    } else {
      scrollToBottom("smooth");
    }
  }, [messages, loading]);

  useEffect(() => {
    const handleSocketEvent = (e) => {
      const data = e.detail;
      if (data.type === "new_message") {
        const msg = data.payload;
        if (msg.sender_id === user.id || msg.receiver_id === user.id) {
          setMessages(prev => {
            if (prev.find(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
          
          if (msg.sender_id === user.id && socket?.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
              type: "mark_chat_read",
              payload: { chat_id: user.id }
            }));
          }
        }
      } else if (data.type === "messages_read") {
        if (data.payload.chat_id === user.id) {
          setMessages(prev => prev.map(m => 
            (m.sender_id === currentUser?.id && !m.is_read) ? { ...m, is_read: true } : m
          ));
        }
      } else if (data.type === "message_deleted") {
        setMessages(prev => prev.map(m => 
          m.id === data.payload.message_id ? { ...m, is_deleted: true, content: "" } : m
        ));
      } else if (data.type === "message_saved") {
        setMessages(prev => prev.map(m => 
          m.id === data.payload.message_id ? { ...m, saved: data.payload.saved } : m
        ));
      } else if (data.type === "message_viewed") {
        setMessages(prev => prev.map(m => 
          m.id === data.payload.message_id ? { ...m, is_viewed: true } : m
        ));
      }
    };

    window.addEventListener("socket_event", handleSocketEvent);
    return () => window.removeEventListener("socket_event", handleSocketEvent);
  }, [socket, user.id, currentUser]);

  const handleSendText = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || uploading) return;

    const msgContent = newMessage;
    setNewMessage("");

    try {
      const res = await api.post("/messages", {
        receiver_id: user.id,
        content: msgContent,
        type: "text"
      });
      setMessages(prev => {
        if (prev.find(m => m.id === res.id)) return prev;
        return [...prev, res];
      });
    } catch (error) {
      console.error("Error enviando mensaje:", error);
      setNewMessage(msgContent); 
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreviewFile(file);
    setPreviewUrl(url);

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmImageSend = async (file, caption, isOnce) => {
    try {
      const imageUrl = await api.upload(file, "chat");
      
      // Enviar imagen
      const res = await api.post("/messages", {
        receiver_id: user.id,
        content: imageUrl,
        type: isOnce ? "image_once" : "image"
      });
      
      setMessages(prev => {
        if (prev.find(m => m.id === res.id)) return prev;
        return [...prev, res];
      });

      // Si hay un caption, lo enviamos como mensaje de texto justo después
      if (caption.trim()) {
        const textRes = await api.post("/messages", {
          receiver_id: user.id,
          content: caption.trim(),
          type: "text"
        });
        setMessages(prev => {
          if (prev.find(m => m.id === textRes.id)) return prev;
          return [...prev, textRes];
        });
      }

      // Cerrar modal
      setPreviewFile(null);
      setPreviewUrl(null);
      
    } catch (error) {
      console.error("Error subiendo imagen:", error);
      alert("Error enviando imagen. Intenta de nuevo.");
    }
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      await api.delete(`/messages/${msgId}`);
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, is_deleted: true, content: "" } : m));
    } catch (error) {
      console.error("Error eliminando mensaje:", error);
    }
  };

  const handleToggleSave = async (msg) => {
    try {
      const res = await api.post(`/messages/${msg.id}/toggle-save`);
      setMessages(prev => prev.map(m => 
        m.id === msg.id ? { ...m, saved: res.saved } : m
      ));
      if (viewingPhoto && viewingPhoto.id === msg.id) {
        setViewingPhoto(prev => ({ ...prev, saved: res.saved }));
      }
    } catch (error) {
      console.error("Error guardando mensaje:", error);
    }
  };

  const handleOpenPhoto = (msg) => {
    if (msg.type === "image_once" && msg.sender_id !== currentUser?.id && !msg.is_viewed) {
      if (socket) {
        socket.send(JSON.stringify({
          type: "view_once_opened",
          payload: { message_id: msg.id }
        }));
      }
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_viewed: true } : m));
    }
    setViewingPhoto(msg);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex flex-col bg-cuadralo-bgLight dark:bg-cuadralo-bgDark sm:p-4 md:p-6 transition-colors duration-300">
        
        {/* Header Superior Rediseñado */}
        <header className="bg-white/70 dark:bg-[#150a21]/80 backdrop-blur-2xl border-b border-black/5 dark:border-[#8b1a93]/30 px-4 py-3 flex items-center justify-between shrink-0 sm:rounded-3xl sm:mx-auto sm:max-w-4xl w-full z-10 shadow-glass-light dark:shadow-none mb-0 sm:mb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="p-2 -ml-2 rounded-full hover:bg-black/5 dark:hover:bg-[#8b1a93]/20 text-cuadralo-textLight dark:text-white transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => router.push(`/u/${user.username}`)}
            >
              <div className="relative">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden bg-black/5 dark:bg-[#1a0b2e] border-2 border-transparent group-hover:border-cuadralo-pink transition-colors">
                  {user.photo ? (
                    <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold uppercase">{user.username?.charAt(0)}</div>
                  )}
                </div>
                {isOnline && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-[#150a21] rounded-full shadow-sm"></div>
                )}
              </div>
              
              <div>
                <h3 className="font-bold text-cuadralo-textLight dark:text-white text-sm sm:text-base leading-tight group-hover:text-cuadralo-pink transition-colors">
                  {user.name}
                </h3>
                {isOnline ? (
                  <p className="text-[10px] sm:text-xs text-green-500 font-bold tracking-wide uppercase mt-0.5">En línea</p>
                ) : (
                  <p className="text-[10px] sm:text-xs text-gray-400 font-bold tracking-wide uppercase mt-0.5">Desconectado</p>
                )}
              </div>
            </div>
          </div>

          <div className="relative" ref={chatOptionsRef}>
            <button onClick={(e) => { e.stopPropagation(); setShowChatOptions(!showChatOptions); }} className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-[#8b1a93]/20 text-gray-400 hover:text-cuadralo-pink transition-colors">
              <MoreVertical size={22} />
            </button>
            
            <AnimatePresence>
              {showChatOptions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute right-0 top-12 z-50 w-56 bg-white dark:bg-[#150a21] border border-black/5 dark:border-[#8b1a93]/30 rounded-2xl shadow-2xl overflow-hidden py-2"
                >
                  <div className="px-4 py-2 border-b border-black/5 dark:border-[#8b1a93]/30 mb-1">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Opciones de Chat</p>
                  </div>
                  <button onClick={() => { setShowChatOptions(false); setReportingMsg(user); }} className="w-full text-left px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-500/10 flex items-center gap-3 text-orange-500 text-sm font-bold transition-colors">
                    <Flag size={18} /> Reportar Usuario
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {/* Área de Mensajes */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:mx-auto sm:max-w-4xl w-full relative custom-scrollbar">
          
          <div className="flex flex-col items-center justify-center py-8 mb-8">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden bg-black/5 dark:bg-[#1a0b2e] mb-4 shadow-xl border-[4px] border-white dark:border-[#8b1a93]/30">
              {user.photo ? (
                <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-3xl uppercase">{user.username?.charAt(0)}</div>
              )}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-cuadralo-textLight dark:text-white mb-1">{user.name}</h2>
            <p className="text-sm text-gray-500 font-medium mb-6">@{user.username}</p>
            
            <div className="bg-cuadralo-pink/10 dark:bg-cuadralo-pink/20 border border-cuadralo-pink/30 text-cuadralo-pink text-xs px-6 py-3 rounded-2xl font-bold flex flex-col items-center text-center gap-2 max-w-sm">
              <Clock size={20} />
              <p>Los mensajes desaparecen automáticamente después de 24 horas a menos que decidan guardarlos.</p>
            </div>
          </div>

          <div className="space-y-1">
            {loading ? (
              <div className="flex justify-center items-center py-10">
                <SquareLoader size="small" />
              </div>
            ) : messages.length === 0 ? (
              <p className="text-center text-gray-400 text-sm font-medium mt-10">Envía un mensaje para romper el hielo.</p>
            ) : (
              messages.map((msg, index) => {
                const isMe = msg.sender_id === currentUser?.id;
                const showDateMarker = index === 0 || new Date(messages[index - 1].created_at).toDateString() !== new Date(msg.created_at).toDateString();
                
                return (
                  <div key={msg.id}>
                    {showDateMarker && (
                      <div className="flex justify-center my-6">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-black/5 dark:bg-white/5 px-4 py-1.5 rounded-full border border-black/5 dark:border-white/10">
                          {new Date(msg.created_at).toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    )}
                    <MessageItem 
                      msg={msg} 
                      isMe={isMe} 
                      isLastMessage={index === messages.length - 1}
                      onDelete={handleDeleteMessage}
                      onToggleSave={handleToggleSave}
                      onReport={setReportingMsg}
                      onOpenPhoto={handleOpenPhoto}
                    />
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Bottom Bar Rediseñado */}
        <div className="bg-white/70 dark:bg-[#150a21]/80 backdrop-blur-2xl border-t border-black/5 dark:border-[#8b1a93]/30 p-3 sm:p-4 shrink-0 sm:rounded-3xl sm:mx-auto sm:max-w-4xl w-full pb-safe mb-0 sm:mb-2 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_40px_rgba(0,0,0,0.3)]">
          <form onSubmit={handleSendText} className="flex items-end gap-3 max-w-3xl mx-auto relative">
            
            <button 
              type="button" 
              onClick={() => fileInputRef.current.click()}
              disabled={uploading}
              className="w-[52px] h-[52px] shrink-0 bg-black/5 dark:bg-[#1a0b2e] border border-black/5 dark:border-[#8b1a93]/30 flex items-center justify-center rounded-full text-gray-500 hover:text-cuadralo-pink hover:bg-black/10 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              <ImageIcon size={22} />
              <input 
                type="file" 
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageSelect}
                className="hidden" 
              />
            </button>

            <div className="flex-1 bg-black/5 dark:bg-[#1a0b2e] rounded-3xl border border-black/5 dark:border-[#8b1a93]/30 flex items-center px-5 py-1 focus-within:ring-2 focus-within:ring-cuadralo-pink/30 focus-within:border-cuadralo-pink transition-all min-h-[52px] shadow-inner">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="w-full bg-transparent text-cuadralo-textLight dark:text-white text-[15px] focus:outline-none resize-none max-h-32 custom-scrollbar py-3 placeholder-gray-400 dark:placeholder-gray-500"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendText(e);
                  }
                }}
              />
            </div>

            {newMessage.trim() || uploading ? (
              <button 
                type="submit" 
                disabled={uploading}
                className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-cuadralo-pink to-[#c20e72] text-white hover:scale-105 active:scale-95 transition-all shadow-md shrink-0 flex items-center justify-center disabled:opacity-50"
              >
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send size={22} />
                )}
              </button>
            ) : (
              <button 
                type="button"
                disabled
                className="w-[52px] h-[52px] rounded-full bg-black/5 dark:bg-white/5 text-gray-300 dark:text-gray-600 transition-all shrink-0 flex items-center justify-center cursor-not-allowed border border-black/5 dark:border-white/5"
              >
                <Send size={22} />
              </button>
            )}
          </form>
        </div>

      </div>

      <AnimatePresence>
        {previewFile && (
          <ImagePreviewModal 
            file={previewFile}
            previewUrl={previewUrl}
            onClose={() => {
              setPreviewFile(null);
              setPreviewUrl(null);
            }}
            onSend={handleConfirmImageSend}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewingPhoto && (
          <PhotoModal 
            photo={viewingPhoto} 
            isMe={viewingPhoto.sender_id === currentUser?.id}
            onClose={() => setViewingPhoto(null)} 
            onToggleSave={handleToggleSave}
            onDelete={handleDeleteMessage}
            onReport={setReportingMsg}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
          {reportingMsg && (
              <ReportModal 
                 targetType={reportingMsg.id === user.id ? "user" : "message"} 
                 targetId={reportingMsg.id} 
                 onClose={() => setReportingMsg(null)} 
              />
          )}
      </AnimatePresence>
    </>
  );
}