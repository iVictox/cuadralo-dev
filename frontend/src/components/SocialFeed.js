"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Loader2, RefreshCw, Crown, Sparkles } from "lucide-react"; 
import StoriesBar from "./StoriesBar"; 
import FeedPost from "./FeedPost";
import StoryViewer from "./StoryViewer";
import SocialHeader from "./SocialHeader"; 
import SearchModal from "./SearchModal"; 
import NotificationModal from "./NotificationModal"; 
import { api } from "@/utils/api";
import { AnimatePresence, motion } from "framer-motion";
import PrimeModal from "@/components/PrimeModal";
import SquareLoader from "./SquareLoader";

export default function SocialFeed({ onUploadClick, isActive = true, onLoaded, onPostsUpdate, externalPostId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const [stories, setStories] = useState([]); 
  const [myStories, setMyStories] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const fetchingRef = useRef(false);
  const [scrollRef, setScrollRef] = useState(null);
  
  const [viewingUserStories, setViewingUserStories] = useState(null);
  const [showPrime, setShowPrime] = useState(false);
  const [isPrime, setIsPrime] = useState(false);
  
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState(0);

  const [activeTab, setActiveTab] = useState("for_you");
  const [hasInitialFetch, setHasInitialFetch] = useState(false);

  // Reset page when tab changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setPosts([]);
  }, [activeTab]);

  const fetchData = async (tab = activeTab, isRefresh = false, targetPage = 1) => {
    if (fetchingRef.current && !isRefresh) return;
    
    try {
      if (!isRefresh && targetPage === 1) setLoading(true);
      if (targetPage > 1) {
        setIsFetchingMore(true);
        fetchingRef.current = true;
      }

      if (targetPage === 1) {
        try {
          const status = await api.get("/premium/status");
          setIsPrime(status.is_prime);
        } catch (e) {}

        try {
          const userStr = localStorage.getItem("user");
          const me = userStr ? JSON.parse(userStr) : null;
          setCurrentUser(me);
        } catch (e) {}

        try {
          const notifs = await api.get("/notifications");
          if (Array.isArray(notifs)) {
              setUnreadNotifsCount(notifs.filter(n => !n.is_read).length);
          }
        } catch (e) {}

        try {
          const storiesResponse = await api.get("/social/stories");
          if (storiesResponse) {
              setStories(storiesResponse.feed || []);
              setMyStories(storiesResponse.my_stories || []);
          }
        } catch (e) {}
      }

      try {
        const feedData = await api.get(`/social/feed?tab=${tab}&page=${targetPage}&limit=10`);
        const postsArray = Array.isArray(feedData) ? feedData : [];
        
        if (postsArray.length < 10) {
          setHasMore(false);
        }

        setPosts(prev => {
          let newList;
          if (targetPage === 1) {
            newList = postsArray;
          } else {
            const existingIds = new Set(prev.map(p => p.id));
            const uniqueNewPosts = postsArray.filter(p => !existingIds.has(p.id));
            newList = [...prev, ...uniqueNewPosts];
          }

          if (newList.length > 30) {
            return newList.slice(newList.length - 30);
          }
          return newList;
        });
        
        if (onPostsUpdate) {
          onPostsUpdate(postsArray);
        }
      } catch (e) { console.error("Error feed:", e); }

      setHasInitialFetch(true);
    } catch (error) {
      console.error("Error data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsFetchingMore(false);
      fetchingRef.current = false;
      if (onLoaded) onLoaded();
    }
  };

  // Fetch when the component becomes active or tab changes
  useEffect(() => {
      if (isActive) {
          fetchData(activeTab, !hasInitialFetch, page);
      }
  }, [isActive, hasInitialFetch, activeTab, page]);

  // WebSockets para tiempo real
  useEffect(() => {
      const handleSocketEvent = (e) => {
          const { type, payload } = e.detail;

          if (type === "new_notification") {
              setUnreadNotifsCount(prev => prev + 1);
          }

          if (type === "user_updated") {
              setCurrentUser(payload);
              localStorage.setItem("user", JSON.stringify(payload));
          }

          if (type === "new_story") {
              api.get("/social/stories").then(res => {
                  if (res) { setStories(res.feed || []); setMyStories(res.my_stories || []); }
              }).catch(() => {});
          }

          if (type === "story_viewed") {
              setStories(prev => prev.map(group => {
                  let changed = false;
                  const newGroupStories = group.stories.map(s => {
                      if (String(s.id) === String(payload.story_id) && !s.seen) { changed = true; return { ...s, seen: true }; }
                      return s;
                  });
                  if (changed) return { ...group, stories: newGroupStories, all_seen: newGroupStories.every(s => s.seen) };
                  return group;
              }));
          }

          if (type === "story_seen_by") {
              setMyStories(prev => prev.map(s => String(s.id) === String(payload.story_id) ? { ...s, views_count: (s.views_count || 0) + 1 } : s));
              
              setViewingUserStories(prev => {
                  if (prev && prev.playlist) {
                      const newPlaylist = prev.playlist.map(group => {
                          if (group.isOwner) {
                              return {
                                  ...group,
                                  stories: group.stories.map(s => String(s.id) === String(payload.story_id) ? { ...s, views_count: (s.views_count || 0) + 1 } : s)
                              };
                          }
                          return group;
                      });
                      return { ...prev, playlist: newPlaylist };
                  }
                  return prev;
              });
          }

          if (type === "story_deleted") {
              const { story_id, user_id } = payload;
              if (currentUser && String(user_id) === String(currentUser.id)) {
                  setMyStories(prev => prev.filter(s => String(s.id) !== String(story_id)));
              } else {
                  setStories(prev => prev.map(group => {
                      if (String(group.user.id) === String(user_id)) return { ...group, stories: group.stories.filter(s => String(s.id) !== String(story_id)) };
                      return group;
                  }).filter(group => group.stories.length > 0));
              }

              setViewingUserStories(prev => {
                  if (!prev) return null;
                  const newPlaylist = prev.playlist.map(group => {
                      return {
                          ...group,
                          stories: group.stories.filter(s => String(s.id) !== String(story_id))
                      };
                  }).filter(group => group.stories.length > 0);

                  if (newPlaylist.length === 0) return null;
                  return { ...prev, playlist: newPlaylist };
              });
          }
      };

      window.addEventListener("socket_event", handleSocketEvent);

      const handleGlobalPostDeleted = (e) => {
          handlePostDeleted(e.detail.id);
      };
      window.addEventListener("post_deleted", handleGlobalPostDeleted);

      return () => {
          window.removeEventListener("socket_event", handleSocketEvent);
          window.removeEventListener("post_deleted", handleGlobalPostDeleted);
      };
  }, [currentUser]);

  // Infinite Scroll Observer
  useEffect(() => {
    if (!hasMore || isFetchingMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Añadimos una pequeña verificación extra para evitar el bucle infinito
        if (entries[0].isIntersecting && hasMore && !fetchingRef.current && !loading) {
          setTimeout(() => {
            setPage(prev => prev + 1);
          }, 500);
        }
      },
      { threshold: 0.01, rootMargin: "100px" } // Detectamos un poco antes para que sea más suave
    );

    const target = document.getElementById("feed-bottom-anchor");
    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [hasMore, isFetchingMore, posts]);

  const handleRefresh = () => { setRefreshing(true); fetchData(activeTab, true); };
  const handlePostDeleted = (deletedPostId) => { setPosts(prev => prev.filter(p => p.id !== deletedPostId)); };

  // ✅ NUEVO: Lógica de Playlist para las Historias
  const handleViewStory = async (targetUserId) => {
      let fullPlaylist = [];

      // 1. Agregamos nuestra propia historia primero (si tenemos)
      if (myStories && myStories.length > 0) {
          fullPlaylist.push({
              user: currentUser,
              stories: myStories,
              isOwner: true
          });
      }

      // 2. Agregamos las historias de los demás usuarios
      if (stories && stories.length > 0) {
          stories.forEach(group => {
              if (group.stories && group.stories.length > 0) {
                  fullPlaylist.push({
                      user: group.user,
                      stories: group.stories,
                      isOwner: false
                  });
              }
          });
      }

      // 3. Buscamos dónde hizo clic el usuario para empezar desde ahí
      let targetIndex = fullPlaylist.findIndex(g => String(g.user?.id) === String(targetUserId));

      // 4. Si NO está en la lista (no lo seguimos), cargamos sus historias individualmente
      if (targetIndex === -1) {
          try {
              const cleanId = String(targetUserId).trim();
              console.log("🚀 handleViewStory -> Cargando para ID:", cleanId);
              const res = await api.get(`/social/user-stories/${cleanId}`);
              
              if (res && res.stories && res.stories.length > 0) {
                  fullPlaylist.push({
                      user: res.user,
                      stories: res.stories,
                      isOwner: false
                  });
                  targetIndex = fullPlaylist.length - 1;
              } else {
                  console.log("ℹ️ El usuario no tiene historias activas o la respuesta fue vacía.");
                  return; 
              }
          } catch (e) {
              console.error("❌ ERROR en handleViewStory:", e);
              if (e.message) console.error("📝 Mensaje:", e.message);
              if (e.stack) console.error("🔍 Stack:", e.stack);
              return;
          }
      }

      if (targetIndex !== -1) {
          setViewingUserStories({
              playlist: fullPlaylist,
              initialGroupIndex: targetIndex
          });
      }
  };

  return (
    <div className="w-full h-full relative overflow-y-auto pb-28 no-scrollbar scroll-smooth">
      
      <SocialHeader 
        unreadCount={unreadNotifsCount} 
        onSearchClick={() => setShowSearchModal(true)} 
        onNotifClick={() => setShowNotifModal(true)} 
      />

      <div className="mb-4 pt-[10px] px-2 md:px-6">
          <StoriesBar stories={stories} myStories={myStories} currentUser={currentUser} onViewStory={handleViewStory} onRefresh={() => fetchData(activeTab, true)} />
      </div>

      <div className="flex justify-center mb-6 px-4">
          <div className="flex bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl w-full max-w-[320px] shadow-inner">
              <button onClick={() => setActiveTab("for_you")} className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === "for_you" ? "bg-white dark:bg-cuadralo-cardDark text-cuadralo-pink shadow-md" : "text-cuadralo-textMutedLight dark:text-gray-400 hover:text-cuadralo-textLight dark:hover:text-white"}`}>Para ti</button>
              <button onClick={() => setActiveTab("following")} className={`flex-1 py-2 text-sm font-bold rounded-xl transition-all duration-300 ${activeTab === "following" ? "bg-white dark:bg-cuadralo-cardDark text-cuadralo-pink shadow-md" : "text-cuadralo-textMutedLight dark:text-gray-400 hover:text-cuadralo-textLight dark:hover:text-white"}`}>Siguiendo</button>
          </div>
      </div>

      {!isPrime && !loading && (
          <div className="flex justify-center mb-8 px-4">
              <motion.button initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} onClick={() => setShowPrime(true)} className="group w-full max-w-md flex items-center justify-center gap-3 px-6 py-3 rounded-2xl bg-white/40 dark:bg-black/40 border border-yellow-500/30 hover:border-yellow-400 shadow-glass-light dark:shadow-glass-dark backdrop-blur-lg transition-all">
                  <Crown size={18} className="text-yellow-500 group-hover:scale-110 transition-transform" fill="currentColor" />
                  <span className="text-sm font-medium text-gray-700 dark:text-yellow-100/90">Sube tus fotos en <b className="text-yellow-600 dark:text-yellow-400">Ultra HD</b></span>
                  <Sparkles size={16} className="text-yellow-400 opacity-50 group-hover:opacity-100 animate-pulse" />
              </motion.button>
          </div>
      )}

      {loading ? (
         <div className="flex justify-center py-10"><SquareLoader size="medium" /></div>
      ) : (
          <div className="w-full max-w-[600px] mx-auto px-4 flex flex-col gap-8 pb-20">
            <AnimatePresence mode="popLayout">
                {posts.map((post, i) => (
                  <motion.div key={post.id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05, duration: 0.4, ease: "easeOut" }}>
                      <FeedPost 
                        post={post} 
                        onDelete={() => handlePostDeleted(post.id)} 
                        onViewStory={() => handleViewStory(post.user.id)}
                        autoOpen={externalPostId === post.id}
                      />
                  </motion.div>
                ))}
            </AnimatePresence>

            {posts.length === 0 && !loading && (
               <div className="text-center text-cuadralo-textMutedLight dark:text-cuadralo-textMutedDark py-16 px-6 font-medium">
                  {activeTab === "following" 
                      ? "Aún no sigues a nadie o tus amigos no han publicado nada. ¡Usa el buscador para conectarte!" 
                      : "No hay publicaciones aún. ¡Sé el primero en romper el hielo!"}
               </div>
            )}
            
            {isFetchingMore && (
                <div className="flex flex-col items-center justify-center h-32 gap-3 opacity-60">
                    <SquareLoader size="small" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cuadralo-pink animate-pulse">Cargando más momentos...</span>
                </div>
            )}

            {!hasMore && posts.length > 0 && (
                <div className="flex flex-col items-center justify-center py-16 px-6">
                    <div className="w-12 h-[1px] bg-gradient-to-r from-transparent via-cuadralo-pink/30 to-transparent mb-6" />
                    <div className="flex items-center gap-2 text-cuadralo-textMutedLight dark:text-gray-500 text-[10px] font-black uppercase tracking-[0.3em]">
                        <Sparkles size={12} className="text-cuadralo-pink/50" />
                        Estás al día
                    </div>
                </div>
            )}

            {/* Anchor for infinite scroll */}
            <div id="feed-bottom-anchor" className="h-20 w-full" />
         </div>
      )}

      <button onClick={onUploadClick} className="fixed bottom-24 right-6 md:bottom-10 md:right-10 w-14 h-14 bg-cuadralo-pink text-white rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgb(242,19,142,0.4)] hover:shadow-[0_8px_30px_rgb(242,19,142,0.6)] hover:-translate-y-1 active:scale-95 transition-all z-40 group">
        <Plus size={28} className="group-hover:rotate-90 transition-transform duration-300" strokeWidth={2.5} />
      </button>

      <AnimatePresence>
          {showSearchModal && <SearchModal onClose={() => setShowSearchModal(false)} />}
          
          {showNotifModal && (
              <NotificationModal 
                  onClose={() => setShowNotifModal(false)} 
                  onReadSync={() => setUnreadNotifsCount(prev => Math.max(0, prev - 1))}
              />
          )}

          {/* ✅ NUEVO: Pasamos la Playlist al visor de historias */}
          {viewingUserStories && viewingUserStories.playlist && (
              <StoryViewer 
                  playlist={viewingUserStories.playlist} 
                  initialGroupIndex={viewingUserStories.initialGroupIndex}
                  onClose={(needsRefresh) => {
                      setViewingUserStories(null);
                      if (needsRefresh) {
                          api.get("/social/stories").then(res => {
                              if (res) { 
                                  setStories(res.feed || []); 
                                  setMyStories(res.my_stories || []); 
                              }
                          }).catch(() => {});
                      }
                  }} 
              />
          )}
          {showPrime && <PrimeModal onClose={() => setShowPrime(false)} />}
      </AnimatePresence>
    </div>
  );
}