"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Send, CheckCircle2, Tags, AlertCircle } from "lucide-react";
import { submitContributorArticle } from "@/lib/actions/contributeActions";
import { useRouter } from "next/navigation";

export default function ContributorSubmissionPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDrafting, setIsDrafting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const handleAction = async (isDraft: boolean) => {
    if (!formRef.current) return;
    
    if (isDraft) setIsDrafting(true);
    else setIsSubmitting(true);
    
    setErrorMsg("");

    const formData = new FormData(formRef.current);
    const result = await submitContributorArticle(formData, isDraft);

    if (result.error) {
      setErrorMsg(result.error);
      setIsDrafting(false);
      setIsSubmitting(false);
    } else {
      if (isDraft) {
        router.push("/contribute/dashboard");
      } else {
        setIsSubmitted(true);
      }
      setIsDrafting(false);
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAction(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0F1D] text-[#1E1E1E] dark:text-slate-200 py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link href="/contribute/dashboard" className="inline-flex items-center text-sm font-hindi text-slate-500 hover:text-[#EA580C] transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            कार्यक्षेत्र पर वापस जाएँ (Back to Dashboard)
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10 border-b border-[#E7E2D8] dark:border-slate-800 pb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-black font-hindi tracking-tight text-slate-900 dark:text-white mb-3">
            नया लेख प्रेषित करें
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-hindi text-sm md:text-base">
            समीक्षा और प्रकाशन के लिए अपना नवीनतम लेख ड्राफ्ट सबमिट करें।
          </p>
        </div>

        {isSubmitted ? (
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-10 text-center">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white mb-4 font-hindi">
              आपका लेख सफलतापूर्वक प्रेषित कर दिया गया है!
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8 font-hindi leading-relaxed">
              संपादकीय दल आपके लेख की समीक्षा करेगा। आप अपने कार्यक्षेत्र (Dashboard) में इसकी स्थिति को ट्रैक कर सकते हैं।
            </p>
            <Link 
              href="/contribute/dashboard"
              className="inline-flex items-center justify-center bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold py-3 px-8 rounded-xl hover:border-[#EA580C] hover:text-[#EA580C] transition-colors font-hindi"
            >
              कार्यक्षेत्र पर वापस जाएँ
            </Link>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="bg-white dark:bg-[#0D1527] border border-[#E7E2D8] dark:border-slate-800 p-8 md:p-10 rounded-2xl shadow-sm space-y-8">
            
            {errorMsg && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-hindi flex gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {errorMsg}
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-6">
              {/* Title */}
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-bold text-slate-900 dark:text-white font-hindi">
                  लेख का शीर्षक (Title) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    name="title"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E7E2D8] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#EA580C] focus:border-transparent outline-none transition-all font-hindi font-serif text-lg"
                    placeholder="आकर्षक और सटीक शीर्षक लिखें"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-900 dark:text-white font-hindi">
                  श्रेणी (Category) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tags className="h-5 w-5 text-slate-400" />
                  </div>
                  <select 
                    name="category"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E7E2D8] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#EA580C] focus:border-transparent outline-none transition-all font-hindi appearance-none"
                    defaultValue=""
                  >
                    <option value="" disabled>श्रेणी चुनें</option>
                    <option value="politics">राजनीति (Politics)</option>
                    <option value="society">समाज (Society)</option>
                    <option value="science">विज्ञान (Science)</option>
                    <option value="culture">संस्कृति (Culture)</option>
                    <option value="opinion">विचार (Opinion)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900 dark:text-white font-hindi">
                लेख सामग्री (Content) <span className="text-red-500">*</span>
              </label>
              <textarea 
                name="content"
                required
                rows={16}
                className="w-full p-5 rounded-xl border border-[#E7E2D8] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#EA580C] focus:border-transparent outline-none transition-all font-hindi text-base resize-y leading-relaxed"
                placeholder="अपना लेख यहाँ लिखना शुरू करें..."
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[#E7E2D8] dark:border-slate-800">
              <button 
                type="submit"
                disabled={isSubmitting || isDrafting}
                className="flex-1 flex items-center justify-center gap-2 bg-[#EA580C] text-white font-bold py-4 px-6 rounded-xl hover:bg-[#C2410C] disabled:bg-[#ea590c7e] disabled:cursor-not-allowed transition-colors font-hindi shadow-md hover:shadow-lg"
              >
                <Send className="w-5 h-5" />
                {isSubmitting ? "भेजा जा रहा है..." : "समीक्षा के लिए भेजें (Submit for Review)"}
              </button>
              <button 
                type="button"
                onClick={() => handleAction(true)}
                disabled={isSubmitting || isDrafting}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-4 px-6 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-hindi"
              >
                {isDrafting ? "सहेजा जा रहा है..." : "ड्राफ्ट सहेजें (Save as Draft)"}
              </button>
            </div>
            
          </form>
        )}
      </div>
    </div>
  );
}
