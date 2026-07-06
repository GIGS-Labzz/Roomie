import type { Metadata, Viewport } from "next";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { BarredCheck } from "@/components/auth/BarredCheck";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { PwaInstallTracker } from "@/components/pwa/PwaInstallTracker";
import { CookieBanner } from "@/components/layout/CookieBanner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Roomie",
  description: "Find your perfect student roommate. Connect and Cooonnectttt.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Roomie",
  },
};

export const viewport: Viewport = {
  themeColor: "#8AAF6E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
      <body className="min-h-screen bg-sage-surface">
        <AuthProvider>
          <NotificationProvider>
            <BarredCheck>
              {children}
              <InstallPrompt />
              <PwaInstallTracker />
              <CookieBanner />
            </BarredCheck>
          </NotificationProvider>
        </AuthProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
