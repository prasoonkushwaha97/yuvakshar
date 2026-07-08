"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
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
  Share2,
  Menu
} from "lucide-react";
import type { MagazineIssue } from "@/store/types";

export default function MagazineReaderPage() {
  const { issue } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { magazines } = useCms();
  
  const mag = magazines.find((m) => m.id === issue) as MagazineIssue;
  
  const initialPage = parseInt(searchParams.get("page") || "1", 10) - 1;
  const [currentPage, setCurrentPage] = useState(Math.max(0, initialPage));
  
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Restore progress on load
  useEffect(() => {
    if (mag) {
      const saved = localStorage.getItem(`yuvakshar_mag_${mag.id}`);
      if (saved && !searchParams.get("page")) {
        try {
          const progress = JSON.parse(saved);
          if (progress.page < mag.pages.length) {
            setCurrentPage(progress.page);
          }
        } catch (e) {}
      }
    }
  }, [mag, searchParams]);

  // Save progress on page change
  useEffect(() => {
    if (mag) {
      localStorage.setItem(`yuvakshar_mag_${mag.id}`, JSON.stringify({ page: currentPage, date: new Date().toISOString() }));
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

  const [[page, direction], setPage] = useState([currentPage, 0]);

  // Sync internal framer state with actual page state
  useEffect(() => {
    setPage((prev) => {
      const newDirection = currentPage > prev[0] ? 1 : -1;
      return [currentPage, newDirection];
    });
  }, [currentPage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNextPage();
      if (e.key === "ArrowLeft") handlePrevPage();
      if (e.key === "Escape") {
        if (showThumbnails) setShowThumbnails(false);
        else if (zoomLevel > 1) setZoomLevel(1);
        else router.back();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, mag, showThumbnails, zoomLevel]);

  if (!mag || !mag.pages || mag.pages.length === 0) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050505] text-white">
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
      opacity: 0,
      scale: 0.95
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      scale: 0.95
    })
  };

  const toggleControls = () => setShowControls(!showControls);

  const progressPercentage = ((currentPage + 1) / mag.pages.length) * 100;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[100] bg-[#050505] text-slate-200 overflow-hidden font-sans select-none touch-none">
      
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
              opacity: { duration: 0.3 },
              scale: { duration: 0.3 }
            }}
            drag={zoomLevel === 1 ? "x" : true}
            dragConstraints={zoomLevel === 1 ? { left: 0, right: 0 } : undefined}
            dragElastic={0.8}
            onDragEnd={zoomLevel === 1 ? handleDragEnd : undefined}
            className="absolute inset-0 flex items-center justify-center p-2 md:p-12"
          >
            <motion.img
              src={mag.pages[currentPage]}
              alt={`Page ${currentPage + 1}`}
              animate={{ scale: zoomLevel }}
              transition={{ type: "tween", duration: 0.2 }}
              className="max-w-full max-h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto origin-center cursor-grab active:cursor-grabbing bg-white rounded-sm"
              draggable={false}
              onClick={(e) => {
                e.stopPropagation();
                if (zoomLevel > 1) {
                  // If zoomed in, clicking doesn't toggle controls, it just allows panning
                } else {
                  toggleControls();
                }
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (zoomLevel === 1) zoomIn();
                else setZoomLevel(1);
              }}
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
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute top-0 inset-x-0 h-20 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between px-6 z-40 backdrop-blur-sm"
            >
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => router.back()}
                  className="p-3 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md bg-black/40 text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="hidden md:block text-white font-serif border-l border-white/20 pl-6">
                  <h1 className="font-bold text-xl leading-tight truncate max-w-[300px] lg:max-w-[500px]">{mag.issue}</h1>
                  {mag.edition && <p className="text-sm text-white/60 font-sans mt-0.5">{mag.edition}</p>}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button onClick={() => setShowThumbnails(true)} className="p-3 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md bg-black/40 text-white flex items-center gap-2" title="Table of Contents">
                  <Grid className="w-5 h-5" />
                  <span className="hidden md:inline text-sm font-bold">अनुक्रमणिका</span>
                </button>
                <div className="w-px h-6 bg-white/20 mx-2 hidden md:block"></div>
                <button onClick={zoomOut} disabled={zoomLevel <= 1} className="p-3 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md bg-black/40 disabled:opacity-30 text-white hidden md:block" title="Zoom Out">
                  <ZoomOut className="w-5 h-5" />
                </button>
                <button onClick={zoomIn} disabled={zoomLevel >= 3} className="p-3 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md bg-black/40 disabled:opacity-30 text-white hidden md:block" title="Zoom In">
                  <ZoomIn className="w-5 h-5" />
                </button>
                <button onClick={toggleFullscreen} className="p-3 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md bg-black/40 hidden md:block text-white" title="Fullscreen">
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>
              </div>
            </motion.div>

            {/* BOTTOM BAR (Progress & Nav) */}
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-20 pb-8 px-6 z-40 backdrop-blur-sm"
            >
              <div className="max-w-4xl mx-auto flex flex-col items-center">
                
                {/* Navigation Controls */}
                <div className="flex items-center justify-between w-full mb-6">
                  <button 
                    onClick={handlePrevPage} 
                    disabled={currentPage === 0}
                    className="p-4 hover:bg-white/20 rounded-full transition-all disabled:opacity-20 backdrop-blur-md bg-black/50 text-white group"
                  >
                    <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                  </button>
                  
                  <div className="text-center">
                    <div className="text-sm font-bold tracking-widest text-white/50 uppercase mb-1">
                      पृष्ठ (Page)
                    </div>
                    <div className="text-3xl font-black font-serif text-white">
                      {currentPage + 1} <span className="text-white/30 text-xl font-medium">/ {mag.pages.length}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={handleNextPage} 
                    disabled={currentPage === mag.pages.length - 1}
                    className="p-4 hover:bg-white/20 rounded-full transition-all disabled:opacity-20 backdrop-blur-md bg-black/50 text-white group"
                  >
                    <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden relative cursor-pointer group" onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const percentage = x / rect.width;
                  const newPage = Math.min(Math.max(0, Math.floor(percentage * mag.pages.length)), mag.pages.length - 1);
                  setCurrentPage(newPage);
                  setZoomLevel(1);
                }}>
                  <div 
                    className="absolute left-0 top-0 bottom-0 bg-primary transition-all duration-300 ease-out"
                    style={{ width: `${progressPercentage}%` }}
                  />
                  {/* Hover indicator */}
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </motion.div>
            
            {/* SIDE CLICK AREAS FOR EASY DESKTOP NAVIGATION */}
            <div 
              className="absolute left-0 top-20 bottom-32 w-[15%] hidden md:block cursor-[url('/cursor-left.png'),_w-resize] z-30 opacity-0"
              onClick={handlePrevPage}
            />
            <div 
              className="absolute right-0 top-20 bottom-32 w-[15%] hidden md:block cursor-[url('/cursor-right.png'),_e-resize] z-30 opacity-0"
              onClick={handleNextPage}
            />
          </>
        )}
      </AnimatePresence>

      {/* THUMBNAILS SIDEBAR (Table of Contents) */}
      <AnimatePresence>
        {showThumbnails && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowThumbnails(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute top-0 right-0 bottom-0 w-full max-w-sm bg-[#0A0A0A] border-l border-white/10 z-50 flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between sticky top-0 bg-[#0A0A0A]/90 backdrop-blur-md z-10">
                <h3 className="text-xl font-bold font-serif text-white flex items-center gap-3">
                  <Grid className="w-5 h-5 text-primary" /> सभी पृष्ठ (All Pages)
                </h3>
                <button 
                  onClick={() => setShowThumbnails(false)}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-4 custom-scrollbar">
                {mag.pages.map((pageImg, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      setCurrentPage(idx);
                      setZoomLevel(1);
                      setShowThumbnails(false);
                    }}
                    className={`cursor-pointer group rounded-sm overflow-hidden border-2 transition-all duration-300 relative aspect-[1/1.4] ${
                      currentPage === idx ? "border-primary shadow-[0_0_20px_rgba(234,88,12,0.4)] scale-105 z-10" : "border-transparent hover:border-white/30"
                    }`}
                  >
                    <Image 
                      src={pageImg} 
                      alt={`Thumbnail ${idx + 1}`} 
                      fill 
                      className={`object-cover ${currentPage === idx ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`} 
                      sizes="200px"
                    />
                    <div className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-center text-xs font-bold transition-opacity ${currentPage === idx ? 'opacity-100 text-primary' : 'opacity-0 group-hover:opacity-100 text-white'}`}>
                      पृष्ठ {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
