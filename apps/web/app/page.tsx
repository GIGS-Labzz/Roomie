import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { WhyRoomie } from "@/components/sections/WhyRoomie";
import { Pricing } from "@/components/sections/Pricing";
import { ForProviders } from "@/components/sections/ForProviders";
import { AppPreview } from "@/components/sections/AppPreview";
import { Footer } from "@/components/sections/Footer";

export default function HomePage() {
  return (
    <main className="overflow-x-hidden">
      <Hero />
      <HowItWorks />
      <WhyRoomie />
      <Pricing />
      <ForProviders />
      <AppPreview />
      <Footer />
    </main>
  );
}
