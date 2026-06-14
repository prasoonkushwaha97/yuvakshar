import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";
import { LanguageProvider } from "@/store/LanguageContext";
import { CmsProvider } from "@/store/CmsContext";
import AuthModal from "@/components/yuvakshar/AuthModal";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";
import { Noto_Sans_Devanagari, Noto_Serif_Devanagari, Hind, Mukta, Inter } from "next/font/google";
import fs from "fs";
import path from "path";

const notoSansDeva = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-noto-sans-deva",
  display: "swap",
});

const notoSerifDeva = Noto_Serif_Devanagari({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-noto-serif-deva",
  display: "swap",
});

const hindFont = Hind({
  subsets: ["devanagari", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hind",
  display: "swap",
});

const muktaFont = Mukta({
  subsets: ["devanagari", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-mukta",
  display: "swap",
});

const interFont = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

async function getBrandingVersion(): Promise<string> {
  if (!isSupabaseConfigured()) {
    try {
      const defaultPath = path.join(process.cwd(), "public", "favicon.ico");
      const stat = fs.statSync(defaultPath);
      return stat.mtimeMs.toString();
    } catch {
      return "default";
    }
  }
  try {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "site_icons")
      .single();
    if (data?.value?.updated_at) {
      return new Date(data.value.updated_at).getTime().toString();
    }
  } catch (err) {
    console.error("Error fetching branding version in layout:", err);
  }
  return "default";
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export async function generateMetadata(): Promise<Metadata> {
  const version = await getBrandingVersion();
  const iconBaseUrl = `/api/branding/icon`;
  const manifestUrl = `/api/branding/manifest?v=${version}`;

  return {
    metadataBase: new URL("https://yuvakshar.org"),
    title: "युवाक्षर | लेखन, चिंतन और परिवर्तन - Premium Devanagari Editorial & Magazine Platform",
    description: "युवाक्षर is a modern, premium Hindi digital platform focused on News, Magazine Publishing, Articles, Expression, Career and Scholarships, and AI-powered learning assistance. विचारों को आवाज़ दीजिए।",
    keywords: "युवाक्षर, युवाक्षर, Hindi Digital Magazine, Youth Expression Hub, Hindi Articles, Career Hub, Career guidance, AI learning, Indian current affairs, Nation building",
    authors: [{ name: "युवाक्षर संपादकीय कक्ष" }],
    manifest: manifestUrl,
    icons: {
      icon: [
        { url: `${iconBaseUrl}?size=16&v=${version}`, sizes: "16x16", type: "image/png" },
        { url: `${iconBaseUrl}?size=32&v=${version}`, sizes: "32x32", type: "image/png" },
        { url: `${iconBaseUrl}?size=48&v=${version}`, sizes: "48x48", type: "image/png" },
        { url: `${iconBaseUrl}?size=96&v=${version}`, sizes: "96x96", type: "image/png" },
      ],
      shortcut: `${iconBaseUrl}?size=32&v=${version}`,
      apple: [
        { url: `${iconBaseUrl}?size=180&v=${version}`, sizes: "180x180", type: "image/png" },
        { url: `${iconBaseUrl}?size=152&v=${version}`, sizes: "152x152", type: "image/png" },
      ],
    },
    openGraph: {
      title: "युवाक्षर - विचारों को आवाज़ दीजिए",
      description: "युवाओं, लेखकों और विचारकों का हिन्दी डिजिटल मंच - युवाक्षर",
      url: "https://yuvakshar.org",
      siteName: "युवाक्षर",
      locale: "hi_IN",
      type: "website",
      images: [
        {
          url: `${iconBaseUrl}?size=512&v=${version}`,
          width: 512,
          height: 512,
          alt: "युवाक्षर",
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: "युवाक्षर - हिन्दी डिजिटल मंच",
      description: "Modern Hindi Digital Magazine & Youth Expression Hub",
      images: [`${iconBaseUrl}?size=512&v=${version}`],
    },
  };
}

import { hasAnyRole } from "@/lib/rbacService";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isFounder = await hasAnyRole(['founder']);
  const isCoFounder = await hasAnyRole(['co_founder']);
  const isSuperAdmin = await hasAnyRole(['super_admin']);
  const isAdmin = await hasAnyRole(['admin']);
  const isEditorInChief = await hasAnyRole(['editor_in_chief']);
  const isModerator = await hasAnyRole(['moderator']);

  const showFounderWorkspace = isFounder;
  const showAdminWorkspace = isFounder || isCoFounder || isSuperAdmin || isAdmin;
  const showModeratorWorkspace = isFounder || isCoFounder || isSuperAdmin || isAdmin || isEditorInChief || isModerator;

  return (
    <html lang="hi" className={`h-full scroll-smooth ${notoSansDeva.variable} ${notoSerifDeva.variable} ${hindFont.variable} ${muktaFont.variable} ${interFont.variable}`}>
      <body className="min-h-full flex flex-col bg-white text-[#0F172A] dark:bg-[#0A0F1D] dark:text-slate-200 font-sans antialiased pb-16 lg:pb-0">
        <CmsProvider>
          <LanguageProvider>
            {/* Global Beta Banner */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-[10px] md:text-xs font-serif py-1.5 px-4 text-center select-none shadow-sm relative z-[60] tracking-wide">
              युवाक्षर बीटा संस्करण (Yuvakshar Beta Version) — कुछ सुविधाएँ अभी विकास के अधीन हैं।
            </div>

            {/* Navigation bar */}
            <Navbar 
              showFounderWorkspace={showFounderWorkspace}
              showAdminWorkspace={showAdminWorkspace}
              showModeratorWorkspace={showModeratorWorkspace}
            />
            
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
            
            {/* Notifications */}
            <ToastProvider />
          </LanguageProvider>
        </CmsProvider>
      </body>
    </html>
  );
}
