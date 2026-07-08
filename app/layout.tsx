import type { Metadata, Viewport } from "next";
import { Heebo } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { BottomNav } from "@/components/BottomNav";
import { Footer } from "@/components/Footer";
import { ShabbatGuard } from "@/components/ShabbatGuard";
import { CHAT_AUTH_ENABLED } from "@/lib/features";

const heebo = Heebo({ subsets: ["hebrew", "latin"], variable: "--font-heebo" });

export const metadata: Metadata = {
  title: "World Cup Hub · Powered by StreamNet",
  description: "חוויית המונדיאל 2026 של StreamNet — שידורים חיים, תוצאות, טבלאות, בראקט וצ׳אט אוהדים. מבית Crack Apps.",
};

export const viewport: Viewport = {
  themeColor: "#070a12",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const shell = (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className="min-h-screen font-sans antialiased">
        <ShabbatGuard>
          <Sidebar />
          <div className="lg:mr-64">
            <Topbar />
            <main className="mx-auto max-w-6xl px-4 pb-6 pt-6">{children}</main>
            <Footer />
          </div>
          <BottomNav />
        </ShabbatGuard>
      </body>
    </html>
  );

  return CHAT_AUTH_ENABLED ? <ClerkProvider>{shell}</ClerkProvider> : shell;
}
