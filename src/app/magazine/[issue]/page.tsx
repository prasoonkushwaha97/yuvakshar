"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCms } from "@/store/CmsContext";
import { ArrowLeft, BookOpen, Download, Share2, Star, Calendar, FileText, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import type { MagazineIssue } from "@/store/types";

export default function MagazineIssueDetailsPage() {
  const { issue } = useParams();
  const router = useRouter();
  const { magazines } = useCms();
  
  const mag = magazines.find(m => m.id === issue) as MagazineIssue;
  
  const [isSharing, setIsSharing] = useState(false);

  if (!mag) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-[#070B14] text-slate-900 dark:text-slate-100 font-hindi">
        <h2 className="text-2xl font-bold font-serif mb-4">अंक नहीं मिला</h2>
        <Link href="/magazine" className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> ई-पत्रिका होम पर लौटें
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    setIsSharing(true);
    if (navigator.share) {
      navigator.share({
        title: `युवाक्षर ई-पत्रिका: ${mag.issue}`,
        text: mag.description,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("लिंक कॉपी कर लिया गया है!");
    }
    setTimeout(() => setIsSharing(false), 1000);
  };

  const relatedIssues = magazines.filter(m => m.category === mag.category && m.id !== mag.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FDFDFD] dark:bg-[#070B14] text-slate-900 dark:text-slate-100 font-hindi selection:bg-primary/20 pb-20">
      
      {/* HEADER */}
      <header className="pt-24 pb-8 px-6 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium">
          <Link href="/magazine" className="hover:text-primary transition-colors">ई-पत्रिका</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/magazine?category=${mag.category}`} className="hover:text-primary transition-colors">{mag.category}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-slate-900 dark:text-slate-200">{mag.issue}</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        
        {/* DETAILS SECTION */}
        <div className="flex flex-col md:flex-row gap-12 lg:gap-20">
          
          {/* COVER */}
          <div className="w-full md:w-1/3 shrink-0 flex justify-center md:justify-start">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative w-full max-w-[320px] aspect-[3/4] shadow-2xl rounded-sm overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900"
            >
              <img src={mag.coverImage} alt={mag.issue} className="w-full h-full object-cover" />
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-r from-white/40 to-transparent" />
            </motion.div>
          </div>
          
          {/* INFO */}
          <div className="w-full md:w-2/3 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold tracking-widest uppercase mb-4 border border-slate-200 dark:border-slate-700">
                {mag.category}
              </div>
              
              <h1 className="text-4xl md:text-5xl font-black font-serif text-slate-900 dark:text-white leading-tight mb-2">
                {mag.issue}
              </h1>
              {mag.edition && (
                <p className="text-2xl text-primary font-serif mb-4">{mag.edition}</p>
              )}
              
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400 mb-8 font-medium">
                <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {mag.month} {mag.year}</span>
                <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> {mag.pages?.length || 0} पृष्ठ</span>
                <span className="flex items-center gap-2"><Star className="w-4 h-4 text-amber-500 fill-amber-500" /> {mag.isFeatured ? "Featured" : mag.accessLevel}</span>
              </div>
              
              <div className="prose prose-slate dark:prose-invert prose-lg font-serif leading-relaxed text-slate-700 dark:text-slate-300">
                <p>{mag.description}</p>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="pt-8 flex flex-wrap gap-4 border-t border-slate-200 dark:border-slate-800"
            >
              <Link href={`/magazine/read/${mag.id}`} className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/25">
                <BookOpen className="w-5 h-5" />
                ऑनलाइन पढ़ें
              </Link>
              
              {mag.pdfSourceUrl && (
                <a href={mag.pdfSourceUrl} download target="_blank" rel="noopener noreferrer" className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 px-6 py-4 rounded-xl font-bold flex items-center gap-2 transition-transform hover:scale-105 shadow-md">
                  <Download className="w-5 h-5" />
                  PDF
                </a>
              )}
              
              <button onClick={handleShare} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-6 py-4 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm ml-auto md:ml-0">
                <Share2 className="w-5 h-5" />
                शेयर करें
              </button>
            </motion.div>
          </div>
          
        </div>
        
        {/* RELATED ISSUES */}
        {relatedIssues.length > 0 && (
          <div className="mt-24 pt-12 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-2xl font-bold font-serif mb-8 flex items-center gap-2">
              <span className="w-1.5 h-6 bg-primary rounded-full block"></span>
              इसी श्रेणी के अन्य अंक
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedIssues.map(related => (
                <Link key={related.id} href={`/magazine/${related.id}`} className="group block">
                  <div className="relative rounded-sm overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 mb-4 bg-slate-100 dark:bg-slate-800 aspect-[3/4]">
                    <img src={related.coverImage} alt={related.issue} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white text-slate-900 px-3 py-1.5 rounded-full font-bold text-xs flex items-center gap-1">
                        <BookOpen className="w-3 h-3" /> विवरण
                      </span>
                    </div>
                  </div>
                  <h4 className="font-bold font-serif text-slate-900 dark:text-white group-hover:text-primary transition-colors text-base">
                    {related.issue}
                  </h4>
                  <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">{related.month} {related.year}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
        
      </main>
    </div>
  );
}
