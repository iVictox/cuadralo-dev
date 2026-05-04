import TerminosContent from "./TerminosContent";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";

export const metadata = {
  title: "Términos y Condiciones | Cuadralo",
  description: "Términos y condiciones de uso de Cuadralo.",
};

export default function Terminos() {
  return (
    <main className="min-h-screen bg-[#0B0410]">
      <LandingNavbar />
      <TerminosContent />
      <LandingFooter />
    </main>
  );
}
