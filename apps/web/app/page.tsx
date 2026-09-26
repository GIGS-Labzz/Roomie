import { Navbar } from "@/components/sections/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Intro } from "@/components/sections/Intro";
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
        {/* Spacer to account for the fixed hero */}
        <div className="h-[100svh]" />
        <div className="relative z-10">
          <Intro />
          <WhyRoomie />
          <RoomieAuth />
          <Pricing />
          <ForProviders />
          <AppPreview />
          <Footer />
        </div>
      </main>
    </>
  );
}
