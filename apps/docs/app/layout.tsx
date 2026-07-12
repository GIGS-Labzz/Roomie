import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Roomie Developer Hub | platform.roomie",
  description: "Integrate Roomie services including SSO OAuth, Shared Profiling, Split Payments, and Housing Checkout Consent.",
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
        {children}
      </body>
    </html>
  );
}
