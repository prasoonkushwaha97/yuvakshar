"use client";

import React from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { useLanguage } from "@/store/LanguageContext";
import SectionTitle from "../shared/SectionTitle";
import MagazineCard from "../cards/MagazineCard";

export default function Magazine() {
  const { locale } = useLanguage();
  const { magazines } = useCms();

  const publishedMags = (magazines ?? []).filter((m: any) => m.status === "Published" || !m.status);

  // Fallback default issue if magazines context is empty
  const currentMag = publishedMags[0] || {
    id: "mag-default",
    issue: "अंक 15",
    month: "जून 2025",
    year: "2025",
    coverImage: "/images/placeholder-news.jpg",
    description: "राष्ट्रीय विमर्श, गहन इतिहास, पर्यावरण संरक्षण और आधुनिक तकनीक पर विशेष बौद्धिक विमर्श।"
  };

  const archives = publishedMags.slice(1, 6);

  return (
    <div className="w-full py-0.5">
      {/* Title */}
      <SectionTitle 
        title={locale === "hi" ? "डिजिटल पत्रिका डेस्क" : "Digital Magazine Desk"} 
        link="/magazine" 
      />

      <div className="bg-[#FAF9F6] dark:bg-[#121212] border border-gray-150 dark:border-gray-850 p-6 md:p-10 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
          
          {/* Left Column: Spotlight cover (4 cols) */}
          <div className="lg:col-span-4 flex justify-center perspective-[1000px]">
            <div className="relative group w-[220px] md:w-[260px]">
              <div className="absolute inset-0 bg-black/10 dark:bg-black/50 blur-xl transform translate-y-4 translate-x-4 scale-95 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform duration-700" />
              <div className="relative transform rotate-y-[-6deg] rotate-x-[3deg] group-hover:rotate-y-[0deg] group-hover:rotate-x-[0deg] transition-all duration-700 border border-gray-250 dark:border-gray-800 shadow-2xl bg-white dark:bg-black rounded-sm overflow-hidden">
                <img
                  src={currentMag.coverImage}
                  alt={currentMag.issue}
                  className="w-full h-auto object-cover"
                  onError={(e) => { e.currentTarget.src = "/images/placeholder-news.jpg"; }}
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-3 -right-3 bg-[#f97316] text-white text-[9px] font-sans font-bold px-3 py-1.5 uppercase tracking-widest shadow-lg transform rotate-2 z-20">
                {locale === "hi" ? "नया संस्करण" : "New Edition"}
              </div>
            </div>
          </div>

          {/* Right Column: Description + Buttons + Archives List (8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-6 text-center lg:text-left">
            <div>
              <span className="text-[#f97316] font-bold uppercase tracking-[0.25em] text-xs mb-2 block">
                {locale === "hi" ? "ताजा संस्करण / मासिक विशेषांक" : "LATEST EDITION / MONTHLY ISSUE"}
              </span>
              <h3 className="text-4xl md:text-5xl font-black font-serif text-gray-900 dark:text-gray-150 leading-tight tracking-tight mb-4">
                {currentMag.issue} ({currentMag.month})
              </h3>
              <p className="text-gray-650 dark:text-gray-400 text-sm md:text-base font-serif max-w-xl mx-auto lg:mx-0 leading-relaxed italic">
                "{currentMag.description || "राष्ट्रीय विमर्श, गहन साहित्य और विशेष शोध रिपोर्ट पढ़ें। पत्रिका का नवीनतम अंक अब उपलब्ध है।"}"
              </p>
            </div>

            {/* Read / Archive buttons */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              <Link 
                href="/magazine" 
                className="bg-[#f97316] hover:bg-[#EA580C] text-white px-8 py-3.5 rounded-full text-xs font-bold font-sans tracking-widest shadow-md transition-all duration-300 uppercase flex items-center space-x-1.5 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>{locale === "hi" ? "पत्रिका पढ़ें" : "Read Magazine"}</span>
              </Link>
              <Link 
                href="/magazine/archive" 
                className="bg-transparent border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-black px-8 py-3.5 rounded-full text-xs font-bold font-sans tracking-widest transition-all duration-300 uppercase cursor-pointer"
              >
                {locale === "hi" ? "पुराने अंक" : "Archives"}
              </Link>
            </div>

            {/* Archives slider strip */}
            {archives.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-sans uppercase font-bold tracking-widest block mb-4">
                  {locale === "hi" ? "पत्रिका संग्रह के अन्य अंक" : "OTHER COVERS FROM ARCHIVES"}
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {archives.map((mag: any) => (
                    <div key={mag.id} className="max-w-[120px] mx-auto w-full">
                      <MagazineCard magazine={mag} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
