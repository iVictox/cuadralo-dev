"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Heart, Trash2, Reply, Flag, MessageCircle, MoreHorizontal, Share2, MapPin } from "lucide-react";
import { api } from "@/utils/api";
import ReportModal from "./ReportModal";
import SquareLoader from "./SquareLoader";
import { formatDistanceToNow, format, differenceInHours } from "date-fns";
import { es } from "date-fns/locale";

const formatTimeAgo = (date) => {
    const dateObj = new Date(date);
    const hours = differenceInHours(new Date(), dateObj);
    
    if (hours >= 24) {
        return format(dateObj, "d MMM", { locale: es });
    }
    
    const timeStr = formatDistanceToNow(dateObj, { addSuffix: false, locale: es });
    return timeStr.replace("hace ", "").replace("alrededor de ", "");
};
import { useConfirm } from "@/context/ConfirmContext";

const parseMentions = (content) => {
  if (!content) return [];
  const parts = content.split(/(@\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      return <span key={i} className="text-[#f2158e] font-bold">{part}</span>;
    }
    return part;
  });
};

const GlassInput = ({ value, onChange, onSubmit, placeholder, replyingTo, onCancelReply }) => {
  const userStr = typeof window !== 'undefined' ? localStorage.getItem("user") : null;
  const currentUser = userStr ? JSON.parse(userStr) : null;
  const userPhoto = currentUser?.photo;
  const initial = currentUser?.username?.charAt(0)?.toUpperCase() || '?';
  return (
    <div className="relative">
      {replyingTo && (
        <div className="flex items-center justify-between px-4 py-2 bg-[#1a0b2e] border-b border-[#8b1a93]/30">
          <span className="text-xs text-purple-400">
            Respondiendo a <span className="text-[#f2158e] font-bold">@{replyingTo.user?.username}</span>
          </span>
          <button onClick={onCancelReply} className="p-1 hover:bg-[#8b1a93]/30 rounded-full">
            <X size={14} className="text-purple-400" />
          </button>
        </div>
      )}
      <div className="flex items-center gap-3 p-3 bg-[#0f0518]">
        {userPhoto ? (
          <img src={userPhoto} alt="Tu foto" className="w-8 h-8 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#f2158e] to-[#8b1a93] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initial}
          </div>
        )}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-transparent text-sm text-white placeholder-purple-500/50 outline-none"
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSubmit(); } }}
        />
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={onSubmit}
          disabled={!value.trim()}
          className={`p-2.5 rounded-full transition-all ${value.trim() ? "bg-[#f2158e] text-white" : "bg-[#8b1a93]/30 text-purple-500/50 cursor-not-allowed"}`}
        >
          <Send size={16} />
        </motion.button>
      </div>
    </div>
  );
};

const CommentItem = ({ c, isReply = false, currentUser, onLike, onReply, onDelete, onReport, onViewStory }) => {
  const [showOptions, setShowOptions] = useState(false);
  const isOwner = currentUser?.id === c.user_id;
  const hasStory = c.user?.has_story;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group ${isReply ? 'ml-12 mt-4 pl-4 border-l-2 border-[#8b1a93]/30' : 'mt-4'}`}
    >
      <div className="flex gap-3">
        <div 
          className={`w-9 h-9 rounded-full bg-[#1a0b2e] overflow-hidden shrink-0 cursor-pointer border border-[#8b1a93]/30 ${hasStory ? 'ring-2 ring-[#f2158e]' : ''}`}
          onClick={() => { if (hasStory && onViewStory) onViewStory(c.user_id); else window.location.href = `/u/${c.user?.username}`; }}
        >
          {c.user?.photo ? (
            <img src={c.user.photo} alt={c.user.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#f2158e] to-[#8b1a93] flex items-center justify-center text-white font-bold text-xs">
              {c.user?.username?.charAt(0)?.toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="bg-[#1a0b2e]/60 rounded-2xl px-4 py-3 border border-[#8b1a93]/20">
            <div className="flex items-center gap-2 mb-1">
              <span 
                className="font-bold text-sm text-white cursor-pointer hover:text-[#f2158e] transition-colors"
                onClick={() => { if (hasStory && onViewStory) onViewStory(c.user_id); else window.location.href = `/u/${c.user?.username}`; }}
              >
                @{c.user?.username}
              </span>
              <span className="text-xs text-purple-500/60">
                {formatTimeAgo(c.created_at)}
              </span>
            </div>
            <p className="text-sm text-purple-200/80 whitespace-pre-wrap">{parseMentions(c.content)}</p>
          </div>
          
          <div className="flex items-center gap-4 mt-2 ml-2">
            <button onClick={() => onLike(c.id)} className={`text-xs font-semibold transition-colors ${c.is_liked ? 'text-[#f2158e]' : 'text-purple-500 hover:text-purple-300'}`}>
              <Heart size={14} className={c.is_liked ? "fill-[#f2158e]" : ""} /> {c.likes_count > 0 && c.likes_count}
            </button>
            <button onClick={() => onReply(c)} className="text-xs font-semibold text-purple-500 hover:text-purple-300 transition-colors">
              Responder
            </button>
          </div>
        </div>

        <div className="relative">
          <button onClick={() => setShowOptions(!showOptions)} className="p-1.5 text-purple-500/50 hover:text-purple-300 rounded-full opacity-0 group-hover:opacity-100 transition-all">
            <MoreHorizontal size={14} />
          </button>
          
          <AnimatePresence>
            {showOptions && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute right-0 top-8 w-28 bg-[#150a21] border border-[#8b1a93]/30 rounded-xl shadow-xl z-10 overflow-hidden"
              >
                {isOwner ? (
                  <button onClick={() => { onDelete(c.id); setShowOptions(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                    <Trash2 size={12} /> Eliminar
                  </button>
                ) : (
                  <button onClick={() => { onReport(c); setShowOptions(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-left text-xs text-yellow-400 hover:bg-yellow-500/10 transition-colors">
                    <Flag size={12} /> Reportar
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default function CommentsModal({ post, onClose, liked, likesCount, onLikeToggle, onCommentsUpdate, onViewStory }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const { confirm } = useConfirm();
  const [reportingComment, setReportingComment] = useState(null);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const commentsEndRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'unset'; };
  }, []);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) setCurrentUser(JSON.parse(userStr));
    if (post?.id) fetchComments();
  }, [post]);

  const fetchComments = async () => {
    try {
      const data = await api.get(`/social/posts/${post.id}/comments`);
      setComments(data || []);
      if (onCommentsUpdate) onCommentsUpdate((data || []).length);
    } catch (error) { console.error("Error fetching comments:", error); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!newComment.trim()) return;
    try {
      const payload = { content: newComment };
      if (replyingTo) payload.parent_id = replyingTo.parent_id || replyingTo.id;
      await api.post(`/social/posts/${post.id}/comments`, payload);
      setNewComment("");
      setReplyingTo(null);
      fetchComments();
      setTimeout(() => commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (error) { console.error("Error posting comment:", error); }
  };

  const handleDelete = async (commentId) => {
    const isConfirmed = await confirm({
      title: "Eliminar comentario",
      message: "¿Seguro que deseas eliminar este comentario?",
      confirmText: "Eliminar",
      variant: "danger"
    });
    if (!isConfirmed) return;
    try {
      await api.delete(`/social/comments/${commentId}`);
      fetchComments();
    } catch (error) { console.error("Error deleting comment:", error); }
  };

  const handleReplyClick = (comment) => { setReplyingTo(comment); setNewComment(`@${comment.user?.username} `); };
  const handleLike = async (commentId) => {
    try {
      const res = await api.post(`/social/comments/${commentId}/like`);
      setComments(prev => prev.map(c => {
        if (c.id === commentId) return { ...c, is_liked: res.is_liked, likes_count: res.is_liked ? c.likes_count + 1 : c.likes_count - 1 };
        return c;
      }));
    } catch (error) { console.error("Error toggling like:", error); }
  };

  const rootComments = comments.filter(c => !c.parent_id).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const replies = comments.filter(c => c.parent_id).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  const [expandedReplies, setExpandedReplies] = useState({});
  const toggleReplies = (commentId) => setExpandedReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));

  const shouldTruncateCaption = post?.caption?.length > 100;
  const displayCaption = !showFullCaption && shouldTruncateCaption 
    ? post?.caption?.slice(0, 100) + "..." 
    : post?.caption;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/90 backdrop-blur-md" />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-5xl h-[92vh] bg-[#150a21] rounded-3xl border border-[#8b1a93]/30 overflow-hidden flex flex-col md:flex-row"
        >
          <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-all">
            <X size={20} className="text-white" />
          </button>

          {/* Columna IZQUIERDA: Foto ocupa TODO + Info usuario y likes flotando sobre la foto */}
          <div className="hidden md:flex md:w-1/2 flex-col h-full relative">
            <div className="flex-1 flex items-center justify-center">
              {post?.image_url ? (
                <img src={post.image_url} alt="Post" className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center w-full h-full p-8">
                  <p className="text-3xl font-bold text-white text-center leading-tight whitespace-pre-wrap">
                    {post?.caption}
                  </p>
                </div>
              )}
            </div>
            
            {/* Info usuario FLOTANDO ARRIBA */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent">
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-[#f2158e] to-[#8b1a93] flex items-center justify-center text-white font-bold text-lg overflow-hidden cursor-pointer border-2 border-white/20"
                  onClick={() => window.location.href = `/u/${post?.user?.username}`}
                >
                  {post?.user?.photo ? (
                    <img src={post.user.photo} alt={post.user.name} className="w-full h-full object-cover" />
                  ) : (
                    post?.user?.username?.charAt(0)?.toUpperCase()
                  )}
                </div>
                <div 
                  className="cursor-pointer"
                  onClick={() => window.location.href = `/u/${post?.user?.username}`}
                >
                  <p className="font-bold text-white drop-shadow-md">@{post?.user?.username}</p>
                  {post?.location && (
                    <p className="text-xs text-purple-200 flex items-center gap-1 drop-shadow-md">
                      <MapPin size={10} /> {post.location}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Likes y comentarios FLOTANDO ABAJO */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center gap-6">
                <button onClick={onLikeToggle} className={`flex items-center gap-2 transition-colors ${liked ? "text-[#f2158e]" : "text-white hover:text-[#f2158e]"}`}>
                  <Heart size={22} className={liked ? "fill-[#f2158e]" : ""} />
                  <span className="font-semibold text-sm text-white drop-shadow-md">{likesCount}</span>
                </button>
                <div className="flex items-center gap-2 text-white drop-shadow-md">
                  <MessageCircle size={22} />
                  <span className="font-semibold text-sm">{comments.length}</span>
                </div>
                <button className="text-white hover:text-[#f2158e] transition-colors ml-auto drop-shadow-md">
                  <Share2 size={22} />
                </button>
              </div>
              {post?.caption && (
                <p className="text-sm text-white mt-3 drop-shadow-md">
                  <span className="font-bold">@{post?.user?.username}</span> {displayCaption}
                  {shouldTruncateCaption && (
                    <button onClick={() => setShowFullCaption(true)} className="text-purple-300 ml-1">
                      leer más
                    </button>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Columna DERECHA: Solo comentarios */}
          <div className="w-full md:w-1/2 flex flex-col h-full border-l border-[#8b1a93]/30">
            <div className="px-6 py-4 border-b border-[#8b1a93]/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-bold text-xl text-white">Comentarios</h3>
                <span className="px-3 py-1 bg-[#8b1a93]/30 rounded-full text-xs font-bold text-[#f2158e]">
                  {comments.length}
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              {loading ? (
                <div className="flex justify-center items-center h-40">
                  <SquareLoader size="large" />
                </div>
              ) : rootComments.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#8b1a93]/20 flex items-center justify-center mb-3">
                    <MessageCircle size={28} className="text-purple-500/50" />
                  </div>
                  <p className="text-sm text-purple-400">Aún no hay comentarios</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {rootComments.map(c => {
                    const threadReplies = replies.filter(r => r.parent_id === c.id);
                    const isExpanded = expandedReplies[c.id];
                    const visibleReplies = isExpanded ? threadReplies : threadReplies.slice(0, 2);
                    const hiddenCount = threadReplies.length - 2;
                    
                    return (
                      <div key={c.id}>
                        <CommentItem c={c} currentUser={currentUser} onLike={handleLike} onReply={handleReplyClick} onDelete={handleDelete} onReport={setReportingComment} onViewStory={onViewStory} />
                        {visibleReplies.map(reply => (
                          <CommentItem key={reply.id} c={reply} isReply={true} currentUser={currentUser} onLike={handleLike} onReply={handleReplyClick} onDelete={handleDelete} onReport={setReportingComment} onViewStory={onViewStory} />
                        ))}
                        {hiddenCount > 0 && !isExpanded && (
                          <button onClick={() => toggleReplies(c.id)} className="ml-12 mt-2 text-xs font-bold text-[#f2158e] hover:text-pink-400 transition-colors">
                            Ver {hiddenCount} respuestas
                          </button>
                        )}
                        {hiddenCount > 0 && isExpanded && (
                          <button onClick={() => toggleReplies(c.id)} className="ml-12 mt-2 text-xs font-bold text-purple-500 hover:text-purple-300 transition-colors">
                            Ocultar respuestas
                          </button>
                        )}
                      </div>
                    );
                  })}
                  <div ref={commentsEndRef} />
                </div>
              )}
            </div>

            <GlassInput 
              value={newComment}
              onChange={setNewComment}
              onSubmit={handleSubmit}
              placeholder="Añadir un comentario..."
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
            />
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {reportingComment && (
          <ReportModal targetType="comment" targetId={reportingComment.id} onClose={() => setReportingComment(null)} />
        )}
      </AnimatePresence>
    </>
  );
}