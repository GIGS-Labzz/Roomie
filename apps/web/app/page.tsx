import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { WhyRoomie } from "@/components/sections/WhyRoomie";
import { RoomieAuth } from "@/components/sections/RoomieAuth";
import { Pricing } from "@/components/sections/Pricing";
import { ForProviders } from "@/components/sections/ForProviders";
import { AppPreview } from "@/components/sections/AppPreview";
import { Footer } from "@/components/sections/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="overflow-x-hidden scroll-smooth">
        <Hero />
        <HowItWorks />
        <WhyRoomie />
        <RoomieAuth />
        <Pricing />
        <ForProviders />
        <AppPreview />
        <Footer />
      </main>
    </>
  );
}
