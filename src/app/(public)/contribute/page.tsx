import React from "react";
import Link from "next/link";
import { PenTool, CheckCircle, Clock, BookOpen, ArrowRight } from "lucide-react";

export default function ContributorPortalPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0F1D] text-[#1E1E1E] dark:text-slate-200 py-12 md:py-16">
      <div className="max-w-5xl mx-auto px-4 md:px-8 space-y-12">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4 border-b border-[#E7E2D8] dark:border-slate-800 pb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-[#EA580C]/10 text-[#EA580C] border border-[#EA580C]/20 mb-2">
            <PenTool className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl md:text-5xl font-extrabold font-hindi tracking-tight text-slate-900 dark:text-white">
            युवाक्षर के लिए लिखें
          </h1>
          <p className="font-hindi text-slate-600 dark:text-slate-300 leading-relaxed text-sm md:text-base">
            हमारे सत्यापित लेखकों, विशेषज्ञों और पाठकों के समुदाय से जुड़ें। दुनिया भर के करोड़ों हिंदी पाठकों के साथ अपनी कहानियाँ, विश्लेषण और विचार साझा करें।
          </p>
        </div>

        {/* Entry Points */}
        <div className="grid md:grid-cols-2 gap-8 pt-4">
          
          {/* Guest / New Reader Submission */}
          <div className="bg-white dark:bg-[#0D1527] border-2 border-[#E7E2D8] dark:border-slate-800 rounded-xl p-8 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-lg dark:hover:shadow-orange-500/10 transition-all duration-300 flex flex-col justify-between">
            <div>
              <h2 className="font-serif text-2xl font-bold font-hindi text-slate-900 dark:text-white mb-4">
                अतिथि लेख प्रेषित करें
              </h2>
              <p className="font-hindi text-slate-600 dark:text-slate-400 mb-8 text-sm md:text-base leading-relaxed">
                क्या आपका खाता नहीं है? फिर भी आप अपना लेख समीक्षा के लिए भेज सकते हैं। स्वीकृत होने पर हम ईमेल के माध्यम से आपसे संपर्क करेंगे।
              </p>
            </div>
            <Link 
              href="/contribute/guest"
              className="inline-flex items-center justify-center w-full text-center bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold py-3 px-6 rounded-xl hover:border-[#EA580C] hover:text-[#EA580C] transition-colors font-hindi"
            >
              अतिथि के रूप में लेख भेजें
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          {/* Registered Reader / Author Workspace */}
          <div className="bg-orange-50/50 dark:bg-orange-950/20 border-2 border-[#EA580C]/30 rounded-xl p-8 hover:border-[#EA580C]/60 hover:shadow-lg dark:hover:shadow-orange-500/10 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <h2 className="font-serif text-2xl font-bold font-hindi text-slate-900 dark:text-white">
                  लेखक कार्यक्षेत्र
                </h2>
                <span className="bg-[#EA580C]/10 text-[#EA580C] border border-[#EA580C]/20 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider font-hindi">
                  अनुशंसित
                </span>
              </div>
              <p className="font-hindi text-slate-600 dark:text-slate-400 mb-8 text-sm md:text-base leading-relaxed">
                अपने ड्राफ्ट तक पहुँचने, लेख की स्थिति ट्रैक करने और हमारे संपादकीय दल से सीधे संवाद करने के लिए लॉग इन करें।
              </p>
            </div>
            <Link 
              href="/contribute/dashboard"
              className="inline-flex items-center justify-center w-full text-center bg-[#EA580C] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#C2410C] transition-colors font-hindi shadow-sm"
            >
              मेरे कार्यक्षेत्र में जाएँ
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

        </div>

        {/* Guidelines & Process */}
        <div className="grid md:grid-cols-3 gap-8 pt-10 border-t border-[#E7E2D8] dark:border-slate-800">
          
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold font-hindi text-slate-900 dark:text-white">
              संपादकीय दिशानिर्देश
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-hindi">
              हम मौलिक, अच्छी तरह से शोधित और तथ्य-जांच सामग्री स्वीकार करते हैं। साहित्यिक चोरी सख्त वर्जित है और ऐसा करने पर स्थायी प्रतिबंध लगाया जा सकता है।
            </p>
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold font-hindi text-slate-900 dark:text-white">
              लेख प्रकाशन प्रक्रिया
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-hindi">
              सबमिट होने के बाद, आपका लेख हमारी संपादकीय कतार में चला जाता है। हमारे संपादक तथ्यों की जांच करेंगे और आवश्यकता होने पर संशोधन का अनुरोध कर सकते हैं।
            </p>
          </div>

          <div className="space-y-4">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-bold font-hindi text-slate-900 dark:text-white">
              अनुमानित समय
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed font-hindi">
              हमारा संपादकीय दल 3-5 कार्य दिवसों के भीतर सभी लेखों का जवाब देने का प्रयास करता है। आप अपने कार्यक्षेत्र में वास्तविक स्थिति को ट्रैक कर सकते हैं।
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
