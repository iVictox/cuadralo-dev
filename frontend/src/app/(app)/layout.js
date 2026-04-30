"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ToastProvider } from "@/context/ToastContext";
import { SocketProvider } from "@/context/SocketContext";
import { ConfirmProvider } from "@/context/ConfirmContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import SquareLoader from "@/components/SquareLoader";
import { api } from "@/utils/api";

export default function AppLayout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const res = await api.get('/auth/verify');
        if (!res || !res.valid) {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('token');
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#0B0410] flex items-center justify-center">
        <SquareLoader />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        <ConfirmProvider>
          <SocketProvider>
            <div className="min-h-screen bg-cuadralo-bgLight dark:bg-[#0B0410]">
              <Navbar />
              <main className="pt-16 md:pt-0 md:pl-20 pb-16 md:pb-0">
                {children}
              </main>
              <BottomNav />
            </div>
          </SocketProvider>
        </ConfirmProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
