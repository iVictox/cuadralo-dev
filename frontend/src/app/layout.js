import "./globals.css";
import { Inter } from "next/font/google";
import ClientLayout from "./ClientLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: {
    default: 'Cuadralo Club - La app de citas de Venezuela',
    template: '%s | Cuadralo Club'
  },
  description: 'La forma más divertida de conocer gente nueva en Venezuela. Swipe, conecta y encuentra a alguien especial con Cuadralo Club.',
  keywords: ['citas', 'Venezuela', 'dating app', 'conocer gente', 'encontrar pareja', 'app de citas', 'Venezuela dating'],
  authors: [{ name: 'Cuadralo Club' }],
  creator: 'Cuadralo Club',
  publisher: 'Cuadralo Club',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: 'Cuadralo Club - La app de citas de Venezuela',
    description: 'Conecta con personas reales en Venezuela. La app de citas diseñada para ti.',
    url: 'https://cuadralo.com',
    siteName: 'Cuadralo Club',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Cuadralo Club - App de Citas',
      },
    ],
    locale: 'es_VE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cuadralo Club - La app de citas de Venezuela',
    description: 'Conecta con personas reales en Venezuela.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  manifest: '/site.webmanifest',
  metadataBase: new URL('https://cuadralo.com'),
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
