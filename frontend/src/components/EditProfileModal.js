"use client";

import { useState, useRef, useEffect } from "react";
import { X, Save, Loader2, Plus, GripHorizontal, Trash2, Edit3, Camera, User, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import { INTERESTS_LIST, getInterestInfo } from "@/utils/interests"; 

export default function EditProfileModal({ user, onClose, onUpdate }) {
  const { showToast } = useToast();
  
  // ✅ CORRECCIÓN: "location" eliminado del estado inicial
  const [formData, setFormData] = useState({
    name: user?.name || "",
    username: user?.username || "",
    bio: user?.bio || "",
    gender: user?.gender || "male"
  });

  const groupedInterests = INTERESTS_LIST.reduce((acc, item) => {
      const cat = item.category || "Otros";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
  }, {});

  const [selectedInterests, setSelectedInterests] = useState(user?.interestsList || []);
  
  const [photos, setPhotos] = useState(() => {
      let initial = [];
      if (user?.photos && Array.isArray(user.photos)) {
          initial = user.photos.filter(p => typeof p === 'string' && p.trim() !== '');
      }
      if (initial.length === 0 && user?.photo && typeof user.photo === 'string' && user.photo.trim() !== '') {
          initial = [user.photo];
      }
      return initial;
  });
  
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const handleChange = (e) => { 
      setFormData({ ...formData, [e.target.name]: e.target.value }); 
  };

  const toggleInterest = (slug) => {
      if (selectedInterests.includes(slug)) {
          setSelectedInterests(prev => prev.filter(i => i !== slug));
      } else {
          if (selectedInterests.length >= 10) return showToast("Máximo 10 intereses", "error");
          setSelectedInterests(prev => [...prev, slug]);
      }
  };

  const handleAddPhotoClick = () => { fileInputRef.current.click(); };
  
  const handleFileChange = async (e) => {
      const file = e.target.files[0]; 
      if (!file) return; 
      if (photos.length >= 9) return showToast("Máximo 9 fotos permitidas", "error");

      setUploading(true);
      showToast("Subiendo imagen...", "info");
      try {
          const imageUrl = await api.upload(file, "profile");
          if (imageUrl) {
            setPhotos(prev => [...prev, imageUrl]);
            showToast("Foto añadida", "success");
          }
      } catch (error) { 
          showToast("Error al subir foto", "error"); 
      } finally { 
          setUploading(false); 
          e.target.value = ""; 
      }
  };

  const handleDeletePhoto = (e, index) => { 
      e.stopPropagation(); 
      if (photos.length <= 1) return showToast("Debes tener al menos una foto principal", "error");
      setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleDragStart = (e, position) => { dragItem.current = position; };
  const handleDragEnter = (e, position) => { dragOverItem.current = position; };
  const handleDragEnd = () => {
      const copyListItems = [...photos];
      const dragItemContent = copyListItems[dragItem.current];
      copyListItems.splice(dragItem.current, 1);
      copyListItems.splice(dragOverItem.current, 0, dragItemContent);
      dragItem.current = null;
      dragOverItem.current = null;
      setPhotos(copyListItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    if (formData.bio.length > 1000) return showToast("Biografía demasiado larga", "error");

    setSaving(true);
    try {
        const finalPhotos = photos.filter(p => typeof p === 'string' && p.trim() !== '');
        const mainPhoto = finalPhotos.length > 0 ? finalPhotos[0] : (user.photo || "");
        
        await api.put("/me", { 
            ...formData, 
            photo: mainPhoto, 
            photos: finalPhotos, 
            interests: selectedInterests 
        });
        
        const userStr = localStorage.getItem("user");
        if (userStr) {
            const userObj = JSON.parse(userStr);
            userObj.photo = mainPhoto;
            userObj.photos = finalPhotos;
            localStorage.setItem("user", JSON.stringify(userObj));
            window.dispatchEvent(new CustomEvent("user_updated", { detail: userObj }));
        }
        
        showToast("Perfil actualizado correctamente", "success"); 
        onUpdate();
        onClose();
    } catch (error) { 
        showToast("Error al guardar cambios", "error"); 
    } finally { 
        setSaving(false); 
    }
  };

  const [activeTab, setActiveTab] = useState("photos");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const scrollRef = useRef(null);
  let isDown = false;
  let startX;
  let scrollLeft;

  const handleMouseDown = (e) => {
    isDown = true;
    if (scrollRef.current) {
        scrollRef.current.style.scrollSnapType = 'none';
        scrollRef.current.style.scrollBehavior = 'auto';
        startX = e.pageX - scrollRef.current.offsetLeft;
        scrollLeft = scrollRef.current.scrollLeft;
    }
  };

  const handleMouseLeave = () => {
    isDown = false;
    if (scrollRef.current) scrollRef.current.style.scrollSnapType = 'x mandatory';
  };
  
  const handleMouseUp = () => {
    isDown = false;
    if (scrollRef.current) scrollRef.current.style.scrollSnapType = 'x mandatory';
  };
  
  const handleMouseMove = (e) => {
    if (!isDown || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.95, opacity: 0, y: 20 }} 
        className="bg-cuadralo-bgLight dark:bg-[#0f0518] w-full max-w-5xl rounded-[2rem] md:rounded-[3rem] border border-black/5 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] md:h-[650px] relative"
      >
        
        {/* SIDEBAR */}
        <div className="w-full md:w-72 bg-white/50 dark:bg-black/40 border-b md:border-b-0 md:border-r border-black/5 dark:border-white/5 flex flex-col z-10 backdrop-blur-sm">
          <div className="p-6 md:p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-black text-cuadralo-textLight dark:text-white flex items-center gap-3 tracking-tighter">
              <Edit3 size={28} className="text-cuadralo-pink"/> Perfil
            </h2>
            <button onClick={onClose} className="md:hidden p-2 bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 rounded-full text-cuadralo-textLight dark:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div 
            ref={scrollRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            style={{ scrollSnapType: 'x mandatory' }}
            className="w-full p-4 md:p-6 flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto no-scrollbar touch-pan-x select-none cursor-grab active:cursor-grabbing"
          >
            <TabButton 
              active={activeTab === 'photos'} 
              onClick={() => setActiveTab('photos')} 
              icon={<Camera size={20}/>} 
              label="Mis Fotos" 
            />
            <TabButton 
              active={activeTab === 'personal'} 
              onClick={() => setActiveTab('personal')} 
              icon={<User size={20}/>} 
              label="Datos Personales" 
            />
            <TabButton 
              active={activeTab === 'interests'} 
              onClick={() => setActiveTab('interests')} 
              icon={<Heart size={20}/>} 
              label="Mis Intereses" 
            />
          </div>

          <div className="p-6 border-t border-black/5 dark:border-white/5 hidden md:block">
            <button type="button" onClick={handleSubmit} disabled={saving || uploading} className="w-full py-4 bg-cuadralo-pink text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-cuadralo-pink/30 hover:scale-[1.02] active:scale-95 transition-all flex justify-center items-center gap-2 text-xs">
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Guardar Cambios
            </button>
          </div>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="flex-1 relative flex flex-col overflow-hidden bg-white/30 dark:bg-transparent">
          <div className="absolute top-6 right-8 hidden md:block z-20">
            <button onClick={onClose} className="p-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-cuadralo-textMutedLight dark:text-gray-400 hover:text-cuadralo-textLight dark:hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto no-scrollbar p-6 md:p-12 relative">
            <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] bg-cuadralo-pink/10 rounded-full blur-[100px] pointer-events-none" />
            
            <motion.div 
              key={activeTab} 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.3 }}
              className="max-w-2xl mx-auto"
            >
              
              {/* FOTOS */}
              {activeTab === "photos" && (
                  <div className="space-y-8">
                      <div>
                        <h3 className="text-3xl font-black tracking-tighter text-cuadralo-textLight dark:text-white mb-2">Galería de Fotos</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Sube tus mejores ángulos. Arrastra las fotos para cambiar su orden.</p>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {photos.map((photo, index) => (
                              <motion.div
                                  layout 
                                  key={`photo-${index}-${photo}`}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, index)}
                                  onDragEnter={(e) => handleDragEnter(e, index)}
                                  onDragEnd={handleDragEnd}
                                  onDragOver={(e) => e.preventDefault()}
                                  className={`relative aspect-[3/4] rounded-[2rem] overflow-hidden group cursor-grab active:cursor-grabbing border-2 border-transparent hover:border-cuadralo-pink/50 transition-all bg-black/5 dark:bg-white/5 ${index === 0 ? "ring-2 ring-cuadralo-pink ring-offset-4 dark:ring-offset-[#0f0518] ring-offset-white" : ""}`}
                              >
                                  <img src={photo} className="w-full h-full object-cover pointer-events-none" alt={`Uploaded ${index}`} />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                  <button type="button" onClick={(e) => handleDeletePhoto(e, index)} className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity shadow-lg backdrop-blur-sm"><Trash2 size={16} /></button>
                                  <div className="absolute bottom-4 right-4 text-white/90 opacity-0 group-hover:opacity-100"><GripHorizontal size={24}/></div>
                                  {index === 0 && (<div className="absolute top-3 left-3 bg-cuadralo-pink text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg">Principal</div>)}
                              </motion.div>
                          ))}

                          {photos.length < 9 && (
                              <div onClick={handleAddPhotoClick} className={`aspect-[3/4] rounded-[2rem] border-2 border-dashed border-black/10 dark:border-white/10 flex flex-col items-center justify-center transition-all group ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-cuadralo-pink/50 hover:bg-cuadralo-pink/5 bg-black/5 dark:bg-white/5'}`}>
                                  {uploading ? (
                                      <Loader2 className="animate-spin text-cuadralo-pink" size={32} />
                                  ) : (
                                      <>
                                          <div className="p-4 rounded-full bg-white dark:bg-black/40 group-hover:bg-cuadralo-pink group-hover:text-white transition-colors mb-3 shadow-sm border border-black/5 dark:border-white/5"><Plus size={32} className="text-gray-400 group-hover:text-white" /></div>
                                          <span className="text-xs text-gray-500 font-black uppercase tracking-widest">Añadir Foto</span>
                                      </>
                                  )}
                              </div>
                          )}
                      </div>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploading} />
                  </div>
              )}

              {/* DATOS PERSONALES */}
              {activeTab === "personal" && (
                  <div className="space-y-8 pb-20 md:pb-0">
                      <div>
                        <h3 className="text-3xl font-black tracking-tighter text-cuadralo-textLight dark:text-white mb-2">Datos Personales</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Actualiza cómo te ve el mundo en Cuadralo.</p>
                      </div>

                      <div className="space-y-6 bg-white dark:bg-black/40 p-6 md:p-8 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-sm">
                          <FloatingInput label="Nombre Visible" type="text" name="name" value={formData.name} onChange={handleChange} />
                          
                          <div className="relative">
                              <FloatingInput label="Nombre de Usuario" type="text" name="username" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value.toLowerCase().replace(/\s+/g, '')})} paddingLeft="pl-10" />
                              <span className="absolute left-4 top-[22px] text-cuadralo-pink font-black">@</span>
                          </div>

                          <div className="relative">
                              <textarea 
                                name="bio" 
                                value={formData.bio} 
                                onChange={handleChange} 
                                rows={5} 
                                maxLength={1000} 
                                className="peer w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-cuadralo-pink/50 rounded-[2rem] pt-8 pb-4 px-6 text-base font-bold text-cuadralo-textLight dark:text-white outline-none transition-all resize-none" 
                                placeholder=" "
                              />
                              <label className={`absolute left-6 text-gray-500 font-black uppercase tracking-widest transition-all duration-200 pointer-events-none ${formData.bio ? 'top-3 text-[10px]' : 'top-6 text-xs peer-focus:top-3 peer-focus:text-[10px] peer-focus:text-cuadralo-pink'}`}>
                                  Biografía
                              </label>
                              <span className={`absolute bottom-4 right-6 text-[10px] font-black ${formData.bio.length >= 1000 ? "text-red-500" : formData.bio.length > 900 ? "text-yellow-500" : "text-gray-400"}`}>
                                  {formData.bio.length}/1000
                              </span>
                          </div>

                          <div>
                              <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-3 mb-2 block">Identidad de Género</label>
                              <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-black/5 dark:bg-white/5 border border-transparent rounded-[1.5rem] px-6 py-4 text-base font-bold text-cuadralo-textLight dark:text-white focus:ring-2 focus:ring-cuadralo-pink outline-none appearance-none cursor-pointer">
                                  <option value="male">Hombre</option>
                                  <option value="female">Mujer</option>
                                  <option value="other">Otro</option>
                              </select>
                          </div>
                      </div>
                  </div>
              )}

              {/* INTERESES */}
              {activeTab === "interests" && (
                  <div className="space-y-8 pb-20 md:pb-0">
                      <div>
                        <h3 className="text-3xl font-black tracking-tighter text-cuadralo-textLight dark:text-white mb-2">Mis Intereses</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Selecciona hasta 10 cosas que te apasionan ({selectedInterests.length}/10).</p>
                      </div>

                      <div className="space-y-8">
                          {Object.entries(groupedInterests).map(([category, items]) => (
                              <div key={category} className="bg-white dark:bg-black/20 p-6 md:p-8 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-sm">
                                  <h4 className="text-cuadralo-pink text-xs font-black uppercase tracking-[0.2em] mb-5 ml-2">{category}</h4>
                                  <div className="flex flex-wrap gap-3">
                                      {items.map((interest) => {
                                          const slug = interest.slug || interest.id;
                                          const isSelected = selectedInterests.includes(slug);
                                          const info = getInterestInfo(slug); 
                                          return (
                                              <button 
                                                  key={slug} 
                                                  type="button" 
                                                  onClick={() => toggleInterest(slug)}
                                                  className={`px-5 py-3 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 border-2 ${isSelected ? "bg-cuadralo-pink/10 border-cuadralo-pink text-cuadralo-pink shadow-md scale-105" : "bg-black/5 dark:bg-white/5 border-transparent text-gray-500 hover:bg-black/10 dark:hover:bg-white/10 hover:text-cuadralo-textLight dark:hover:text-white"}`}
                                              >
                                                  <span className="text-lg">{info.icon}</span> 
                                                  <span>{info.name}</span>
                                              </button>
                                          );
                                      })}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

            </motion.div>
          </div>

          {/* Botón Flotante Móvil */}
          <div className="md:hidden absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-white via-white/90 dark:from-black dark:via-black/90 to-transparent z-30">
            <button type="button" onClick={handleSubmit} disabled={saving || uploading} className="w-full py-4 bg-cuadralo-pink text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-cuadralo-pink/30 active:scale-95 transition-all flex justify-center items-center gap-2 text-xs">
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Guardar
            </button>
          </div>

        </div>
      </motion.div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button 
      onClick={onClick} 
      className={`flex items-center justify-center gap-3 px-6 py-4 rounded-[1.25rem] transition-all whitespace-nowrap shrink-0 border border-transparent snap-start ${
        active 
          ? 'bg-white dark:bg-white/10 text-cuadralo-pink border-black/5 dark:border-white/10 shadow-sm' 
          : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-cuadralo-textLight dark:hover:text-white'
      }`}
    >
      {icon}
      <span className="text-[13px] font-black tracking-wide">{label}</span>
    </button>
  );
}

function FloatingInput({ label, type = "text", name, value, onChange, paddingLeft = "px-6" }) {
    return (
        <div className="relative">
            <input
                type={type}
                name={name}
                className={`peer w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-cuadralo-pink/50 rounded-[2rem] pt-8 pb-4 ${paddingLeft} text-base font-bold text-cuadralo-textLight dark:text-white outline-none transition-all`}
                placeholder=" "
                value={value}
                onChange={onChange}
            />
            <label className={`absolute left-6 text-gray-500 font-black uppercase tracking-widest transition-all duration-200 pointer-events-none ${value ? 'top-3 text-[10px]' : 'top-1/2 -translate-y-1/2 text-xs peer-focus:top-3 peer-focus:text-[10px] peer-focus:text-cuadralo-pink'}`}>
                {label}
            </label>
        </div>
    );
}