"use client";

import { useState, useEffect, useRef } from "react";
import { X, Lock, Trash2, Loader2, LogOut, Palette, Moon, Sun, CheckCircle, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import { useRouter } from "next/navigation";

export default function SettingsModal({ onClose }) {
  const { showToast } = useToast();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState("appearance");
  const [isLoading, setIsLoading] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("dark");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("theme") || "dark";
    setCurrentTheme(saved);

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

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const toggleTheme = (themeName) => {
    setCurrentTheme(themeName);
    localStorage.setItem("theme", themeName);
    document.documentElement.className = themeName;
    showToast(`Modo ${themeName === 'dark' ? 'Oscuro' : 'Claro'} activado`);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return showToast("Las contraseñas no coinciden", "error");
    setIsLoading(true);
    try {
      await api.put("/change-password", { old_password: oldPassword, new_password: newPassword });
      showToast("¡Contraseña cambiada!");
      setTimeout(() => handleLogout(), 2000);
    } catch (error) {
      showToast(error.message || "Error", "error");
    } finally { setIsLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-cuadralo-bgLight dark:bg-[#0f0518] w-full max-w-4xl rounded-[2rem] md:rounded-[3rem] border border-black/5 dark:border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] md:h-[650px] relative"
      >
        
        {/* SIDEBAR */}
        <div className="w-full md:w-72 bg-white/50 dark:bg-black/40 border-b md:border-b-0 md:border-r border-black/5 dark:border-white/5 flex flex-col z-10 backdrop-blur-sm">
          <div className="p-6 md:p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-black text-cuadralo-textLight dark:text-white flex items-center gap-3 tracking-tighter">
              <Settings size={28} className="text-cuadralo-pink"/> Ajustes
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
              active={activeTab === 'appearance'} 
              onClick={() => setActiveTab('appearance')} 
              icon={<Palette size={20}/>} 
              label="Apariencia" 
            />
            <TabButton 
              active={activeTab === 'security'} 
              onClick={() => setActiveTab('security')} 
              icon={<Lock size={20}/>} 
              label="Seguridad" 
            />
            <TabButton 
              active={activeTab === 'verification'} 
              onClick={() => setActiveTab('verification')} 
              icon={<CheckCircle size={20}/>} 
              label="Verificación" 
            />
            <div className="hidden md:block my-2 border-t border-black/5 dark:border-white/5"></div>
            <TabButton 
              active={activeTab === 'danger'} 
              onClick={() => setActiveTab('danger')} 
              icon={<Trash2 size={20}/>} 
              label="Zona de Peligro" 
              danger 
            />
          </div>

          <div className="p-6 border-t border-black/5 dark:border-white/5 hidden md:block">
             <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-4 text-sm font-bold text-gray-500 hover:text-red-500 transition-colors rounded-2xl hover:bg-red-500/10 active:scale-95">
                <LogOut size={20}/> Cerrar Sesión
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
              className="max-w-xl mx-auto"
            >
              
              {/* APARIENCIA */}
              {activeTab === "appearance" && (
                  <div className="space-y-8">
                      <div>
                        <h3 className="text-3xl font-black tracking-tighter text-cuadralo-textLight dark:text-white mb-2">Tema y Estilo</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Personaliza cómo se ve Cuadralo en tu dispositivo.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                          <button onClick={() => toggleTheme("light")} className={`p-8 rounded-[2rem] border-2 flex flex-col items-center gap-4 transition-all ${currentTheme === 'light' ? 'border-cuadralo-pink bg-cuadralo-pink/5 text-cuadralo-pink' : 'border-black/5 dark:border-white/5 bg-white dark:bg-white/5 text-gray-400 hover:border-black/10 dark:hover:border-white/10'}`}>
                              <Sun size={40} />
                              <span className="text-sm font-black uppercase tracking-widest text-cuadralo-textLight dark:text-white">Claro</span>
                          </button>
                          
                          <button onClick={() => toggleTheme("dark")} className={`p-8 rounded-[2rem] border-2 flex flex-col items-center gap-4 transition-all ${currentTheme === 'dark' ? 'border-cuadralo-pink bg-cuadralo-pink/5 text-cuadralo-pink' : 'border-black/5 dark:border-white/5 bg-white dark:bg-white/5 text-gray-400 hover:border-black/10 dark:hover:border-white/10'}`}>
                              <Moon size={40} />
                              <span className="text-sm font-black uppercase tracking-widest text-cuadralo-textLight dark:text-white">Oscuro</span>
                          </button>
                      </div>
                  </div>
              )}

              {/* SEGURIDAD */}
              {activeTab === "security" && (
                  <div className="space-y-8">
                      <div>
                        <h3 className="text-3xl font-black tracking-tighter text-cuadralo-textLight dark:text-white mb-2">Contraseña</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Mantén tu cuenta segura actualizando tu contraseña periódicamente.</p>
                      </div>

                      <form onSubmit={handleChangePassword} className="space-y-5 bg-white dark:bg-black/40 p-6 md:p-8 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm">
                          <FloatingInput label="Contraseña Actual" type="password" value={oldPassword} onChange={setOldPassword} />
                          <div className="h-px w-full bg-black/5 dark:bg-white/5 my-2"></div>
                          <FloatingInput label="Nueva Contraseña" type="password" value={newPassword} onChange={setNewPassword} />
                          <FloatingInput label="Confirmar Contraseña" type="password" value={confirmPassword} onChange={setConfirmPassword} />
                          
                          <button type="submit" disabled={isLoading || !oldPassword || !newPassword || !confirmPassword} className="w-full py-5 mt-4 bg-cuadralo-pink text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-cuadralo-pink/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-cuadralo-pinkLight">
                              {isLoading ? <Loader2 className="animate-spin mx-auto" /> : "Actualizar Contraseña"}
                          </button>
                      </form>
                  </div>
              )}

              {/* VERIFICACIÓN */}
              {activeTab === "verification" && (
                  <div className="space-y-8">
                      <div>
                        <h3 className="text-3xl font-black tracking-tighter text-cuadralo-textLight dark:text-white mb-2">Verificación de Identidad</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Obtén la insignia de confianza en tu perfil.</p>
                      </div>

                      <div className="bg-gradient-to-br from-blue-600/10 to-blue-400/5 border border-blue-500/20 rounded-[2rem] p-8 md:p-10 text-center relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[50px]"></div>
                          
                          <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto text-blue-500 mb-6 relative z-10 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                              <CheckCircle size={48} className="drop-shadow-md"/>
                          </div>
                          
                          <h4 className="text-xl font-black text-cuadralo-textLight dark:text-white mb-4 relative z-10">Conviértete en un Usuario Verificado</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium leading-relaxed mb-8 relative z-10">
                              Aumenta tu credibilidad. El sistema utilizará tecnología de <b>reconocimiento facial de IA en tiempo real</b> para comparar tu rostro con tu foto de perfil y asegurar que eres tú verdaderamente.
                          </p>
                          
                          <button 
                              onClick={() => {
                                  onClose();
                                  router.push("/verify");
                              }} 
                              className="relative z-10 w-full md:w-auto md:px-12 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/30 active:scale-95 transition-all hover:bg-blue-500 hover:scale-[1.02]"
                          >
                              Comenzar Proceso Biométrico
                          </button>
                      </div>
                  </div>
              )}

              {/* PELIGRO */}
              {activeTab === "danger" && (
                  <div className="space-y-8">
                      <div>
                        <h3 className="text-3xl font-black tracking-tighter text-red-500 mb-2">Zona de Peligro</h3>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Acciones destructivas e irreversibles.</p>
                      </div>

                      <div className="bg-red-500/5 border border-red-500/20 rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row items-center gap-8">
                          <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center shrink-0 text-red-500">
                              <Trash2 size={40}/>
                          </div>
                          <div className="text-center md:text-left flex-1">
                              <h4 className="text-lg font-black text-cuadralo-textLight dark:text-white mb-2">Eliminar Cuenta</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium leading-relaxed mb-6">
                                  Una vez que elimines tu cuenta, no hay vuelta atrás. Perderás tus mensajes, fotos, matches y toda tu información personal para siempre. Por favor, asegúrate de estar seguro.
                              </p>
                              <button onClick={() => alert("Función de borrado activada")} className="w-full md:w-auto px-8 py-4 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white border border-red-600/20 hover:border-red-600 rounded-xl font-bold uppercase text-xs tracking-widest active:scale-95 transition-all">
                                  Eliminar Definitivamente
                              </button>
                          </div>
                      </div>
                  </div>
              )}

            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, danger }) {
  return (
    <button 
      onClick={onClick} 
      className={`flex items-center justify-center gap-3 px-6 py-4 rounded-[1.25rem] transition-all whitespace-nowrap shrink-0 border border-transparent snap-start ${
        active 
          ? danger 
            ? 'bg-red-500/10 text-red-500 border-red-500/20 shadow-sm' 
            : 'bg-white dark:bg-white/10 text-cuadralo-pink border-black/5 dark:border-white/10 shadow-sm' 
          : danger 
            ? 'text-red-500/70 hover:bg-red-500/5 hover:text-red-500' 
            : 'text-gray-500 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-cuadralo-textLight dark:hover:text-white'
      }`}
    >
      {icon}
      <span className="text-[13px] font-black tracking-wide">{label}</span>
    </button>
  );
}

function FloatingInput({ label, type = "text", value, onChange }) {
    return (
        <div className="relative">
            <input
                type={type}
                className="peer w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-cuadralo-pink/50 rounded-2xl pt-7 pb-3 px-5 text-base font-bold text-cuadralo-textLight dark:text-white outline-none transition-all"
                placeholder=" "
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
            <label className={`absolute left-5 text-gray-500 font-black uppercase tracking-widest transition-all duration-200 pointer-events-none ${value ? 'top-2.5 text-[9px]' : 'top-1/2 -translate-y-1/2 text-xs peer-focus:top-2.5 peer-focus:text-[9px] peer-focus:text-cuadralo-pink'}`}>
                {label}
            </label>
        </div>
    );
}