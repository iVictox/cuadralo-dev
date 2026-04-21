"use client";

import { useState, useEffect } from "react";
import { Heart, MessageCircle, MoreVertical, Flag, Trash2, Share2, MapPin } from "lucide-react";
import { api } from "@/utils/api";
import { formatDistanceToNow, format, differenceInHours } from "date-fns";
import { es } from "date-fns/locale";

const formatTimeAgo = (date) => {
    const dateObj = new Date(date);
    const hours = differenceInHours(new Date(), dateObj);
    
    if (hours >= 24) {
        return format(dateObj, "d MMM", { locale: es });
    }
    
    const timeStr = formatDistanceToNow(dateObj, { addSuffix: false, locale: es });
    const cleaned = timeStr.replace("hace ", "").replace("alrededor de ", "");
    return cleaned;
};
import CommentsModal from "./CommentsModal";
import ReportModal from "./ReportModal";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useConfirm } from "@/context/ConfirmContext";
import { useToast } from "@/context/ToastContext";

const GlowIcon = ({ icon: Icon, active, onClick, size = 26 }) => (
  <motion.div whileTap={{ scale: 0.8 }} whileHover={{ scale: 1.1 }}>
    <Icon 
      size={size} 
      className={`transition-all duration-300 ${active ? "drop-shadow-[0_0_12px_rgba(242,21,142,0.8)]" : ""}`}
      onClick={onClick}
    />
  </motion.div>
);

export default function FeedPost({ post, onDelete, onViewStory, isModal = false, autoOpen = false }) {
  const router = useRouter();
  const { confirm } = useConfirm();
  const { showToast } = useToast();

  const [liked, setLiked] = useState(post.is_liked);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);
  
  const [showMenu, setShowMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showReport, setShowReport] = useState(false);

  // Auto abrir modal cuando se carga desde URL
  useEffect(() => {
    if (autoOpen) {
      setShowComments(true);
    }
  }, [autoOpen]);

  // Limpiar URL cuando se cierra el modal
  const handleCloseComments = () => {
    setShowComments(false);
    // Solo limpiar URL si es el post actual
    const params = new URLSearchParams(window.location.search);
    if (params.get('post') === String(post.id)) {
      window.history.pushState(null, "", "/");
    }
  };
  
  const userStr = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const isMyPost = currentUser && currentUser.id === post.user.id;

  const hasStory = post.user?.has_story;
  const hasUnseen = post.user?.has_unseen_story;
  
  const ringClass = hasStory 
    ? (hasUnseen ? "ring-2 ring-[#f2158e] ring-offset-2 ring-offset-[#0f0518] shadow-[0_0_20px_rgba(242,21,142,0.4)]" : "ring-2 ring-purple-500/50 ring-offset-2")
    : "";

  const handleAvatarClick = (e) => {
      e.stopPropagation();
      if (hasStory) onViewStory(post.user.id);
      else router.push(`/u/${post.user.username}`);
  };

  const handleLike = async () => {
    const prevLiked = liked;
    const prevCount = likesCount;
    setLiked(!liked);
    setLikesCount(prev => prev + (liked ? -1 : 1));
    try { await api.post(`/social/posts/${post.id}/like`); } 
    catch (error) { setLiked(prevLiked); setLikesCount(prevCount); }
  };

  const openCommentsModal = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowComments(true);
    window.history.pushState(null, "", `/?post=${post.id}`);
  };

  const handleDeletePost = async () => {
      setShowMenu(false); 
      const ok = await confirm({ 
          title: "¿Eliminar publicación?", 
          message: "Esta acción no se puede deshacer.", 
          confirmText: "Eliminar", 
          variant: "danger" 
      });
      if (ok) {
          try {
              await api.delete(`/social/posts/${post.id}`);
              showToast("Publicación eliminada", "success");
              if (onDelete) onDelete(post.id);
          } catch (error) {
              console.error(error);
              showToast("Error al eliminar", "error");
          }
      }
  };

  return (
    <>
        <div className="w-full">
            {/* Glass Card Principal Morado */}
            <div className="relative bg-gradient-to-br from-[#2d1b4e]/60 via-[#1a0b2e]/40 to-[#150a21]/60 backdrop-blur-xl rounded-3xl border border-[#8b1a93]/30 shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-3xl pointer-events-none border border-[#8b1a93]/20" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#f2158e]/30 to-transparent" />
                
                {/* Header del Post */}
                <div className="relative flex items-center justify-between p-4 pb-3">
                    <div className="flex items-center gap-3">
                        <div 
                            onClick={handleAvatarClick}
                            className={`relative w-12 h-12 rounded-full overflow-hidden cursor-pointer ${ringClass}`}
                        >
                            {post.user?.photo ? (
                                <img src={post.user.photo} alt={post.user.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#f2158e] to-[#8b1a93] flex items-center justify-center text-white font-bold">
                                    {post.user?.username?.charAt(0)?.toUpperCase()}
                                </div>
                            )}
                            {hasStory && hasUnseen && (
                                <div className="absolute inset-0 rounded-full animate-pulse bg-[#f2158e]/20" />
                            )}
                        </div>
                        <div 
                            className="cursor-pointer"
                            onClick={() => {
                                if (hasStory) onViewStory(post.user.id);
                                else router.push(`/u/${post.user.username}`);
                            }}
                        >
                            <h4 className="font-bold text-purple-100 text-[15px] tracking-tight">
                                {post.user?.name}
                            </h4>
                            <p className="text-xs text-purple-400">@{post.user?.username}</p>
                            <div className="flex items-center gap-2 text-xs text-purple-500 mt-0.5">
                                <span>{formatTimeAgo(post.created_at)}</span>
                                {post.location && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-purple-500/50" />
                                        <span className="flex items-center gap-1">
                                            <MapPin size={10} /> {post.location}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="relative">
                        <button onClick={() => setShowMenu(!showMenu)} className="p-2 rounded-full text-purple-400 hover:text-purple-200 hover:bg-[#8b1a93]/20 transition-all">
                            <MoreVertical size={20} />
                        </button>

                        <AnimatePresence>
                            {showMenu && (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                    className="absolute right-0 top-12 w-44 bg-[#150a21]/95 backdrop-blur-xl border border-[#8b1a93]/30 rounded-2xl shadow-xl z-20 overflow-hidden"
                                >
                                    {isMyPost ? (
                                        <button onClick={handleDeletePost} className="w-full text-left px-4 py-3 text-red-400 hover:bg-red-500/10 text-sm flex items-center gap-2 transition-colors">
                                            <Trash2 size={16} /> Eliminar
                                        </button>
                                    ) : (
                                        <button onClick={() => { setShowMenu(false); setShowReport(true); }} className="w-full text-left px-4 py-3 text-yellow-400 hover:bg-yellow-500/10 text-sm flex items-center gap-2 transition-colors">
                                            <Flag size={16} /> Reportar
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Contenido del Post */}
                {post.image_url ? (
                    <div 
                        className="relative w-full aspect-[4/5] cursor-pointer group"
                        onDoubleClick={handleLike}
                        onClick={openCommentsModal}
                    >
                        <img src={post.image_url} alt="Post" className="w-full h-full object-cover" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0518]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                ) : (
                    <div 
                        className="w-full py-12 px-8 cursor-pointer"
                        onClick={openCommentsModal}
                    >
                        <p className="text-3xl md:text-4xl font-bold text-purple-100 text-center leading-tight whitespace-pre-wrap">
                            {post.caption}
                        </p>
                    </div>
                )}

                {/* Acciones - Barrita Neón */}
                <div className="relative px-4 py-3 flex items-center gap-6 border-t border-[#8b1a93]/20">
                    <button 
                        onClick={handleLike} 
                        className={`flex items-center gap-2 transition-all hover:scale-105 ${liked ? "text-[#f2158e]" : "text-purple-400 hover:text-purple-200"}`}
                    >
                        <GlowIcon icon={Heart} active={liked} size={28} />
                        {likesCount > 0 && <span className="text-sm font-semibold text-purple-300">{likesCount}</span>}
                    </button>

                    <button 
                        onClick={openCommentsModal} 
                        className="flex items-center gap-2 text-purple-400 hover:text-purple-200 transition-all hover:scale-105"
                    >
                        <MessageCircle size={28} strokeWidth={1.5} />
                        {commentsCount > 0 && <span className="text-sm font-semibold text-purple-300">{commentsCount}</span>}
                    </button>
                    
                    <button className="ml-auto text-purple-400 hover:text-purple-200 transition-all hover:scale-105">
                        <Share2 size={26} strokeWidth={1.5} />
                    </button>
                </div>

                {/* Caption si hay imagen */}
                {post.image_url && post.caption && (
                    <div className="px-4 pb-4">
                        <p className="text-purple-200 text-sm leading-relaxed">
                            <span className="font-bold text-[#f2158e]">@{post.user?.username}</span> {post.caption}
                        </p>
                    </div>
                )}
            </div>
        </div>

        {showComments && (
            <CommentsModal
                post={post}
                onClose={handleCloseComments}
                liked={liked}
                likesCount={likesCount}
                onLikeToggle={handleLike}
                onCommentsUpdate={(count) => setCommentsCount(count)}
                onViewStory={onViewStory}
            />
        )}

        {showReport && (
            <ReportModal
                targetType="post"
                targetId={post.id}
                onClose={() => setShowReport(false)}
            />
        )}
    </>
  );
}