import React from 'react';
import Image from 'next/image';

export default function PartnerSection() {
  return (
    <section className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-12 mb-8">
      {/* Heading with Orange Accent Lines */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className="h-[2px] w-12 sm:w-24 bg-primary/40 rounded-full"></div>
        <h2 className="text-xl sm:text-2xl font-black font-hindi text-slate-800 dark:text-white tracking-wide uppercase">
          हमारे साझेदार
        </h2>
        <div className="h-[2px] w-12 sm:w-24 bg-primary/40 rounded-full"></div>
      </div>

      {/* Clickable Partner Card */}
      <a
        href="https://www.thekaalchakra.com/hindi"
        target="_blank"
        rel="noopener noreferrer"
        className="group block w-full max-w-4xl mx-auto bg-white dark:bg-[#111827] rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ease-out p-8 md:p-12 overflow-hidden relative cursor-pointer"
      >
        <div className="flex flex-col md:flex-row items-center justify-center md:justify-around gap-8 md:gap-16">
          
          {/* Logo - Left on Desktop, Top on Mobile */}
          <div className="relative w-32 h-32 md:w-40 md:h-40 shrink-0">
            <Image
              src="/images/partners/kaalchakra-logo.jpg"
              alt="The Kaalchakra Logo"
              fill
              className="object-contain drop-shadow-sm group-hover:scale-[1.02] transition-transform duration-500"
              sizes="(max-width: 768px) 128px, 160px"
              priority
            />
          </div>

          {/* Vertical Divider for Desktop */}
          <div className="hidden md:block w-px h-32 bg-slate-200 dark:bg-slate-700"></div>

          {/* Typography & Tagline - Right on Desktop, Bottom on Mobile */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="relative w-48 h-16 md:w-64 md:h-20 shrink-0">
              <Image
                src="/images/partners/kaalchakra-text.png"
                alt="कालचक्र"
                fill
                className="object-contain drop-shadow-sm dark:invert group-hover:scale-[1.02] transition-transform duration-500"
                sizes="(max-width: 768px) 192px, 256px"
                priority
              />
            </div>
            <p className="text-lg md:text-xl font-black font-hindi text-slate-600 dark:text-slate-300 tracking-wide mt-2">
              खबर नहीं, हकीकत
            </p>
          </div>
          
        </div>
      </a>
    </section>
  );
}
