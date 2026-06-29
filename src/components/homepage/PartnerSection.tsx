import React from 'react';
import Image from 'next/image';

export default function PartnerSection() {
  return (
    <section className="w-full max-w-[1440px] mx-auto px-4 md:px-8 pt-8 pb-4 mb-0">
      {/* Heading with Orange Accent Lines */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className="h-[2px] w-12 sm:w-24 bg-primary/40 rounded-full"></div>
        <h2 className="text-xl sm:text-2xl font-black font-hindi text-slate-800 dark:text-white tracking-wide uppercase">
          हमारे सहयोगी
        </h2>
        <div className="h-[2px] w-12 sm:w-24 bg-primary/40 rounded-full"></div>
      </div>

      {/* Clickable Partner Card - 2-Column Responsive Layout */}
      <a
        href="https://www.thekaalchakra.com/hindi"
        target="_blank"
        rel="noopener noreferrer"
        className="group block w-full max-w-4xl mx-auto bg-white dark:bg-[#111827] rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-[2px] transition-all duration-300 ease-out p-8 md:p-12 overflow-hidden relative cursor-pointer"
      >
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 h-full">
          
          {/* Left Column (Logo) - 40% */}
          <div className="w-full md:w-[40%] flex justify-center md:justify-end items-center h-full">
            <div className="relative w-[160px] h-[160px] md:w-[200px] md:h-[200px] shrink-0">
              <Image
                src="/images/partners/kaalchakra-logo.png"
                alt="The Kaalchakra Logo"
                fill
                className="object-contain drop-shadow-sm group-hover:scale-[1.03] transition-transform duration-500"
                sizes="(max-width: 768px) 160px, 200px"
                priority
              />
            </div>
          </div>

          {/* Right Column (Typography + Tagline) - 60% */}
          <div className="w-full md:w-[60%] flex flex-col items-center md:items-start justify-center text-center md:text-left h-full">
            <div className="relative w-[280px] h-[85px] md:w-[340px] md:h-[105px] shrink-0 flex items-end">
              <Image
                src="/images/partners/kaalchakra-text.png"
                alt="कालचक्र"
                fill
                className="object-contain md:object-left drop-shadow-sm dark:invert group-hover:scale-[1.02] transition-transform duration-500"
                sizes="(max-width: 768px) 280px, 340px"
                priority
              />
            </div>
            
            <p className="text-lg md:text-xl font-black font-hindi text-slate-600 dark:text-slate-300 tracking-wide mt-1 md:-mt-1">
              खबर नहीं, हकीकत
            </p>
          </div>
          
        </div>
      </a>
    </section>
  );
}
