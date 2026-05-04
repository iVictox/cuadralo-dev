import LandingNavbar from "@/components/landing/LandingNavbar";
import HeroSection from "@/components/landing/HeroSection";
import QueEsCuadralo from "@/components/landing/QueEsCuadralo";
import ParaTi from "@/components/landing/ParaTi";
import CtaSection from "@/components/landing/CtaSection";
import LandingFooter from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#0B0410]">
      <LandingNavbar />
      <HeroSection />
      <QueEsCuadralo />
      <ParaTi />
      <CtaSection />
      <LandingFooter />
    </main>
  );
}
