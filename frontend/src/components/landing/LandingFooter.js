"use client";

import Link from "next/link";
import { Heart, Mail, Phone, MapPin, Instagram, Twitter, Send } from "lucide-react";

export default function LandingFooter() {
  return (
    <footer className="bg-[#0B0410] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
          <Link href="/" className="flex items-center gap-2 mb-4">
            <img 
              src="/logo.svg" 
              alt="Cuadralo Club" 
              style={{ height: '32px', width: 'auto' }}
            />
          </Link>
            <p className="text-sm text-white/60 mb-4">
              La app social diseñada para jóvenes en Venezuela. Conecta, haz amigos y vive experiencias únicas.
            </p>
            <div className="flex gap-3">
              <a
                href="https://instagram.com/cuadralo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-cuadralo-pink/10 flex items-center justify-center hover:bg-cuadralo-pink/20 transition-colors"
              >
                <Instagram size={18} className="text-cuadralo-pink" />
              </a>
              <a
                href="https://twitter.com/cuadralo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-blue-400/10 flex items-center justify-center hover:bg-blue-400/20 transition-colors"
              >
                <Twitter size={18} className="text-blue-400" />
              </a>
              <a
                href="https://t.me/cuadralo"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-sky-400/10 flex items-center justify-center hover:bg-sky-400/20 transition-colors"
              >
                <Send size={18} className="text-sky-400" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-bold text-white mb-4">
              Producto
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/faq" className="text-sm text-white/60 hover:text-cuadralo-pink transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/sobre-nosotros" className="text-sm text-white/60 hover:text-cuadralo-pink transition-colors">
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-sm text-white/60 hover:text-cuadralo-pink transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-bold text-white mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terminos" className="text-sm text-white/60 hover:text-cuadralo-pink transition-colors">
                  Términos y Condiciones
                </Link>
              </li>
              <li>
                <Link href="/politica" className="text-sm text-white/60 hover:text-cuadralo-pink transition-colors">
                  Política de Privacidad
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-bold text-white mb-4">
              Soporte
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/faq" className="text-sm text-white/60 hover:text-cuadralo-pink transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="text-sm text-white/60 hover:text-cuadralo-pink transition-colors">
                  Contáctanos
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/60">
            © {new Date().getFullYear()} Cuadralo Club. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
