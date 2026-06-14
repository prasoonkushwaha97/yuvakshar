"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Flame, 
  BookMarked, 
  Activity, 
  Calendar, 
  Award, 
  BookOpen, 
  ChevronRight, 
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Trash2,
  Lock,
  FileText,
  UserCheck,
  CheckCircle2,
  Brain,
  ChevronLeft,
  Crown,
  Copy,
  Download,
  Share2,
  Plus,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Gem
} from "lucide-react";

import { useCms, Article } from "@/store/CmsContext";
import GlassCard from "@/components/yuvakshar/GlassCard";
import ProfileTab from "@/components/yuvakshar/ProfileTab";
import SettingsTab from "@/components/yuvakshar/SettingsTab";
import { User, Settings, Bookmark, Bell, FileEdit } from "lucide-react";

const translateRole = (role?: string | null) => {
  if (role === null) return "सदस्य";
  if (!role) return "अतिथि";
  switch (role) {
    case "Owner": return "स्वामी";
    case "Admin": return "प्रशासक";
    case "Editor-in-Chief": return "प्रधान संपादक";
    case "Managing Editor": return "प्रबंध संपादक";
    case "Editor": return "संपादक";
    case "Fact Check Reviewer": return "सत्यता समीक्षक";
    case "Author": return "लेखक";
    case "Contributor": return "योगदानकर्ता";
    default: return role;
  }
};

export default function DashboardPage() {
  const { 
    currentUser, 
    openAuthModal, 
     
    articles, 
    aiNotes, 
    deleteAiNote,
    quizAttempts,
    quizCertificates,
    quizzes,
    
    
    
    
    
    
    submissions,
    authLoading
  } = useCms();

  const [activeTab, setActiveTab] = useState<"study" | "notes" | "author" | "profile" | "submissions" | "bookmarks" | "notifications">("study");
  const [profileSubTab, setProfileSubTab] = useState<"edit" | "settings">("edit");
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Article[]>([]);
  const [streak, setStreak] = useState(5); // Default study streak
  const [friendEmail, setFriendEmail] = useState("");
  const [refSuccessMsg, setRefSuccessMsg] = useState("");
  const [refErrorMsg, setRefErrorMsg] = useState("");
  const [mounted, setMounted] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    
    // Parse query params to set active tab and sub tab
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      const sub = params.get("sub");
      if (tab) {
        setActiveTab(tab as any);
      }
      if (sub === "settings") {
        setProfileSubTab("settings");
      } else {
        setProfileSubTab("edit");
      }
    }
    
    // Load Bookmarks
    const saved = localStorage.getItem("yuvakshar_bookmarks");
    let bookmarkIds: string[] = [];
    if (saved) {
      bookmarkIds = JSON.parse(saved);
      setBookmarks(bookmarkIds);
    } else {
      // Set a default bookmark to start
      bookmarkIds = ["art-1", "art-3"];
      setBookmarks(bookmarkIds);
      localStorage.setItem("yuvakshar_bookmarks", JSON.stringify(bookmarkIds));
    }

    const filtered = articles.filter(art => bookmarkIds.includes(art.id));
    setBookmarkedArticles(filtered);

    // Load Notifications
    const localNotifs = localStorage.getItem("yuvakshar_notifications");
    if (localNotifs) {
      setNotifications(JSON.parse(localNotifs));
    } else {
      const initialNotifs = [
        { id: "n1", title: "युवाक्षर में आपका स्वागत है!", message: "युवाक्षर विचारों और चिंतन का एक उत्कृष्ट भाषाई मंच है।", date: new Date().toISOString(), read: false },
        { id: "n2", title: "स्वाध्याय निरंतरता सक्रिय", message: "बधाई हो! आपका लगातार 5 दिनों का स्वाध्याय रिकॉर्ड सक्रिय है। इसे बनाए रखें।", date: new Date().toISOString(), read: false }
      ];
      setNotifications(initialNotifs);
      localStorage.setItem("yuvakshar_notifications", JSON.stringify(initialNotifs));
    }
  }, [articles]);

  const markNotificationRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem("yuvakshar_notifications", JSON.stringify(updated));
  };

  const deleteNotification = (id: string) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    localStorage.setItem("yuvakshar_notifications", JSON.stringify(updated));
  };

  const removeBookmark = (id: string) => {
    const updated = bookmarks.filter(b => b !== id);
    setBookmarks(updated);
    localStorage.setItem("yuvakshar_bookmarks", JSON.stringify(updated));
    setBookmarkedArticles(prev => prev.filter(art => art.id !== id));
  };

  

  // Recommendations based on user categories
  const recommendedArticles = articles.filter(art => !bookmarks.includes(art.id)).slice(0, 3);

  // Filter dynamic quiz stats
  const userAttempts = currentUser ? quizAttempts.filter(att => att.userId === currentUser.id) : [];
  const totalAttempts = userAttempts.length;
  const averageScore = totalAttempts > 0 
    ? Math.round(userAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / totalAttempts) 
    : 82; // Default mock average score
  
  const totalStudyTimeSeconds = totalAttempts > 0 
    ? userAttempts.reduce((acc, curr) => acc + curr.durationSeconds, 0) 
    : 4800; // Default mock: 80 mins
  const totalStudyTimeMinutes = Math.round(totalStudyTimeSeconds / 60);

  const certificatesCount = currentUser 
    ? quizCertificates.filter(c => c.userId === currentUser.id).length 
    : 1; // Default mock certificate count

  // Calculate Cognitive Metrics based on quiz answers
  const getCognitiveMetrics = () => {
    const counts = { MCQ: 0, "Fact Recall": 0, Comprehension: 0, Analysis: 0, Application: 0 };
    const corrects = { MCQ: 0, "Fact Recall": 0, Comprehension: 0, Analysis: 0, Application: 0 };
    
    if (totalAttempts > 0) {
      userAttempts.forEach(att => {
        const artQuiz = quizzes.find(q => q.articleId === att.articleId);
        if (artQuiz) {
          artQuiz.questions.forEach((q, qIdx) => {
            if (att.answers[qIdx] !== undefined) {
              const type = q.questionType || "MCQ";
              counts[type] = (counts[type] || 0) + 1;
              if (att.answers[qIdx] === q.correctAnswer) {
                corrects[type] = (corrects[type] || 0) + 1;
              }
            }
          });
        }
      });
    }

    return {
      memory: counts["Fact Recall"] > 0 ? Math.round((corrects["Fact Recall"] / counts["Fact Recall"]) * 100) : 84,
      comprehension: counts["Comprehension"] > 0 ? Math.round((corrects["Comprehension"] / counts["Comprehension"]) * 100) : 88,
      analysis: counts["Analysis"] > 0 ? Math.round((corrects["Analysis"] / counts["Analysis"]) * 100) : 76,
      logic: counts["Application"] > 0 ? Math.round((corrects["Application"] / counts["Application"]) * 100) : 80
    };
  };

  const cognitive = getCognitiveMetrics();

  // Author Submissions & Evaluations list for Weekly Author Review
  const getAuthorEvaluations = () => {
    return [
      {
        id: "eval-1",
        title: "डिजिटल भारत: भविष्य की नई राहें",
        category: "विशेष लेख",
        date: "2026-06-10",
        score: 92,
        reviewer: "प्रधान संपादक",
        remarks: "विषय की प्रस्तुति सराहनीय है। लेखन शैली उत्कृष्ट है।",
        strengths: "सरल भाषा, नवीन दृष्टिकोण",
        improvements: "तथ्यों के सत्यापन के साथ कुछ और संदर्भ जोड़ने की आवश्यकता है।"
      },
      {
        id: "eval-2",
        title: "पर्यावरण संकट और युवा पीढ़ी का दायित्व",
        category: "पर्यावरण",
        date: "2026-06-09",
        score: 85,
        reviewer: "प्रबंध संपादक",
        remarks: "विषय की प्रस्तुति सराहनीय है। पर्यावरण संरक्षण पर युवाओं के उत्तरदायित्व को तार्किक रूप से रेखांकित किया गया है।",
        strengths: "सरल और सुपाठ्य भाषा, व्यावहारिक उदाहरण, भावनात्मक जुड़ाव",
        improvements: "लेख के अंत में उद्धृत संदर्भो (citations) का मानक प्रारूप में उल्लेख आवश्यक है।"
      }
    ];
  };

  const authorEvaluations = getAuthorEvaluations();

  if (mounted && authLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] dark:bg-[#0A0F1D] flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 font-serif">
            प्रमाणीकरण की जाँच की जा रही है...
          </p>
        </div>
      </div>
    );
  }

  if (mounted && !currentUser) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] dark:bg-[#0A0F1D] flex items-center justify-center p-4">
        <GlassCard glow="gold" className="max-w-md w-full p-8 text-center space-y-6">
          <Lock className="w-12 h-12 text-primary mx-auto animate-bounce" />
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-slate-800 dark:text-white">लॉगिन आवश्यक है</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-serif leading-relaxed">
              युवाक्षर डैशबोर्ड तक पहुँचने के लिए कृपया पहले लॉगिन करें।
            </p>
          </div>
          <button
            onClick={() => openAuthModal(undefined, "Please login or create an account to continue.")}
            className="w-full bg-primary hover:bg-primary/95 text-white py-3.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer"
          >
            Please login or create an account to continue.
          </button>
        </GlassCard>
      </div>
    );
  }

  const isAuthorOrEditor = currentUser && currentUser.role !== null;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 min-h-screen text-[#0F172A] dark:text-slate-200">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-primary/20 pb-6 mb-8 gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl text-primary font-bold">
            रचनाकार एवं स्वाध्याय मंच (Dashboard)
          </h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-sans mt-1.5 font-bold">
            Track reading habits, saved analyses, study streaks, and metrics
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link 
            href="/dashboard/profile"
            className="flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-800 rounded-2xl px-4 py-2.5 font-serif text-xs font-bold transition-all shadow-sm"
          >
            <span>प्रोफ़ाइल सेटिंग्स (Settings)</span>
          </Link>

          
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 justify-start space-x-2 pb-px text-xs font-bold font-serif mb-8 scrollbar-none">
        <button
          onClick={() => setActiveTab("study")}
          className={`pb-3 px-4 transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 shrink-0 ${
            activeTab === "study"
              ? "border-primary text-primary"
              : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>१. स्वाध्याय एवं प्रगति</span>
        </button>
        <button
          onClick={() => setActiveTab("notes")}
          className={`pb-3 px-4 transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 shrink-0 ${
            activeTab === "notes"
              ? "border-primary text-primary"
              : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>२. अध्ययन सामग्री</span>
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 px-4 transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 shrink-0 ${
            activeTab === "profile"
              ? "border-primary text-primary"
              : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <User className="w-4 h-4" />
          <span>३. मेरा प्रोफ़ाइल</span>
        </button>
        <button
          onClick={() => setActiveTab("submissions")}
          className={`pb-3 px-4 transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 shrink-0 ${
            activeTab === "submissions"
              ? "border-primary text-primary"
              : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <FileEdit className="w-4 h-4" />
          <span>४. सबमिशन व लेख</span>
        </button>
        <button
          onClick={() => setActiveTab("bookmarks")}
          className={`pb-3 px-4 transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 shrink-0 ${
            activeTab === "bookmarks"
              ? "border-primary text-primary"
              : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>५. बुकमार्क</span>
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`pb-3 px-4 transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 shrink-0 ${
            activeTab === "notifications"
              ? "border-primary text-primary"
              : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>६. सूचनाएं</span>
        </button>
        
        {isAuthorOrEditor && (
          <button
            onClick={() => setActiveTab("author")}
            className={`pb-3 px-4 transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 shrink-0 ${
              activeTab === "author"
                ? "border-primary text-primary"
                : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>लेखक समीक्षा</span>
          </button>
        )}
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT BLOCK: Active Tab Content (Col Span 8) */}
        <div className="lg:col-span-8 space-y-8">

          {/* TAB 1: STUDY & PROGRESS */}
          {activeTab === "study" && (
            <div className="space-y-8">
              
              {/* Three Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <GlassCard glow="gold" className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-sans">सहेजे गए नोट्स</span>
                    <p className="text-2xl font-serif font-bold text-primary">{aiNotes.length}</p>
                  </div>
                  <BookMarked className="w-8 h-8 text-primary/20" />
                </GlassCard>

                <GlassCard glow="blue" className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-sans">ज्ञान परीक्षा (Attempts)</span>
                    <p className="text-2xl font-serif font-bold text-blue-500">{totalAttempts}</p>
                  </div>
                  <Activity className="w-8 h-8 text-blue-500/20" />
                </GlassCard>

                <GlassCard glow="saffron" className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold font-sans">अर्जित प्रमाणपत्र</span>
                    <p className="text-2xl font-serif font-bold text-amber-500">{certificatesCount}</p>
                  </div>
                  <Award className="w-8 h-8 text-amber-500/20" />
                </GlassCard>
              </div>

              {/* Weekly Activity index chart */}
              <GlassCard glow="blue" className="p-6">
                <div className="flex justify-between items-center border-b border-primary/10 pb-4 mb-6">
                  <div className="flex items-center space-x-2 text-blue-500">
                    <TrendingUp className="w-4.5 h-4.5" />
                    <h3 className="font-serif text-sm font-bold">बौद्धिक गतिविधि सूचकांक (Minutes)</h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-sans font-bold">साप्ताहिक सारांश</span>
                </div>

                {/* Premium Interactive Bar Chart SVG */}
                <div className="w-full h-[220px] flex items-end justify-between relative px-2 pt-8">
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                    <div className="w-full border-t border-slate-400 dark:border-white" />
                    <div className="w-full border-t border-slate-400 dark:border-white" />
                    <div className="w-full border-t border-slate-400 dark:border-white" />
                    <div className="w-full border-t border-slate-400 dark:border-white" />
                  </div>

                  {[
                    { day: "सोम", mins: 25 },
                    { day: "मंगल", mins: 15 },
                    { day: "बुध", mins: 35 },
                    { day: "गुरु", mins: 45 },
                    { day: "शुक्र", mins: 60 },
                    { day: "शनि", mins: 30 },
                    { day: "रवि", mins: 20 }
                  ].map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center flex-1 space-y-2 group relative">
                      <span className="absolute -top-6 text-[9px] font-sans font-bold text-blue-500 bg-white dark:bg-slate-900 border border-blue-500/30 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.mins} मिनट
                      </span>
                      
                      {/* Bar */}
                      <div 
                        className="w-8 rounded-t bg-gradient-to-t from-blue-500/40 to-blue-500 hover:from-primary/40 hover:to-primary transition-all cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.15)]"
                        style={{ height: item.mins * 3 }}
                      />
                      
                      <span className="text-[10px] text-slate-400 font-sans font-bold">{item.day}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* AI Knowledge Report (एआई ज्ञान रिपोर्ट) */}
              <GlassCard glow="gold" className="p-6 relative overflow-hidden">
                <div className="flex items-center space-x-2 text-primary border-b border-primary/10 pb-4 mb-6">
                  <Brain className="w-5 h-5 text-amber-500 animate-pulse" />
                  <h3 className="font-serif text-sm font-bold">एआई ज्ञान रिपोर्ट (AI Knowledge Report)</h3>
                </div>

                {/* Report Content */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-sans text-xs">
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="block text-[10px] text-slate-400 font-bold mb-1">पढ़े गए लेख</span>
                      <strong className="text-lg font-bold font-mono text-primary">{userAttempts.length + 5} लेख</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="block text-[10px] text-slate-400 font-bold mb-1">औसत स्कोर</span>
                      <strong className="text-lg font-bold font-mono text-blue-500">{averageScore}%</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="block text-[10px] text-slate-400 font-bold mb-1">स्वाध्याय अवधि</span>
                      <strong className="text-lg font-bold font-mono text-amber-500">{totalStudyTimeMinutes} मिनट</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="block text-[10px] text-slate-400 font-bold mb-1">ज्ञानवीर रैंक</span>
                      <strong className="text-lg font-bold font-serif text-green-500">उन्नत पाठक</strong>
                    </div>
                  </div>

                  {/* Cognitive Strengths */}
                  <div className="space-y-4">
                    <h4 className="font-serif text-xs font-bold text-slate-800 dark:text-white border-l-2 border-primary pl-2 mb-2">
                      संज्ञानात्मक क्षमता सूचकांक (Cognitive Breakdown)
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Metric 1 */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                          <span>स्मरण शक्ति (Fact Recall)</span>
                          <span className="font-mono">{cognitive.memory}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-primary h-full rounded-full" style={{ width: `${cognitive.memory}%` }} />
                        </div>
                      </div>

                      {/* Metric 2 */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                          <span>विषय समझ (Comprehension)</span>
                          <span className="font-mono">{cognitive.comprehension}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full" style={{ width: `${cognitive.comprehension}%` }} />
                        </div>
                      </div>

                      {/* Metric 3 */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                          <span>विश्लेषण क्षमता (Analysis)</span>
                          <span className="font-mono">{cognitive.analysis}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: `${cognitive.analysis}%` }} />
                        </div>
                      </div>

                      {/* Metric 4 */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                          <span>तार्किक अनुप्रयोग (Logic & Application)</span>
                          <span className="font-mono">{cognitive.logic}%</span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-green-500 h-full rounded-full" style={{ width: `${cognitive.logic}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation Panel */}
                  <div className="bg-primary/5 border border-primary/20 p-4 rounded-2xl text-xs space-y-2 font-serif">
                    <p className="font-bold text-slate-800 dark:text-white flex items-center space-x-1">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>एआई साप्ताहिक अधिगम सुझाव (Learning Recommendations)</span>
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 font-light leading-relaxed">
                      सुझाव: आपके विश्लेषण (Analysis) सूचकांक में सुधार की गुंजाइश है। इसके लिए संपादकीय श्रेणी के लंबे लेखों को पढ़ें और <strong>"कठिन शब्द समझाइए"</strong> और <strong>"मुख्य बिंदु"</strong> मॉड्यूल का उपयोग अधिक करें।
                    </p>
                  </div>
                </div>
              </GlassCard>

            </div>
          )}

          {/* TAB 2: SAVED NOTES (अध्ययन सामग्री) */}
          {activeTab === "notes" && (
            <div className="space-y-4">
              <h2 className="text-sm font-serif text-primary uppercase tracking-wider font-bold mb-4">
                सहेजे गए अध्ययन नोट्स (Saved Notes Viewer)
              </h2>

              {aiNotes.length > 0 ? (
                <div className="space-y-4">
                  {aiNotes.map((note) => (
                    <GlassCard key={note.id} glow="none" className="p-5 space-y-3 relative">
                      
                      {/* Note Header */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold tracking-wider text-primary px-2 py-0.5 bg-primary/10 rounded">
                            {note.noteType}
                          </span>
                          <h4 className="text-xs font-bold text-slate-800 dark:text-white font-serif leading-snug">
                            {note.articleTitle}
                          </h4>
                          <span className="text-[9px] text-slate-400 block font-mono">
                            सहेजा गया: {new Date(note.createdAt).toLocaleDateString("hi-IN")} | {new Date(note.createdAt).toLocaleTimeString("hi-IN")}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm("क्या आप वाकई इस नोट को हटाना चाहते हैं?")) {
                              deleteAiNote(note.id);
                            }
                          }}
                          className="text-slate-400 hover:text-red-500 transition-colors p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                          title="Delete Note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Note Body */}
                      <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl text-[11px] leading-relaxed font-serif text-slate-700 dark:text-slate-300 whitespace-pre-line">
                        {note.content}
                      </div>

                      {/* Read Article Link */}
                      <div className="flex justify-end pt-1">
                        <Link
                          href={`/editorial?id=${note.articleId}`}
                          className="text-[10px] text-primary hover:underline font-bold font-serif flex items-center space-x-1"
                        >
                          <span>मूल लेख पढ़ें</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                    </GlassCard>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/30">
                  <BookMarked className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs text-slate-500 font-serif">आपने अभी तक कोई एआई अध्ययन नोट्स नहीं बचाए हैं।</p>
                  <p className="text-[10px] text-slate-400 font-serif mt-1">
                    लेख के पन्ने पर जाकर <strong>अध्ययन साथी (AI Study Companion)</strong> से नोट्स बनाकर सुरक्षित करें।
                  </p>
                  <div className="mt-4">
                    <Link
                      href="/"
                      className="inline-block bg-primary text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer"
                    >
                      लेख ब्राउज़ करें
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROFILE & SETTINGS (मेरा प्रोफ़ाइल) */}
          {activeTab === "profile" && currentUser && (
            <div className="space-y-6">
              <div className="flex border-b border-slate-200 dark:border-slate-800 pb-px text-xs font-bold font-serif mb-6 space-x-4">
                <button
                  onClick={() => setProfileSubTab("edit")}
                  className={`pb-2 transition-all border-b-2 cursor-pointer flex items-center space-x-1 ${
                    profileSubTab === "edit" ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>प्रोफ़ाइल संपादित करें</span>
                </button>
                <button
                  onClick={() => setProfileSubTab("settings")}
                  className={`pb-2 transition-all border-b-2 cursor-pointer flex items-center space-x-1 ${
                    profileSubTab === "settings" ? "border-primary text-primary" : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>सुलभता एवं ऐप सेटिंग्स</span>
                </button>
              </div>

              {profileSubTab === "edit" ? (
                <ProfileTab currentUser={currentUser} translateRole={translateRole} />
              ) : (
                <SettingsTab />
              )}
            </div>
          )}

          {/* TAB 4: SUBMISSIONS & ARTICLES (सबमिशन व लेख) */}
          {activeTab === "submissions" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                <h2 className="text-sm font-serif text-primary uppercase tracking-wider font-bold">
                  मेरे सबमिशन व लेख
                </h2>
                <Link
                  href="/submit-article"
                  className="bg-primary hover:bg-primary/95 text-white font-bold py-2 px-4 rounded-xl text-xs transition-all flex items-center space-x-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>रचना सबमिट करें</span>
                </Link>
              </div>

              {/* User Submissions List */}
              <div className="space-y-4">
                <h3 className="font-serif text-xs font-bold text-slate-700 dark:text-slate-300">
                  लेखन ड्राफ्ट व सबमिशन स्थिति
                </h3>
                {(() => {
                  const userSubmissions = submissions.filter(s => s.email === currentUser?.email);
                  if (userSubmissions.length > 0) {
                    return (
                      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-[#0f172a]/20">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 font-serif">
                              <th className="p-3 text-slate-700 dark:text-slate-300">विषय / शीर्षक</th>
                              <th className="p-3 text-slate-700 dark:text-slate-300">प्रकार</th>
                              <th className="p-3 text-slate-700 dark:text-slate-300">दिनांक</th>
                              <th className="p-3 text-slate-700 dark:text-slate-300">स्थिति</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {userSubmissions.map((sub) => (
                              <tr key={sub.id} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/20">
                                <td className="p-3 font-serif font-bold text-slate-800 dark:text-white max-w-[200px] truncate">{sub.subject || sub.title || "बिना शीर्षक"}</td>
                                <td className="p-3 capitalize">{sub.type}</td>
                                <td className="p-3 font-mono">{new Date(sub.created_at).toLocaleDateString("hi-IN")}</td>
                                <td className="p-3">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                                    sub.status === "Resolved" || sub.status === "Archived"
                                      ? "bg-green-500/10 border-green-500/30 text-green-500"
                                      : sub.status === "In Progress"
                                        ? "bg-blue-500/10 border-blue-500/30 text-blue-500"
                                        : "bg-amber-500/10 border-amber-500/30 text-amber-500"
                                  }`}>
                                    {sub.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  }
                  return <p className="text-xs text-slate-500 font-serif">कोई सबमिशन ड्राफ्ट नहीं मिले।</p>;
                })()}

                {/* Published Articles */}
                {(() => {
                  const userArticles = articles.filter(a => a.author === currentUser?.name);
                  return (
                    <>
                      <h3 className="font-serif text-xs font-bold text-slate-700 dark:text-slate-300 pt-4">
                        मेरे प्रकाशित लेख ({userArticles.length})
                      </h3>
                      {userArticles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {userArticles.map((art) => (
                            <GlassCard key={art.id} className="p-4 flex justify-between items-center gap-3">
                              <div className="space-y-1 min-w-0 flex-1">
                                <span className="text-[8px] uppercase tracking-wider text-primary font-bold">{art.category}</span>
                                <Link href={`/editorial?id=${art.id}`} className="block text-xs font-bold text-slate-800 dark:text-white hover:text-primary truncate">
                                  {art.title}
                                </Link>
                                <span className="text-[9px] text-slate-400 font-mono block">पठित संख्या: {art.views || 0}</span>
                              </div>
                              <Link href={`/editorial?id=${art.id}`} className="text-xs text-primary font-bold hover:underline shrink-0">
                                पढ़ें
                              </Link>
                            </GlassCard>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 font-serif">कोई प्रकाशित लेख नहीं है।</p>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB 5: BOOKMARKS (बुकमार्क) */}
          {activeTab === "bookmarks" && (
            <div className="space-y-4">
              <h2 className="text-sm font-serif text-primary uppercase tracking-wider font-bold mb-4">
                बुकमार्क व सहेजे गए लेख
              </h2>
              {bookmarkedArticles.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bookmarkedArticles.map((art) => (
                    <GlassCard key={art.id} className="p-5 flex flex-col justify-between h-full space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] uppercase font-bold tracking-wider text-primary px-2 py-0.5 bg-primary/10 rounded">
                            {art.category}
                          </span>
                          <button
                            onClick={() => removeBookmark(art.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <h4 className="text-sm font-bold text-slate-800 dark:text-white font-serif leading-snug">
                          {art.title}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-serif line-clamp-3 leading-relaxed">
                          {art.summary}
                        </p>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800/80 pt-3">
                        <span className="font-mono">समय: {art.readTime || "5 मिनट"}</span>
                        <Link
                          href={`/editorial?id=${art.id}`}
                          className="text-primary hover:underline font-bold font-serif flex items-center space-x-1"
                        >
                          <span>लेख पढ़ें</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/30">
                  <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs text-slate-500 font-serif">आपने अभी तक कोई बुकमार्क नहीं सहेजा है।</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 6: NOTIFICATIONS (सूचनाएं) */}
          {activeTab === "notifications" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                <h2 className="text-sm font-serif text-primary uppercase tracking-wider font-bold">
                  सूचनाएं (Notifications)
                </h2>
                {notifications.length > 0 && (
                  <button
                    onClick={() => {
                      const updated = notifications.map(n => ({ ...n, read: true }));
                      setNotifications(updated);
                      localStorage.setItem("yuvakshar_notifications", JSON.stringify(updated));
                    }}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    सभी को पढ़ा हुआ चिह्नित करें
                  </button>
                )}
              </div>

              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <GlassCard key={notif.id} glow={!notif.read ? "saffron" : "none"} className="p-4 relative">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <h4 className={`text-xs font-bold font-serif ${!notif.read ? "text-primary" : "text-slate-700 dark:text-slate-300"}`}>
                            {notif.title}
                          </h4>
                          <p className="text-[11px] text-slate-650 dark:text-slate-400 font-serif leading-relaxed">
                            {notif.message}
                          </p>
                          <span className="text-[8px] text-slate-400 font-mono block mt-1">
                            {new Date(notif.date).toLocaleDateString("hi-IN")} {new Date(notif.date).toLocaleTimeString("hi-IN")}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          {!notif.read && (
                            <button
                              onClick={() => markNotificationRead(notif.id)}
                              className="text-[9px] bg-primary/10 border border-primary/20 text-primary font-bold px-2 py-0.5 rounded cursor-pointer"
                            >
                              पढ़ा
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notif.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 border border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/30">
                  <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-xs text-slate-500 font-serif">कोई नई सूचना नहीं है।</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: AUTHOR REVIEW (लेखक साप्ताहिक समीक्षा) */}
          {activeTab === "author" && isAuthorOrEditor && (
            <div className="space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-3 flex justify-between items-center">
                <h2 className="text-sm font-serif text-primary uppercase tracking-wider font-bold">
                  लेखक साप्ताहिक समीक्षा (Weekly Author Review)
                </h2>
                <span className="text-[10px] bg-green-500/10 text-green-500 border border-green-500/20 px-2.5 py-0.5 rounded-full font-bold">
                  सक्रिय समीक्षा चक्र
                </span>
              </div>

              <div className="space-y-6">
                {authorEvaluations.map((evalItem) => (
                  <GlassCard key={evalItem.id} glow="none" className="p-5 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[9px] uppercase font-bold tracking-wider text-primary px-2 py-0.5 bg-primary/10 rounded">
                          {evalItem.category}
                        </span>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white font-serif mt-1">
                          {evalItem.title}
                        </h4>
                        <span className="text-[9px] text-slate-400 block font-mono">
                          सबमिट दिनांक: {evalItem.date}
                        </span>
                      </div>

                      {/* Score Badge */}
                      <div className="text-center bg-primary/5 border border-primary/20 px-3.5 py-2 rounded-2xl">
                        <span className="text-[8px] text-slate-400 block font-sans font-bold">रचना स्कोर</span>
                        <strong className="text-lg font-bold text-primary font-mono">{evalItem.score}/100</strong>
                      </div>
                    </div>

                    {/* Evaluator Remarks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-serif pt-2">
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl">
                        <h5 className="font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1 mb-1.5">
                          💪 मुख्य ताकतें (Key Strengths)
                        </h5>
                        <p className="text-[10.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
                          {evalItem.strengths}
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl">
                        <h5 className="font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-1 mb-1.5">
                          📈 सुधार के क्षेत्र (Areas to Improve)
                        </h5>
                        <p className="text-[10.5px] text-slate-600 dark:text-slate-400 leading-relaxed">
                          {evalItem.improvements}
                        </p>
                      </div>
                    </div>

                    <div className="bg-primary/5 border border-primary/20 p-3.5 rounded-xl text-[10.5px] font-serif">
                      <p className="text-slate-705 dark:text-slate-300">
                        <strong>संपादकीय टिप्पणी ({evalItem.reviewer}):</strong> {evalItem.remarks}
                      </p>
                    </div>

                  </GlassCard>
                ))}
              </div>

              {/* Submit Suite Link Card */}
              <GlassCard glow="gold" className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="space-y-1 text-center md:text-left">
                  <h4 className="font-serif text-xs font-bold text-slate-800 dark:text-white">
                    क्या आप एक नया लेख लिखना चाहते हैं?
                  </h4>
                  <p className="text-[10px] text-slate-400 font-serif">
                    अपनी रचनाकार डेस्क पर जाकर एआई लेखन सहयोगियों की मदद से नया आलेख सबमिट करें।
                  </p>
                </div>
                <Link
                  href="/submit-article"
                  className="bg-primary hover:bg-primary/95 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all shadow-md cursor-pointer flex items-center space-x-1"
                >
                  <span>लेखक सबमिशन डेस्क</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </GlassCard>

            </div>
          )}

          

        </div>

        {/* RIGHT BLOCK: Recommendations & Streak (Col Span 4) */}
        <aside className="lg:col-span-4 space-y-6">
          
          

          {/* Bookmarked Articles list */}
          <GlassCard glow="none" className="space-y-4">
            <h3 className="font-serif text-sm font-bold text-primary border-b border-primary/10 pb-3">
              बुकमार्क आलेख ({bookmarkedArticles.length})
            </h3>
            
            {bookmarkedArticles.length > 0 ? (
              <div className="space-y-3">
                {bookmarkedArticles.slice(0, 4).map((art) => (
                  <div key={art.id} className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-2 last:border-b-0 last:pb-0">
                    <div className="space-y-0.5 max-w-[80%]">
                      <span className="text-[8px] uppercase tracking-wider text-primary font-bold">{art.category}</span>
                      <Link href={`/editorial?id=${art.id}`} className="block text-[11px] font-medium text-slate-700 dark:text-slate-200 hover:text-primary transition-colors leading-snug truncate">
                        {art.title}
                      </Link>
                    </div>
                    <button
                      onClick={() => removeBookmark(art.id)}
                      className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-900 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 font-serif">कोई बुकमार्क लेख नहीं हैं।</p>
            )}
          </GlassCard>

          {/* Personalized Recommendations */}
          <GlassCard glow="gold" className="space-y-4">
            <div className="flex items-center space-x-2 text-primary border-b border-primary/10 pb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="font-serif text-sm font-bold">आपके लिए अनुशंसित</h3>
            </div>

            <div className="space-y-4">
              {recommendedArticles.map((art) => (
                <div key={art.id} className="space-y-2 border-b border-slate-100 dark:border-slate-800/40 pb-3 last:border-b-0 last:pb-0">
                  <span className="text-[8px] uppercase tracking-wider text-primary font-bold">{art.category}</span>
                  <Link href={`/editorial?id=${art.id}`} className="block text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-primary transition-colors leading-snug line-clamp-2">
                    {art.title}
                  </Link>
                  <div className="flex justify-between items-center text-[8px] text-slate-400 font-mono">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{art.readTime}</span>
                    </span>
                    <Link href={`/editorial?id=${art.id}`} className="text-primary font-bold hover:underline">पढ़ें</Link>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

        </aside>

      </div>
    </div>
  );
}
