"use client";
import Image from "next/image";


import React from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { useLanguage } from "@/store/LanguageContext";
import SectionTitle from "../shared/SectionTitle";
import MagazineCard from "../cards/MagazineCard";
import SectionContainer from "../layout/SectionContainer";

export default function Magazine() {
  const { locale } = useLanguage();
  const { magazines } = useCms();

  const publishedMags = (magazines ?? []).filter((m: any) => m.status === "Published" || !m.status);

  if (publishedMags.length === 0) return null;

  const currentMag = publishedMags[0];
  const archives = publishedMags.slice(1, 6);

  return (
    <SectionContainer bgClassName="bg-[#FAFAF9] dark:bg-[#1C1917]" noTopPadding={true}>
      <div className="w-full">
      {/* Title */}
      <SectionTitle 
        title={locale === "hi" ? "पत्रिका डेस्क" : "Magazine Desk"} 
        link="/magazine" 
      />
      <div className="bg-transparent border-t border-stone-200 dark:border-stone-800 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start">
          
          {/* Left Column: Spotlight cover (4 cols) */}
          <div className="lg:col-span-4 flex justify-center items-start perspective-[1000px]">
            <div className="relative group w-[220px] md:w-[260px]">
              <div className="absolute inset-0 bg-black/10 dark:bg-black/50 blur-xl transform translate-y-4 translate-x-4 scale-95 group-hover:translate-x-6 group-hover:translate-y-6 transition-transform duration-700" />
              <div className="relative transform rotate-y-[-4deg] rotate-x-[2deg] group-hover:rotate-y-[0deg] group-hover:rotate-x-[0deg] transition-all duration-700 border border-stone-200 dark:border-stone-800 shadow-xl bg-stone-50 dark:bg-stone-900 rounded-sm overflow-hidden">
                <Image src={currentMag.coverImage} alt={currentMag.issue} className="w-full h-auto object-cover" onError={(e) => { e.currentTarget.src = "/images/placeholder-news.jpg"; }} loading="lazy" fill />
              </div>
              <div className="absolute -bottom-3 -right-3 bg-stone-900 dark:bg-stone-100 text-stone-100 dark:text-stone-900 text-[10px] font-sans font-medium px-4 py-2 uppercase tracking-widest shadow-lg transform rotate-2 z-20">
                {locale === "hi" ? "नया संस्करण" : "New Edition"}
              </div>
            </div>
          </div>

          {/* Right Column: Description + Buttons + Archives List (8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-6 text-center lg:text-left">
            <div>
              <span className="text-stone-500 font-medium font-sans uppercase tracking-[0.25em] text-xs mb-3 block">
                {locale === "hi" ? "ताजा संस्करण / मासिक विशेषांक" : "LATEST EDITION / MONTHLY ISSUE"}
              </span>
              <h3 className="text-3xl md:text-5xl font-medium font-serif text-stone-900 dark:text-stone-100 leading-[1.15] tracking-normal mb-5">
                {currentMag.issue} ({currentMag.month})
              </h3>
              <p className="text-stone-600 dark:text-stone-400 text-base md:text-lg font-serif max-w-xl mx-auto lg:mx-0 leading-relaxed italic">
                "{currentMag.description || "राष्ट्रीय विमर्श, गहन साहित्य और विशेष शोध रिपोर्ट पढ़ें। पत्रिका का नवीनतम अंक अब उपलब्ध है।"}"
              </p>
            </div>

            {/* Read / Archive buttons */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
              <Link 
                href="/magazine" 
                className="bg-stone-900 dark:bg-stone-100 hover:bg-stone-800 dark:hover:bg-stone-200 text-stone-100 dark:text-stone-900 px-8 py-3.5 rounded-sm text-xs font-medium font-sans tracking-widest transition-all duration-300 uppercase flex items-center space-x-2 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>{locale === "hi" ? "पत्रिका पढ़ें" : "Read Magazine"}</span>
              </Link>
              <Link 
                href="/magazine/archive" 
                className="bg-transparent border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 px-8 py-3.5 rounded-sm text-xs font-medium font-sans tracking-widest transition-all duration-300 uppercase cursor-pointer"
              >
                {locale === "hi" ? "पुराने अंक" : "Archives"}
              </Link>
            </div>

            {/* Archives slider strip */}
            {archives.length > 0 && (
              <div className="border-t border-stone-200 dark:border-stone-800 pt-8 mt-4">
                <span className="text-[10px] text-stone-400 dark:text-stone-500 font-sans uppercase font-medium tracking-widest block mb-5">
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
    </SectionContainer>
  );
}
