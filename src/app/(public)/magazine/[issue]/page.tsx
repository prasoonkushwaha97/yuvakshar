"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCms } from "@/store/CmsContext";
import { ArrowLeft, BookOpen, Download, Share2, Calendar, ChevronRight, PlayCircle, Layers, Unlock } from "lucide-react";
import { motion } from "framer-motion";
import type { MagazineIssue } from "@/store/types";

export default function MagazineIssueDetailsPage() {
  const { issue } = useParams();
  const router = useRouter();
  const { magazines } = useCms();
  const [mounted, setMounted] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const mag = magazines.find(m => m.id === issue) as MagazineIssue;

  if (!mounted) return null;

  if (!mag) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] dark:bg-[#050505] text-slate-900 dark:text-slate-100 font-sans">
        <h2 className="text-3xl font-black font-serif mb-6">अंक नहीं मिला (Issue Not Found)</h2>
        <Link href="/magazine" className="text-primary hover:underline flex items-center gap-2 font-bold bg-primary/10 px-6 py-3 rounded-full">
          <ArrowLeft className="w-5 h-5" /> ई-पत्रिका लाइब्रेरी पर लौटें
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
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#050505] text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/20 pb-20">
      
      {/* HEADER BREADCRUMBS */}
      <header className="pt-24 pb-8 px-6 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/50 dark:bg-[#0A0A0A]/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center gap-2 text-xs font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">
          <Link href="/magazine" className="hover:text-primary transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> लाइब्रेरी
          </Link>
          <ChevronRight className="w-3 h-3" />
          <Link href={`/magazine?category=${mag.category}`} className="hover:text-primary transition-colors">{mag.category || 'साहित्य'}</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-primary">{mag.issue}</span>
        </div>
      </header>

      {/* SPLIT LAYOUT HERO */}
      <main className="max-w-6xl mx-auto px-6 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          
          {/* LEFT: 3D Cover */}
          <motion.div 
            initial={{ opacity: 0, x: -30, rotateY: 15 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="lg:col-span-5 relative perspective-1000"
          >
            <div className="absolute inset-0 bg-primary/10 blur-[80px] rounded-full scale-90 z-0" />
            
            <div className="relative w-full max-w-[400px] mx-auto aspect-[1/1.4] rounded-sm overflow-hidden shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-white/20 dark:border-white/10 bg-slate-200 dark:bg-slate-800 z-10 group">
              <Image 
                src={mag.coverImage || "/placeholder-cover.jpg"} 
                alt={mag.issue} 
                className="w-full h-full object-cover transform-gpu group-hover:scale-105 transition-transform duration-700 ease-in-out" 
                fill 
                priority
                sizes="(max-width: 768px) 100vw, 400px"
              />
              {/* Magazine Spine Highlight */}
              <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-white/60 via-white/20 to-transparent z-20 mix-blend-overlay" />
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-20 pointer-events-none" />
            </div>

            {/* Quick Stats below cover */}
            <div className="mt-8 flex justify-center gap-8 text-slate-500 dark:text-slate-400 font-bold text-sm">
              <div className="flex flex-col items-center gap-1">
                <Layers className="w-5 h-5 text-slate-400" />
                <span>{mag.pages?.length || 0} पृष्ठ (Pages)</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <Calendar className="w-5 h-5 text-slate-400" />
                <span>{mag.publishDate ? new Date(mag.publishDate).toLocaleDateString('hi-IN', { year: 'numeric', month: 'long' }) : mag.month}</span>
              </div>
            </div>
          </motion.div>
          
          {/* RIGHT: Issue Metadata & Preview */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="lg:col-span-7 flex flex-col"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="text-xs font-bold text-primary tracking-widest uppercase bg-primary/10 px-3 py-1 rounded-full">
                {mag.category || 'साहित्य विशेषांक'}
              </div>
              {mag.accessLevel === "Premium" && (
                <div className="text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full flex items-center gap-1">
                  <Unlock className="w-3 h-3" /> प्रीमियम
                </div>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-serif text-slate-900 dark:text-white leading-[1.1] mb-2 tracking-tight">
              {mag.issue}
            </h1>
            {mag.edition && (
              <h2 className="text-2xl md:text-3xl font-medium text-slate-500 dark:text-slate-400 mb-6 font-serif">
                {mag.edition}
              </h2>
            )}

            <div className="w-12 h-1 bg-primary/30 rounded-full mb-6" />

            <div className="prose prose-lg dark:prose-invert prose-slate font-serif leading-relaxed mb-10 max-w-none text-slate-600 dark:text-slate-300">
              <p>{mag.description}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 items-center mb-16 pb-12 border-b border-slate-200 dark:border-slate-800">
              <Link 
                href={`/magazine/read/${mag.id}`} 
                className="group relative px-8 py-4 bg-primary text-white rounded-full font-bold flex items-center gap-3 hover:bg-primary/90 transition-all duration-300 shadow-[0_10px_30px_-10px_rgba(234,88,12,0.5)] flex-1 sm:flex-none justify-center"
              >
                <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="text-lg">अभी पढ़ें (Read Now)</span>
              </Link>
              
              {mag.pdfSourceUrl && (
                <a 
                  href={mag.pdfSourceUrl} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full font-bold flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-1 sm:flex-none justify-center"
                  download
                >
                  <Download className="w-5 h-5" /> PDF
                </a>
              )}
              
              <button 
                onClick={handleShare}
                className="px-6 py-4 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-full font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex-1 sm:flex-none justify-center"
              >
                <Share2 className="w-5 h-5" /> शेयर
              </button>
            </div>

            {/* Pages Preview (Table of Contents alternative) */}
            {mag.pages && mag.pages.length > 0 && (
              <div>
                <h3 className="text-xl font-black font-serif mb-6 flex items-center gap-2 text-slate-900 dark:text-white">
                  <BookOpen className="w-5 h-5 text-primary" /> इस अंक में (Inside this Issue)
                </h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                  {mag.pages.slice(0, 10).map((pageImg, idx) => (
                    <Link 
                      href={`/magazine/read/${mag.id}?page=${idx + 1}`} 
                      key={idx}
                      className="group block relative aspect-[1/1.4] bg-slate-100 dark:bg-slate-800 rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-700"
                    >
                      <Image 
                        src={pageImg} 
                        alt={`Page ${idx + 1}`} 
                        fill 
                        className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                        sizes="100px"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded">पृष्ठ {idx + 1}</span>
                      </div>
                    </Link>
                  ))}
                  {mag.pages.length > 10 && (
                    <Link 
                      href={`/magazine/read/${mag.id}?page=11`}
                      className="flex flex-col items-center justify-center aspect-[1/1.4] bg-slate-100 dark:bg-slate-800 rounded-sm shadow-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700 text-slate-500 font-bold text-sm"
                    >
                      <span>+{mag.pages.length - 10}</span>
                      <span>और पृष्ठ</span>
                    </Link>
                  )}
                </div>
              </div>
            )}
            
          </motion.div>
        </div>
      </main>

      {/* RELATED ISSUES */}
      {relatedIssues.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-12 mt-12">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black font-serif text-slate-900 dark:text-white">संबंधित संस्करण (Related)</h3>
            <Link href={`/magazine?category=${mag.category}`} className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              सभी देखें <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {relatedIssues.map(issue => (
              <Link href={`/magazine/${issue.id}`} key={issue.id} className="group block">
                <div className="relative aspect-[1/1.4] rounded-sm overflow-hidden mb-3 shadow-md border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
                  <Image src={issue.coverImage || "/placeholder-cover.jpg"} alt={issue.issue} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-r from-white/40 to-transparent z-10" />
                </div>
                <h4 className="font-bold font-serif text-slate-900 dark:text-white group-hover:text-primary transition-colors line-clamp-1">{issue.issue}</h4>
                <p className="text-xs text-slate-500 font-bold tracking-wider mt-1">{issue.month} {issue.year}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
