"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCms } from "@/store/CmsContext";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  Grid,
  X,
  Share2
} from "lucide-react";
import type { MagazineIssue } from "@/store/types";

export default function MagazineReaderPage() {
  const { issue } = useParams();
  const router = useRouter();
  const { magazines } = useCms();
  
  const mag = magazines.find((m) => m.id === issue) as MagazineIssue;
  
  const [currentPage, setCurrentPage] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Restore progress on load
  useEffect(() => {
    if (mag) {
      const saved = localStorage.getItem("yuvakshar_mag_progress");
      if (saved) {
        try {
          const progress = JSON.parse(saved);
          if (progress.issueId === mag.id && progress.page < mag.pages.length) {
            setCurrentPage(progress.page);
          }
        } catch (e) {}
      }
    }
  }, [mag]);

  // Save progress on page change
  useEffect(() => {
    if (mag) {
      const percentage = Math.round(((currentPage + 1) / mag.pages.length) * 100);
      localStorage.setItem("yuvakshar_mag_progress", JSON.stringify({
        issueId: mag.id,
        page: currentPage,
        percentage
      }));
    }
  }, [currentPage, mag]);

  // Fullscreen handling
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  if (!mag || !mag.pages || mag.pages.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#070B14] text-white">
        <h2 className="text-2xl font-bold font-serif mb-4">अंक पढ़ने के लिए उपलब्ध नहीं है</h2>
        <button onClick={() => router.back()} className="text-primary hover:underline flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> वापस जाएँ
        </button>
      </div>
    );
  }

  const handleNextPage = () => {
    if (currentPage < mag.pages.length - 1) {
      setCurrentPage((p) => p + 1);
      setZoomLevel(1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1);
      setZoomLevel(1);
    }
  };

  const zoomIn = () => setZoomLevel((z) => Math.min(z + 0.5, 3));
  const zoomOut = () => setZoomLevel((z) => Math.max(z - 0.5, 1));
  const resetZoom = () => setZoomLevel(1);

  // Swipe handlers for motion.div
  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = Math.abs(offset.x) * velocity.x;
    if (swipe < -100) {
      handleNextPage();
    } else if (swipe > 100) {
      handlePrevPage();
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const [[page, direction], setPage] = useState([currentPage, 0]);

  // Sync internal framer state with actual page state
  useEffect(() => {
    setPage((prev) => {
      const newDirection = currentPage > prev[0] ? 1 : -1;
      return [currentPage, newDirection];
    });
  }, [currentPage]);

  const toggleControls = () => setShowControls(!showControls);

  return (
    <div ref={containerRef} className="h-screen w-full bg-[#070B14] text-slate-200 overflow-hidden relative font-hindi select-none touch-none">
      
      {/* READER CONTENT (The Page Image) */}
      <div 
        className="absolute inset-0 flex items-center justify-center cursor-pointer"
        onClick={toggleControls}
      >
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag={zoomLevel === 1 ? "x" : true}
            dragConstraints={zoomLevel === 1 ? { left: 0, right: 0 } : undefined}
            dragElastic={1}
            onDragEnd={zoomLevel === 1 ? handleDragEnd : undefined}
            className="absolute inset-0 flex items-center justify-center p-4 md:p-8"
          >
            <motion.img
              src={mag.pages[currentPage]}
              alt={`Page ${currentPage + 1}`}
              animate={{ scale: zoomLevel }}
              transition={{ type: "tween", duration: 0.2 }}
              className="max-w-full max-h-full object-contain drop-shadow-2xl rounded-sm pointer-events-auto origin-center cursor-grab active:cursor-grabbing"
              draggable={false}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* OVERLAY CONTROLS */}
      <AnimatePresence>
        {showControls && (
          <>
            {/* TOP BAR */}
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between px-4 md:px-6 z-50 backdrop-blur-sm"
            >
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => router.back()}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md bg-black/20"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div className="hidden md:block text-white font-serif">
                  <h1 className="font-bold text-lg leading-tight truncate max-w-[200px] lg:max-w-[400px]">{mag.issue}</h1>
                  {mag.edition && <p className="text-xs text-white/60">{mag.edition}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => setShowThumbnails(true)} className="p-2 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md bg-black/20 text-white" title="All Pages">
                  <Grid className="w-5 h-5" />
                </button>
                <button onClick={zoomOut} disabled={zoomLevel <= 1} className="p-2 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md bg-black/20 disabled:opacity-30 text-white" title="Zoom Out">
                  <ZoomOut className="w-5 h-5" />
                </button>
                <button onClick={zoomIn} disabled={zoomLevel >= 3} className="p-2 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md bg-black/20 disabled:opacity-30 text-white" title="Zoom In">
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button onClick={toggleFullscreen} className="p-2 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md bg-black/20 hidden md:block text-white" title="Fullscreen">
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
                <button onClick={() => {
                   if (navigator.share) {
                     navigator.share({ title: mag.issue, url: window.location.href });
                   } else {
                     navigator.clipboard.writeText(window.location.href);
                     alert("लिंक कॉपी कर लिया गया है!");
                   }
                }} className="p-2 hover:bg-white/10 rounded-full transition-colors backdrop-blur-md bg-black/20 text-white" title="Share">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </motion.div>

            {/* BOTTOM BAR (Progress & Nav) */}
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end px-4 md:px-8 pb-4 md:pb-6 z-50 backdrop-blur-sm"
            >
              <div className="flex items-center justify-between gap-4 w-full max-w-3xl mx-auto">
                <button 
                  onClick={handlePrevPage} 
                  disabled={currentPage === 0}
                  className="p-3 hover:bg-white/10 rounded-full transition-colors disabled:opacity-20 backdrop-blur-md bg-black/40 text-white"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <div className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-white/80 font-medium text-sm tracking-widest font-mono">
                    {currentPage + 1} / {mag.pages.length}
                  </div>
                  {/* Scrubber / Progress bar */}
                  <div className="w-full relative h-1.5 bg-white/20 rounded-full cursor-pointer group" onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percentage = x / rect.width;
                    const newPage = Math.max(0, Math.min(mag.pages.length - 1, Math.floor(percentage * mag.pages.length)));
                    setCurrentPage(newPage);
                    setZoomLevel(1);
                  }}>
                    <div 
                      className="absolute top-0 left-0 bottom-0 bg-primary rounded-full transition-all duration-300" 
                      style={{ width: `${((currentPage + 1) / mag.pages.length) * 100}%` }}
                    />
                    <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{ left: `calc(${((currentPage + 1) / mag.pages.length) * 100}% - 6px)` }} />
                  </div>
                </div>

                <button 
                  onClick={handleNextPage} 
                  disabled={currentPage === mag.pages.length - 1}
                  className="p-3 hover:bg-white/10 rounded-full transition-colors disabled:opacity-20 backdrop-blur-md bg-black/40 text-white"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* THUMBNAILS DRAWER */}
      <AnimatePresence>
        {showThumbnails && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="absolute bottom-0 inset-x-0 h-[60vh] bg-[#0F1420]/95 backdrop-blur-xl border-t border-white/10 z-[100] flex flex-col rounded-t-3xl shadow-2xl"
          >
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-white font-bold font-serif text-lg">सभी पृष्ठ</h3>
              <button onClick={() => setShowThumbnails(false)} className="p-2 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 custom-scrollbar">
              {mag.pages.map((p, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    setCurrentPage(idx);
                    setZoomLevel(1);
                    setShowThumbnails(false);
                  }}
                  className={`relative aspect-[3/4] rounded-md overflow-hidden cursor-pointer border-2 transition-all hover:scale-105 ${currentPage === idx ? "border-primary shadow-lg shadow-primary/30" : "border-transparent opacity-60 hover:opacity-100"}`}
                >
                  <img src={p} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] text-center py-1 font-mono">
                    {idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
