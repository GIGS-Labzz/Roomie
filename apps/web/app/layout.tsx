import type { Metadata } from "next";
import "./globals.css";
import { WaitlistProvider } from "@/context/waitlist";
import { CookieBanner } from "@/components/sections/CookieBanner";

export const metadata: Metadata = {
  title: "Roomie — Connect and Cooonnecttt",
  description: "Find your perfect student roommate. Pay once. Move in together.",
  openGraph: {
    title: "Roomie",
    description: "Find your perfect student roommate.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning style={{ scrollBehavior: "smooth" }}>
        <WaitlistProvider>
          {children}
          <CookieBanner />
        </WaitlistProvider>
      </body>
    </html>
  );
}
