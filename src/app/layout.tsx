import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/store/LanguageContext";
import { CmsProvider } from "@/store/CmsContext";
import AuthModal from "@/components/yuvakshar/AuthModal";
import { ToastProvider } from "@/components/ui/ToastProvider";
import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";
import { Noto_Sans_Devanagari, Noto_Serif_Devanagari, Hind, Mukta, Inter } from "next/font/google";
import fs from "fs";
import path from "path";
import Script from "next/script";

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
  viewportFit: "cover",
  themeColor: "#ffffff",
};

export async function generateMetadata(): Promise<Metadata> {
  const version = await getBrandingVersion();
  const iconBaseUrl = `/api/branding/icon`;
  const manifestUrl = `/api/branding/manifest?v=${version}`;

  return {
    metadataBase: new URL("https://yuvakshar.tech"),
    title: "युवाक्षर | लेख, समाचार, विश्लेषण, संस्कृति और समाज",
    description: "युवाक्षर पर पढ़ें लेख, समाचार, विश्लेषण, संस्कृति, समाज और समसामयिक विषयों पर प्रामाणिक एवं विश्वसनीय हिंदी सामग्री।",
    keywords: "युवाक्षर, Hindi पत्रिका, Youth Expression Hub, Hindi Articles, Career Hub, Career guidance, AI learning, Indian current affairs, Nation building",
    authors: [{ name: "युवाक्षर संपादकीय कक्ष" }],
    manifest: manifestUrl,
    alternates: {
      canonical: "https://yuvakshar.tech",
    },
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
      title: "युवाक्षर | लेख, समाचार, विश्लेषण, संस्कृति और समाज",
      description: "युवाक्षर पर पढ़ें लेख, समाचार, विश्लेषण, संस्कृति, समाज और समसामयिक विषयों पर प्रामाणिक एवं विश्वसनीय हिंदी सामग्री।",
      url: "https://yuvakshar.tech",
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
      title: "युवाक्षर | लेख, समाचार, विश्लेषण, संस्कृति और समाज",
      description: "युवाक्षर पर पढ़ें लेख, समाचार, विश्लेषण, संस्कृति, समाज और समसामयिक विषयों पर प्रामाणिक एवं विश्वसनीय हिंदी सामग्री।",
      images: [`${iconBaseUrl}?size=512&v=${version}`],
    },
  };
}

import { getSiteSettings, getNavigationMenus, getHomepageSections, getAdvertisements } from "@/lib/actions/globalSettingsActions";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch dynamic platform data
  const siteSettings = await getSiteSettings();
  const navigationMenus = await getNavigationMenus();
  const homepageSections = await getHomepageSections();
  const advertisements = await getAdvertisements();

  // Production defaults — used when site_settings table is empty or a key is missing
  const SETTINGS_DEFAULTS = {
    general: {
      site_name: "युवाक्षर",
      tagline: "लेखन, चिंतन और परिवर्तन",
      primary_email: "yuvakshar.editor@gmail.com",
      editorial_email: "yuvakshar.editor@gmail.com",
      support_email: "yuvakshar.editor@gmail.com",
      newsletter_email: "yuvakshar.editor@gmail.com",
      notification_email: "yuvakshar.editor@gmail.com",
    },
    appearance: {
      primary_color: "#EA580C",
      secondary_color: "#0F172A",
      background_color: "#FFFFFF",
      logo_url: "/yuvakshar_logo_official.png",
      favicon_url: "/favicon.ico",
      font_headlines: "Noto Serif Devanagari",
      font_body: "Noto Sans Devanagari",
    },
    footer: {
      copyright_text: "© 2026 Yuvakshar. Designed for India's youth vanguard.",
      links: [
        { name: "हमारे बारे में", href: "/about" },
        { name: "संपर्क", href: "/contact" },
        { name: "गोपनीयता नीति", href: "/privacy-policy" },
        { name: "नियम और शर्तें", href: "/terms-and-conditions" },
        { name: "संपादकीय नीति", href: "/editorial-policy" }
      ],
    },
  };

  // Convert settings array to object for easier consumption
  const settingsObj = siteSettings.reduce((acc: any, curr: any) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  // Deep-merge: DB values override defaults; missing keys fall back to defaults
  const mergedSettings = {
    general: { ...SETTINGS_DEFAULTS.general, ...(settingsObj.general_settings || settingsObj.general || {}) },
    appearance: { ...SETTINGS_DEFAULTS.appearance, ...(settingsObj.appearance_settings || settingsObj.appearance || {}) },
    footer: { ...SETTINGS_DEFAULTS.footer, ...(settingsObj.footer_settings || settingsObj.footer || {}) },
  };

  return (
    <html lang="hi" suppressHydrationWarning className={`h-full scroll-smooth ${notoSansDeva.variable} ${notoSerifDeva.variable} ${hindFont.variable} ${muktaFont.variable} ${interFont.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "युवाक्षर",
                "url": "https://yuvakshar.tech",
                "logo": "https://yuvakshar.tech/yuvakshar_logo_official.png"
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "युवाक्षर",
                "url": "https://yuvakshar.tech"
              }
            ])
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-[#0F172A] dark:bg-[#0A0F1D] dark:text-slate-200 font-sans antialiased pb-16 lg:pb-0">
        <CmsProvider initialSettings={mergedSettings} initialNavigation={navigationMenus} initialHomepageSections={homepageSections} initialAds={advertisements}>
          <LanguageProvider>
            {/* Global Auth Modal */}
            <AuthModal />
            
            {/* Main Content Area */}
            <main className="flex-grow pt-0">
              {children}
            </main>
            
            {/* Notifications */}
            <ToastProvider />
          </LanguageProvider>
        </CmsProvider>
        
        {/* Service Worker Registration */}
        <Script
          id="service-worker-registration"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful');
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

