"use client";

import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  Search, 
  Download, 
  FileText, 
  Plus, 
  ThumbsUp, 
  Share2, 
  FolderPlus,
  Send
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import GlassCard from "@/components/yuvakshar/GlassCard";

interface ResourceItem {
  id: string;
  title: string;
  description: string;
  type: "Notes" | "Study Material" | "Research Paper" | "Literary Guide" | "Public Collection";
  file_url: string;
  downloads: number;
  likes: number;
  user_name: string;
  created_at: string;
}

export default function KnowledgeHubPage() {
  const { currentUser } = useCms();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [showUploadForm, setShowUploadForm] = useState(false);
  
  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<ResourceItem["type"]>("Notes");
  const [fileName, setFileName] = useState("");

  const [resources, setResources] = useState<ResourceItem[]>([
    { id: "res-1", title: "काव्य शास्त्र के प्रमुख सिद्धांत", description: "हिंदी साहित्य एम.ए. पाठ्यक्रम के लिए रसास्वादन, ध्वनि और अलंकार सिद्धांतों की विस्तृत व्याख्या।", type: "Literary Guide", file_url: "kavya_shastra_guide.pdf", downloads: 142, likes: 28, user_name: "संपादक युवाक्षर", created_at: "2026-05-10" },
    { id: "res-2", title: "छायावाद: इतिहास और प्रवृत्तियाँ", description: "जयशंकर प्रसाद, सुमित्रानंदन पंत, निराला और महादेवी वर्मा के रचनात्मक योगदान की समीक्षात्मक टिप्पणियां।", type: "Research Paper", file_url: "chhayavad_history.pdf", downloads: 98, likes: 19, user_name: "डॉ. विकास शर्मा", created_at: "2026-05-15" },
    { id: "res-3", title: "हिंदी वर्तनी एवं व्याकरण शुद्धि पत्रक", description: "अक्सर होने वाली सामान्य व्याकरण त्रुटियों को सुधारने के लिए त्वरित संदर्भ मार्गदर्शिका।", type: "Study Material", file_url: "hindi_grammar_rules.pdf", downloads: 215, likes: 45, user_name: "सरिता वर्मा", created_at: "2026-05-20" },
    { id: "res-4", title: "उपन्यासकार प्रेमचंद का सामाजिक यथार्थ", description: "प्रेमचंद के उपन्यासों में चित्रित कृषक जीवन और महाजनी सभ्यता के शोषण का गंभीर विवेचन।", type: "Notes", file_url: "premchand_social_aspects.pdf", downloads: 67, likes: 14, user_name: "अमित कुमार", created_at: "2026-06-02" }
  ]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("yuvakshar_c_resources");
      if (saved) setResources(JSON.parse(saved));
    }
  }, []);

  const saveResources = (items: ResourceItem[]) => {
    setResources(items);
    if (typeof window !== "undefined") {
      localStorage.setItem("yuvakshar_c_resources", JSON.stringify(items));
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!title.trim() || !fileName.trim()) return;

    const newItem: ResourceItem = {
      id: `res-${Date.now()}`,
      title,
      description,
      type,
      file_url: fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`,
      downloads: 0,
      likes: 0,
      user_name: currentUser.name || "लेखक",
      created_at: new Date().toISOString().split("T")[0]
    };

    const updated = [newItem, ...resources];
    saveResources(updated);
    setTitle("");
    setDescription("");
    setFileName("");
    setShowUploadForm(false);
    alert("साहित्यिक संसाधन सफलतापूर्वक साझा किया गया!");
  };

  const handleDownload = (id: string) => {
    const updated = resources?.map(res => {
      if (res.id === id) {
        alert(`फ़ाइल '${res.file_url}' सफलतापूर्वक डाउनलोड की गई।`);
        return { ...res, downloads: res.downloads + 1 };
      }
      return res;
    });
    saveResources(updated);
  };

  const handleLike = (id: string) => {
    const updated = resources?.map(res => {
      if (res.id === id) {
        return { ...res, likes: res.likes + 1 };
      }
      return res;
    });
    saveResources(updated);
  };

  const filtered = resources.filter(res => {
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          res.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || res.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 text-[#0F172A] dark:text-slate-200">
      
      {/* Header bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-[#0F172A]/35 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/40">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="ज्ञान कोष में अध्ययन सामग्री खोजें..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-slate-200 dark:border-slate-800 hover:border-primary/45 rounded-xl px-4 py-2.5 text-xs pl-9 focus:outline-none focus:border-primary font-hindi"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
        </div>

        <div className="flex space-x-2 shrink-0">
          {currentUser && (
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer font-hindi"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>सामग्री अपलोड करें</span>
            </button>
          )}
        </div>

      </div>

      {/* Filter Category pills */}
      <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: "all", name: "सभी संसाधन" },
          { id: "Notes", name: "नोट्स" },
          { id: "Study Material", name: "अध्ययन सामग्री" },
          { id: "Research Paper", name: "शोध पत्र" },
          { id: "Literary Guide", name: "साहित्यिक गाइड" }
        ]?.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedType(cat.id)}
            className={`px-3.5 py-1.8 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer font-hindi ${
              selectedType === cat.id
                ? "bg-primary text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-200/30"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Upload Form Modal */}
      {showUploadForm && currentUser && (
        <GlassCard className="p-5 border-slate-200/60 dark:border-slate-800/40">
          <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs font-hindi">
            <h3 className="text-sm font-bold font-serif text-slate-800 dark:text-white flex items-center gap-1.5">
              <FolderPlus className="w-4.5 h-4.5 text-primary" />
              <span>ज्ञान केंद्र में नई सामग्री साझा करें</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block font-serif">सामग्री का शीर्षक</label>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="जैसे: रस सिद्धांत और उनके स्थायी भाव"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block font-serif">सामग्री का प्रकार</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 focus:outline-none"
                >
                  <option value="Notes">नोट्स</option>
                  <option value="Study Material">अध्ययन सामग्री</option>
                  <option value="Research Paper">शोध पत्र</option>
                  <option value="Literary Guide">साहित्यिक गाइड</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 block font-serif">संक्षिप्त विवरण</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="इस पठन सामग्री के मुख्य अध्यायों या विषय के बारे में संक्षेप में बताएं..."
                rows={2}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 block font-serif">फ़ाइल का नाम (PDF Simulation)</label>
              <input 
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="जैसे: ras_siddhant_notes.pdf"
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 focus:outline-none font-mono"
                required
              />
            </div>

            <button
              type="submit"
              className="bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>साधन प्रकाशित करें (Share Resource)</span>
            </button>
          </form>
        </GlassCard>
      )}

      {/* Resources list */}
      <div className="space-y-4">
        {filtered.length > 0 ? (
          filtered?.map(res => (
            <GlassCard key={res.id} className="p-5 border-slate-200/60 dark:border-slate-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
                  <FileText className="w-5.5 h-5.5" />
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <h4 className="text-xs font-bold font-serif text-slate-800 dark:text-white font-hindi">{res.title}</h4>
                    <span className="text-[8px] bg-slate-150 dark:bg-slate-850 text-slate-400 px-1.5 py-0.5 rounded font-bold font-mono uppercase">
                      {res.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-450 leading-relaxed font-hindi">{res.description}</p>
                  <div className="flex items-center space-x-2 text-[9px] text-slate-400 font-serif">
                    <span className="font-hindi">अपलोडर: {res.user_name}</span>
                    <span>•</span>
                    <span className="font-mono">{res.created_at}</span>
                  </div>
                </div>
              </div>

              {/* Action columns */}
              <div className="flex items-center space-x-4 ml-auto md:ml-0 shrink-0">
                <button
                  onClick={() => handleLike(res.id)}
                  className="flex items-center space-x-1 text-slate-400 hover:text-primary transition-all text-[11px] font-mono font-bold cursor-pointer"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{res.likes}</span>
                </button>

                <button
                  onClick={() => handleDownload(res.id)}
                  className="bg-primary hover:bg-primary/95 text-white px-3.5 py-2 rounded-xl text-[10px] font-bold transition-all shadow-md flex items-center space-x-1 cursor-pointer font-hindi"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="font-mono">{res.downloads}</span>
                </button>
              </div>

            </GlassCard>
          ))
        ) : (
          <div className="py-20 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl font-serif text-xs">
            इस खोज मानदंड के तहत कोई शैक्षणिक संसाधन उपलब्ध नहीं है।
          </div>
        )}
      </div>

    </div>
  );
}
