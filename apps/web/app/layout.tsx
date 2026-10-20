import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Under Construction — Roomie",
  description: "We are working hard to bring this concept back to life. Check back soon.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Roomie — Under Construction",
    description: "We are working hard to bring this concept back to life. Check back soon.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#080c14] text-slate-100 antialiased min-h-screen selection:bg-brand-500/30 selection:text-brand-300">
        {children}
      </body>
    </html>
  );
}
