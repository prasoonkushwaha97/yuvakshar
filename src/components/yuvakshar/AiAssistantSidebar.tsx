"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Send, 
  X, 
  Plus, 
  Volume2,
  Play,
  Pause,
  Square,
  Cpu,
  BrainCircuit
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { stripMarkdown } from "@/lib/markdown";
import { ContentRenderer } from "@/components/content/ContentRenderer";

interface Message {
  sender: "user" | "ai";
  text: string;
  type?: "text" | "summary" | "points" | "quiz" | "vocab" | "dates" | "people" | "history" | "reading";
  data?: any;
}

export default function AiAssistantSidebar({ articleId }: { articleId?: string }) {
  const { 
    currentUser, 
    openAuthModal, 
    articles, 
    generateAiContent,
    saveAiNote,
    aiNotes,
    aiSettings,
  } = useCms();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"assistant" | "chat" | "notes" | "audio">("assistant");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Find current article
  const article = articles.find(a => a.id === articleId) || articles[0];

  // Chat message history
  const [chatMessages, setChatMessages] = useState<Message[]>([]);

  // Notes history generator
  const [noteType, setNoteType] = useState<"अध्ययन नोट्स" | "Revision Notes" | "Quick Notes" | "परीक्षा नोट्स">("अध्ययन नोट्स");
  const [generatedNote, setGeneratedNote] = useState("");
  const [isGeneratingNote, setIsGeneratingNote] = useState(false);

  // Assistant tab result state
  const [assistantResult, setAssistantResult] = useState<string>("");
  const [activeAssistantTool, setActiveAssistantTool] = useState<string>("");
  const [isAssistantLoading, setIsAssistantLoading] = useState(false);

  // Speech Synthesis states
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isPausedAudio, setIsPausedAudio] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setSynth(window.speechSynthesis);
    }
    // Initialize welcome message
    setChatMessages([
      { 
        sender: "ai", 
        text: `नमस्ते! मैं युवाक्षर AI ज्ञान सहायक हूँ। मैं इस लेख "${article?.title || 'लेख'}" का सारांश बना सकता हूँ, कठिन शब्द समझा सकता हूँ, या आपके प्रश्नों के उत्तर दे सकता हूँ। आप क्या पूछना चाहते हैं?`,
      }
    ]);

    const handleOpenSidebar = (e: Event) => {
      const customEv = e as CustomEvent;
      setIsOpen(true);
      if (customEv.detail?.tab) {
        setActiveTab(customEv.detail.tab);
      }
    };

    window.addEventListener("open-ai-sidebar", handleOpenSidebar);
    return () => {
      window.removeEventListener("open-ai-sidebar", handleOpenSidebar);
    };
  }, [article?.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  // Premium / Authorization check helper
  const checkAccess = (_featureName: string): boolean => {
    if (!currentUser) {
      openAuthModal(undefined, "Please login or create an account to continue.");
      return false;
    }
    
    // Features are free now
    return true;
  };

  // 1. Assistant features trigger
  const handleAssistantAction = async (action: string, label: string) => {
    if (!checkAccess("readerAssistant")) return;

    setIsAssistantLoading(true);
    setActiveAssistantTool(action);
    setAssistantResult("");

    try {
      const prompt = `लेख शीर्षक: "${article.title}"\nलेख श्रेणी: ${article.category}\nसामग्री: ${article.content}\n\nकृपया लेख के आधार पर निम्नलिखित कार्य करें: ${label}`;
      const responseText = await generateAiContent(prompt, action);
      setAssistantResult(responseText);
    } catch (err: any) {
      setAssistantResult(`त्रुटि: ${err.message || "एआई विश्लेषण विफल हुआ।"}`);
    } finally {
      setIsAssistantLoading(false);
    }
  };

  // 2. Chat trigger
  const handleSendChat = async (e?: React.FormEvent, presetQuery?: string) => {
    if (e) e.preventDefault();
    
    const queryText = presetQuery || input;
    if (!queryText.trim()) return;

    if (!checkAccess("articleChat")) return;

    setChatMessages(prev => [...prev, { sender: "user", text: queryText }]);
    if (!presetQuery) setInput("");
    setIsTyping(true);

    try {
      const prompt = `लेख: "${article.title}"\nश्रेणी: ${article.category}\nसामग्री: ${article.content}\n\nपाठक का प्रश्न: ${queryText}\n\nकृपया लेख की विषयवस्तु को ध्यान में रखकर उत्तर दें:`;
      const aiResponse = await generateAiContent(prompt, "chat");
      setChatMessages(prev => [...prev, { sender: "ai", text: aiResponse }]);
    } catch (err: any) {
      setChatMessages(prev => [...prev, { sender: "ai", text: `उत्तर देने में असमर्थ: ${err.message || "त्रुटि उत्पन्न हुई।"}` }]);
    } finally {
      setIsTyping(false);
    }
  };

  // 3. Notes generator
  const handleGenerateNotes = async () => {
    if (!checkAccess("noteGenerator")) return;

    setIsGeneratingNote(true);
    setGeneratedNote("");

    try {
      const featureKey = noteType === "अध्ययन नोट्स" ? "notes_study" :
                         noteType === "Revision Notes" ? "notes_revision" :
                         noteType === "Quick Notes" ? "notes_quick" : "notes_exam";
                         
      const label = `${noteType} तैयार करें।`;
      const prompt = `लेख: "${article.title}"\nसामग्री: ${article.content}\n\nकृपया इस लेख के आधार पर विस्तृत ${noteType} तैयार करें:`;
      
      const responseText = await generateAiContent(prompt, featureKey);
      setGeneratedNote(responseText);
    } catch (err: any) {
      setGeneratedNote(`त्रुटि: ${err.message || "नोट्स तैयार करने में असमर्थ।"}`);
    } finally {
      setIsGeneratingNote(false);
    }
  };

  const handleSaveNoteToProfile = () => {
    if (!currentUser) {
      openAuthModal(undefined, "Please login or create an account to continue.");
      return;
    }
    if (!generatedNote.trim()) return;

    saveAiNote({
      userId: currentUser.id,
      articleId: article.id,
      articleTitle: article.title,
      noteType: noteType,
      content: generatedNote
    });
    alert("✓ नोट्स आपके प्रोफ़ाइल (अध्ययन सामग्री) में सहेज लिए गए हैं!");
  };

  // 4. Speech Synthesis Player Controls
  const handlePlayAudio = () => {
    if (!checkAccess("audioSystem")) return;
    if (!synth || !article) return;

    if (isPausedAudio) {
      synth.resume();
      setIsPlayingAudio(true);
      setIsPausedAudio(false);
      return;
    }

    synth.cancel(); // Reset any speaking queue

    const cleanBodyText = stripMarkdown(article.content);
    const textToSpeak = `शीर्षक: ${article.title}. श्रेणी: ${article.category}. लेख का मुख्य भाग: ${cleanBodyText}`;
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = "hi-IN";
    utterance.rate = playbackRate;

    utterance.onend = () => {
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
    };
    
    utterance.onerror = (e) => {
      console.error("SpeechSynthesis error:", e);
      setIsPlayingAudio(false);
      setIsPausedAudio(false);
    };

    setCurrentUtterance(utterance);
    synth.speak(utterance);
    setIsPlayingAudio(true);
    setIsPausedAudio(false);
  };

  const handlePauseAudio = () => {
    if (!synth) return;
    if (synth.speaking && !synth.paused) {
      synth.pause();
      setIsPlayingAudio(false);
      setIsPausedAudio(true);
    }
  };

  const handleStopAudio = () => {
    if (!synth) return;
    synth.cancel();
    setIsPlayingAudio(false);
    setIsPausedAudio(false);
  };

  useEffect(() => {
    if (isPlayingAudio && synth) {
      synth.cancel();
      handlePlayAudio();
    }
  }, [playbackRate]);

  // Clean speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (synth) synth.cancel();
    };
  }, [synth]);

  const quickActions = [
    { label: "३० सेकंड सारांश", action: "30s_summary" },
    { label: "२ मिनट सारांश", action: "2m_summary" },
    { label: "विस्तृत सारांश", action: "detailed_summary" },
    { label: "बिंदुवार सारांश", action: "bullet_summary" },
    { label: "कठिन शब्द", action: "vocabulary" },
    { label: "तिथियाँ सूची", action: "dates" },
    { label: "प्रमुख व्यक्तित्व", action: "personalities" },
    { label: "ऐतिहासिक संदर्भ", action: "history" },
    { label: "आगे क्या पढ़ें", action: "further_reading" }
  ];

  const presetChatChips = [
    "इसका निष्कर्ष क्या है?",
    "इसे सरल भाषा में समझाएँ",
    "बच्चों को समझाएँ",
    "परीक्षा के लिए महत्वपूर्ण बिंदु बताइए"
  ];

  return (
    <>
      {/* Floating Sparkle Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed right-6 bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] lg:bottom-6 z-[40] p-4 rounded-full bg-gradient-to-tr from-primary to-amber-500 text-white font-bold shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] cursor-pointer flex items-center space-x-1"
        title="AI ज्ञान इंजन"
      >
        <Sparkles className="w-5.5 h-5.5 animate-pulse text-amber-100" />
        <span className="text-xs font-serif font-bold tracking-wide hidden md:inline">AI सहायक</span>
      </motion.button>

      {/* Sidebar Overlay panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-[49] bg-black/60 backdrop-blur-sm"
            />

            {/* Sidebar body (glassmorphic saffron borders) */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-full max-w-md z-[50] bg-[#FAF8F3]/98 dark:bg-[#080D1A]/95 border-l border-amber-500/20 shadow-2xl flex flex-col justify-between"
            >
              {/* Header */}
              <div className="p-4 border-b border-amber-500/10 flex items-center justify-between bg-primary/5">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                    <Cpu className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-bold text-gradient-gold text-slate-800 dark:text-white">युवाक्षर AI ज्ञान इंजन</h3>
                    <p className="text-[9px] uppercase tracking-wider text-slate-400 font-sans">
                      STUDY COMPANION SYSTEM v2.0
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Sub tabs Labeled Menu */}
              <div className="grid grid-cols-4 border-b border-amber-500/10 bg-slate-50/60 dark:bg-slate-950/40 text-[10px] font-serif font-bold text-center">
                <button 
                  onClick={() => setActiveTab("assistant")}
                  className={`py-3 border-b-2 transition-all cursor-pointer ${activeTab === "assistant" ? "border-primary text-primary bg-primary/5" : "border-transparent text-slate-450 hover:text-slate-800 dark:hover:text-white"}`}
                >
                  अध्ययन साथी
                </button>
                <button 
                  onClick={() => setActiveTab("chat")}
                  className={`py-3 border-b-2 transition-all cursor-pointer ${activeTab === "chat" ? "border-primary text-primary bg-primary/5" : "border-transparent text-slate-450 hover:text-slate-800 dark:hover:text-white"}`}
                >
                  लेख संवाद
                </button>
                <button 
                  onClick={() => setActiveTab("notes")}
                  className={`py-3 border-b-2 transition-all cursor-pointer ${activeTab === "notes" ? "border-primary text-primary bg-primary/5" : "border-transparent text-slate-450 hover:text-slate-800 dark:hover:text-white"}`}
                >
                  नोट्स मेकर
                </button>
                <button 
                  onClick={() => setActiveTab("audio")}
                  className={`py-3 border-b-2 transition-all cursor-pointer ${activeTab === "audio" ? "border-primary text-primary bg-primary/5" : "border-transparent text-slate-450 hover:text-slate-800 dark:hover:text-white"}`}
                >
                  स्वर वाचन
                </button>
              </div>

              {/* Tab Contents Scrollable container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                
                {/* 1. ASSISTANT COMPANION TAB */}
                {activeTab === "assistant" && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      {quickActions?.map((act) => (
                        <button
                          key={act.action}
                          onClick={() => handleAssistantAction(act.action, act.label)}
                          className={`p-2.5 rounded-xl border text-[10px] text-center font-serif font-semibold cursor-pointer transition-all ${
                            activeAssistantTool === act.action
                              ? "bg-primary text-white border-primary shadow-sm"
                              : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary/40 text-slate-650 dark:text-slate-350"
                          }`}
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>

                    {/* Result viewport */}
                    {(isAssistantLoading || assistantResult) && (
                      <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl text-[11px] leading-relaxed font-serif space-y-3 shadow-inner">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                          <span className="font-bold text-primary flex items-center space-x-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                            <span>AI विश्लेषण परिणाम</span>
                          </span>
                          {isAssistantLoading && (
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
                          )}
                        </div>
                        
                        <ContentRenderer content={assistantResult} className="text-[11px]" />
                      </div>
                    )}
                  </div>
                )}

                {/* 2. CHAT TAB */}
                {activeTab === "chat" && (
                  <div className="h-full flex flex-col justify-between space-y-4">
                    {/* Chat Messages */}
                    <div className="flex-grow space-y-3 text-[11px]">
                      {chatMessages?.map((msg, index) => {
                        const isAi = msg.sender === "ai";
                        return (
                          <div 
                            key={index} 
                            className={`flex ${isAi ? "justify-start" : "justify-end"}`}
                          >
                            <div className={`max-w-[85%] rounded-2xl p-3 leading-relaxed border shadow-sm font-serif ${
                              isAi 
                                ? "bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-250"
                                : "bg-primary/10 border-primary/25 text-slate-850 dark:text-slate-200 font-semibold"
                            }`}>
                              <ContentRenderer content={msg.text} className="text-[11px]" />
                            </div>
                          </div>
                        );
                      })}
                      
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 rounded-2xl p-3 flex space-x-1.5 items-center">
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></span>
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chips suggestions */}
                    <div className="space-y-1.5 border-t border-slate-200/40 dark:border-slate-800/40 pt-3">
                      <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-sans">त्वरित प्रश्न (Quick Questions)</p>
                      <div className="flex flex-wrap gap-1">
                        {presetChatChips?.map((chip, idx) => (
                          <button
                            key={idx}
                            onClick={(_e) => handleSendChat(undefined, chip)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/40 rounded-xl px-2.5 py-1.5 text-[9.5px] text-slate-500 hover:text-slate-800 dark:hover:text-white font-serif transition-all cursor-pointer"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. NOTES MAKER TAB */}
                {activeTab === "notes" && (
                  <div className="space-y-4 font-serif">
                    <div className="space-y-2">
                      <label className="text-[10px] text-slate-500 font-bold uppercase block">नोट्स का प्रकार चुनें</label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {(["अध्ययन नोट्स", "Revision Notes", "Quick Notes", "परीक्षा नोट्स"] as const)?.map((type) => (
                          <button
                            key={type}
                            onClick={() => setNoteType(type)}
                            className={`py-2 px-3 rounded-xl border font-bold transition-all text-center cursor-pointer ${
                              noteType === type
                                ? "bg-primary text-white border-primary"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary/20 text-slate-650"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleGenerateNotes}
                      disabled={isGeneratingNote}
                      className="w-full bg-primary hover:bg-primary/95 text-white py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50 text-xs"
                    >
                      <BrainCircuit className="w-4 h-4" />
                      <span>{isGeneratingNote ? "नोट्स संकलित हो रहे हैं..." : "एआई नोट्स तैयार करें"}</span>
                    </button>

                    {/* Output Note box */}
                    {(isGeneratingNote || generatedNote) && (
                      <div className="bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl text-[11px] leading-relaxed space-y-4 shadow-sm relative">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                          <span className="font-bold text-primary block">{noteType}</span>
                          {generatedNote && (
                            <button
                              onClick={handleSaveNoteToProfile}
                              className="text-[10px] font-bold text-amber-600 hover:text-amber-700 flex items-center space-x-0.5 cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>प्रोफ़ाइल में सहेजें</span>
                            </button>
                          )}
                        </div>

                        <ContentRenderer content={generatedNote} className="text-[11px]" />
                      </div>
                    )}
                  </div>
                )}

                {/* 4. AUDIO VOICE TAB */}
                {activeTab === "audio" && (
                  <div className="space-y-6 text-center py-6 font-serif">
                    <div className="w-20 h-20 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary animate-pulse">
                      <Volume2 className="w-9 h-9" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-800 dark:text-white">AI स्वर वाचन प्रणाली</h4>
                      <p className="text-[10.5px] text-slate-400 font-light px-4">
                        लेख का देवनागरी पाठ विश्लेषण कर स्पष्ट हिंदी भाषा में स्वर वाचन सुनें।
                      </p>
                    </div>

                    {/* Controller bar */}
                    <div className="flex items-center justify-center space-x-4">
                      {isPlayingAudio ? (
                        <button
                          onClick={handlePauseAudio}
                          className="p-3 bg-amber-500 hover:bg-amber-600 text-white rounded-full transition-all shadow-md cursor-pointer"
                          title="वाचन रोकें (Pause)"
                        >
                          <Pause className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={handlePlayAudio}
                          className="p-3 bg-primary hover:bg-primary/95 text-white rounded-full transition-all shadow-md cursor-pointer"
                          title="वाचन प्रारंभ (Play)"
                        >
                          <Play className="w-5 h-5 fill-current" />
                        </button>
                      )}

                      {(isPlayingAudio || isPausedAudio) && (
                        <button
                          onClick={handleStopAudio}
                          className="p-3 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full transition-all cursor-pointer"
                          title="वाचन बंद करें (Stop)"
                        >
                          <Square className="w-5 h-5 fill-current" />
                        </button>
                      )}
                    </div>

                    {/* Speed rate modifier */}
                    <div className="max-w-xs mx-auto space-y-2.5 pt-4 border-t border-slate-200/40 dark:border-slate-800/40">
                      <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                        <span>वाचन गति (Speech Speed)</span>
                        <span className="font-sans text-primary">{playbackRate}x</span>
                      </div>
                      
                      <div className="flex justify-between gap-1">
                        {([0.5, 1.0, 1.25, 1.5, 2.0] as const)?.map((rate) => (
                          <button
                            key={rate}
                            onClick={() => setPlaybackRate(rate)}
                            className={`flex-1 py-1 rounded border text-[9.5px] font-sans font-bold transition-all cursor-pointer ${
                              playbackRate === rate
                                ? "bg-primary text-white border-primary"
                                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary/20 text-slate-650"
                            }`}
                          >
                            {rate}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Chat Input form footer */}
              {activeTab === "chat" && (
                <form 
                  onSubmit={(e) => handleSendChat(e)}
                  className="p-3 border-t border-amber-500/10 bg-white dark:bg-slate-900/60 flex items-center space-x-2"
                >
                  <input
                    type="text"
                    placeholder="लेख के निष्कर्ष या विषय में पूछें..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-4 py-2 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:border-primary font-serif font-light"
                  />
                  <button
                    type="submit"
                    className="p-2 bg-primary text-white hover:bg-primary/95 rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
