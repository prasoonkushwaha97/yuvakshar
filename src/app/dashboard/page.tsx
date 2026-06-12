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

export default function DashboardPage() {
  const { 
    currentUser, 
    openAuthModal, 
    updateUserMembership, 
    articles, 
    aiNotes, 
    deleteAiNote,
    quizAttempts,
    quizCertificates,
    quizzes,
    userMemberships,
    paymentRecords,
    referrals,
    addReferral,
    toggleAutoRenewal,
    cancelSubscription
  } = useCms();

  const [activeTab, setActiveTab] = useState<"study" | "notes" | "author" | "membership">("study");
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Article[]>([]);
  const [streak, setStreak] = useState(5); // Default study streak
  const [friendEmail, setFriendEmail] = useState("");
  const [refSuccessMsg, setRefSuccessMsg] = useState("");
  const [refErrorMsg, setRefErrorMsg] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
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
  }, [articles]);

  const removeBookmark = (id: string) => {
    const updated = bookmarks.filter(b => b !== id);
    setBookmarks(updated);
    localStorage.setItem("yuvakshar_bookmarks", JSON.stringify(updated));
    setBookmarkedArticles(prev => prev.filter(art => art.id !== id));
  };

  // Streak Tracker Config
  const streakProgress = [
    { day: "सोम", active: true },
    { day: "मंगल", active: true },
    { day: "बुध", active: true },
    { day: "गुरु", active: true },
    { day: "शुक्र", active: true },
    { day: "शनि", active: false },
    { day: "रवि", active: false }
  ];

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
        date: "2026-06-05",
        score: 92,
        reviewer: "प्रसून कुशवाहा (प्रधान संपादक)",
        remarks: "भाषा शैली अत्यंत सारगर्भित है। डिजिटल समावेशन के तर्कों को बहुत अच्छे से रखा गया है। व्याकरण त्रुटिहीन है।",
        strengths: "उच्च स्तरीय तार्किकता, स्पष्ट संरचना, तथ्यात्मक प्रामाणिकता",
        improvements: "द्वितीय पैराग्राफ में नीति आयोग के अद्यतन वित्तीय आंकड़ों को भी शामिल कर सकते थे।"
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

        {/* Streak Counter Visual Badge */}
        <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 border border-amber-500/30 rounded-2xl px-5 py-2.5 shadow-[0_0_15px_rgba(234,88,12,0.08)]">
          <div className="p-1.5 rounded-full bg-primary/10 text-primary animate-pulse">
            <Flame className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-bold font-sans uppercase">अध्ययन निरंतरता</div>
            <div className="text-sm font-serif font-bold text-primary">{streak} दिन सक्रिय</div>
          </div>
        </div>
      </div>

      {/* MEMBERSHIP ARCHIVED: Membership Info Card — hidden, preserved for future reactivation */}

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
            <span>३. लेखक समीक्षा</span>
          </button>
        )}
        {/* MEMBERSHIP ARCHIVED: Membership tab button hidden for membership system archival */}
        {false && (<button
          onClick={() => setActiveTab("membership")}
          className={`pb-3 px-4 transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 shrink-0 ${
            activeTab === "membership"
              ? "border-primary text-primary"
              : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>४. सदस्यता एवं रेफ़रल</span>
        </button>)}
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

                {/* MEMBERSHIP ARCHIVED: Premium lock overlay removed — AI Knowledge Report is now freely accessible to all logged-in users */}

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

          {/* TAB 4: MEMBERSHIP DESK (सदस्यता एवं रेफ़रल) */}
          {activeTab === "membership" && currentUser && (
            <div className="space-y-6">
              
              {/* Active Plan Card */}
              {(() => {
                const currentPlan = userMemberships.find(m => m.userId === currentUser.id && m.status === "active");
                return (
                  <GlassCard glow={currentPlan?.membershipType === "Patron" ? "saffron" : currentPlan?.membershipType === "Premium" ? "gold" : "none"} className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">आपकी सदस्यता (Membership Details)</p>
                        <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          {currentPlan?.membershipType === "Patron" ? <Gem className="w-5 h-5 text-rose-500" /> : currentPlan?.membershipType === "Premium" ? <Crown className="w-5 h-5 text-amber-500" /> : <Lock className="w-4 h-4 text-slate-400" />}
                          <span>युवाक्षर {currentPlan?.membershipType === "Premium" ? "प्रीमियम सदस्य" : currentPlan?.membershipType === "Patron" ? "संरक्षक (Patron) सदस्य" : "निःशुल्क पाठक (Free)"}</span>
                        </h3>
                      </div>
                      {currentPlan ? (
                        <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold">सक्रिय</span>
                      ) : (
                        <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-bold">निःशुल्क</span>
                      )}
                    </div>

                    {currentPlan ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono border-t border-slate-100 dark:border-slate-800/80 pt-4">
                        <div>
                          <p className="text-slate-500">प्रारंभ तिथि:</p>
                          <p className="text-slate-800 dark:text-slate-200 font-bold">{currentPlan.startDate}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">समाप्ति तिथि (Expiry Date):</p>
                          <p className="text-slate-800 dark:text-slate-200 font-bold">{currentPlan.expiryDate}</p>
                        </div>
                        <div>
                          <p className="text-slate-500">भुगतान चक्र (Billing Cycle):</p>
                          <p className="text-slate-800 dark:text-slate-200 font-bold">{currentPlan.billingCycle}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-slate-500">स्वचालित नवीनीकरण (Auto-Renew):</p>
                            <p className="text-slate-800 dark:text-slate-200 font-bold">{currentPlan.autoRenewal ? "हाँ (सक्रिय)" : "नहीं (बंद)"}</p>
                          </div>
                          <button
                            onClick={() => {
                              toggleAutoRenewal(currentUser.id);
                              alert("ऑटो-रिन्यूअल स्थिति अपडेट की गई!");
                            }}
                            className="p-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 cursor-pointer"
                          >
                            {currentPlan.autoRenewal ? <ToggleRight className="w-8 h-8 text-primary" /> : <ToggleLeft className="w-8 h-8 text-slate-400" />}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 font-serif leading-relaxed">
                        आप वर्तमान में एक निःशुल्क पाठक हैं। विशेष प्रीमियम लेखों, डिजिटल मासिक पत्रिका, अध्ययन नोट्स और अन्य सुविधाओं का लाभ उठाने के लिए अपग्रेड करें।
                      </p>
                    )}

                    <div className="pt-2 flex flex-wrap gap-3">
                      {!currentPlan && (
                        <Link
                          href="/membership"
                          className="bg-primary hover:bg-primary/95 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all shadow-md cursor-pointer flex items-center space-x-1"
                        >
                          <Crown className="w-4 h-4" />
                          <span>प्रीमियम में अपग्रेड करें (₹49 से शुरू)</span>
                        </Link>
                      )}
                      {currentPlan && (
                        <>
                          <Link
                            href="/membership"
                            className="bg-primary hover:bg-primary/95 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all shadow-md cursor-pointer flex items-center space-x-1"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>सदस्यता बदलें / अपग्रेड करें</span>
                          </Link>
                          <button
                            onClick={() => {
                              if (confirm("क्या आप वाकई अपनी सक्रिय सदस्यता रद्द करना चाहते हैं?")) {
                                cancelSubscription(currentUser.id);
                                alert("आपकी सदस्यता रद्द कर दी गई है और समाप्त होने तक सक्रिय रहेगी।");
                              }
                            }}
                            className="bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 py-2.5 px-6 rounded-xl text-xs font-semibold cursor-pointer transition-all"
                          >
                            सदस्यता रद्द करें
                          </button>
                        </>
                      )}
                    </div>
                  </GlassCard>
                );
              })()}

              {/* Referral Center */}
              <GlassCard glow="gold" className="p-6 space-y-5">
                <div className="flex items-center space-x-2 text-primary border-b border-primary/10 pb-3">
                  <Share2 className="w-4 h-4 text-amber-500" />
                  <h3 className="font-serif text-sm font-bold">रेफ़रल कार्यक्रम (Referral Center)</h3>
                </div>

                <p className="text-xs text-slate-500 font-serif leading-relaxed">
                  अपने दोस्तों को युवाक्षर की सदस्यता के लिए आमंत्रित करें। जब आपका मित्र आपके आमंत्रण से जुड़कर कोई भी भुगतान योजना खरीदेगा, तो आप दोनों को <strong>₹50 कैशबैक</strong> प्राप्त होगा!
                </p>

                {/* Invite Form */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!friendEmail.trim() || !friendEmail.includes("@")) {
                      setRefErrorMsg("कृपया एक मान्य ईमेल पता दर्ज करें।");
                      setRefSuccessMsg("");
                      return;
                    }
                    addReferral(currentUser.id, friendEmail.trim());
                    setRefSuccessMsg(`सफलतापूर्वक ${friendEmail} को आमंत्रण भेजा गया!`);
                    setRefErrorMsg("");
                    setFriendEmail("");
                  }}
                  className="space-y-2"
                >
                  <label className="block text-[11px] font-medium text-slate-400">दोस्त का ईमेल दर्ज करें</label>
                  <div className="flex space-x-2">
                    <input
                      type="email"
                      placeholder="friend@email.com"
                      value={friendEmail}
                      onChange={(e) => setFriendEmail(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                    />
                    <button
                      type="submit"
                      className="bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>आमंत्रित करें</span>
                    </button>
                  </div>
                  {refErrorMsg && <p className="text-[10px] text-red-400">{refErrorMsg}</p>}
                  {refSuccessMsg && <p className="text-[10px] text-emerald-400">{refSuccessMsg}</p>}
                </form>

                {/* Referral Code Box */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 border border-slate-800 p-4 rounded-2xl text-xs">
                  <div>
                    <span className="text-slate-500">आपका रेफ़रल कोड:</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="font-mono font-bold text-white bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                        YUV-{currentUser.id.substring(0, 5).toUpperCase()}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`YUV-${currentUser.id.substring(0, 5).toUpperCase()}`);
                          alert("रेफ़रल कोड कॉपी किया गया!");
                        }}
                        className="p-1 rounded text-slate-400 hover:text-primary cursor-pointer hover:bg-slate-900"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500">आपका रेफ़रल लिंक:</span>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="font-mono text-white truncate bg-slate-900 px-2.5 py-1 rounded border border-slate-800 block max-w-[150px]">
                        https://yuvakshar.org/membership?ref=YUV-{currentUser.id.substring(0, 5).toUpperCase()}
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`https://yuvakshar.org/membership?ref=YUV-${currentUser.id.substring(0, 5).toUpperCase()}`);
                          alert("रेफ़रल लिंक कॉपी किया गया!");
                        }}
                        className="p-1 rounded text-slate-400 hover:text-primary cursor-pointer hover:bg-slate-900"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Referrals Invited List */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold font-serif text-slate-800 dark:text-white">आमंत्रित मित्रों की सूची (Referrals Tracker)</h4>
                  {(() => {
                    const myRefs = referrals.filter(r => r.referrerId === currentUser.id);
                    if (myRefs.length === 0) {
                      return <p className="text-[10px] text-slate-500">अभी तक आपने किसी को आमंत्रित नहीं किया है।</p>;
                    }
                    return (
                      <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
                        <table className="w-full text-left border-collapse text-[10px] md:text-xs">
                          <thead>
                            <tr className="border-b border-slate-800 bg-slate-900 font-serif">
                              <th className="p-3 text-slate-400">दोस्त का ईमेल</th>
                              <th className="p-3 text-slate-400">दिनांक</th>
                              <th className="p-3 text-slate-400">स्थिति</th>
                              <th className="p-3 text-slate-400">रिवॉर्ड</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {myRefs.map((ref) => (
                              <tr key={ref.id} className="hover:bg-slate-900/50">
                                <td className="p-3 font-mono text-slate-350">{ref.referredEmail}</td>
                                <td className="p-3 text-slate-400">{ref.date}</td>
                                <td className="p-3">
                                  {ref.status === "pending" && <span className="text-amber-500 font-bold bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">पेंडिंग</span>}
                                  {ref.status === "registered" && <span className="text-blue-400 font-bold bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 rounded">रजिस्टर्ड</span>}
                                  {ref.status === "purchased" && <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">सफल</span>}
                                </td>
                                <td className="p-3">
                                  {ref.status === "purchased" ? (
                                    <span className="text-emerald-400 font-bold">₹50 संचित</span>
                                  ) : (
                                    <span className="text-slate-500">—</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </div>
              </GlassCard>

              {/* Payment History Card */}
              <GlassCard glow="none" className="p-6 space-y-4">
                <div className="flex items-center space-x-2 text-primary border-b border-primary/10 pb-3">
                  <FileText className="w-4 h-4" />
                  <h3 className="font-serif text-sm font-bold">भुगतान एवं बिल इतिहास (Payment & Invoice History)</h3>
                </div>

                {(() => {
                  const myPayments = paymentRecords.filter(p => p.userId === currentUser.id);
                  if (myPayments.length === 0) {
                    return <p className="text-xs text-slate-500">अभी तक कोई भुगतान रिकॉर्ड नहीं मिला।</p>;
                  }
                  
                  const printInvoiceFromRecord = (record: any) => {
                    const printWindow = window.open("", "_blank");
                    if (!printWindow) return;
                    
                    printWindow.document.write(`
                      <html>
                        <head>
                          <title>युवाक्षर सदस्यता रसीद (Yuvakshar Subscription Invoice)</title>
                          <style>
                            body { font-family: 'Noto Sans Devanagari', sans-serif; padding: 40px; color: #1e293b; }
                            .header { border-bottom: 2px solid #ea580c; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
                            .logo { font-size: 24px; font-weight: bold; color: #ea580c; }
                            .title { font-size: 20px; font-weight: bold; }
                            .details-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                            .details-table th, .details-table td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
                            .details-table th { background-color: #f8fafc; }
                            .total { font-weight: bold; color: #ea580c; font-size: 18px; }
                            .footer { margin-top: 50px; font-size: 12px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; }
                          </style>
                        </head>
                        <body>
                          <div class="header">
                            <div>
                              <div class="logo">युवाक्षर (Yuvakshar)</div>
                              <div>लेखन, चिंतन और परिवर्तन</div>
                            </div>
                            <div class="title">सदस्यता चालान (INVOICE)</div>
                          </div>
                          <h3>चालान विवरण:</h3>
                          <p><strong>लेनदेन आईडी (Transaction ID):</strong> ${record.id}</p>
                          <p><strong>दिनांक (Date):</strong> ${record.date}</p>
                          <p><strong>ग्राहक का नाम (Customer Name):</strong> ${currentUser?.name}</p>
                          <p><strong>ईमेल (Email):</strong> ${currentUser?.email}</p>
                          
                          <table class="details-table">
                            <thead>
                              <tr>
                                <th>विवरण (Description)</th>
                                <th>अवधि (Billing Cycle)</th>
                                <th>कुल राशि (Total Paid)</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td>युवाक्षर ${record.membershipType === "Premium" ? "प्रीमियम सदस्यता" : "संरक्षक सदस्यता"}</td>
                                <td>${record.billingCycle === "Monthly" ? "मासिक" : record.billingCycle === "Quarterly" ? "त्रैमासिक" : record.billingCycle === "Half-Yearly" ? "अर्धवार्षिक" : "वार्षिक"}</td>
                                <td class="total">₹${record.amount}</td>
                              </tr>
                            </tbody>
                          </table>
                          
                          <div class="footer">
                            यह एक कंप्यूटर जनित रसीद है और इसके लिए हस्ताक्षर की आवश्यकता नहीं है। युवाक्षर को समर्थन देने के लिए धन्यवाद।
                          </div>
                          <script>window.print();</script>
                        </body>
                      </html>
                    `);
                    printWindow.document.close();
                  };

                  return (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-[#0f172a]/20">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 font-serif">
                            <th className="p-3 text-slate-700 dark:text-slate-300">लेनदेन आईडी</th>
                            <th className="p-3 text-slate-700 dark:text-slate-300">योजना</th>
                            <th className="p-3 text-slate-700 dark:text-slate-300">चक्र</th>
                            <th className="p-3 text-slate-700 dark:text-slate-300">राशि</th>
                            <th className="p-3 text-slate-700 dark:text-slate-300">तिथि</th>
                            <th className="p-3 text-slate-700 dark:text-slate-300">बिल (Invoice)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                          {myPayments.map((record) => (
                            <tr key={record.id} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/20">
                              <td className="p-3 font-mono text-slate-500">{record.id}</td>
                              <td className="p-3 font-bold">{record.membershipType}</td>
                              <td className="p-3">{record.billingCycle}</td>
                              <td className="p-3 text-primary font-bold">₹{record.amount}</td>
                              <td className="p-3">{record.date}</td>
                              <td className="p-3">
                                {record.status === "success" ? (
                                  <button
                                    onClick={() => printInvoiceFromRecord(record)}
                                    className="flex items-center space-x-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-white font-medium px-2 py-1 rounded border border-slate-750 cursor-pointer"
                                  >
                                    <Download className="w-3 h-3" />
                                    <span>रसीद</span>
                                  </button>
                                ) : (
                                  <span className="text-red-400 font-bold">विफल</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </GlassCard>

            </div>
          )}

        </div>

        {/* RIGHT BLOCK: Recommendations & Streak (Col Span 4) */}
        <aside className="lg:col-span-4 space-y-6">
          
          {/* Week Streak Tracker (glowing dots) */}
          <GlassCard glow="saffron">
            <h3 className="font-serif text-sm font-bold text-primary mb-4">स्वाध्याय ट्रैकर (Habits)</h3>
            <div className="flex justify-between items-center">
              {streakProgress.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center space-y-1">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-[9px] font-mono font-bold ${
                    day.active 
                      ? "bg-primary/20 border-primary text-primary shadow-[0_0_8px_rgba(234,88,12,0.4)]" 
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400"
                  }`}>
                    {day.day[0]}
                  </div>
                  <span className="text-[8px] font-mono text-slate-400 font-bold">{day.day}</span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-4 font-serif leading-relaxed">
              निरंतर अध्ययन सूचकांक सक्रिय है! अध्ययन साथी के साथ रोज़ाना कम से कम एक लेख पढ़ने से आपकी ज्ञान रिपोर्ट उन्नत होती है।
            </p>
          </GlassCard>

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
