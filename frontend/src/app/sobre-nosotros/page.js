import SobreNosotrosContent from "./SobreNosotrosContent";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";

export const metadata = {
  title: "Sobre Nosotros | Cuadralo",
  description: "Conoce la misión y visión de Cuadralo, la app que está revolucionando las citas en Venezuela.",
};

export default function SobreNosotros() {
  return (
    <main className="min-h-screen bg-[#0B0410]">
      <LandingNavbar />
      <SobreNosotrosContent />
      <LandingFooter />
    </main>
  );
}
