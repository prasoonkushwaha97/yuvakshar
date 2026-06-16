"use client";

import { useEffect } from "react";
import { useCms } from "@/store/CmsContext";
import { useRouter, useSearchParams } from "next/navigation";

import { Suspense } from "react";

function LoginContent() {
  const { currentUser, openAuthModal } = useCms();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (currentUser) {
      const redirectTo = searchParams.get("redirect_to") || "/";
      window.location.href = redirectTo;
    } else {
      openAuthModal(undefined, "कृपया आगे बढ़ने के लिए लॉगिन करें।");
    }
  }, [currentUser, openAuthModal, router, searchParams]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1D] flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold font-serif mb-4">प्रमाणीकरण आवश्यक</h1>
        <p className="text-slate-500 mb-6">लॉगिन विंडो खोली जा रही है...</p>
        <button 
          onClick={() => openAuthModal(undefined, "कृपया आगे बढ़ने के लिए लॉगिन करें।")}
          className="bg-primary text-white px-6 py-2 rounded-xl font-bold transition-all hover:bg-primary/90 cursor-pointer"
        >
          लॉगिन करें
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1D] flex items-center justify-center">
        <p>लोड हो रहा है...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
