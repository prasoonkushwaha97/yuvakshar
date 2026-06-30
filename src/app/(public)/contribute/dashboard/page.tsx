import React from "react";
import Link from "next/link";
import { Plus, Clock, FileText, CheckCircle2, AlertCircle, Edit3, ArrowLeft } from "lucide-react";
import { getContributorSubmissions } from "@/lib/actions/contributeActions";

export default async function ContributorDashboard() {
  const { submissions, error } = await getContributorSubmissions();
  
  const subs = submissions || [];

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    switch(s) {
      case "draft": return <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-md text-[10px] font-bold uppercase font-hindi">ड्राफ्ट (Draft)</span>;
      case "submitted": return <span className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md text-[10px] font-bold uppercase font-hindi">प्रेषित (Submitted)</span>;
      case "under_review": return <span className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-md text-[10px] font-bold uppercase font-hindi">समीक्षाधीन (Under Review)</span>;
      case "revision_requested": return <span className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1 font-hindi"><AlertCircle className="w-3 h-3"/> संशोधन आवश्यक (Revision Needed)</span>;
      case "accepted": return <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 rounded-md text-[10px] font-bold uppercase font-hindi">स्वीकृत (Accepted)</span>;
      case "published": return <span className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-md text-[10px] font-bold uppercase flex items-center gap-1 font-hindi"><CheckCircle2 className="w-3 h-3"/> प्रकाशित (Published)</span>;
      case "rejected": return <span className="bg-slate-800 dark:bg-slate-700 text-white px-2 py-1 rounded-md text-[10px] font-bold uppercase font-hindi">अस्वीकृत (Declined)</span>;
      default: return <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 px-2 py-1 rounded-md text-[10px] font-bold uppercase font-hindi">{status}</span>;
    }
  };

  const totalSubs = subs.length;
  const publishedSubs = subs.filter(s => s.status?.toLowerCase() === "published").length;
  const underReviewSubs = subs.filter(s => s.status?.toLowerCase() === "under_review" || s.status?.toLowerCase() === "submitted").length;
  const actionRequiredSubs = subs.filter(s => s.status?.toLowerCase() === "revision_requested").length;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0F1D] text-[#1E1E1E] dark:text-slate-200 py-8 md:py-12">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link href="/contribute" className="inline-flex items-center text-sm font-hindi text-slate-500 hover:text-[#EA580C] transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            वापस जाएँ (Back)
          </Link>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#E7E2D8] dark:border-slate-800 pb-8 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-black font-hindi tracking-tight text-slate-900 dark:text-white">
              लेखक कार्यक्षेत्र
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2 font-hindi text-sm md:text-base">
              अपने ड्राफ्ट प्रबंधित करें और संपादकीय प्रगति को ट्रैक करें
            </p>
          </div>
          <Link 
            href="/contribute/new"
            className="inline-flex items-center gap-2 bg-[#EA580C] text-white font-bold py-3 px-6 rounded-xl hover:bg-[#C2410C] transition-colors font-hindi shadow-sm"
          >
            <Plus className="w-5 h-5" /> नया लेख प्रेषित करें
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-hindi flex gap-2 mb-8">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Metrics / Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          <div className="bg-white dark:bg-[#0D1527] p-6 rounded-2xl border border-[#E7E2D8] dark:border-slate-800 shadow-sm hover:border-[#EA580C]/30 transition-colors">
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 font-hindi">कुल प्रविष्टियाँ</p>
            <p className="text-4xl font-black text-slate-900 dark:text-white font-serif">{totalSubs}</p>
          </div>
          <div className="bg-emerald-50/50 dark:bg-emerald-950/10 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 shadow-sm">
            <p className="text-emerald-700 dark:text-emerald-400 text-sm font-medium mb-1 font-hindi">प्रकाशित</p>
            <p className="text-4xl font-black text-emerald-700 dark:text-emerald-400 font-serif">{publishedSubs}</p>
          </div>
          <div className="bg-amber-50/50 dark:bg-amber-950/10 p-6 rounded-2xl border border-amber-100 dark:border-amber-900/30 shadow-sm">
            <p className="text-amber-700 dark:text-amber-400 text-sm font-medium mb-1 font-hindi">समीक्षाधीन</p>
            <p className="text-4xl font-black text-amber-700 dark:text-amber-400 font-serif">{underReviewSubs}</p>
          </div>
          <div className="bg-red-50/50 dark:bg-red-950/10 p-6 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm">
            <p className="text-red-700 dark:text-red-400 text-sm font-medium mb-1 font-hindi">कार्रवाई आवश्यक</p>
            <p className="text-4xl font-black text-red-700 dark:text-red-400 font-serif">{actionRequiredSubs}</p>
          </div>
        </div>

        {/* Submissions List */}
        <div className="bg-white dark:bg-[#0D1527] border border-[#E7E2D8] dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-[#E7E2D8] dark:border-slate-800 bg-slate-50/50 dark:bg-[#0A0F1D]/50">
             <h3 className="font-bold text-slate-900 dark:text-white font-hindi font-serif text-xl">
               हाल की प्रविष्टियाँ
             </h3>
          </div>
          
          <div className="divide-y divide-[#E7E2D8] dark:divide-slate-800/80">
            {subs.length === 0 ? (
              <div className="p-16 text-center flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-6 border border-[#E7E2D8] dark:border-slate-700">
                  <FileText className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-2xl font-bold font-serif text-slate-900 dark:text-white mb-3 font-hindi">
                  अभी तक कोई लेख नहीं
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 font-hindi leading-relaxed">
                  आपने अभी तक कोई लेख प्रस्तुत नहीं किया है। लिखना शुरू करें और अपनी कहानी दुनिया के साथ साझा करें।
                </p>
                <Link 
                  href="/contribute/new"
                  className="inline-flex items-center gap-2 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold py-3 px-8 rounded-xl hover:border-[#EA580C] hover:text-[#EA580C] transition-colors font-hindi"
                >
                  <Plus className="w-4 h-4" /> लिखना शुरू करें
                </Link>
              </div>
            ) : (
              subs.map((sub: any) => (
                <div key={sub.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                   
                   <div className="flex-1">
                     <div className="flex items-center gap-3 mb-2.5">
                       {getStatusBadge(sub.status)}
                       <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                         <Clock className="w-3 h-3" /> {new Date(sub.updated_at).toLocaleDateString("hi-IN")}
                       </span>
                     </div>
                     <h4 className="text-lg md:text-xl font-bold font-serif text-slate-900 dark:text-white line-clamp-1 font-hindi">
                       {sub.title || sub.english_title || "बिना शीर्षक"}
                     </h4>
                   </div>

                   <div className="flex flex-wrap items-center gap-4">
                     <Link 
                       href={`/contribute/submission/${sub.id}`}
                       className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#0A0F1D] border border-[#E7E2D8] dark:border-slate-700 hover:border-[#EA580C] dark:hover:border-[#EA580C] hover:text-[#EA580C] dark:hover:text-[#EA580C] rounded-xl text-sm font-bold transition-colors font-hindi"
                     >
                       {sub.status?.toLowerCase() === "revision_requested" || sub.status?.toLowerCase() === "draft" ? (
                         <><Edit3 className="w-4 h-4" /> संपादित करें (Edit)</>
                       ) : (
                         <><FileText className="w-4 h-4" /> विवरण देखें (View)</>
                       )}
                     </Link>
                   </div>
                </div>
              ))
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
}
