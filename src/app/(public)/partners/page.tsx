import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import { designTokens } from '@/config/designTokens';

export const metadata: Metadata = {
  title: 'हमारे सहयोगी | Yuvakshar Partners',
  description: 'युवाक्षर के सहयोगी संस्थानों और संगठनों के बारे में जानें। (Learn about Yuvakshar\'s partner organizations and institutions.)',
  alternates: {
    canonical: 'https://yuvakshar.com/partners',
  },
  openGraph: {
    title: 'हमारे सहयोगी | Yuvakshar Partners',
    description: 'युवाक्षर के सहयोगी संस्थानों और संगठनों के बारे में जानें।',
    url: 'https://yuvakshar.com/partners',
    siteName: 'Yuvakshar',
    locale: 'hi_IN',
    type: 'website',
  },
};

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0f1d] pb-24">
      {/* Header Section */}
      <section className="bg-white dark:bg-[#111827] border-b border-gray-150 dark:border-gray-800 pt-12 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <div className="h-[2px] w-12 sm:w-24 bg-[#f97316]/40 rounded-full"></div>
            <h1 className="text-2xl md:text-3xl font-black font-hindi text-gray-900 dark:text-white tracking-wide uppercase">
              हमारे सहयोगी
            </h1>
            <div className="h-[2px] w-12 sm:w-24 bg-[#f97316]/40 rounded-full"></div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-sans text-lg max-w-2xl mx-auto leading-relaxed">
            हम उन संस्थानों और संगठनों के आभारी हैं जो स्वतंत्र और निष्पक्ष पत्रकारिता के हमारे मिशन का समर्थन करते हैं।
          </p>
        </div>
      </section>

      {/* Partners Grid */}
      <section className="max-w-4xl mx-auto px-4 md:px-8 pt-16">
        <div className="grid grid-cols-1 gap-8">
          
          {/* Partner Card: Kaalchakra */}
          <a
            href="https://www.thekaalchakra.com/hindi"
            target="_blank"
            rel="noopener noreferrer"
            className="group block w-full bg-white dark:bg-[#111827] rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl hover:-translate-y-[2px] transition-all duration-300 ease-out p-8 md:p-12 overflow-hidden relative cursor-pointer"
          >
            <div className="flex flex-col items-center justify-center text-center gap-4 md:gap-6 h-full w-full">
              
              {/* Logo */}
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

              {/* Brand Name */}
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
              
              {/* Tagline / Short Description */}
              <div className="space-y-3 mt-2">
                <p className="text-lg md:text-xl font-black font-hindi text-slate-600 dark:text-slate-300 tracking-wide">
                  खबर नहीं, हकीकत
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-sans max-w-md mx-auto">
                  A leading Hindi news and media platform providing in-depth analysis and real ground reporting.
                </p>
              </div>
              
            </div>
          </a>
          
        </div>
      </section>
    </div>
  );
}
