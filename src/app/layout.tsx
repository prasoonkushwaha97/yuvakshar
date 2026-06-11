import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { LanguageProvider } from "@/store/LanguageContext";
import { CmsProvider } from "@/store/CmsContext";
import AuthModal from "@/components/yuvakshar/AuthModal";

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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi" className="h-full scroll-smooth">
      <body className="min-h-full flex flex-col bg-white text-[#0F172A] dark:bg-[#0A0F1D] dark:text-slate-200 font-sans antialiased pb-20 lg:pb-0">
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

            {/* Fixed Bottom Navigation Bar for Mobile */}
            <div className="fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-[#0F172A]/90 backdrop-blur-md border-t border-border lg:hidden flex items-center justify-around z-50 px-2 shadow-lg">
              <Link href="/" className="flex flex-col items-center justify-center w-12 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-all">
                <span className="text-lg">🏠</span>
                <span className="text-[9px] font-bold mt-0.5">होम</span>
              </Link>
              <Link href="/categories" className="flex flex-col items-center justify-center w-12 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-all">
                <span className="text-lg">📰</span>
                <span className="text-[9px] font-bold mt-0.5">समाचार</span>
              </Link>
              <Link href="/magazine" className="flex flex-col items-center justify-center w-12 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-all">
                <span className="text-lg">📖</span>
                <span className="text-[9px] font-bold mt-0.5">पत्रिका</span>
              </Link>
              <Link href="/search" className="flex flex-col items-center justify-center w-12 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-all">
                <span className="text-lg">🔍</span>
                <span className="text-[9px] font-bold mt-0.5">खोज</span>
              </Link>
              <Link href="/admin" className="flex flex-col items-center justify-center w-12 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-all">
                <span className="text-lg">👤</span>
                <span className="text-[9px] font-bold mt-0.5">प्रोफ़ाइल</span>
              </Link>
            </div>
          </LanguageProvider>
        </CmsProvider>
      </body>
    </html>
  );
}
