"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, 
  Download, 
  Maximize, 
  Minimize, 
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
  ArrowLeft
} from "lucide-react";

import { useCms } from "@/store/CmsContext";
import GlassCard from "@/components/yuvakshar/GlassCard";
import { parseInlineMarkdown } from "@/lib/markdown";

interface ChatMessage {
  sender: "user" | "ai";
  text: string;
}

export default function MagazinePage() {
  const { magazines } = useCms();
  const [selectedMag, setSelectedMag] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(0); // Left page index
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeAiTool, setActiveAiTool] = useState<"chat" | "summary" | "audio" | "quiz" | "translate">("chat");

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
    "युवाक्षर में आपका स्वागत है. The main theme of this issue is digital sovereignty and indigenous AI.",
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

  const currentLatest = magazines[0] || { issue: "वर्तमान अंक", month: "मई 2025", coverImage: "/yuvakshar_logo.jpg", description: "" };

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
                    className="px-6 py-3 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary/95 shadow-md cursor-pointer"
                  >
                    पत्रिका पढ़ें
                  </button>
                  <button
                    onClick={() => alert("Downloading PDF Volume...")}
                    className="px-6 py-3 rounded-full border border-slate-200 dark:border-slate-800 hover:border-primary text-slate-500 dark:text-slate-200 hover:text-primary bg-white dark:bg-slate-850 text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>PDF डाउनलोड</span>
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
                      </div>
                      
                      <div className="p-6 space-y-4">
                        <div>
                          <h4 className="font-serif text-lg font-bold">{mag.issue}</h4>
                          <p className="text-[10px] text-slate-400 tracking-wider uppercase mt-1 font-mono">{mag.month}</p>
                        </div>
                        
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light line-clamp-3">
                          {mag.description || "मासिक विमर्श, लेख संग्रह और साहित्य विशेष के साथ प्रस्तुत नया अंक।"}
                        </p>

                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/40 flex items-center justify-between">
                          <button
                            onClick={() => setSelectedMag(mag)}
                            className="px-4 py-2 bg-primary/10 hover:bg-primary border border-primary/30 hover:border-transparent text-primary hover:text-white text-[10px] font-bold tracking-wider uppercase rounded-lg transition-all cursor-pointer"
                          >
                            पत्रिका पढ़ें
                          </button>
                          <button 
                            onClick={() => alert("Downloading PDF...")}
                            className="text-[10px] text-slate-400 hover:text-primary uppercase tracking-wider font-bold transition-colors cursor-pointer"
                          >
                            PDF
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
          
          /* VIEW 2: IMMERSIVE FLIPBOOK READER & AI DESK */
          <motion.div
            key="reader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`grid grid-cols-1 lg:grid-cols-12 gap-8 ${
              isFullscreen ? "fixed inset-0 z-50 bg-white dark:bg-[#0A0F1D] p-6 overflow-hidden flex flex-col justify-between" : ""
            }`}
          >
            {/* Left Area: Flipbook Reader (Col Span 7) */}
            <div className="lg:col-span-7 space-y-6 flex flex-col justify-between h-full">
              
              <div className="flex justify-between items-center bg-slate-50 dark:bg-[#0F172A]/40 p-3 rounded-xl border border-slate-200 dark:border-slate-850 shadow-sm">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setSelectedMag(null)}
                    className="p-2 text-slate-400 hover:text-primary cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h3 className="font-serif text-sm font-bold text-primary">{selectedMag.issue}</h3>
                    <p className="text-[9px] uppercase tracking-wider text-slate-400 font-mono">
                      Page {currentPage + 1}-{currentPage + 2} of {selectedMag.pages.length}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 border border-slate-200 dark:border-slate-850 text-slate-400 hover:text-primary rounded-lg text-xs cursor-pointer bg-white dark:bg-slate-800"
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex-grow flex items-center justify-center py-4 relative min-h-[400px]">
                
                <button 
                  onClick={prevPage} 
                  disabled={currentPage === 0}
                  className="absolute left-0 z-20 p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-primary disabled:opacity-20 text-slate-400 hover:text-primary transition-all cursor-pointer shadow"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={nextPage} 
                  disabled={currentPage + 2 >= selectedMag.pages.length}
                  className="absolute right-0 z-20 p-2.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 hover:border-primary disabled:opacity-20 text-slate-400 hover:text-primary transition-all cursor-pointer shadow"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-px w-full max-w-3xl h-[450px] border border-primary/20 rounded-2xl overflow-hidden shadow-2xl relative bg-primary/5">
                  
                  {/* Left Page */}
                  <div className="bg-white dark:bg-[#0F172A] p-8 flex flex-col justify-between border-r border-slate-200 dark:border-slate-850">
                    <span className="text-[8px] uppercase tracking-widest text-primary font-bold">युवाक्षर अंक</span>
                    <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-serif leading-relaxed whitespace-pre-line mt-4">
                      {getPageContent(currentPage)}
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono mt-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                      Page {currentPage + 1}
                    </div>
                  </div>

                  {/* Right Page */}
                  <div className="bg-white dark:bg-[#0F172A] p-8 flex flex-col justify-between">
                    <span className="text-[8px] uppercase tracking-widest text-primary font-bold">युवाक्षर अंक</span>
                    <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-serif leading-relaxed whitespace-pre-line mt-4">
                      {getPageContent(currentPage + 1)}
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono mt-4 pt-2 border-t border-slate-200 dark:border-slate-800">
                      Page {currentPage + 2}
                    </div>
                  </div>

                </div>

              </div>

              <div className="text-center text-xs text-slate-400 font-light">
                * Flipbook viewer supports custom sticky notes. Use the AI translation tool to read in English.
              </div>
            </div>

            {/* Right Area: AI Tools workspace (Col Span 5) */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full min-h-[480px]">
              
              <div className="bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col justify-between h-full shadow-lg">
                
                <div>
                  <div className="flex items-center space-x-2 text-primary border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    <h3 className="font-serif text-sm font-bold">युवाक्षर AI सहायक</h3>
                  </div>

                  {/* Tabs */}
                  <div className="grid grid-cols-5 gap-1 mb-4 select-none">
                    {[
                      { type: "chat", icon: MessageSquare, label: "Ask AI Chat" },
                      { type: "summary", icon: FileText, label: "Summary" },
                      { type: "audio", icon: Volume2, label: "Listen TTS" },
                      { type: "quiz", icon: HelpCircle, label: "Generate Quiz" },
                      { type: "translate", icon: Languages, label: "Translate" }
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

                  {/* AI TOOL PANELS */}
                  <div className="min-h-[260px] max-h-[300px] overflow-y-auto pr-1">
                    
                    {/* PANEL 1: AI CHAT */}
                    {activeAiTool === "chat" && (
                      <div className="space-y-3">
                        {chatMessages.map((msg, index) => (
                          <div key={index} className={`flex ${msg.sender === "ai" ? "justify-start" : "justify-end"}`}>
                            <div className={`p-3 rounded-xl text-xs max-w-[85%] border ${
                              msg.sender === "ai" 
                                ? "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 leading-relaxed" 
                                : "bg-primary/10 border-primary/20 text-primary font-medium"
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* PANEL 2: AI SUMMARY */}
                    {activeAiTool === "summary" && (
                      <div className="space-y-4 text-xs font-light leading-relaxed text-slate-600 dark:text-slate-400">
                        <p className="font-bold text-primary uppercase tracking-wider font-mono">अंक मुख्य सारांश:</p>
                        <ul className="list-disc list-inside space-y-2">
                          <li dangerouslySetInnerHTML={{ __html: parseInlineMarkdown("**डिजिटल संप्रभुता (Digital Sovereignty)**: पश्चिमी भाषा मॉडलों के प्रभुत्व को टक्कर देने के लिए भारत को स्वयं के सार्वजनिक कंप्यूट और भाषाई डेटाबेस (भाषिणी) की तत्काल आवश्यकता है।") }} />
                          <li dangerouslySetInnerHTML={{ __html: parseInlineMarkdown("**ग्रामीण प्रशासन**: पंचायतों में स्थापित हो रहे ऑप्टिकल फाइबर ग्रिड से नौकरशाही में कमी और त्वरित कल्याणकारी वितरण सक्षम हुआ है।") }} />
                          <li dangerouslySetInnerHTML={{ __html: parseInlineMarkdown("**काव्य रस**: युवाओं में राष्ट्र प्रेम और रचनात्मक ऊर्जा को संचरित करती कविता 'कर्मवीर युवा' का प्रकाशन।") }} />
                        </ul>
                      </div>
                    )}

                    {/* PANEL 3: AI AUDIO */}
                    {activeAiTool === "audio" && (
                      <div className="flex flex-col items-center justify-center py-8 space-y-6">
                        <button
                          onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                          className="p-5 rounded-full bg-primary text-white hover:bg-primary/95 shadow-md transition-all cursor-pointer scale-110"
                        >
                          {isPlayingAudio ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 fill-current" />}
                        </button>
                        
                        <div className="w-full space-y-1.5 text-center">
                          <p className="text-xs font-bold">{isPlayingAudio ? "अब सुना जा रहा है..." : "ऑडियो बंद है"}</p>
                          <p className="text-[10px] text-slate-400 font-mono">अंक — पृष्ठ {currentPage + 1} स्वर वाचन</p>
                          
                          {/* Progress bar */}
                          <div className="w-full h-1 bg-slate-200 dark:bg-slate-850 rounded-full overflow-hidden mt-3 max-w-xs mx-auto">
                            <div className="h-full bg-primary" style={{ width: `${audioProgress}%` }} />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* PANEL 4: AI QUIZ */}
                    {activeAiTool === "quiz" && (
                      <div className="space-y-4">
                        <p className="text-xs font-bold text-primary font-mono uppercase tracking-wider">अंक से संबंधित प्रश्नोत्तरी:</p>
                        
                        {quizScore === null ? (
                          <div className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg space-y-3">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Q1. पश्चिमी बड़े भाषा मॉडलों (LLMs) के डेटा पूर्वाग्रह से बचने के लिए भारत सरकार की कौन सी प्रमुख परियोजना कार्यरत है?</p>
                            <div className="space-y-1.5">
                              {["परियोजना तरंग", "भाषिणी परियोजना", "डिजिटल भारत मिशन", "सागरमाला ग्रिड"].map((opt, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setSelectedAnswer(idx)}
                                  className={`w-full text-left p-2 rounded border text-xs transition-all ${
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

                    {/* PANEL 5: AI TRANSLATION */}
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

                  </div>
                </div>

                {/* Send chat message footer (only shown for chat panel) */}
                {activeAiTool === "chat" && (
                  <form 
                    onSubmit={handleSendChat}
                    className="border-t border-slate-200 dark:border-slate-800 pt-4 mt-4 flex items-center space-x-2"
                  >
                    <input
                      type="text"
                      placeholder="पूछें (जैसे: पर्यावरण पर लेख कहाँ है?)..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-grow bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary text-slate-700 dark:text-slate-350"
                    />
                    <button
                      type="submit"
                      className="p-2.5 rounded-xl bg-primary text-white hover:bg-primary/95 transition-all shrink-0 cursor-pointer"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                )}

              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
