import PoliticaContent from "./PoliticaContent";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";

export const metadata = {
  title: "Política de Privacidad | Cuadralo",
  description: "Política de privacidad de Cuadralo.",
};

export default function PoliticaPrivacidad() {
  return (
    <main className="min-h-screen bg-[#0B0410]">
      <LandingNavbar />
      <PoliticaContent />
      <LandingFooter />
    </main>
  );
}
