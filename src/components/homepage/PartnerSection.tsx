import React from 'react';
import Image from 'next/image';

export default function PartnerSection() {
  return (
    <section className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-8 mb-4">
      {/* Heading with Orange Accent Lines */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className="h-[2px] w-12 sm:w-24 bg-primary/40 rounded-full"></div>
        <h2 className="text-xl sm:text-2xl font-black font-hindi text-slate-800 dark:text-white tracking-wide uppercase">
          हमारे साझेदार
        </h2>
        <div className="h-[2px] w-12 sm:w-24 bg-primary/40 rounded-full"></div>
      </div>

      {/* Clickable Partner Card - Single Brand Showcase */}
      <a
        href="https://www.thekaalchakra.com/hindi"
        target="_blank"
        rel="noopener noreferrer"
        className="group block w-full max-w-2xl mx-auto bg-white dark:bg-[#111827] rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-[2px] transition-all duration-300 ease-out p-10 md:p-14 overflow-hidden relative cursor-pointer"
      >
        <div className="flex flex-col items-center justify-center text-center">
          
          {/* Logo */}
          <div className="relative w-[140px] h-[140px] md:w-[160px] md:h-[160px] shrink-0 mb-[24px]">
            <Image
              src="/images/partners/kaalchakra-logo.png"
              alt="The Kaalchakra Logo"
              fill
              className="object-contain drop-shadow-sm group-hover:scale-[1.03] transition-transform duration-500"
              sizes="(max-width: 768px) 140px, 160px"
              priority
            />
          </div>

          {/* Typography */}
          <div className="relative w-[280px] h-[85px] md:w-[340px] md:h-[105px] shrink-0">
            <Image
              src="/images/partners/kaalchakra-text.png"
              alt="कालचक्र"
              fill
              className="object-contain drop-shadow-sm dark:invert group-hover:scale-[1.02] transition-transform duration-500"
              sizes="(max-width: 768px) 280px, 340px"
              priority
            />
          </div>
          
          {/* Tagline */}
          <p className="text-lg md:text-xl font-black font-hindi text-slate-600 dark:text-slate-300 tracking-wide mt-[12px]">
            खबर नहीं, हकीकत
          </p>
          
        </div>
      </a>
    </section>
  );
}
