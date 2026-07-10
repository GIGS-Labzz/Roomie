import { Metadata } from "next";
import { SlideDeck } from "@/components/pitch/SlideDeck";

export const metadata: Metadata = {
  title: "Roomie — Kano Pitchathon 2026 Interactive Deck",
  description: "Find your perfect roommate. Interactive presentation for Kano Pitchathon.",
};

export default function PitchPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white overflow-hidden select-none">
      <SlideDeck />
    </main>
  );
}
