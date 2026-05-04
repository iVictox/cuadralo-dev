"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem("token"));
  }, []);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0B0410]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Original exacto como en Login y Navbar de la app */}
          <Link href="/" className="flex items-center gap-2">
            <img 
              src="/logo.svg" 
              alt="Cuadralo Club" 
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-white/60 hover:text-cuadralo-pink transition-colors">
              Características
            </a>
            <a href="#how-it-works" className="text-sm text-white/60 hover:text-cuadralo-pink transition-colors">
              Cómo funciona
            </a>
            <a href="#testimonials" className="text-sm text-white/60 hover:text-cuadralo-pink transition-colors">
              Testimonios
            </a>
            <a href="#safety" className="text-sm text-white/60 hover:text-cuadralo-pink transition-colors">
              Seguridad
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isLoggedIn ? (
              <Link
                href="/app"
                className="bg-cuadralo-pink text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-cuadralo-pinkDark transition-colors"
              >
                Acceder a la app
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/register"
                  className="bg-cuadralo-pink text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-cuadralo-pinkDark transition-colors"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {isMenuOpen ? (
                <X size={20} className="text-white" />
              ) : (
                <Menu size={20} className="text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-4">
              <a
                href="#features"
                className="text-sm text-white/60 hover:text-cuadralo-pink transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Características
              </a>
              <a
                href="#how-it-works"
                className="text-sm text-white/60 hover:text-cuadralo-pink transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Cómo funciona
              </a>
              <a
                href="#testimonials"
                className="text-sm text-white/60 hover:text-cuadralo-pink transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Testimonios
              </a>
              <a
                href="#safety"
                className="text-sm text-white/60 hover:text-cuadralo-pink transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Seguridad
              </a>
              <div className="flex gap-4 pt-4 border-t border-white/10">
                {isLoggedIn ? (
                  <Link
                    href="/app"
                    className="flex-1 text-center bg-cuadralo-pink text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-cuadralo-pinkDark transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Acceder a la app
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="flex-1 text-center text-sm font-medium text-white/80 hover:text-white transition-colors py-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Iniciar Sesión
                    </Link>
                    <Link
                      href="/register"
                      className="flex-1 text-center bg-cuadralo-pink text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-cuadralo-pinkDark transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Registrarse
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
