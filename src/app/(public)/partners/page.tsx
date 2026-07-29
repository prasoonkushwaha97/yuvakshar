import React from 'react';
import Image from 'next/image';
import { Metadata } from 'next';
import { ExternalLink, Check } from 'lucide-react';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  weight: ['800'],
  subsets: ['latin', 'devanagari'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'हमारे सहयोगी | Yuvakshar Partners',
  description: 'युवाक्षर के सहयोगी संस्थानों और संगठनों के बारे में जानें।',
  alternates: {
    canonical: 'https://yuvakshar.com/partners',
  },
  openGraph: {
    title: 'हमारे सहयोगी | युवाक्षर',
    description: 'युवाक्षर के सहयोगी संस्थानों और संगठनों के बारे में जानें।',
    url: 'https://yuvakshar.tech/partners',
    siteName: 'युवाक्षर',
    locale: 'hi_IN',
    type: 'website',
  },
};

export default function PartnersPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0E1322] pb-32">
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 md:px-12 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl md:text-5xl font-black font-hindi text-slate-900 dark:text-white tracking-wide">
            हमारे सहयोगी
          </h1>
          <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 font-hindi leading-relaxed max-w-2xl mx-auto font-medium">
            युवाक्षर उन संस्थानों और संगठनों के साथ कार्य करता है जो स्वतंत्र पत्रकारिता, ज्ञान और सामाजिक उत्तरदायित्व के मूल्यों को आगे बढ़ाने के लिए प्रतिबद्ध हैं।
          </p>
        </div>
      </section>

      {/* Premium Partner Showcase */}
      <section className="px-4 md:px-8 max-w-5xl mx-auto">
        <div className="bg-white dark:bg-[#151B2B] rounded-[24px] border border-slate-50 dark:border-slate-800/50 shadow-sm hover:shadow-md p-10 md:p-20 flex flex-col items-center text-center transition-all duration-500">
          
          {/* Logo */}
          <div className="relative w-[196px] h-[196px] md:w-[264px] md:h-[264px] shrink-0 mb-6">
            <Image
              src="/images/partners/kaalchakra-logo.png"
              alt="कालचक्र Logo"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 196px, 264px"
              priority
            />
          </div>

          {/* Partner Name */}
          <h2 className={`text-5xl md:text-[64px] font-extrabold tracking-wider ${poppins.className} text-slate-900 dark:text-white mb-4`}>
            कालचक्र
          </h2>

          {/* Tagline */}
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-hindi mb-10 font-medium tracking-wide">
            खबर नहीं, हकीकत
          </p>

          {/* Short Description */}
          <p className="text-lg md:text-xl text-slate-700 dark:text-slate-300 font-hindi leading-relaxed max-w-3xl mb-12">
            कालचक्र एक प्रमुख डिजिटल मीडिया प्लेटफॉर्म है जो सत्यनिष्ठ पत्रकारिता और गहरी जांच रिपोर्टिंग के लिए जाना जाता है। यह मंच केवल सतही खबरों से आगे बढ़कर सामाजिक, राजनीतिक और आर्थिक वास्तविकताओं को सामने लाता है, ताकि समाज को एक निष्पक्ष और पारदर्शी दृष्टिकोण मिल सके।
          </p>

          {/* Partnership Areas */}
          <div className="w-full max-w-2xl mb-14">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {[
                'मीडिया सहयोग',
                'सामग्री सहयोग',
                'संयुक्त संपादकीय परियोजनाएँ',
                'जनहित संवाद'
              ].map((area, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0">
                    <Check className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                  </div>
                  <span className="text-lg font-hindi text-slate-700 dark:text-slate-300 font-medium">{area}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Website Button */}
          <a
            href="https://www.thekaalchakra.com/hindi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-hindi text-lg font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors duration-300"
          >
            <span>🌐 आधिकारिक वेबसाइट देखें</span>
          </a>
          
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="mt-32 px-6 md:px-12 text-center">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-3xl md:text-4xl font-black font-hindi text-slate-900 dark:text-white">
            क्या आपका संस्थान युवाक्षर के साथ सहयोग करना चाहता है?
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 font-hindi leading-relaxed max-w-2xl mx-auto font-medium">
            यदि आप मीडिया, शिक्षा, शोध, संस्कृति या समाजहित के क्षेत्र में कार्यरत हैं, तो हम आपके साथ सार्थक साझेदारी का स्वागत करते हैं।
          </p>
          <div className="pt-4">
            <a
              href="mailto:yuvakshar.editor@gmail.com"
              className="inline-flex items-center justify-center px-10 py-4 rounded-full border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white font-hindi text-lg font-bold hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all duration-300"
            >
              सहयोग के लिए संपर्क करें
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
