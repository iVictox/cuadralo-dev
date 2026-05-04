import ContactForm from "./ContactForm";
import LandingNavbar from "@/components/landing/LandingNavbar";
import LandingFooter from "@/components/landing/LandingFooter";

export const metadata = {
  title: "Contacto | Cuadralo",
  description: "Contáctanos para cualquier duda o sugerencia.",
};

export default function Contacto() {
  return (
    <main className="min-h-screen bg-[#0B0410]">
      <LandingNavbar />
      <ContactForm />
      <LandingFooter />
    </main>
  );
}
