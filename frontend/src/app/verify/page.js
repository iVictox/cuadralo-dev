"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/utils/api";
import { useToast } from "@/context/ToastContext";
import { Camera, CheckCircle, XCircle, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Script from "next/script";
import Image from "next/image";

export default function VerifyPage() {
  const router = useRouter();
  const { showToast } = useToast();
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [status, setStatus] = useState("loading_models"); // loading_models, ready, scanning, comparing, success, error
  const [errorMessage, setErrorMessage] = useState("");
  const [userProfileUrl, setUserProfileUrl] = useState(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    // 1. Obtener datos del usuario
    api.get("/me").then(res => {
      if (res.is_verified) {
        showToast("Tu cuenta ya está verificada", "success");
        router.push("/u/" + res.username);
        return;
      }
      
      const photoUrl = res.photo || (res.photos && res.photos[0]);
      if (!photoUrl) {
        setStatus("error");
        setErrorMessage("Debes tener una foto de perfil para poder verificar tu cuenta.");
        return;
      }
      
      const absoluteUrl = photoUrl.startsWith("http") 
        ? photoUrl 
        : `http://localhost:8080/uploads/${photoUrl}`; // Ajusta base URL según tu env
        
      setUserProfileUrl(absoluteUrl);
    }).catch(err => {
      showToast("Error cargando usuario", "error");
    });

    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (isScriptLoaded && userProfileUrl) {
      loadModels();
    }
  }, [isScriptLoaded, userProfileUrl]);

  const loadModels = async () => {
    try {
      const faceapi = window.faceapi;
      if (!faceapi) {
          throw new Error("face-api no está cargado");
      }
      const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]);
      setStatus("ready");
      startCamera();
    } catch (error) {
      console.error("Model load error", error);
      setStatus("error");
      setErrorMessage("No se pudieron cargar los modelos de IA.");
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "user" } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
    } catch (error) {
      setStatus("error");
      setErrorMessage("Permiso de cámara denegado o no disponible.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const handleScan = async () => {
    if (!videoRef.current || !userProfileUrl) return;

    setStatus("scanning");
    
    try {
      const faceapi = window.faceapi;
      // 1. Detectar rostro en la cámara
      const videoDetection = await faceapi.detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!videoDetection) {
        setStatus("error");
        setErrorMessage("No se detectó un rostro en la cámara. Acércate más y asegúrate de tener buena iluminación.");
        return;
      }

      setStatus("comparing");

      // 2. Cargar imagen de perfil y detectar rostro
      const profileImage = await faceapi.fetchImage(userProfileUrl);
      const profileDetection = await faceapi.detectSingleFace(profileImage, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!profileDetection) {
        setStatus("error");
        setErrorMessage("No se detectó un rostro claro en tu foto de perfil. Cambia tu foto e intenta de nuevo.");
        return;
      }

      // 3. Comparar descriptores
      const distance = faceapi.euclideanDistance(videoDetection.descriptor, profileDetection.descriptor);
      const score = Math.max(0, 1 - distance);
      const isMatch = distance < 0.5; // Threshold: menor es más estricto

      // Capturar frame de la cámara para historial (opcional)
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
      const capturedImage = canvas.toDataURL("image/jpeg");

      // 4. Enviar a backend
      const res = await api.post("/user/verify-face", {
        success: isMatch,
        score: score,
        image: capturedImage
      });

      if (isMatch) {
        setStatus("success");
        setTimeout(() => router.push("/"), 3000);
      }

    } catch (error) {
      console.error(error);
      const backendMsg = error.response?.data?.error;
      setStatus("error");
      setErrorMessage(backendMsg || "Hubo un error en el proceso de verificación.");
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-cuadralo-bgLight dark:bg-[#0f0518] overflow-hidden text-cuadralo-textLight dark:text-white transition-colors duration-500 relative">
      <Script 
        src="https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.min.js" 
        strategy="afterInteractive"
        onLoad={() => setIsScriptLoaded(true)}
      />

      {/* PANEL IZQUIERDO (Branding - Solo Escritorio) */}
      <div className="hidden lg:flex w-[45%] relative bg-black items-center justify-center p-16 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cuadralo-pink/20 via-[#0f0518] to-blue-900/40 z-0" />
          <div className="absolute -top-[20%] -left-[10%] w-[600px] h-[600px] bg-blue-600/30 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute -bottom-[20%] -right-[10%] w-[600px] h-[600px] bg-cuadralo-pink/20 rounded-full blur-[120px] animate-pulse delay-1000" />
          
          <div className="relative z-10 w-full max-w-md">
             <div className="w-48 h-12 relative mb-16">
                 <Image src="/logo.svg" fill className="object-contain dark:invert-0 invert" alt="Cuadralo" priority />
             </div>
             
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                 <h1 className="text-5xl xl:text-6xl font-black text-white tracking-tighter mb-6 leading-[1.1]">
                    Verificación de Identidad.
                 </h1>
                 <p className="text-gray-400 text-lg font-medium leading-relaxed">
                    Protegemos nuestra comunidad asegurándonos de que eres quien dices ser.
                 </p>
             </motion.div>
          </div>

          <div className="absolute bottom-12 left-16 text-white/30 text-sm font-bold tracking-widest uppercase">
              © {new Date().getFullYear()} Cuadralo App
          </div>
      </div>

      {/* FONDOS ANIMADOS MÓVIL */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none lg:hidden z-0">
          <div className="absolute top-[-10%] -left-[20%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-[-10%] -right-[20%] w-[400px] h-[400px] bg-cuadralo-pink/20 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      {/* PANEL DERECHO (Cámara) */}
      <div className="w-full lg:w-[55%] flex flex-col items-center justify-center p-6 sm:p-12 md:p-20 relative z-10 bg-white/40 dark:bg-black/10 lg:bg-transparent backdrop-blur-sm lg:backdrop-blur-none h-screen overflow-y-auto">
        
        {/* Botón Volver (Móvil y Desktop) */}
        <div className="absolute top-6 left-6 z-50">
          <button onClick={() => router.back()} className="p-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-cuadralo-textLight dark:text-white transition-colors">
            <ArrowLeft size={24} />
          </button>
        </div>

        <div className="w-full max-w-lg flex flex-col items-center mt-12 lg:mt-0">
          
          <div className="mb-8 text-center space-y-2 lg:hidden">
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                 <h2 className="text-3xl sm:text-4xl font-black text-cuadralo-textLight dark:text-white tracking-tighter mb-3 leading-[1.1]">
                    Identidad Biométrica.
                 </h2>
                 <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base font-medium leading-relaxed">
                    Protegemos nuestra comunidad asegurándonos de que eres quien dices ser.
                 </p>
             </motion.div>
          </div>

          <div className="w-full text-center mb-6">
             <span className="inline-block px-4 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold uppercase tracking-widest text-[10px] rounded-full mb-3">
               Estado del Escáner
             </span>
             <p className="text-sm font-medium text-cuadralo-textMutedLight dark:text-gray-400">
                {status === "loading_models" && "Inicializando motor de IA segura..."}
                {status === "ready" && "Posiciona tu rostro dentro del marco guía."}
                {status === "scanning" && "Analizando geometría facial..."}
                {status === "comparing" && "Comparando con tus datos biométricos..."}
                {status === "success" && "¡Identidad confirmada exitosamente!"}
                {status === "error" && "Error en la validación"}
             </p>
          </div>

          {/* Camera Frame (Más grande) */}
          <div className="relative w-full max-w-[340px] aspect-[3/4] sm:max-w-[400px] sm:h-[500px] rounded-[2.5rem] lg:rounded-[3rem] overflow-hidden bg-black/10 dark:bg-white/5 shadow-2xl border border-black/10 dark:border-white/10 mb-8 mx-auto">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${['loading_models', 'success'].includes(status) ? 'opacity-0' : 'opacity-100'}`}
            />
            
            {/* Guide Overlay */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className={`w-[65%] h-[60%] rounded-[100%] border-2 transition-all duration-300 ${status === 'ready' ? 'border-white/60 border-dashed animate-pulse' : status === 'scanning' ? 'border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.6)] bg-blue-500/10' : 'border-transparent'}`}></div>
            </div>

            {/* Status Overlays */}
            <AnimatePresence>
              {(status === "loading_models" || status === "scanning" || status === "comparing") && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/50 backdrop-blur-md flex flex-col items-center justify-center text-white">
                  <Loader2 size={48} className="animate-spin mb-6 text-blue-500" />
                  <span className="text-xs font-black uppercase tracking-widest">{status === "loading_models" ? "Iniciando Sistema" : "Procesando"}</span>
                </motion.div>
              )}
              {status === "success" && (
                <motion.div initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} className="absolute inset-0 bg-gradient-to-br from-blue-500 to-green-500 flex flex-col items-center justify-center text-white">
                  <ShieldCheck size={72} className="mb-6 drop-shadow-lg" />
                  <span className="text-sm font-black uppercase tracking-widest drop-shadow-md">Verificado</span>
                </motion.div>
              )}
              {status === "error" && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} className="absolute inset-0 bg-red-500/95 backdrop-blur-md flex flex-col items-center justify-center text-white p-6 text-center">
                  <XCircle size={60} className="mb-4 text-white" />
                  <span className="text-sm font-bold leading-relaxed">{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action Button */}
          {status === "ready" && (
            <button 
              onClick={handleScan}
              className="w-full max-w-[340px] sm:max-w-[400px] py-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-blue-500/30 active:scale-95 transition-all hover:scale-[1.02]"
            >
              Iniciar Escaneo Facial
            </button>
          )}

          {status === "error" && (
            <button 
              onClick={() => {
                setStatus("ready");
                setErrorMessage("");
              }}
              className="w-full max-w-[340px] sm:max-w-[400px] py-5 bg-black/5 dark:bg-white/10 text-cuadralo-textLight dark:text-white rounded-2xl font-black uppercase text-xs tracking-widest active:scale-95 transition-all hover:bg-black/10 dark:hover:bg-white/20"
            >
              Reintentar
            </button>
          )}

        </div>
      </div>
    </div>
  );
}
