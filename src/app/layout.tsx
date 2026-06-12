import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { LanguageProvider } from "@/store/LanguageContext";
import { CmsProvider } from "@/store/CmsContext";
import AuthModal from "@/components/yuvakshar/AuthModal";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

export const metadata: Metadata = {
  title: "युवाक्षर | लेखन, चिंतन और परिवर्तन - Premium Devanagari Editorial & Magazine Platform",
  description: "युवाक्षर is a modern, premium Hindi digital platform focused on News, Magazine Publishing, Articles, Expression, Career and Scholarships, and AI-powered learning assistance. विचारों को आवाज़ दीजिए।",
  keywords: "युवाक्षर, युवाक्षर, Hindi Digital Magazine, Youth Expression Hub, Hindi Articles, Career Hub, Career guidance, AI learning, Indian current affairs, Nation building",
  authors: [{ name: "युवाक्षर संपादकीय कक्ष" }],
  openGraph: {
    title: "युवाक्षर - विचारों को आवाज़ दीजिए",
    description: "युवाओं, लेखकों और विचारकों का हिन्दी डिजिटल मंच - युवाक्षर",
    url: "https://yuvakshar.org",
    siteName: "युवाक्षर",
    locale: "hi_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "युवाक्षर - हिन्दी डिजिटल मंच",
    description: "Modern Hindi Digital Magazine & Youth Expression Hub",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=5",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-white text-[#0F172A] dark:bg-[#0A0F1D] dark:text-slate-200 font-sans antialiased pb-16 lg:pb-0">
        <CmsProvider>
          <LanguageProvider>
            {/* Navigation bar */}
            <Navbar />
            
            {/* Global Auth Modal */}
            <AuthModal />
            
            {/* Main Content Area */}
            <main className="flex-grow pt-0">
              {children}
            </main>

            {/* Global Dynamic Footer */}
            <Footer />

            {/* Mobile Bottom Navigation Bar */}
            <MobileBottomNav />
          </LanguageProvider>
        </CmsProvider>
      </body>
    </html>
  );
}
