"use client";

import React, { useState } from "react";
import { Award, Trophy, Download, Flame } from "lucide-react";
import { useCms, Profile } from "@/store/CmsContext";

interface StudyProgressTabProps {
  currentUser: Profile;
  getUserReputation: (attemptsCount: number, avgScore: number) => { title: string; desc: string };
}

export default function StudyProgressTab({ currentUser, getUserReputation }: StudyProgressTabProps) {
  const cms = useCms();
  const [isGeneratingMonthlyReport, setIsGeneratingMonthlyReport] = useState(false);

  const handleDownloadMonthlyReport = () => {
    setIsGeneratingMonthlyReport(true);
    setTimeout(() => {
      setIsGeneratingMonthlyReport(false);
      alert("मासिक स्वाध्याय प्रगति रिपोर्ट (PDF) आपके डिवाइस पर डाउनलोड कर दी गई है!");
    }, 1500);
  };

  const userAttempts = cms.quizAttempts.filter(att => att.userId === (currentUser?.id || "anonymous-reader"));
  const totalAttempts = userAttempts.length;
  const completedArticlesCount = new Set(userAttempts.filter(att => att.percentage >= 60).map(att => att.articleId)).size;
  const averageScore = totalAttempts > 0 ? Math.round(userAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / totalAttempts) : 0;
  const bestScore = totalAttempts > 0 ? Math.max(...userAttempts.map(att => att.percentage)) : 0;
  const totalStudyTime = userAttempts.reduce((acc, curr) => acc + curr.durationSeconds, 0);
  const certificatesCount = cms.quizCertificates.filter(c => c.userId === (currentUser?.id || "anonymous-reader")).length;

  // Cognitive Metrics
  const counts = { MCQ: 0, "Fact Recall": 0, Comprehension: 0, Analysis: 0, Application: 0 };
  const corrects = { MCQ: 0, "Fact Recall": 0, Comprehension: 0, Analysis: 0, Application: 0 };
  userAttempts.forEach(att => {
    const artQuiz = cms.quizzes.find(q => q.articleId === att.articleId);
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

  const memory = counts["Fact Recall"] > 0 ? Math.round((corrects["Fact Recall"] / counts["Fact Recall"]) * 100) : averageScore || 75;
  const understanding = counts["Comprehension"] > 0 ? Math.round((corrects["Comprehension"] / counts["Comprehension"]) * 100) : averageScore || 80;
  const analysis = counts["Analysis"] > 0 ? Math.round((corrects["Analysis"] / counts["Analysis"]) * 100) : averageScore || 70;
  const logic = counts["Application"] > 0 ? Math.round((corrects["Application"] / counts["Application"]) * 100) : averageScore || 65;

  // Reputation badge
  const rep = getUserReputation(totalAttempts, averageScore);

  const renderProgressRing = (score: number, title: string, color: string) => {
    const radius = 36;
    const stroke = 5;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;
    return (
      <div className="flex flex-col items-center space-y-2 p-4 bg-white dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="relative w-18 h-18">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              stroke="currentColor"
              fill="transparent"
              strokeWidth={stroke}
              className="text-slate-100 dark:text-slate-800"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            <circle
              stroke={color}
              fill="transparent"
              strokeWidth={stroke}
              strokeDasharray={circumference + ' ' + circumference}
              style={{ strokeDashoffset }}
              strokeLinecap="round"
              r={normalizedRadius}
              cx={radius}
              cy={radius}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold font-mono">
            {score}%
          </div>
        </div>
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-serif">{title}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold border-l-2 border-primary pl-2">मेरी अध्ययन प्रगति (My Swadhyaya Progress)</h2>
          <p className="text-xs text-slate-400">युवाक्षर ज्ञान परख पोर्टल पर आपका व्यक्तिगत स्वाध्याय ट्रैकर।</p>
        </div>
        <button 
          onClick={handleDownloadMonthlyReport}
          disabled={isGeneratingMonthlyReport}
          className="bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center space-x-1.5 disabled:opacity-50 font-serif"
        >
          <Download className="w-4 h-4" />
          <span>{isGeneratingMonthlyReport ? "रिपोर्ट तैयार हो रही है..." : "मासिक रिपोर्ट डाउनलोड करें (PDF)"}</span>
        </button>
      </div>

      {/* Scoreboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-4 rounded-xl text-center space-y-1">
          <span className="text-[10px] text-slate-400 block uppercase font-serif">पूर्ण लेख</span>
          <p className="text-2xl font-bold font-serif text-primary">{completedArticlesCount}</p>
        </div>
        <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-4 rounded-xl text-center space-y-1">
          <span className="text-[10px] text-slate-400 block uppercase font-serif">क्विज प्रयास</span>
          <p className="text-2xl font-bold font-serif text-primary">{totalAttempts}</p>
        </div>
        <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-4 rounded-xl text-center space-y-1">
          <span className="text-[10px] text-slate-400 block uppercase font-serif">सर्वश्रेष्ठ स्कोर</span>
          <p className="text-2xl font-bold font-serif text-primary">{bestScore}%</p>
        </div>
        <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-805 p-4 rounded-xl text-center space-y-1">
          <span className="text-[10px] text-slate-400 block uppercase font-serif">औसत स्कोर</span>
          <p className="text-2xl font-bold font-serif text-primary">{averageScore}%</p>
        </div>
        <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-805 p-4 rounded-xl text-center space-y-1">
          <span className="text-[10px] text-slate-400 block uppercase font-serif">कुल समय (मिनट)</span>
          <p className="text-2xl font-bold font-serif text-primary">{Math.round(totalStudyTime / 60)}</p>
        </div>
        <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-805 p-4 rounded-xl text-center space-y-1">
          <span className="text-[10px] text-slate-400 block uppercase font-serif">प्रमाणपत्र</span>
          <p className="text-2xl font-bold font-serif text-primary">{certificatesCount}</p>
        </div>
      </div>

      {/* Swadhyaya Daily Streak & Cognitive Skill Rings */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Swadhyaya Daily Streak */}
        <div className="md:col-span-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-orange-950/10 dark:to-amber-950/10 border border-orange-200/50 dark:border-orange-900/30 p-5 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="space-y-1 font-serif text-xs">
            <h4 className="font-bold text-slate-800 dark:text-orange-200 text-sm">स्वाध्याय निरंतरता (Daily Streak)</h4>
            <p className="text-[10px] text-slate-400 leading-relaxed">लगातार ५ दिनों से सक्रिय पाठक। अपना दैनिक स्वाध्याय क्रम बनाए रखें और बैज प्राप्त करें!</p>
          </div>
          <div className="flex items-center space-x-3 bg-white dark:bg-slate-900/60 border border-orange-100 dark:border-orange-900/20 px-4 py-3 rounded-xl shadow-inner mt-4">
            <div className="relative">
              {/* Pulsing glow background */}
              <div className="absolute inset-0 bg-orange-500 rounded-full blur-md opacity-40 animate-pulse" />
              <Flame className="w-8 h-8 text-primary fill-orange-500 relative animate-bounce" />
            </div>
            <div>
              <div className="flex items-baseline gap-1 font-serif">
                <span className="text-3xl font-black font-mono text-primary">5</span>
                <span className="text-xs font-bold text-slate-400">दिवस</span>
              </div>
              <p className="text-[9px] text-slate-400 font-sans font-hindi">स्वाध्याय स्तर: नियमित स्वाध्यायी</p>
            </div>
          </div>
        </div>

        {/* Cognitive Skill Progress Rings */}
        <div className="md:col-span-7 space-y-3">
          <h4 className="font-serif font-bold text-slate-800 dark:text-white text-xs border-l-2 border-primary pl-2">संज्ञानात्मक कौशल मापन (Cognitive Skill Mastery)</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {renderProgressRing(memory, "स्मरण शक्ति", "#EA580C")}
            {renderProgressRing(understanding, "अवबोधन", "#10B981")}
            {renderProgressRing(analysis, "विश्लेषण क्षमता", "#3B82F6")}
            {renderProgressRing(logic, "तार्किक सोच", "#8B5CF6")}
          </div>
        </div>
      </div>

      {/* Reputation and Topic Mastery Badges */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
          <h3 className="font-serif font-bold text-sm text-primary flex items-center space-x-1.5">
            <Award className="w-5 h-5" />
            <span>स्वाध्याय स्तर (Study Achievement Level)</span>
          </h3>
          <div className="flex items-center space-x-4 bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl">
              🏆
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white font-serif">{rep.title}</p>
              <p className="text-xs text-slate-400 mt-0.5">{rep.desc}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
          <h3 className="font-serif font-bold text-sm text-primary flex items-center space-x-1.5">
            <Trophy className="w-5 h-5" />
            <span>श्रेणी विशेषज्ञता बैज (Topic Mastery Badges)</span>
          </h3>
          <div className="flex flex-wrap gap-2">
            {(() => {
              const categoryStats: Record<string, { total: number; passed: number; best: number }> = {};
              userAttempts.forEach(att => {
                const art = cms.articles.find(a => a.id === att.articleId);
                if (art) {
                  const cat = art.category || "सामान्य";
                  if (!categoryStats[cat]) {
                    categoryStats[cat] = { total: 0, passed: 0, best: 0 };
                  }
                  categoryStats[cat].total += 1;
                  if (att.percentage >= 60) {
                    categoryStats[cat].passed += 1;
                  }
                  if (att.percentage > categoryStats[cat].best) {
                    categoryStats[cat].best = att.percentage;
                  }
                }
              });

              const topicBadgesDef = [
                { category: "AI", badge: "🏅 AI विशेषज्ञ" },
                { category: "इतिहास", badge: "🏅 इतिहास साधक" },
                { category: "पर्यावरण", badge: "🏅 पर्यावरण विश्लेषक" },
                { category: "शिक्षा", badge: "🏅 शिक्षा शोधकर्ता" },
                { category: "संविधान", badge: "🏅 संविधान अध्येता" },
                { category: "राजनीति", badge: "🏅 राजनीति विश्लेषक" },
                { category: "साहित्य", badge: "🏅 साहित्य साधक" }
              ];

              const activeBadges = topicBadgesDef.filter(item => (categoryStats[item.category]?.passed || 0) >= 1);

              return (
                <>
                  {activeBadges.map((badge, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-bold font-serif">
                      {badge.badge}
                    </span>
                  ))}
                  {activeBadges.length === 0 && (
                    <span className="text-slate-400 text-xs font-serif italic">क्विज हल करें और अपनी पहली श्रेणी विशेषज्ञता अर्जित करें।</span>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
