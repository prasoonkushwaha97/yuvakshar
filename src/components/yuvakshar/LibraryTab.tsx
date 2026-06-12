"use client";

import React, { useState } from "react";
import { BookMarked, BookOpen, Trash2 } from "lucide-react";
import { useCms, Profile } from "@/store/CmsContext";
import GlassCard from "@/components/yuvakshar/GlassCard";

interface LibraryTabProps {
  currentUser: Profile;
}

export default function LibraryTab({ currentUser }: LibraryTabProps) {
  const cms = useCms();

  const stats = {
    readCount: currentUser?.articlesReadCount || 14,
    readTime: currentUser?.totalReadingTime || 150, // in minutes
    exploreCount: Object.keys(currentUser?.categoryStats || {}).length || 4
  };

  const mockMags = cms.magazines.slice(0, 3).map((m, idx) => ({
    ...m,
    progress: idx === 0 ? 80 : idx === 1 ? 40 : 100
  }));

  const savedNotesKey = `yuvakshar_notes_${currentUser?.id || "anonymous"}`;
  
  const getNotes = (): Array<{ id: string; title: string; content: string; date: string }> => {
    if (typeof window === "undefined") return [];
    const val = localStorage.getItem(savedNotesKey);
    if (val) {
      return JSON.parse(val);
    } else {
      const defaultNotes = [
        { id: "n1", title: "डिजिटल संप्रभुता पर टिप्पणी", content: "भारत के सुपरकंप्यूटिंग मिशन में परम रुद्र का योगदान अत्यंत महत्वपूर्ण है। यह अनुसंधान क्षेत्रों में देश को स्वतंत्र बनाता है।", date: "११ जून २०२६" },
        { id: "n2", title: "राष्ट्रीय शिक्षा नीति चिंतन", content: "मातृभाषा में शिक्षण न केवल सांस्कृतिक गौरव बढ़ाता है बल्कि छात्रों के संज्ञानात्मक (cognitive) विकास को भी सुगम बनाता है।", date: "१० जून २०२६" }
      ];
      localStorage.setItem(savedNotesKey, JSON.stringify(defaultNotes));
      return defaultNotes;
    }
  };

  const [notes, setNotes] = useState(getNotes());

  const deleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    localStorage.setItem(savedNotesKey, JSON.stringify(updated));
    alert("नोट सफलतापूर्वक हटा दिया गया है!");
  };

  return (
    <div className="space-y-6">
      {/* Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <GlassCard glow="none" className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-xl font-bold">📖</div>
          <div>
            <span className="text-[10px] text-slate-400 block font-serif">कुल पढ़े गए आलेख</span>
            <span className="text-lg font-bold font-serif text-slate-800 dark:text-white">{stats.readCount} लेख</span>
          </div>
        </GlassCard>
        <GlassCard glow="none" className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500 text-xl font-bold">⏱️</div>
          <div>
            <span className="text-[10px] text-slate-400 block font-serif">कुल स्वाध्याय समय</span>
            <span className="text-lg font-bold font-serif text-slate-800 dark:text-white">{Math.round(stats.readTime / 60)} घंटे {stats.readTime % 60} मिनट</span>
          </div>
        </GlassCard>
        <GlassCard glow="none" className="p-4 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500 text-xl font-bold">🧠</div>
          <div>
            <span className="text-[10px] text-slate-400 block font-serif">रुचि क्षेत्र श्रेणियां</span>
            <span className="text-lg font-bold font-serif text-slate-800 dark:text-white">{stats.exploreCount} श्रेणियां</span>
          </div>
        </GlassCard>
      </div>

      {/* Magazines Progress Grid */}
      <div className="space-y-4">
        <h3 className="font-serif font-bold text-slate-800 dark:text-white text-xs border-l-2 border-primary pl-2">पत्रिकाएं पठन प्रगति (Magazine Reading Progress)</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockMags.length > 0 ? (
            mockMags.map(m => (
              <GlassCard key={m.id} glow="none" className="p-4 flex flex-col justify-between space-y-4">
                <div className="flex gap-4">
                  <img 
                    src={m.coverImage || "/yuvakshar_logo.jpg"} 
                    alt={m.issue} 
                    className="w-16 h-20 object-cover rounded-lg shadow border border-slate-205 dark:border-slate-800 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/yuvakshar_logo.jpg";
                    }}
                  />
                  <div className="space-y-1 font-serif text-xs">
                    <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold font-serif">{m.month || "विशेष अंक"}</span>
                    <h4 className="font-serif font-bold text-xs text-slate-800 dark:text-white leading-tight line-clamp-2">{m.issue}</h4>
                    <p className="text-[10px] text-slate-400 font-sans line-clamp-1">{m.description || "युवाक्षर ई-पत्रिका"}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[9px] text-slate-400 font-sans">
                    <span>पठन प्रगति</span>
                    <span>{m.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${m.progress}%` }} />
                  </div>
                </div>
              </GlassCard>
            ))
          ) : (
            <div className="col-span-3 text-center py-6 text-slate-400 text-xs font-serif">कोई पत्रिका उपलब्ध नहीं है।</div>
          )}
        </div>
      </div>

      {/* Saved Notes Section */}
      <div className="space-y-4">
        <h3 className="font-serif font-bold text-slate-800 dark:text-white text-xs border-l-2 border-primary pl-2">स्वाध्याय नोट्स (My Study Notes)</h3>
        
        {notes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {notes.map(n => (
              <GlassCard key={n.id} glow="none" className="p-5 relative space-y-3 font-serif text-xs bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800">
                <div className="flex justify-between items-start gap-4">
                  <h4 className="font-bold text-slate-800 dark:text-white text-xs leading-tight">{n.title}</h4>
                  <span className="text-[9px] text-slate-400 font-sans shrink-0">{n.date}</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">{n.content}</p>
                <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800/40">
                  <button 
                    onClick={() => deleteNote(n.id)}
                    className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>हटाएँ</span>
                  </button>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard glow="none" className="p-8 text-center flex flex-col items-center justify-center space-y-4 border border-dashed border-slate-300 dark:border-slate-800">
            {/* SVG notebook illustration */}
            <svg className="w-16 h-16 text-primary/30" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
            </svg>
            <div className="space-y-1 max-w-sm">
              <h4 className="font-serif font-bold text-slate-800 dark:text-white text-xs">कोई नोट्स सहेजे नहीं गए हैं</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed font-serif">आलेखों का अध्ययन करते समय, आप महत्वपूर्ण बिंदुओं को सिलेक्ट कर के अपने स्वाध्याय नोट्स में जोड़ सकते हैं।</p>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
