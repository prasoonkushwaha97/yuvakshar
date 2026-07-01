"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookMarked, 
  Sparkles, 
  BrainCircuit, 
  Calendar, 
  FileText, 
  Trash2, 
  ArrowRight,
  Bookmark,
  CheckCircle,
  HelpCircle,
  Eye
} from "lucide-react";

import { Article } from "@/store/types";
import { useCms } from "@/store/CmsContext";
import GlassCard from "@/components/yuvakshar/GlassCard";

interface Flashcard {
  front: string;
  back: string;
  note: string;
  date: string;
  revealed?: boolean;
}

interface ConsolidatedNote {
  articleId: string;
  articleTitle: string;
  text: string;
  color: string;
  note: string;
  date: string;
}

export default function WorkspacePage() {
  const { articles } = useCms();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [notes, setNotes] = useState<ConsolidatedNote[]>([]);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<"notes" | "flashcards" | "schedule">("notes");
  const [revisionIndex, setRevisionIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    // Load flashcards
    const savedCards = null;
    if (savedCards) {
      setFlashcards(JSON.parse(savedCards));
    } else {
      // Default placeholder flashcards
      const defaults = [
        { front: "What is Digital Public Infrastructure (DPI)?", back: "Open-source, public-access networks (like UPI, ONDC, Aadhaar) that allow societal-scale interoperability.", note: "Default study card.", date: "May 28, 2026" },
        { front: "What defines Sovereign AI under the Indian lens?", back: "The administrative ability to train and run localized models in regional languages to secure cognitive autonomy.", note: "From Dr. Vikram Aditya's thesis.", date: "May 28, 2026" }
      ];
      setFlashcards(defaults);
      undefined;
    }

    // Consolidate highlights from all articles
    const compiledNotes: ConsolidatedNote[] = [];
    articles.forEach(art => {
      const savedHl = null;
      if (savedHl) {
        const highlightsList = JSON.parse(savedHl);
        highlightsList.forEach((hl: any) => {
          compiledNotes.push({
            articleId: art.id,
            articleTitle: art.title,
            text: hl.text,
            color: hl.color,
            note: hl.note,
            date: hl.date
          });
        });
      }
    });
    setNotes(compiledNotes);
  }, [articles]);

  const deleteFlashcard = (index: number) => {
    const updated = flashcards.filter((_, idx) => idx !== index);
    setFlashcards(updated);
    undefined;
  };

  const clearAllNotes = () => {
    if (confirm("Are you sure you want to clear your compiled highlights from all articles? This resets your study notes.")) {
      articles.forEach(art => {
        localStorage.removeItem(`yuvakshar_highlights_${art.id}`);
      });
      setNotes([]);
    }
  };

  const toggleCardReveal = (index: number) => {
    setFlashcards(prev => prev?.map((card, idx) => 
      idx === index ? { ...card, revealed: !card.revealed } : card
    ));
  };

  const highlightColorClasses: Record<string, string> = {
    yellow: "bg-[#EAB308]/10 border-[#EAB308]/30 text-[#EAB308]",
    blue: "bg-[#3B82F6]/10 border-[#3B82F6]/30 text-[#3B82F6]",
    red: "bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]",
    green: "bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]"
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 min-h-screen">
      {/* Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-yuvakshar-gold/15 pb-6 mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-gradient-gold font-bold">Active Learning Desk</h1>
          <p className="text-xs text-yuvakshar-gray uppercase tracking-wider mt-1">
            Review highlights, test memory with flashcards, and schedule revisions
          </p>
        </div>
        
        <div className="flex space-x-2">
          {notes.length > 0 && (
            <button
              onClick={clearAllNotes}
              className="px-4 py-2 border border-red-500/20 hover:border-red-500 bg-red-500/5 hover:bg-red-500/10 text-red-400 rounded-full text-xs font-bold transition-all cursor-pointer"
            >
              Reset Notes
            </button>
          )}
          <Link
            href="/current-affairs"
            className="px-4 py-2 bg-yuvakshar-gold text-yuvakshar-bg rounded-full text-xs font-bold hover:bg-white shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all cursor-pointer flex items-center space-x-1"
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>Open Reading Panel</span>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-yuvakshar-gold/10 pb-px mb-8 select-none overflow-x-auto">
        {(["notes", "flashcards", "schedule"] as const)?.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 text-xs font-bold tracking-wider uppercase border-b-2 transition-all cursor-pointer ${
              activeTab === tab
                ? "border-yuvakshar-gold text-yuvakshar-gold"
                : "border-transparent text-yuvakshar-gray hover:text-yuvakshar-text"
            }`}
          >
            {tab === "notes" ? "Compiled Notes" : tab === "flashcards" ? "Flashcards Deck" : "Revision Calendar"}
          </button>
        ))}
      </div>

      {/* Content Rendering */}
      <div className="space-y-6">
        
        {/* TAB 1: COMPILED NOTES */}
        {activeTab === "notes" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-4">
              <h2 className="text-sm font-serif text-yuvakshar-gold uppercase tracking-wider font-bold mb-4">Highlights Ledger</h2>
              
              {mounted && notes.length > 0 ? (
                notes?.map((note, idx) => (
                  <GlassCard key={idx} glow="none" className="p-5 border-l-4" style={{ borderLeftColor: note.color === "yellow" ? "#EAB308" : note.color === "blue" ? "#3B82F6" : note.color === "red" ? "#EF4444" : "#22C55E" }}>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] text-yuvakshar-gray">
                        <Link href="/admin" className="hover:text-yuvakshar-gold font-serif text-[11px] underline line-clamp-1 font-bold">
                          {note.articleTitle}
                        </Link>
                        <span>{note.date}</span>
                      </div>
                      
                      <p className="italic text-xs text-yuvakshar-text/90 leading-relaxed pl-3 border-l border-yuvakshar-gold/15">
                        "{note.text}"
                      </p>

                      {note.note && (
                        <p className="text-[11px] text-yuvakshar-gray font-light">
                          <span className="font-bold text-yuvakshar-gold">Annotation: </span>
                          {note.note}
                        </p>
                      )}
                    </div>
                  </GlassCard>
                ))
              ) : (
                <div className="text-center py-20 border border-yuvakshar-gold/10 rounded-2xl bg-yuvakshar-card/20 space-y-4">
                  <FileText className="w-12 h-12 text-yuvakshar-gold/25 mx-auto" />
                  <p className="text-sm text-yuvakshar-gray max-w-sm mx-auto font-light leading-relaxed">
                    You have no active highlights. Open the distraction-free reading portal of any article, highlight strategic sentences, and they will populate here.
                  </p>
                </div>
              )}
            </div>

            {/* Note compilation side advice */}
            <div className="lg:col-span-4 space-y-6">
              <GlassCard glow="gold">
                <div className="flex items-center space-x-2 text-yuvakshar-gold mb-3">
                  <BrainCircuit className="w-4.5 h-4.5" />
                  <h3 className="font-serif text-sm font-bold">Study Insights</h3>
                </div>
                <p className="text-xs text-yuvakshar-gray leading-relaxed font-light mb-4">
                  Studies show that active highlighting coupled with immediate annotation improves cognitive recall by 60%. To solidify your understanding:
                </p>
                <ul className="text-xs text-yuvakshar-text/90 space-y-2 list-disc list-inside">
                  <li>Use <span className="text-[#EAB308] font-bold">Yellow</span> for primary thematic arguments.</li>
                  <li>Use <span className="text-[#3B82F6] font-bold">Blue</span> for factual figures and records.</li>
                  <li>Use <span className="text-[#EF4444] font-bold">Red</span> for challenging concepts requiring revision.</li>
                  <li>Use <span className="text-[#22C55E] font-bold">Green</span> for quotes that support nation-building essays.</li>
                </ul>
              </GlassCard>
            </div>
          </div>
        )}

        {/* TAB 2: FLASHCARDS DECK */}
        {activeTab === "flashcards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mounted && flashcards.length > 0 ? (
              flashcards?.map((card, idx) => (
                <GlassCard key={idx} glow="gold" className="p-6 h-[260px] flex flex-col justify-between select-none">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-yuvakshar-gold/15 pb-2">
                      <span className="text-[9px] uppercase tracking-widest text-yuvakshar-gold font-bold">FLASHCARD {idx + 1}</span>
                      <button 
                        onClick={() => deleteFlashcard(idx)}
                        className="text-yuvakshar-gray hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="min-h-[100px] flex items-center justify-center text-center">
                      <AnimatePresence mode="wait">
                        {!card.revealed ? (
                          <motion.p 
                            key="front"
                            initial={{ opacity: 0, rotateY: 90 }}
                            animate={{ opacity: 1, rotateY: 0 }}
                            exit={{ opacity: 0, rotateY: -90 }}
                            className="text-xs font-serif font-bold text-yuvakshar-text leading-relaxed"
                          >
                            {card.front}
                          </motion.p>
                        ) : (
                          <motion.p 
                            key="back"
                            initial={{ opacity: 0, rotateY: 90 }}
                            animate={{ opacity: 1, rotateY: 0 }}
                            exit={{ opacity: 0, rotateY: -90 }}
                            className="text-xs font-light text-yuvakshar-gold leading-relaxed"
                          >
                            {card.back}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-yuvakshar-gold/10 pt-4">
                    <span className="text-[8px] text-yuvakshar-gray font-mono">{card.date}</span>
                    <button 
                      onClick={() => toggleCardReveal(idx)}
                      className="px-3 py-1 bg-yuvakshar-gold/10 hover:bg-yuvakshar-gold border border-yuvakshar-gold/25 hover:border-transparent text-yuvakshar-gold hover:text-yuvakshar-bg text-[9px] font-bold tracking-wider uppercase rounded transition-all cursor-pointer flex items-center space-x-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>{card.revealed ? "Hide Answer" : "Reveal Answer"}</span>
                    </button>
                  </div>
                </GlassCard>
              ))
            ) : (
              <div className="col-span-full text-center py-20 border border-yuvakshar-gold/10 rounded-2xl bg-yuvakshar-card/20 space-y-4">
                <BrainCircuit className="w-12 h-12 text-yuvakshar-gold/25 mx-auto" />
                <p className="text-sm text-yuvakshar-gray max-w-sm mx-auto font-light leading-relaxed">
                  No flashcards created yet. Go to your notes panel or highlight articles, then click "Compile to Flashcards" to populate this workspace.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: REVISION CALENDAR */}
        {activeTab === "schedule" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-4">
              <h2 className="text-sm font-serif text-gradient-gold uppercase tracking-wider font-bold mb-4">Revision Milestones</h2>
              
              <div className="space-y-3">
                {[
                  { title: "Review 'AI & Sovereign Statecraft'", date: "Today", difficulty: "Medium", desc: "Highlight check: 8 key definitions saved." },
                  { title: "Study 'Demographic Arbitrage Reforms'", date: "Tomorrow", difficulty: "High", desc: "Analyze Prof. Raghavan's statistics on structural engineering hubs." },
                  { title: "Weekly Magazine MCQ Assessment", date: "May 31, 2026", difficulty: "Medium", desc: "Covers trade corridors and Indo-Pacific ocean sovereignty indices." }
                ]?.map((item, idx) => (
                  <GlassCard key={idx} glow="none" className="p-5 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-3.5 h-3.5 text-yuvakshar-gold" />
                        <span className="text-xs font-bold text-yuvakshar-text">{item.title}</span>
                      </div>
                      <p className="text-[10px] text-yuvakshar-gray font-light">{item.desc}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] uppercase tracking-wider text-yuvakshar-gold bg-yuvakshar-gold/15 border border-yuvakshar-gold/30 px-2.5 py-0.5 rounded-full font-bold">
                        {item.date}
                      </span>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <GlassCard glow="gold">
                <h3 className="font-serif text-sm font-bold text-gradient-gold mb-3">Structured Revision Goals</h3>
                <p className="text-xs text-yuvakshar-gray leading-relaxed font-light mb-4">
                  Maintain active recall on strategic concepts to build a solid intellectual foundation. The platform automatically flags revision milestones based on spaced repetition indices.
                </p>
                <div className="p-3 bg-yuvakshar-bg border border-yuvakshar-gold/10 rounded-lg flex justify-between items-center text-xs">
                  <span>Current Study Habit Index</span>
                  <span className="font-bold text-yuvakshar-gold">Excel (88%)</span>
                </div>
              </GlassCard>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
