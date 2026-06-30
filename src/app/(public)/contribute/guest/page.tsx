"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, User, Mail, FileText, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { submitGuestArticle } from "@/lib/actions/contributeActions";

export default function GuestSubmissionPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRef.current) return;
    
    setIsSubmitting(true);
    setErrorMsg("");

    const formData = new FormData(formRef.current);
    const result = await submitGuestArticle(formData);

    if (result.error) {
      setErrorMsg(result.error);
      setIsSubmitting(false);
    } else {
      setIsSubmitted(true);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0F1D] text-[#1E1E1E] dark:text-slate-200 py-12 md:py-16">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link href="/contribute" className="inline-flex items-center text-sm font-hindi text-slate-500 hover:text-[#EA580C] transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            वापस जाएँ (Back)
          </Link>
        </div>

        {/* Header */}
        <div className="mb-10 text-center border-b border-[#E7E2D8] dark:border-slate-800 pb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-black font-hindi tracking-tight text-slate-900 dark:text-white mb-3">
            अतिथि लेख प्रेषित करें
          </h1>
          <p className="text-slate-600 dark:text-slate-400 font-hindi text-sm md:text-base">
            बिना खाता बनाए युवाक्षर के संपादकीय दल को अपना लेख भेजें।
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
              धन्यवाद! हमारे संपादकीय दल को आपका लेख प्राप्त हो गया है। समीक्षा के उपरांत हम आपको दिए गए ईमेल पते पर संपर्क करेंगे। इसमें 3-5 कार्य दिवस लग सकते हैं।
            </p>
            <Link 
              href="/"
              className="inline-flex items-center justify-center bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold py-3 px-8 rounded-xl hover:border-[#EA580C] hover:text-[#EA580C] transition-colors font-hindi"
            >
              मुखपृष्ठ पर जाएँ
            </Link>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="bg-white dark:bg-[#0D1527] border border-[#E7E2D8] dark:border-slate-800 p-8 md:p-10 rounded-2xl shadow-sm space-y-6">
            
            {errorMsg && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-hindi flex gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                {errorMsg}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-900 dark:text-white font-hindi">
                  पूरा नाम (Full Name) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    name="fullName"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E7E2D8] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#EA580C] focus:border-transparent outline-none transition-all font-hindi"
                    placeholder="अपना पूरा नाम दर्ज करें"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-900 dark:text-white font-hindi">
                  ईमेल पता (Email Address) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <input 
                    type="email" 
                    name="email"
                    required
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E7E2D8] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#EA580C] focus:border-transparent outline-none transition-all font-hindi"
                    placeholder="उदा. name@example.com"
                  />
                </div>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-900 dark:text-white font-hindi">
                लेख का शीर्षक (Article Title) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-slate-400" />
                </div>
                <input 
                  type="text" 
                  name="title"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#E7E2D8] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#EA580C] focus:border-transparent outline-none transition-all font-hindi font-serif"
                  placeholder="आकर्षक और सटीक शीर्षक लिखें"
                />
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
                rows={12}
                className="w-full p-4 rounded-xl border border-[#E7E2D8] dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-[#EA580C] focus:border-transparent outline-none transition-all font-hindi resize-y"
                placeholder="अपना लेख यहाँ लिखें या पेस्ट करें..."
              />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-hindi mt-1">
                सुझाव: सुनिश्चित करें कि आपका लेख हमारी संपादकीय नीतियों का पालन करता हो।
              </p>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-[#EA580C] text-white font-bold py-4 px-6 rounded-xl hover:bg-[#C2410C] disabled:bg-[#ea590c7e] disabled:cursor-not-allowed transition-colors font-hindi shadow-md hover:shadow-lg"
            >
              <Send className="w-5 h-5" />
              {isSubmitting ? "भेजा जा रहा है..." : "समीक्षा के लिए भेजें (Submit for Review)"}
            </button>
            
          </form>
        )}
      </div>
    </div>
  );
}
