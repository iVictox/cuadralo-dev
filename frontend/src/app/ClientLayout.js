"use client";

import { useEffect, useState } from "react";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from "@/context/ThemeContext";
import { ToastProvider } from "@/context/ToastContext";
import { ConfirmProvider } from "@/context/ConfirmContext";
import { SocketProvider } from "@/context/SocketContext";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

export default function ClientLayout({ children }) {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") setTheme("light");

    // =================================================================
    // 🛡️ SOLUCIÓN DEFINITIVA ANTI-ZOOM PARA IOS/SAFARI Y ANDROID
    // =================================================================
    
    // 1. Bloquea el "pellizco" (pinch-to-zoom) con dos dedos
    const handleTouchMove = (e) => {
      if (e.touches.length > 1) {
        e.preventDefault(); 
      }
    };

    // 2. Bloquea el "doble toque" rápido (double-tap to zoom)
    let lastTouchEnd = 0;
    const handleTouchEnd = (e) => {
      const now = (new Date()).getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    // 3. Bloquea los gestos de trackpad/pantalla exclusivos de Apple
    const handleGesture = (e) => {
        e.preventDefault();
    };

    // Aplicamos los bloqueadores (usamos passive: false para que nos deje cancelar el evento)
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    document.addEventListener('gesturestart', handleGesture, { passive: false });
    document.addEventListener('gesturechange', handleGesture, { passive: false });

    // Limpiamos los eventos al desmontar
    return () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('gesturestart', handleGesture);
      document.removeEventListener('gesturechange', handleGesture);
    };
  }, []);

  return (
    <ThemeProvider>
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <ToastProvider>
          <ConfirmProvider>
            <SocketProvider>
              {children}
            </SocketProvider>
          </ConfirmProvider>
        </ToastProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}
