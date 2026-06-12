"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Maximize2, 
  Minimize2, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Volume2, 
  HelpCircle, 
  MessageSquare, 
  Languages, 
  FileText, 
  Play, 
  Pause, 
  Send,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Camera,
  Lock,
  Crown,
  BookMarked,
  Brain,
  Trash2,
  CheckCircle,
  X
} from "lucide-react";

import { useCms } from "@/store/CmsContext";
import GlassCard from "@/components/yuvakshar/GlassCard";
import { parseInlineMarkdown } from "@/lib/markdown";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

export default function MagazinePage() {
  const { magazines, currentUser, openAuthModal, canAccessContent, aiNotes, saveAiNote, deleteAiNote } = useCms();
  const [selectedMag, setSelectedMag] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(0); // Left page index
  const [zoomScale, setZoomScale] = useState(1);
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [activeAiTool, setActiveAiTool] = useState<"chat" | "summary" | "audio" | "quiz" | "translate" | "notes" | "study">("chat");

  // Translation state for pages
  const [pageLang, setPageLang] = useState<"hi" | "en">("hi");

  // AI Chat state
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  // AI Audio State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  // AI Quiz state
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  // Notes state
  const [noteText, setNoteText] = useState("");

  // Sync state on magazine select
  useEffect(() => {
    if (selectedMag) {
      setCurrentPage(0);
      setPageLang("hi");
      setChatMessages([
        { sender: "ai", text: `नमस्ते! मैं इस ${selectedMag.issue} अंक का एआई सहायक हूँ। आप मुझसे इस अंक के लेखों, पर्यावरण, एआई संप्रभुता आदि विषयों पर सवाल पूछ सकते हैं।` }
      ]);
      setQuizScore(null);
      setSelectedAnswer(null);
      setIsPlayingAudio(false);
      setNoteText("");
      setZoomScale(1);
    }
  }, [selectedMag]);

  // Audio timer emulation
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setAudioProgress(prev => {
          if (prev >= 100) {
            setIsPlayingAudio(false);
            return 0;
          }
          return prev + 2;
        });
      }, 500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlayingAudio]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { sender: "user", text: userText }]);
    setChatInput("");

    // Simulate AI scanning magazine pages
    setTimeout(() => {
      let aiText = "मुझे आपकी क्वेरी के लिए कोई विशिष्ट संदर्भ नहीं मिला। कृपया एआई, संप्रभुता या पर्यावरण से संबंधित प्रश्न पूछें।";
      const textLower = userText.toLowerCase();
      if (textLower.includes("पर्यावरण") || textLower.includes("environment")) {
        aiText = "पर्यावरण पर राघवेंद्र शरण का विशेष लेख 'वैश्विक ऊर्जा संक्रमण और भारत की पंचामृत नीति' इस अंक के पुराने संदर्भों से जुड़ा है, और पंचायतों में ग्रामीण फाइबर ग्रिड से संबंधित विषय पेज 3 पर उपलब्ध है।";
      } else if (textLower.includes("एआई") || textLower.includes("ai") || textLower.includes("संप्रभुता")) {
        aiText = "एआई और डिजिटल संप्रभुता पर मुख्य लेख पेज 2 (लेख 1: कृत्रिम बुद्धिमत्ता और भाषाई विविधता) पर स्थित है। इसमें स्वदेशी भाषिणी परियोजना और भाषा मॉडलों का विश्लेषण है।";
      } else if (textLower.includes("कविता") || textLower.includes("poem")) {
        aiText = "युवाओं को समर्पित कविता 'कर्मवीर युवा' इस अंक के पेज 4 पर प्रकाशित की गई है।";
      } else if (textLower.includes("पेज") || textLower.includes("कहां")) {
        aiText = "पेज 2 पर एआई, पेज 3 पर फाइबर ग्रिड, पेज 4 पर कविता और पेज 5 पर डेटा सुरक्षा कानून की समीक्षा है।";
      }

      setChatMessages(prev => [...prev, { sender: "ai", text: aiText }]);
    }, 1000);
  };

  const nextPage = () => {
    if (!selectedMag) return;
    if (currentPage + 2 < selectedMag.pages.length) {
      setCurrentPage(prev => prev + 2);
    }
  };

  const prevPage = () => {
    if (currentPage - 2 >= 0) {
      setCurrentPage(prev => prev - 2);
    }
  };

  const englishPages = [
    "Welcome to Yuvakshar. The main theme of this issue is digital sovereignty and indigenous AI.",
    "Article 1: Artificial Intelligence and Linguistic Diversity. The significance of the government's Bhashini project and indigenous models in Indian education.",
    "Article 2: Rural Fiber Revolution. Administrative reforms through broadband grids in village Panchayats.",
    "Poetry: Brave Youth. Inspiring lines on creation, youth expression, and national progress.",
    "Review: Technical Reforms. India's digital laws and citizen data privacy frameworks."
  ];

  const getPageContent = (idx: number) => {
    if (!selectedMag) return "";
    if (pageLang === "en") {
      return englishPages[idx] || "End of Volume.";
    }
    return selectedMag.pages[idx] || "अंक समाप्त।";
  };

  const handleSaveNotes = async () => {
    if (!noteText.trim() || !selectedMag) return;
    await saveAiNote({
      userId: currentUser?.id || "",
      articleId: selectedMag.id,
      articleTitle: `${selectedMag.issue} (पृष्ठ ${currentPage + 1}-${currentPage + 2})`,
      noteType: "अध्ययन नोट्स",
      content: noteText
    });
    setNoteText("");
    alert("अध्ययन नोट्स सफलतापूर्वक सहेजे गए!");
  };

  // Canvas screenshot function
  const handleScreenshot = () => {
    if (!selectedMag) return;
    
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 800;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw background
    ctx.fillStyle = "#FCFAF5";
    ctx.fillRect(0, 0, 1200, 800);

    // Draw primary colored border
    ctx.strokeStyle = "#EA580C";
    ctx.lineWidth = 10;
    ctx.strokeRect(20, 20, 1160, 760);

    // Draw diagonal watermarks
    ctx.save();
    ctx.fillStyle = "rgba(234, 88, 12, 0.035)";
    ctx.font = "bold 44px 'Noto Serif Devanagari', serif";
    ctx.rotate(-Math.PI / 8);
    for (let x = -600; x < 1200; x += 300) {
      for (let y = -200; y < 1400; y += 220) {
        ctx.fillText("युवाक्षर", x, y);
      }
    }
    ctx.restore();

    // Draw Header Branding
    ctx.fillStyle = "#EA580C";
    ctx.font = "bold 32px 'Noto Serif Devanagari', serif";
    ctx.fillText("युवाक्षर", 60, 80);

    ctx.fillStyle = "#0F172A";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("yuvakshar.org", 60, 102);

    ctx.fillStyle = "#64748B";
    ctx.font = "14px 'Noto Sans Devanagari', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`${selectedMag.issue} | ${selectedMag.month} ${selectedMag.year || "२०२५"}`, 1140, 80);
    ctx.fillText(`पृष्ठ ${currentPage + 1}-${currentPage + 2}`, 1140, 102);
    ctx.textAlign = "left";

    // Text wrapping draw helper
    const drawTextWrapped = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
      ctx.fillStyle = "#1E293B";
      ctx.font = "16px 'Noto Serif Devanagari', serif";
      const paragraphs = text.split("\n");
      let currentY = y;
      paragraphs.forEach(p => {
        const words = p.split(" ");
        let line = "";
        for (let n = 0; n < words.length; n++) {
          let testLine = line + words[n] + " ";
          let metrics = ctx.measureText(testLine);
          let testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            ctx.fillText(line, x, currentY);
            line = words[n] + " ";
            currentY += lineHeight;
          } else {
            line = testLine;
          }
        }
        ctx.fillText(line, x, currentY);
        currentY += lineHeight * 1.6; // Paragraph spacing
      });
    };

    // Draw Left Page content
    const leftContent = getPageContent(currentPage);
    drawTextWrapped(leftContent, 80, 170, 480, 26);

    // Draw Right Page content
    const rightContent = getPageContent(currentPage + 1);
    drawTextWrapped(rightContent, 640, 170, 480, 26);

    // Draw page numbers under columns
    ctx.fillStyle = "#64748B";
    ctx.font = "12px monospace";
    ctx.fillText(`Page ${currentPage + 1}`, 80, 715);
    ctx.textAlign = "right";
    ctx.fillText(`Page ${currentPage + 2}`, 1120, 715);
    ctx.textAlign = "left";

    // Draw bottom separator
    ctx.strokeStyle = "rgba(234, 88, 12, 0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(60, 735);
    ctx.lineTo(1140, 735);
    ctx.stroke();

    // Draw Source Footer
    ctx.fillStyle = "#EA580C";
    ctx.font = "bold 15px 'Noto Serif Devanagari', serif";
    ctx.textAlign = "center";
    ctx.fillText("स्रोत: युवाक्षर", 600, 760);

    // Trigger download
    const link = document.createElement("a");
    link.download = `Yuvakshar_${selectedMag.issue.replace(/\s+/g, "_")}_Page_${currentPage + 1}-${currentPage + 2}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    
    alert("स्क्रीनशॉट डाउनलोड शुरू हो गया है!");
  };

  const currentLatest = magazines[0] || { issue: "वर्तमान अंक", month: "मई 2025", coverImage: "/yuvakshar_logo.jpg", description: "" };

  // MEMBERSHIP & LOGIN CHECK FOR ACTIVE READING STATE
  if (selectedMag) {
    // 1. Not logged in -> Show Visitor Lock Screen
    if (!currentUser) {
      return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 text-[#0F172A] dark:text-slate-200">
          <div className="p-5 bg-primary/10 rounded-full text-primary animate-pulse border border-primary/20">
            <Lock className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-3xl font-bold text-slate-800 dark:text-white">पत्रिका पढ़ने के लिए लॉगिन आवश्यक है</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-serif max-w-md mx-auto">
              युवाक्षर डिजिटल पत्रिका और हमारे एआई-संचालित स्वाध्याय उपकरणों तक पहुँचने के लिए लॉगिन करना आवश्यक है।
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setSelectedMag(null)}
              className="border border-slate-200 dark:border-slate-800 hover:border-slate-350 px-6 py-3 rounded-full font-bold text-xs transition-all cursor-pointer bg-white dark:bg-slate-900"
            >
              संग्रह पर वापस जाएं
            </button>
            <button
              onClick={() => openAuthModal()}
              className="bg-primary hover:bg-primary/95 text-white px-8 py-3.5 rounded-full font-bold text-xs shadow-lg hover:shadow-primary/20 transition-all cursor-pointer"
            >
              लॉगिन करें
            </button>
            <button
              onClick={() => openAuthModal()}
              className="border border-primary text-primary hover:bg-primary/10 px-8 py-3.5 rounded-full font-bold text-xs transition-all cursor-pointer bg-white dark:bg-slate-900"
            >
              खाता बनाएं
            </button>
          </div>
        </div>
      );
    }

    // 2. Logged in -> Verify membership or role bypass
    const isEditorial = ["Owner", "Admin", "Editor-in-Chief", "Managing Editor", "Editor", "Sub Editor", "Fact Checker", "Reviewer", "Author", "Contributor"].includes(currentUser.role || "");
    const isPremium = ["Premium", "Patron", "Subscriber", "Founding", "Institutional", "Lifetime"].includes(currentUser.membership || "");
    const hasAccess = isEditorial || isPremium;

    if (!hasAccess) {
      return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-20 min-h-[60vh] flex flex-col items-center justify-center text-center space-y-6 text-[#0F172A] dark:text-slate-200">
          <div className="p-5 bg-amber-500/10 rounded-full text-amber-500 animate-pulse border border-amber-500/20">
            <Crown className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-3xl font-bold text-slate-800 dark:text-white">पत्रिका पढ़ने के लिए सक्रिय सदस्यता आवश्यक है</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-serif max-w-md mx-auto">
              यह डिजिटल संस्करण ({selectedMag.issue}) केवल हमारे प्रीमियम सदस्यों के लिए उपलब्ध है। पढ़ने के लिए अपनी सदस्यता प्रारंभ करें।
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setSelectedMag(null)}
              className="border border-slate-200 dark:border-slate-800 hover:border-slate-350 px-6 py-3 rounded-full font-bold text-xs transition-all cursor-pointer bg-white dark:bg-slate-900"
            >
              संग्रह पर वापस जाएं
            </button>
            <Link
              href="/membership"
              className="bg-primary hover:bg-primary/95 text-white px-8 py-3.5 rounded-full font-bold text-xs shadow-lg hover:shadow-primary/20 transition-all text-center flex items-center justify-center"
            >
              सदस्य बनें
            </Link>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 min-h-screen text-[#0F172A] dark:text-slate-200">
      
      <AnimatePresence mode="wait">
        {!selectedMag ? (
          
          /* VIEW 1: MAGAZINE ARCHIVE SHOWROOM */
          <motion.div
            key="archive"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex justify-between items-end">
              <div>
                <h1 className="font-serif text-3xl md:text-5xl text-primary font-bold font-hindi">डिजिटल पत्रिका संग्रह</h1>
                <p className="text-xs text-slate-400 uppercase tracking-wider mt-2">
                  Read युवाक्षर monthly prints cover-to-cover with integrated AI assistance
                </p>
              </div>
            </div>

            {/* Latest Issue Showcase */}
            <div className="relative rounded-3xl overflow-hidden bg-slate-50/50 dark:bg-[#0F172A]/10 border border-slate-200 dark:border-slate-800 p-6 sm:p-10 flex flex-col lg:flex-row gap-8 items-center">
              <div className="relative w-[200px] h-[280px] shrink-0 rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800">
                <img 
                  src={currentLatest.coverImage} 
                  alt="Latest Cover"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-6 flex-grow text-center lg:text-left">
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full">
                    ताज़ा संस्करण
                  </span>
                  <h2 className="font-serif text-2xl sm:text-4xl font-black">
                    {currentLatest.issue}
                  </h2>
                  <p className="text-xs text-slate-400 tracking-wider uppercase font-mono">रिलीज़: {currentLatest.month}</p>
                </div>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-light leading-relaxed max-w-2xl">
                  {currentLatest.description || "इस मासिक अंक में राष्ट्रीय नीतियां, साहित्य सृजन, पर्यावरण चिंता और वैश्विक घटनाक्रमों पर केंद्रित गहन लेख शामिल हैं।"}
                </p>

                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <button
                    onClick={() => setSelectedMag(currentLatest)}
                    className="px-8 py-3.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary/95 shadow-md cursor-pointer"
                  >
                    पत्रिका पढ़ें
                  </button>
                </div>
              </div>
            </div>

            {/* Archive Volumes */}
            <div className="space-y-6">
              <h3 className="font-serif text-2xl font-bold text-primary">मासिक पत्रिका अभिलेखागार</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {magazines.map((mag) => (
                  <GlassCard key={mag.id} glow="gold" className="p-0">
                    <div className="flex flex-col h-full justify-between">
                      <div className="relative h-[220px] w-full overflow-hidden">
                        <img 
                          src={mag.coverImage} 
                          alt={mag.issue}
                          className="w-full h-full object-cover brightness-95"
                        />
                        {mag.accessLevel !== "Free" && (
                          <div className="absolute top-3 right-3 bg-amber-500 text-white p-1.5 rounded-lg shadow border border-amber-400">
                            <Crown className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6 space-y-4">
                        <div>
                          <h4 className="font-serif text-lg font-bold">{mag.issue}</h4>
                          <p className="text-[10px] text-slate-400 tracking-wider uppercase mt-1 font-mono">{mag.month} {mag.year || ""}</p>
                        </div>
                        
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light line-clamp-3">
                          {mag.description || "मासिक विमर्श, लेख संग्रह और साहित्य विशेष के साथ प्रस्तुत नया अंक।"}
                        </p>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/40">
                          <button
                            onClick={() => setSelectedMag(mag)}
                            className="w-full text-center py-2.5 bg-primary/10 hover:bg-primary border border-primary/30 hover:border-transparent text-primary hover:text-white text-[10px] font-bold tracking-wider uppercase rounded-lg transition-all cursor-pointer"
                          >
                            पत्रिका पढ़ें
                          </button>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>

          </motion.div>
        ) : (
          
          /* VIEW 2: IMMERSIVE FULL-WIDTH READER */
          <motion.div
            key="reader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full flex flex-col space-y-6"
          >
            {/* Top Reader Controls Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center bg-slate-50 dark:bg-[#0F172A]/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-850 shadow-sm gap-4">
              <div className="flex items-center space-x-3 w-full md:w-auto">
                <button 
                  onClick={() => setSelectedMag(null)}
                  className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:text-primary rounded-xl cursor-pointer text-slate-400 transition-colors"
                  title="संग्रह पर वापस जाएं"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h3 className="font-serif text-sm font-bold text-primary leading-tight">{selectedMag.issue}</h3>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-mono mt-0.5">
                    पृष्ठ {currentPage + 1}-{currentPage + 2} / {selectedMag.pages.length}
                  </p>
                </div>
              </div>

              {/* Center/Right Toolbar: Zoom, Screenshot, Fullscreen */}
              <div className="flex items-center space-x-2 w-full md:w-auto justify-end flex-wrap gap-2">
                
                {/* Zoom In */}
                <button
                  onClick={() => setZoomScale(prev => Math.min(2.0, prev + 0.15))}
                  className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary rounded-xl text-xs cursor-pointer flex items-center space-x-1"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                  <span className="hidden sm:inline">ज़ूम बढ़ाएं</span>
                </button>

                {/* Zoom Out */}
                <button
                  onClick={() => setZoomScale(prev => Math.max(0.6, prev - 0.15))}
                  className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary rounded-xl text-xs cursor-pointer flex items-center space-x-1"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                  <span className="hidden sm:inline">ज़ूम घटाएं</span>
                </button>

                {/* Fit Width */}
                <button
                  onClick={() => setZoomScale(1.4)}
                  className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary rounded-xl text-xs cursor-pointer"
                  title="Fit Width"
                >
                  ↔️ फिट चौड़ाई
                </button>

                {/* Fit Page */}
                <button
                  onClick={() => setZoomScale(1.0)}
                  className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary rounded-xl text-xs cursor-pointer"
                  title="Fit Page"
                >
                  📖 फिट पृष्ठ
                </button>

                {/* Screenshot tool */}
                <button
                  onClick={handleScreenshot}
                  className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary rounded-xl text-xs cursor-pointer flex items-center space-x-1"
                  title="प्रिटेड पृष्ठ स्क्रीनशॉट"
                >
                  <Camera className="w-4 h-4 text-orange-500" />
                  <span>📸 स्क्रीनशॉट</span>
                </button>

                {/* Custom Fullscreen Mode Toggle */}
                <button
                  onClick={() => setIsFullscreenMode(true)}
                  className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-primary rounded-xl text-xs cursor-pointer flex items-center space-x-1"
                  title="पूर्ण स्क्रीन में पढ़ें"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span>⛶ पूर्ण स्क्रीन</span>
                </button>
              </div>
            </div>

            {/* Panning Scrollable Container for Zoomed Pages */}
            <div className="w-full overflow-auto max-w-full flex justify-center py-6 bg-slate-50 dark:bg-slate-950/20 rounded-3xl border border-slate-100 dark:border-slate-800/40 min-h-[550px] shadow-inner">
              <div 
                style={{ 
                  transform: `scale(${zoomScale})`, 
                  transformOrigin: 'top center',
                  transition: 'transform 0.15s ease-out'
                }}
                className="shrink-0 flex items-center justify-center relative min-w-[768px] max-w-5xl py-4"
              >
                {/* Left/Right Navigation overlay arrows (always visible at sides) */}
                <button 
                  onClick={prevPage} 
                  disabled={currentPage === 0}
                  className="absolute -left-12 z-20 p-3.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-850 hover:border-primary disabled:opacity-20 text-slate-400 hover:text-primary transition-all cursor-pointer shadow-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <button 
                  onClick={nextPage} 
                  disabled={currentPage + 2 >= selectedMag.pages.length}
                  className="absolute -right-12 z-20 p-3.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-850 hover:border-primary disabled:opacity-20 text-slate-400 hover:text-primary transition-all cursor-pointer shadow-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Pages Grid */}
                <div className="grid grid-cols-2 gap-px w-[950px] min-h-[580px] border border-primary/20 rounded-2xl overflow-hidden shadow-2xl bg-primary/5">
                  
                  {/* Left Page */}
                  <div className="bg-[#FCFAF5] dark:bg-[#0F172A] p-10 flex flex-col justify-between border-r border-slate-200 dark:border-slate-850 select-text">
                    <span className="text-[9px] uppercase tracking-widest text-primary font-bold font-hindi">युवाक्षर मासिक पत्रिका</span>
                    <div className="text-sm sm:text-base text-slate-800 dark:text-slate-300 font-serif leading-relaxed whitespace-pre-line mt-6 flex-grow pr-2">
                      {getPageContent(currentPage)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-6 pt-3 border-t border-slate-200/50 dark:border-slate-800 flex justify-between">
                      <span>अंक: {selectedMag.issue}</span>
                      <span>पृष्ठ {currentPage + 1}</span>
                    </div>
                  </div>

                  {/* Right Page */}
                  <div className="bg-[#FCFAF5] dark:bg-[#0F172A] p-10 flex flex-col justify-between select-text">
                    <span className="text-[9px] uppercase tracking-widest text-primary font-bold font-hindi">युवाक्षर मासिक पत्रिका</span>
                    <div className="text-sm sm:text-base text-slate-800 dark:text-slate-300 font-serif leading-relaxed whitespace-pre-line mt-6 flex-grow pl-2">
                      {getPageContent(currentPage + 1)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-6 pt-3 border-t border-slate-200/50 dark:border-slate-800 flex justify-between">
                      <span>पृष्ठ {currentPage + 2}</span>
                      <span>yuvakshar.org</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Bottom Navigation & Progress Section */}
            <div className="bg-slate-50 dark:bg-[#0F172A]/40 border border-slate-200 dark:border-slate-850 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Prev / Next controls */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary rounded-xl text-xs font-bold bg-white dark:bg-slate-800 disabled:opacity-30 cursor-pointer transition-all"
                >
                  पिछला पृष्ठ
                </button>
                
                <button
                  onClick={nextPage}
                  disabled={currentPage + 2 >= selectedMag.pages.length}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary rounded-xl text-xs font-bold bg-white dark:bg-slate-800 disabled:opacity-30 cursor-pointer transition-all"
                >
                  अगला पृष्ठ
                </button>
              </div>

              {/* Progress Tracker bar */}
              <div className="flex-grow max-w-md w-full px-4 space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono font-bold">
                  <span>पठन प्रगति</span>
                  <span>{Math.round(((currentPage + 2) / selectedMag.pages.length) * 100)}% पूर्ण</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${((currentPage + 2) / selectedMag.pages.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Page Selector jump dropdown */}
              <div className="flex items-center space-x-2">
                <span className="text-xs text-slate-400 font-hindi">पृष्ठ पर जाएं:</span>
                <select
                  value={currentPage}
                  onChange={(e) => setCurrentPage(Number(e.target.value))}
                  className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs px-3 py-1.5 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary"
                >
                  {Array.from({ length: Math.ceil(selectedMag.pages.length / 2) }).map((_, idx) => (
                    <option key={idx} value={idx * 2}>
                      पृष्ठ {idx * 2 + 1}-{idx * 2 + 2}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* FLOATING ACTION BUTTON FOR COLLAPSIBLE AI DRAWER */}
            <button 
              onClick={() => setIsAiOpen(true)}
              className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] right-4 lg:bottom-8 lg:right-8 z-[40] bg-primary hover:bg-primary/95 text-white p-4.5 rounded-full shadow-2xl flex items-center justify-center space-x-2 cursor-pointer font-hindi text-xs font-black transition-all hover:scale-105 active:scale-95 border border-primary/20"
            >
              <Sparkles className="w-5 h-5 animate-pulse" />
              <span>🤖 AI सहायक</span>
            </button>

            {/* COLLAPSIBLE AI DRAWER */}
            <AnimatePresence>
              {isAiOpen && (
                <>
                  {/* Backdrop overlay */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsAiOpen(false)}
                    className="fixed inset-0 z-[49] bg-black/60 backdrop-blur-sm"
                  />

                  {/* Drawer body */}
                  <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", damping: 20, stiffness: 100 }}
                    className="fixed top-0 right-0 h-full w-full sm:w-[450px] z-[50] bg-white dark:bg-[#0F172A] border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col justify-between"
                  >
                    <div>
                      {/* Drawer Header */}
                      <div className="p-4.5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/60">
                        <div className="flex items-center space-x-2 text-primary">
                          <Sparkles className="w-5 h-5 animate-pulse" />
                          <h3 className="font-serif text-sm font-bold">युवाक्षर AI सहायक</h3>
                        </div>
                        <button
                          onClick={() => setIsAiOpen(false)}
                          className="p-1 text-slate-450 hover:text-slate-650 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs font-bold cursor-pointer"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Drawer Tabs */}
                      <div className="grid grid-cols-7 gap-1 p-3 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-150 dark:border-slate-800 select-none">
                        {[
                          { type: "chat", icon: MessageSquare, label: "Ask Questions" },
                          { type: "summary", icon: FileText, label: "Summary" },
                          { type: "audio", icon: Volume2, label: "Audio Reader" },
                          { type: "quiz", icon: HelpCircle, label: "Quiz" },
                          { type: "translate", icon: Languages, label: "Translation" },
                          { type: "notes", icon: BookMarked, label: "Notes" },
                          { type: "study", icon: Brain, label: "Study Assistant" }
                        ].map((tool) => {
                          const Icon = tool.icon;
                          return (
                            <button
                              key={tool.type}
                              onClick={() => setActiveAiTool(tool.type as any)}
                              className={`p-2 rounded-lg border text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                                activeAiTool === tool.type
                                  ? "bg-primary/10 border-primary text-primary"
                                  : "border-slate-200 dark:border-slate-850 text-slate-400 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800/40"
                              }`}
                              title={tool.label}
                            >
                              <Icon className="w-4 h-4" />
                            </button>
                          );
                        })}
                      </div>

                      {/* Tool Panel Contents */}
                      <div className="p-5 overflow-y-auto max-h-[calc(100vh-210px)] min-h-[350px]">
                        
                        {/* PANEL 1: AI CHAT */}
                        {activeAiTool === "chat" && (
                          <div className="space-y-4">
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Ask Questions (संवाद कक्ष)</p>
                            <div className="space-y-3">
                              {chatMessages.map((msg, index) => (
                                <div key={index} className={`flex ${msg.sender === "ai" ? "justify-start" : "justify-end"}`}>
                                  <div className={`p-3 rounded-xl text-xs max-w-[85%] border ${
                                    msg.sender === "ai" 
                                      ? "bg-slate-50 dark:bg-slate-900 border-slate-205 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed font-serif" 
                                      : "bg-primary/10 border-primary/20 text-primary font-medium"
                                  }`}>
                                    {msg.text}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* PANEL 2: SUMMARY */}
                        {activeAiTool === "summary" && (
                          <div className="space-y-4 text-xs font-light leading-relaxed text-slate-600 dark:text-slate-400 font-serif">
                            <p className="font-bold text-primary uppercase tracking-wider font-mono text-[10px]">अंक मुख्य सारांश (Summary)</p>
                            <ul className="list-disc list-inside space-y-2">
                              <li dangerouslySetInnerHTML={{ __html: parseInlineMarkdown("**डिजिटल संप्रभुता (Digital Sovereignty)**: पश्चिमी भाषा मॉडलों के प्रभुत्व को टक्कर देने के लिए भारत को स्वयं के सार्वजनिक कंप्यूट और भाषाई डेटाबेस (भाषिणी) की तत्काल आवश्यकता है।") }} />
                              <li dangerouslySetInnerHTML={{ __html: parseInlineMarkdown("**ग्रामीण प्रशासन**: पंचायतों में स्थापित हो रहे ऑप्टिकल फाइबर ग्रिड से नौकरशाही में कमी और त्वरित कल्याणकारी वितरण सक्षम हुआ है।") }} />
                              <li dangerouslySetInnerHTML={{ __html: parseInlineMarkdown("**काव्य रस**: युवाओं में राष्ट्र प्रेम और रचनात्मक ऊर्जा को संचरित करती कविता 'कर्मवीर युवा' का प्रकाशन।") }} />
                            </ul>
                          </div>
                        )}

                        {/* PANEL 3: AUDIO READER */}
                        {activeAiTool === "audio" && (
                          <div className="flex flex-col items-center justify-center py-8 space-y-6">
                            <button
                              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                              className="p-5 rounded-full bg-primary text-white hover:bg-primary/95 shadow-md transition-all cursor-pointer scale-110"
                            >
                              {isPlayingAudio ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
                            </button>
                            
                            <div className="w-full space-y-1.5 text-center">
                              <p className="text-xs font-bold">{isPlayingAudio ? "अब सुना जा रहा है..." : "ऑडियो वाचक बंद है"}</p>
                              <p className="text-[10px] text-slate-400 font-mono">अंक — पृष्ठ {currentPage + 1} स्वर वाचन</p>
                              
                              <div className="w-full h-1 bg-slate-250 dark:bg-slate-800 rounded-full overflow-hidden mt-3 max-w-xs mx-auto">
                                <div className="h-full bg-primary" style={{ width: `${audioProgress}%` }} />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* PANEL 4: QUIZ */}
                        {activeAiTool === "quiz" && (
                          <div className="space-y-4">
                            <p className="text-[10px] font-bold text-primary font-mono uppercase tracking-wider">अंक ज्ञान परीक्षा (Interactive Quiz):</p>
                            
                            {quizScore === null ? (
                              <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3">
                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Q1. पश्चिमी बड़े भाषा मॉडलों (LLMs) के डेटा पूर्वाग्रह से बचने के लिए भारत सरकार की कौन सी प्रमुख परियोजना कार्यरत है?</p>
                                <div className="space-y-1.5">
                                  {["परियोजना तरंग", "भाषिणी परियोजना", "डिजिटल भारत मिशन", "सागरमाला ग्रिड"].map((opt, idx) => (
                                    <button
                                      key={idx}
                                      onClick={() => setSelectedAnswer(idx)}
                                      className={`w-full text-left p-2.5 rounded border text-xs transition-all ${
                                        selectedAnswer === idx 
                                          ? "bg-primary/10 border-primary text-primary" 
                                          : "border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900"
                                      }`}
                                    >
                                      {idx + 1}. {opt}
                                    </button>
                                  ))}
                                </div>
                                <button
                                  onClick={() => {
                                    if (selectedAnswer === null) return;
                                    setQuizScore(selectedAnswer === 1 ? 100 : 0);
                                  }}
                                  className="w-full text-center py-2 bg-primary text-white text-xs font-bold rounded-lg cursor-pointer mt-2"
                                >
                                  उत्तर सबमिट करें
                                </button>
                              </div>
                            ) : (
                              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-center space-y-2">
                                <p className="text-sm font-bold text-primary">
                                  {quizScore === 100 ? "✓ सही उत्तर!" : "✗ गलत उत्तर, पुनः प्रयास करें।"}
                                </p>
                                <p className="text-xs text-slate-400">सही जवाब 'भाषिणी परियोजना' है जो स्वदेशी भाषा अनुवाद मॉडलों का ढांचा तैयार करती है।</p>
                                <button
                                  onClick={() => {
                                    setQuizScore(null);
                                    setSelectedAnswer(null);
                                  }}
                                  className="text-xs text-primary font-bold hover:underline"
                                >
                                  अगला प्रश्न लोड करें
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* PANEL 5: TRANSLATION */}
                        {activeAiTool === "translate" && (
                          <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <Languages className="w-10 h-10 text-primary animate-pulse" />
                            <p className="text-xs text-center text-slate-400 font-light max-w-xs leading-relaxed">
                              AI अनुवाद सक्रिय करें। फ्लिपबुक के वर्तमान पृष्ठों का हिन्दी से अंग्रेजी में त्वरित अनुवाद करें।
                            </p>
                            
                            <div className="flex border border-slate-200 dark:border-slate-850 rounded-lg overflow-hidden shrink-0 select-none">
                              <button
                                  onClick={() => setPageLang("hi")}
                                  className={`px-4 py-2 text-xs font-bold cursor-pointer ${
                                    pageLang === "hi" ? "bg-primary text-white" : "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500"
                                  }`}
                                >
                                  हिन्दी
                                </button>
                                <button
                                  onClick={() => setPageLang("en")}
                                  className={`px-4 py-2 text-xs font-bold cursor-pointer ${
                                    pageLang === "en" ? "bg-primary text-white" : "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-500"
                                  }`}
                                >
                                  अंग्रेजी
                                </button>
                            </div>
                          </div>
                        )}

                        {/* PANEL 6: NOTES */}
                        {activeAiTool === "notes" && (
                          <div className="space-y-4">
                            <p className="text-[10px] font-bold text-primary font-mono uppercase tracking-wider">अध्ययन नोट्स (My Notes):</p>
                            
                            <div className="space-y-2">
                              <textarea
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                placeholder="इस पृष्ठ के मुख्य विचार यहाँ लिखें और सुरक्षित करें..."
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 text-xs rounded-xl focus:outline-none focus:border-primary text-slate-700 dark:text-slate-250 font-serif"
                                rows={4}
                              />
                              <button
                                onClick={handleSaveNotes}
                                disabled={!noteText.trim()}
                                className="w-full bg-primary hover:bg-primary/95 disabled:opacity-40 text-white font-bold py-2 text-xs rounded-xl transition-all cursor-pointer"
                              >
                                नोट्स सुरक्षित करें
                              </button>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/60 mt-4">
                              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">सुरक्षित किए गए नोट्स:</h4>
                              {aiNotes.filter(n => n.articleId === selectedMag.id).length > 0 ? (
                                aiNotes.filter(n => n.articleId === selectedMag.id).map(note => (
                                  <div key={note.id} className="p-3 bg-slate-55 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 rounded-xl relative space-y-1">
                                    <button 
                                      onClick={() => deleteAiNote(note.id)}
                                      className="absolute top-2 right-2 text-slate-400 hover:text-red-500 cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="text-[9px] text-slate-400 block font-mono">{note.articleTitle}</span>
                                    <p className="text-xs text-slate-700 dark:text-slate-300 font-serif leading-relaxed pr-6">{note.content}</p>
                                  </div>
                                ))
                              ) : (
                                <p className="text-xs text-slate-400 font-serif italic text-center py-4">इस अंक में कोई नोट्स नहीं हैं।</p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* PANEL 7: STUDY ASSISTANT */}
                        {activeAiTool === "study" && (
                          <div className="space-y-4">
                            <p className="text-[10px] font-bold text-primary font-mono uppercase tracking-wider">अध्ययन साथी (Study Assistant):</p>
                            
                            <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4 font-serif">
                              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
                                <span className="text-xs font-bold">स्वाध्याय प्रगति:</span>
                                <span className="text-xs text-primary font-mono font-bold">{Math.round(((currentPage + 2) / selectedMag.pages.length) * 100)}%</span>
                              </div>

                              <div className="space-y-2 text-xs">
                                <p className="font-bold text-slate-700 dark:text-slate-350">स्वाध्याय चेकलिस्ट (Goals):</p>
                                <div className="space-y-1.5">
                                  <div className="flex items-center space-x-2">
                                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                    <span>अंक पठन प्रारंभ किया</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {((currentPage + 2) / selectedMag.pages.length) >= 0.5 ? (
                                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                    ) : (
                                      <div className="w-4 h-4 border border-slate-300 rounded-full shrink-0" />
                                    )}
                                    <span>50% से अधिक पठन पूरा किया</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {aiNotes.some(n => n.articleId === selectedMag.id) ? (
                                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                                    ) : (
                                      <div className="w-4 h-4 border border-slate-300 rounded-full shrink-0" />
                                    )}
                                    <span>स्वयं के अध्ययन नोट्स सुरक्षित किए</span>
                                  </div>
                                </div>
                              </div>

                              <div className="bg-primary/5 p-3 rounded-lg text-xs leading-relaxed mt-2 text-slate-600 dark:text-slate-400">
                                <strong className="text-primary block font-serif mb-1">💡 अध्ययन सलाह:</strong>
                                स्व-मूल्यांकन के लिए पठन के बाद 🎯 <strong>Quiz</strong> अनुभाग में जाकर प्रश्नोत्तरी अवश्य हल करें। इससे विषय की अवधारणा स्पष्ट होगी।
                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    </div>

                    {/* Chat Input Footer */}
                    {activeAiTool === "chat" && (
                      <form 
                        onSubmit={handleSendChat}
                        className="border-t border-slate-205 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-900/60 flex items-center space-x-2"
                      >
                        <input
                          type="text"
                          placeholder="पूछें (जैसे: पर्यावरण पर लेख कहाँ है?)..."
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          className="flex-grow bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary text-slate-700 dark:text-slate-250"
                        />
                        <button
                          type="submit"
                          className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary/95 transition-all shrink-0 cursor-pointer"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </form>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>

      {/* FULLSCREEN READING MODE OVERLAY */}
      <AnimatePresence>
        {isFullscreenMode && selectedMag && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0A0F1D] text-white flex flex-col justify-between p-6 select-text overflow-hidden"
          >
            {/* Topbar of Fullscreen */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-serif text-sm font-bold text-primary">{selectedMag.issue} — पूर्ण स्क्रीन पठन</h3>
                <span className="text-[10px] text-slate-400 font-mono">Page {currentPage + 1}-{currentPage + 2} of {selectedMag.pages.length}</span>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setZoomScale(prev => Math.min(2.0, prev + 0.15))}
                  className="p-2 bg-slate-800 border border-slate-700 hover:text-primary rounded-xl text-xs cursor-pointer flex items-center space-x-1"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoomScale(prev => Math.max(0.6, prev - 0.15))}
                  className="p-2 bg-slate-800 border border-slate-700 hover:text-primary rounded-xl text-xs cursor-pointer flex items-center space-x-1"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={handleScreenshot}
                  className="p-2 bg-slate-800 border border-slate-700 hover:text-primary rounded-xl text-xs cursor-pointer"
                >
                  📸 स्क्रीनशॉट
                </button>
                <button
                  onClick={() => setIsFullscreenMode(false)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center space-x-1"
                >
                  <Minimize2 className="w-4 h-4" />
                  <span>बाहर निकलें</span>
                </button>
              </div>
            </div>

            {/* Reading Grid wrapped in overflow-auto */}
            <div className="flex-grow flex items-center justify-center overflow-auto py-6">
              <div 
                style={{ 
                  transform: `scale(${zoomScale})`, 
                  transformOrigin: 'center center',
                  transition: 'transform 0.1s ease-out'
                }}
                className="shrink-0 flex items-center justify-center relative min-w-[768px] max-w-5xl"
              >
                {/* Left/Right navigation overlays */}
                <button 
                  onClick={prevPage} 
                  disabled={currentPage === 0}
                  className="absolute -left-12 z-20 p-3 bg-slate-800 hover:bg-slate-700 rounded-full disabled:opacity-20 text-slate-350 cursor-pointer shadow-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <button 
                  onClick={nextPage} 
                  disabled={currentPage + 2 >= selectedMag.pages.length}
                  className="absolute -right-12 z-20 p-3 bg-slate-800 hover:bg-slate-700 rounded-full disabled:opacity-20 text-slate-350 cursor-pointer shadow-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-2 gap-px w-[950px] min-h-[550px] border border-primary/20 rounded-2xl overflow-hidden shadow-2xl bg-[#FCFAF5]/5">
                  {/* Left Page */}
                  <div className="bg-[#FCFAF5] text-[#1E293B] p-10 flex flex-col justify-between border-r border-slate-200">
                    <span className="text-[9px] uppercase tracking-widest text-primary font-bold">युवाक्षर मासिक पत्रिका</span>
                    <div className="text-sm sm:text-base text-slate-850 font-serif leading-relaxed whitespace-pre-line mt-6 flex-grow pr-2">
                      {getPageContent(currentPage)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-6 pt-3 border-t border-slate-200 flex justify-between">
                      <span>अंक: {selectedMag.issue}</span>
                      <span>Page {currentPage + 1}</span>
                    </div>
                  </div>

                  {/* Right Page */}
                  <div className="bg-[#FCFAF5] text-[#1E293B] p-10 flex flex-col justify-between">
                    <span className="text-[9px] uppercase tracking-widest text-primary font-bold">युवाक्षर मासिक पत्रिका</span>
                    <div className="text-sm sm:text-base text-slate-850 font-serif leading-relaxed whitespace-pre-line mt-6 flex-grow pl-2">
                      {getPageContent(currentPage + 1)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-6 pt-3 border-t border-slate-200 flex justify-between">
                      <span>Page {currentPage + 2}</span>
                      <span>yuvakshar.org</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Progress Bar of Fullscreen */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-xs">
              <span className="font-hindi text-slate-400">स्रोत: युवाक्षर डिजिटल पत्रिका</span>
              
              <div className="w-64 space-y-1">
                <div className="flex justify-between text-[9px] text-slate-400">
                  <span>पठन प्रगति</span>
                  <span>{Math.round(((currentPage + 2) / selectedMag.pages.length) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                  <div className="bg-primary h-full" style={{ width: `${((currentPage + 2) / selectedMag.pages.length) * 100}%` }} />
                </div>
              </div>

              <span className="font-mono text-slate-400">Page {currentPage + 1}-{currentPage + 2} of {selectedMag.pages.length}</span>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
