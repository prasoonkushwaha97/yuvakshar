"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LEGAL } from "@/config/legal";
import { useCms } from "@/store/CmsContext";
import { ShieldCheck, ArrowRight, BookOpen, Lock } from "lucide-react";
import confetti from "canvas-confetti";

export default function TermsAcceptancePage() {
  const router = useRouter();
  const { currentUser, updateUserProfile } = useCms();
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!accepted || !currentUser) return;
    
    setIsSubmitting(true);
    
    // Update DB through CmsContext
    await updateUserProfile({
      terms_accepted: true,
      terms_accepted_at: new Date().toISOString(),
      terms_version: LEGAL.TERMS_VERSION,
      privacy_version: LEGAL.PRIVACY_VERSION
    });
    
    setIsSubmitting(false);
    
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    
    setTimeout(() => {
      // Redirect to the dashboard
      router.push("/admin");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <img 
            src="/yuvakshar_logo_official.png" 
            alt="युवाक्षर" 
            className="h-12 w-auto drop-shadow-sm"
            onError={(e) => { (e.target as HTMLImageElement).src = "/yuvakshar_logo.jpg"; }}
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold font-serif text-slate-900 dark:text-white">
          सेवा की शर्तें अपडेट
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400 font-sans">
          आगे बढ़ने के लिए कृपया हमारी नई नीतियों को स्वीकार करें।
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[560px]">
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow-xl shadow-primary/5 sm:rounded-3xl sm:px-10 border border-slate-200 dark:border-slate-800">
          
          <div className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-500/10 rounded-2xl p-4 border border-amber-200 dark:border-amber-500/20">
              <h3 className="font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5" />
                महत्वपूर्ण अपडेट
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                हमने अपनी सेवा की शर्तों (v1) और गोपनीयता नीति (v1) को अपडेट किया है। युवाक्षर का उपयोग जारी रखने के लिए आपको इन शर्तों से सहमत होना होगा।
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <a 
                href="/terms-and-conditions" 
                target="_blank" 
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <div className="bg-primary/10 p-2 rounded-lg text-primary"><BookOpen className="w-5 h-5" /></div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200">सेवा की शर्तें</h4>
                  <p className="text-xs text-slate-500">नियम और उपयोग की शर्तें पढ़ें</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </a>
              
              <a 
                href="/privacy-policy" 
                target="_blank" 
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <div className="bg-primary/10 p-2 rounded-lg text-primary"><Lock className="w-5 h-5" /></div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800 dark:text-slate-200">गोपनीयता नीति</h4>
                  <p className="text-xs text-slate-500">डेटा उपयोग और आपकी गोपनीयता</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </a>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="w-5 h-5 accent-primary rounded border-slate-300 dark:border-slate-600 focus:ring-primary"
                  />
                </div>
                <div className="text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    मैं सेवा की शर्तें एवं गोपनीयता नीति पढ़ चुका/चुकी हूँ तथा उनसे सहमत हूँ।
                  </span>
                </div>
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!accepted || isSubmitting}
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isSubmitting ? "सहेजा जा रहा है..." : "जारी रखें"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
