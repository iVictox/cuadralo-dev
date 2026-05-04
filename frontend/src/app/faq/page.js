import FaqContent from "./FaqContent";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";

export const metadata = {
  title: "Preguntas Frecuentes | Cuadralo",
  description: "Resuelve tus dudas sobre Cuadralo.",
};

export default function FAQ() {
  return (
    <main className="min-h-screen bg-[#0B0410]">
      <LandingNavbar />
      <FaqContent />
      <LandingFooter />
    </main>
  );
}
