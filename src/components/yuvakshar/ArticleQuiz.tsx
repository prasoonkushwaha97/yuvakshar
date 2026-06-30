"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCms } from "@/store/CmsContext";
import GlassCard from "@/components/yuvakshar/GlassCard";
import { 
  Trophy, 
  Star, 
  BookOpen, 
  RotateCcw, 
  Lock, 
  Unlock, 
  Clock, 
  Brain, 
  Download, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Award,
  ChevronRight
} from "lucide-react";
import { QuizQuestion } from "@/lib/defaultQuizzes";

interface ArticleQuizProps {
  articleId: string;
}

export default function ArticleQuiz({ articleId }: ArticleQuizProps) {
  const { 
    quizzes, 
    quizAttempts, 
    addQuizAttempt, 
    currentUser, 
    articles,
    quizSettings,
    openAuthModal
  } = useCms();

  const article = articles.find(a => a.id === articleId);
  const settings = quizSettings[articleId] || { isEnabled: true, questionCount: 5, difficulty: "मध्यम" };
  const quiz = quizzes.find(q => q.articleId === articleId);

  // Answering & Flow States
  const [hasScrolledEnough, setHasScrolledEnough] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({}); // index -> option text
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<Record<number, string[]>>({}); // question index -> shuffled option array

  // Certificate state
  const [isGeneratingCert, setIsGeneratingCert] = useState(false);

  // Monitor scroll for 70% threshold
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        const scrolled = (window.scrollY / totalScroll) * 100;
        if (scrolled >= 70) {
          setHasScrolledEnough(true);
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initialize Quiz questions and options
  useEffect(() => {
    if (quiz && quiz.questions && quiz.questions.length > 0) {
      // Determine question size based on article length
      const wordCount = article?.content ? article.content.split(/\s+/).length : 600;
      const targetCount = wordCount < 500 ? 5 : wordCount < 1000 ? 7 : 10;
      
      // Select questions and shuffle order
      const shuffledQuestions = [...quiz.questions]
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(targetCount, quiz.questions.length));
      
      setActiveQuestions(shuffledQuestions);

      // Shuffle options for each selected question
      const optsMap: Record<number, string[]> = {};
      shuffledQuestions.forEach((q, idx) => {
        optsMap[idx] = [...q.options].sort(() => Math.random() - 0.5);
      });
      setShuffledOptions(optsMap);
    }
  }, [quiz, articleId]);

  const handleSelectOption = (option: string) => {
    // Lock answer
    if (selectedAnswers[currentQuestionIndex] !== undefined) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: option
    }));
  };

  // Keyboard navigation support: '1', '2', '3', '4' to answer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isQuizStarted || isQuizCompleted) return;
      const opts = shuffledOptions[currentQuestionIndex];
      if (!opts) return;

      // Check if current question is already answered
      if (selectedAnswers[currentQuestionIndex] !== undefined) return;

      if (e.key === "1" || e.key === "2" || e.key === "3" || e.key === "4") {
        const index = parseInt(e.key) - 1;
        if (index < opts.length) {
          handleSelectOption(opts[index]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isQuizStarted, isQuizCompleted, currentQuestionIndex, shuffledOptions, selectedAnswers]);

  // Start & Stop Timer
  useEffect(() => {
    if (isQuizStarted && !isQuizCompleted) {
      const interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      setTimerInterval(interval);
      return () => clearInterval(interval);
    }
  }, [isQuizStarted, isQuizCompleted]);

  if (!settings.isEnabled || !quiz || activeQuestions.length === 0) {
    return null;
  }

  if (!currentUser) {
    return (
      <div id="ai-quiz-root" className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-800 dark:text-white border-l-3 border-primary pl-2 flex items-center space-x-2">
              <Trophy className="w-5 h-5 text-primary animate-pulse" />
              <span>अपना ज्ञान परखें</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium italic mt-1">
              इस लेख को पढ़ने के बाद अपने ज्ञान का परीक्षण करें।
            </p>
          </div>
          <span className="text-[10px] sm:text-xs font-semibold px-3 py-1.5 rounded-xl border border-primary/20 bg-primary/5 text-primary text-center">
            बेहतर परिणाम के लिए पहले लेख पढ़ें।
          </span>
        </div>
        <div className="bg-white dark:bg-slate-900/10 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl text-center space-y-4">
          <Lock className="w-10 h-10 text-primary mx-auto animate-bounce" />
          <div className="space-y-2">
            <h4 className="font-serif text-base font-bold text-slate-800 dark:text-white">कृपया पहले लॉगिन करें</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed font-serif">
              ज्ञान परीक्षा में भाग लेने, अपना ज्ञान स्तर जांचने और डीजी-प्रमाणपत्र प्राप्त करने के लिए कृपया पहले लॉगिन करें।
            </p>
          </div>
          <button 
            onClick={() => openAuthModal(undefined, "ज्ञान परीक्षा देने के लिए कृपया पहले लॉगिन करें।")}
            className="bg-primary hover:bg-primary/95 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer inline-flex items-center space-x-1.5"
          >
            <span>लॉगिन करें</span>
          </button>
        </div>
      </div>
    );
  }

  const handleStartQuiz = () => {
    setIsQuizStarted(true);
    setStartTime(Date.now());
    setElapsedTime(0);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setIsQuizCompleted(false);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleCompleteQuiz = async () => {
    if (timerInterval) clearInterval(timerInterval);
    const end = Date.now();
    setEndTime(end);
    setIsQuizCompleted(true);

    // Calculate score
    let correctCount = 0;
    activeQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    const percentage = Math.round((correctCount / activeQuestions.length) * 100);
    const duration = startTime ? Math.round((end - startTime) / 1000) : elapsedTime;

    // Save attempt in context
    await addQuizAttempt({
      userId: currentUser?.id || "anonymous-reader",
      userName: currentUser?.name || "अतिथि पाठक",
      articleId,
      score: correctCount,
      totalQuestions: activeQuestions.length,
      percentage,
      durationSeconds: duration,
      answers: selectedAnswers
    });
  };

  const handleRetry = () => {
    // Reshuffle questions and options
    if (quiz) {
      const wordCount = article?.content ? article.content.split(/\s+/).length : 600;
      const targetCount = wordCount < 500 ? 5 : wordCount < 1000 ? 7 : 10;
      
      const shuffledQuestions = [...quiz.questions]
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(targetCount, quiz.questions.length));
      
      setActiveQuestions(shuffledQuestions);

      const optsMap: Record<number, string[]> = {};
      shuffledQuestions.forEach((q, idx) => {
        optsMap[idx] = [...q.options].sort(() => Math.random() - 0.5);
      });
      setShuffledOptions(optsMap);
    }

    setIsQuizStarted(false);
    setIsQuizCompleted(false);
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setElapsedTime(0);
  };

  // Score stats calculations
  const correctAnswers = activeQuestions.filter((q, idx) => selectedAnswers[idx] === q.correctAnswer).length;
  const wrongAnswers = activeQuestions.length - correctAnswers;
  const scorePercentage = Math.round((correctAnswers / activeQuestions.length) * 100);

  // Dynamic Cognitive Mastery percentage calculator
  const getCognitiveMeters = () => {
    const counts = { MCQ: 0, "Fact Recall": 0, Comprehension: 0, Analysis: 0, Application: 0 };
    const corrects = { MCQ: 0, "Fact Recall": 0, Comprehension: 0, Analysis: 0, Application: 0 };

    activeQuestions.forEach((q, idx) => {
      counts[q.questionType] = (counts[q.questionType] || 0) + 1;
      if (selectedAnswers[idx] === q.correctAnswer) {
        corrects[q.questionType] = (corrects[q.questionType] || 0) + 1;
      }
    });

    const memoryVal = counts["Fact Recall"] > 0 ? Math.round((corrects["Fact Recall"] / counts["Fact Recall"]) * 100) : scorePercentage;
    const understandingVal = counts["Comprehension"] > 0 ? Math.round((corrects["Comprehension"] / counts["Comprehension"]) * 100) : scorePercentage;
    const analysisVal = counts["Analysis"] > 0 ? Math.round((corrects["Analysis"] / counts["Analysis"]) * 100) : scorePercentage;
    const logicVal = counts["Application"] > 0 ? Math.round((corrects["Application"] / counts["Application"]) * 100) : scorePercentage;

    return {
      memory: memoryVal,
      understanding: understandingVal,
      analysis: analysisVal,
      logic: logicVal
    };
  };

  const cognitiveMeters = getCognitiveMeters();

  // Achievement translation maps
  const getAchievementDetails = (pct: number) => {
    if (pct >= 90) return { title: "🏆 उत्कृष्ट", badge: "🏆 ज्ञानवीर", color: "text-amber-500 bg-amber-500/10 border-amber-500/25", desc: "शानदार! आपने लेख पर पूर्ण महारत हासिल कर ली है।" };
    if (pct >= 75) return { title: "🌟 बहुत अच्छा", badge: "🌟 विचारक", color: "text-blue-500 bg-blue-500/10 border-blue-500/25", desc: "बहुत खूब! आपकी विश्लेषण क्षमता सराहनीय है।" };
    if (pct >= 60) return { title: "👍 अच्छा", badge: "📚 अध्ययनशील पाठक", color: "text-green-500 bg-green-500/10 border-green-500/25", desc: "सफल! आपने लेख की मुख्य बातों को समझ लिया है।" };
    if (pct >= 40) return { title: "📖 और अभ्यास आवश्यक", badge: "🔥 उत्कृष्ट विश्लेषक", color: "text-orange-500 bg-orange-500/10 border-orange-500/25", desc: "प्रयास करते रहें! दोबारा पुनः अभ्यास करने का सुझाव दिया जाता है।" };
    return { title: "📚 कृपया लेख पुनः पढ़ें", badge: "🔥 उत्कृष्ट विश्लेषक", color: "text-red-500 bg-red-500/10 border-red-500/25", desc: "कृपया विषय वस्तु को गहराई से समझने के लिए लेख दोबारा ध्यान से पढ़ें।" };
  };

  const achievement = getAchievementDetails(scorePercentage);

  // Offline sync simulation helper
  const getOfflinePendingCount = () => {
    if (typeof window !== "undefined") {
      const local = null;
      return local ? JSON.parse(local).length : 0;
    }
    return 0;
  };

  // Certificate canvas rendering download function
  const handleDownloadCertificate = () => {
    setIsGeneratingCert(true);
    
    setTimeout(() => {
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 1. Draw elegant parchment background
      ctx.fillStyle = "#FAF7F0";
      ctx.fillRect(0, 0, 1200, 800);

      // Border frames
      ctx.strokeStyle = "#EA580C";
      ctx.lineWidth = 15;
      ctx.strokeRect(20, 20, 1160, 760);

      ctx.strokeStyle = "#0F172A";
      ctx.lineWidth = 2;
      ctx.strokeRect(35, 35, 1130, 730);

      // Gold-orange corner decorations
      const drawCorner = (x: number, y: number, r: number) => {
        ctx.fillStyle = "#EA580C";
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      };
      drawCorner(45, 45, 10);
      drawCorner(1155, 45, 10);
      drawCorner(45, 755, 10);
      drawCorner(1155, 755, 10);

      // Header logo label
      ctx.fillStyle = "#EA580C";
      ctx.font = "bold 32px 'Noto Serif Devanagari', 'Georgia', serif";
      ctx.textAlign = "center";
      ctx.fillText("यु वा क्ष र", 600, 100);

      ctx.fillStyle = "#0F172A";
      ctx.font = "16px 'Noto Sans Devanagari', sans-serif";
      ctx.fillText("लेखन, चिंतन और परिवर्तन", 600, 130);

      // Line division
      ctx.strokeStyle = "#EA580C";
      ctx.beginPath();
      ctx.moveTo(400, 150);
      ctx.lineTo(800, 150);
      ctx.stroke();

      // Certificate Type header
      ctx.fillStyle = "#0F172A";
      ctx.font = "bold 44px 'Noto Serif Devanagari', serif";
      ctx.fillText("ज्ञान अर्जन प्रमाणपत्र", 600, 230);

      ctx.font = "italic 20px 'Noto Sans Devanagari', sans-serif";
      ctx.fillStyle = "#64748B";
      ctx.fillText("यह प्रमाणपत्र गौरवपूर्वक प्रदान किया जाता है", 600, 280);

      // User Name
      ctx.fillStyle = "#EA580C";
      ctx.font = "bold 56px 'Noto Serif Devanagari', serif";
      ctx.fillText(currentUser?.name || "सम्मानित पाठक", 600, 360);

      // Main content
      ctx.fillStyle = "#0F172A";
      ctx.font = "22px 'Noto Sans Devanagari', sans-serif";
      ctx.fillText(`को लेख '${article ? article.title.replace(/[#*`>]/g, "").trim() : "युवाक्षर लेख"}' का सफलतापूर्वक अध्ययन`, 600, 440);
      ctx.fillText(`करने एवं ज्ञान मूल्यांकन में ${scorePercentage}% अंक प्राप्त कर`, 600, 480);
      
      const certName = scorePercentage >= 90 ? "ज्ञानवीर प्रमाणपत्र" : scorePercentage >= 80 ? "उत्कृष्टता प्रमाणपत्र" : "सहभागिता प्रमाणपत्र";
      ctx.fillStyle = "#EA580C";
      ctx.font = "bold 26px 'Noto Serif Devanagari', serif";
      ctx.fillText(`'${certName}' (श्रेणी: ${achievement.badge})`, 600, 525);

      ctx.fillStyle = "#64748B";
      ctx.font = "16px 'Noto Sans Devanagari', sans-serif";
      ctx.fillText("अर्जित करने पर सम्मानित किया जाता है।", 600, 565);

      // Seal & Signatures
      ctx.strokeStyle = "#EA580C";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(600, 670, 50, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = "#EA580C";
      ctx.font = "bold 14px 'Noto Serif Devanagari', sans-serif";
      ctx.fillText("युवाक्षर", 600, 665);
      ctx.fillText("अधीक्षक", 600, 685);

      // Date & ID
      ctx.fillStyle = "#64748B";
      ctx.font = "14px monospace";
      ctx.textAlign = "left";
      ctx.fillText(`DATE: ${new Date().toLocaleDateString("hi-IN")}`, 80, 710);
      ctx.fillText(`CERTIFICATE ID: YVK-${Math.floor(100000 + Math.random() * 900000)}`, 80, 740);

      ctx.textAlign = "right";
      ctx.fillText("YUVAKSHAR DIGITAL COUNCIL", 1120, 710);
      ctx.fillText("VERIFIED ACCREDITED STORY SYSTEM", 1120, 740);

      // Convert to image download trigger
      const link = document.createElement("a");
      link.download = `Yuvakshar_Certificate_${articleId}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      setIsGeneratingCert(false);
      alert("प्रमाणपत्र सफलतापूर्वक डाउनलोड हो गया है!");
    }, 1200);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div id="ai-quiz-root" className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
      
      {/* 1. QUIZ SECTION TITLE HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-800 dark:text-white border-l-3 border-primary pl-2 flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-primary animate-pulse" />
            <span>अपना ज्ञान परखें</span>
          </h3>
          <p className="text-xs text-slate-400 font-medium italic mt-1">
            इस लेख को पढ़ने के बाद अपने ज्ञान का परीक्षण करें।
          </p>
        </div>
        
        {/* Suggestion notice */}
        <span className="text-[10px] sm:text-xs font-semibold px-3 py-1.5 rounded-xl border border-primary/20 bg-primary/5 text-primary text-center">
          बेहतर परिणाम के लिए पहले लेख पढ़ें।
        </span>
      </div>

      {/* Offline sync telemetry status badge */}
      {getOfflinePendingCount() > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/25 p-3 rounded-xl flex items-center space-x-2 text-[10px] text-amber-500">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>ऑफ़लाइन मोड सक्रिय: {getOfflinePendingCount()} मूल्यांकन सुरक्षित हैं और इंटरनेट कनेक्ट होते ही सिंक हो जाएंगे।</span>
        </div>
      )}

      {/* Locked scroll notification box */}
      {!hasScrolledEnough && !isUnlocked && !isQuizStarted && (
        <div className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center space-x-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            <Lock className="w-5 h-5 text-primary shrink-0 animate-bounce" />
            <p>
              लेख का ध्यानपूर्वक अध्ययन करें। 70% स्क्रॉल पूरा करने पर मूल्यांकन स्वतः सक्रिय हो जायेगा।
            </p>
          </div>
          <button 
            onClick={() => setIsUnlocked(true)}
            className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1"
          >
            <Unlock className="w-4 h-4" />
            <span>मैंने लेख पढ़ लिया है</span>
          </button>
        </div>
      )}

      {/* QUIZ INTERACTIVE VIEWPORTS */}
      {(hasScrolledEnough || isUnlocked || isQuizStarted) && (
        <GlassCard glow="saffron" className="overflow-hidden">
          
          {/* STATE A: INTRO PANEL */}
          {!isQuizStarted && !isQuizCompleted && (
            <div className="py-6 text-center space-y-6 max-w-lg mx-auto">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto text-primary">
                <Brain className="w-8 h-8" />
              </div>
              
              <div className="space-y-2">
                <h4 className="font-serif text-lg font-bold text-slate-800 dark:text-white">लेख आधारित बौद्धिक मूल्यांकन परीक्षा</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  इस आलेख की विषय वस्तु से {activeQuestions.length} वस्तुनिष्ठ (MCQ) प्रश्न यादृच्छिक रूप से चुने गए हैं। इसमें भाग लेने से आपकी समझने और विश्लेषण करने की क्षमता का मापन होगा।
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-500">
                <div className="flex items-center space-x-1.5">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>प्रश्नों की संख्या: {activeQuestions.length}</span>
                </div>
                <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
                <span className="px-2 py-0.5 rounded border border-primary/20 text-primary text-[10px] font-mono">
                  कठिनाई: {settings.difficulty || "मध्यम"}
                </span>
              </div>

              <button 
                onClick={handleStartQuiz}
                className="w-full bg-primary hover:bg-primary/95 text-white py-3.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <span>ज्ञान परीक्षा प्रारंभ करें</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STATE B: ACTIVE TEST PANEL */}
          {isQuizStarted && !isQuizCompleted && (
            <div className="space-y-6">
              {/* Header metrics */}
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400">क्वेश्चन पूल प्रोग्रेस</span>
                  <p className="text-xs font-bold font-serif">प्रश्न {currentQuestionIndex + 1} / {activeQuestions.length}</p>
                </div>

                <div className="flex items-center space-x-2 text-primary font-mono text-sm font-extrabold bg-primary/5 border border-primary/20 rounded-xl px-3 py-1.5">
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>{formatTimer(elapsedTime)}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / activeQuestions.length) * 100}%` }}
                />
              </div>

              {/* Question text */}
              <div className="space-y-4">
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold border border-primary/20 bg-primary/5 text-primary uppercase font-mono">
                  {activeQuestions[currentQuestionIndex].questionType} • {activeQuestions[currentQuestionIndex].difficultyLevel}
                </span>
                
                <h5 className="font-serif text-base sm:text-lg font-bold text-slate-800 dark:text-white leading-relaxed">
                  {activeQuestions[currentQuestionIndex].question}
                </h5>
              </div>

              {/* Options list */}
              <div className="grid grid-cols-1 gap-3">
                {shuffledOptions[currentQuestionIndex]?.map((opt, oIdx) => {
                  const isSelected = selectedAnswers[currentQuestionIndex] === opt;
                  const isCorrectAnswer = opt === activeQuestions[currentQuestionIndex].correctAnswer;
                  const isAnyAnswerSelected = selectedAnswers[currentQuestionIndex] !== undefined;

                  let optStyle = "border-slate-200 dark:border-slate-800 hover:border-primary hover:bg-primary/5 text-slate-700 dark:text-slate-300";
                  let labelText = "";
                  let Icon = null;

                  if (isAnyAnswerSelected) {
                    if (isCorrectAnswer) {
                      optStyle = "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400 font-bold scale-[1.01]";
                      labelText = "✓ सही उत्तर";
                      Icon = CheckCircle2;
                    } else if (isSelected) {
                      optStyle = "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 font-bold";
                      labelText = "✗ गलत उत्तर";
                      Icon = XCircle;
                    } else {
                      optStyle = "border-slate-100 dark:border-slate-900 opacity-50 text-slate-400";
                    }
                  }

                  return (
                    <button
                      key={oIdx}
                      disabled={isAnyAnswerSelected}
                      onClick={() => handleSelectOption(opt)}
                      className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm transition-all flex justify-between items-center ${optStyle} ${
                        !isAnyAnswerSelected ? "cursor-pointer" : "cursor-default"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold font-mono flex items-center justify-center text-slate-400 border border-slate-200 dark:border-slate-700">
                          {oIdx + 1}
                        </span>
                        <span className="leading-snug">{opt}</span>
                      </div>
                      
                      {labelText && (
                        <span className="flex items-center space-x-1 text-[9px] uppercase font-bold tracking-wider">
                          {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                          <span>{labelText}</span>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Navigation controls */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex space-x-2">
                  <button
                    disabled={currentQuestionIndex === 0}
                    onClick={handlePrevQuestion}
                    className="px-3 py-2 border border-border text-slate-400 hover:text-primary rounded-xl text-xs font-bold disabled:opacity-30 cursor-pointer"
                  >
                    पिछला
                  </button>
                  <button
                    disabled={currentQuestionIndex === activeQuestions.length - 1}
                    onClick={handleNextQuestion}
                    className="px-3 py-2 border border-border text-slate-400 hover:text-primary rounded-xl text-xs font-bold disabled:opacity-30 cursor-pointer"
                  >
                    अगला
                  </button>
                </div>

                {selectedAnswers[currentQuestionIndex] !== undefined && (
                  <div>
                    {currentQuestionIndex === activeQuestions.length - 1 ? (
                      <button
                        onClick={handleCompleteQuiz}
                        className="bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                      >
                        मेरा परिणाम देखें
                      </button>
                    ) : (
                      <button
                        onClick={handleNextQuestion}
                        className="bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center space-x-1"
                      >
                        <span>आगे बढ़ें</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STATE C: EVALUATION RESULTS PANEL */}
          {isQuizCompleted && (
            <div className="space-y-6">
              
              {/* Score overview header */}
              <div className="text-center py-4 space-y-3">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${achievement.color}`}>
                  {achievement.badge} • {achievement.title}
                </span>

                <div className="text-5xl font-extrabold font-serif text-primary pt-2">
                  {correctAnswers} / {activeQuestions.length}
                </div>

                <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto leading-relaxed">
                  {achievement.desc}
                </p>
              </div>

              {/* Grid indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-center">
                {[
                  { label: "कुल प्रश्न", val: activeQuestions.length, color: "text-slate-500" },
                  { label: "सही उत्तर", val: correctAnswers, color: "text-green-500 font-bold" },
                  { label: "गलत उत्तर", val: wrongAnswers, color: "text-red-500" },
                  { label: "कुल समय", val: formatTimer(elapsedTime), color: "text-primary font-bold" }
                ]?.map((ind, idx) => (
                  <div key={idx} className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/80 p-3.5 rounded-xl space-y-1">
                    <span className="text-[10px] text-slate-400 block">{ind.label}</span>
                    <p className={`text-base font-serif ${ind.color}`}>{ind.val}</p>
                  </div>
                ))}
              </div>

              {/* Dynamic Cognitive Capabilites meters */}
              <div className="bg-slate-50/50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                <h5 className="font-serif text-xs font-bold text-primary flex items-center space-x-1.5">
                  <Brain className="w-4 h-4" />
                  <span>आपकी अध्ययन क्षमता (Cognitive Metrics)</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {[
                    { label: "स्मरण शक्ति (Memory)", val: cognitiveMeters.memory, color: "bg-primary" },
                    { label: "विषय समझ (Understanding)", val: cognitiveMeters.understanding, color: "bg-blue-500" },
                    { label: "विश्लेषण क्षमता (Analysis)", val: cognitiveMeters.analysis, color: "bg-green-500" },
                    { label: "तार्किक सोच (Logic)", val: cognitiveMeters.logic, color: "bg-amber-500" }
                  ]?.map((meter, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between font-medium">
                        <span>{meter.label}</span>
                        <span className="font-mono">{meter.val}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${meter.color} transition-all duration-500`}
                          style={{ width: `${meter.val}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certificate generate action triggers */}
              {scorePercentage >= 60 && (
                <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                  <div className="space-y-1.5 text-xs leading-relaxed max-w-md">
                    <h6 className="font-serif font-bold text-sm text-primary flex items-center justify-center sm:justify-start space-x-1.5">
                      <Award className="w-4.5 h-4.5" />
                      <span>प्रमाणपत्र अनलॉक हो गया है!</span>
                    </h6>
                    <p className="text-slate-400">
                      बधाई हो! आपने परीक्षा में {scorePercentage}% अंक प्राप्त किए हैं। आप अपना मान्यता प्राप्त डीजी-प्रमाणपत्र डाउनलोड कर सकते हैं।
                    </p>
                  </div>
                  
                  <button 
                    disabled={isGeneratingCert}
                    onClick={handleDownloadCertificate}
                    className="w-full sm:w-auto bg-primary hover:bg-primary/95 text-white px-5 py-3 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1.5 shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>{isGeneratingCert ? "प्रमाणपत्र तैयार हो रहा है..." : "प्रमाणपत्र प्राप्त करें"}</span>
                  </button>
                </div>
              )}

              {/* Section 8: Answer review details */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <h5 className="font-serif text-sm font-bold text-slate-800 dark:text-white border-l-2 border-primary pl-2">
                  सही उत्तर एवं व्याख्या (Review Mode)
                </h5>

                <div className="space-y-4">
                  {activeQuestions?.map((q, idx) => {
                    const selected = selectedAnswers[idx];
                    const isCorrect = selected === q.correctAnswer;
                    
                    return (
                      <div 
                        key={idx} 
                        className={`p-4 rounded-xl border text-xs leading-relaxed space-y-3 bg-white dark:bg-slate-900/10 ${
                          isCorrect 
                            ? "border-green-500/20 bg-green-500/[0.02]" 
                            : "border-red-500/20 bg-red-500/[0.02]"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] font-mono font-bold text-slate-400">
                            प्रश्न {idx + 1} • {q.questionType}
                          </span>
                          <span className={`font-mono text-[9px] font-bold uppercase ${isCorrect ? "text-green-500" : "text-red-500"}`}>
                            {isCorrect ? "✓ PASSED" : "✗ FAILED"}
                          </span>
                        </div>

                        <p className="font-serif font-bold text-slate-800 dark:text-slate-200">
                          {q.question}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-medium">
                          <div className="flex space-x-1.5 p-2 bg-slate-100/50 dark:bg-slate-800/30 rounded-lg">
                            <span className="text-slate-400 shrink-0">आपका उत्तर:</span>
                            <span className={isCorrect ? "text-green-500 font-bold" : "text-red-500"}>
                              {selected || "[छोड़ दिया गया]"}
                            </span>
                          </div>
                          <div className="flex space-x-1.5 p-2 bg-slate-100/50 dark:bg-slate-800/30 rounded-lg">
                            <span className="text-slate-400 shrink-0">सही उत्तर:</span>
                            <span className="text-green-500 font-bold">{q.correctAnswer}</span>
                          </div>
                        </div>

                        {/* Explanation & Fact */}
                        <div className="border-t border-slate-100 dark:border-slate-800 pt-2.5 space-y-2">
                          <p className="text-slate-500 font-light">
                            <strong className="text-primary font-serif">व्याख्या: </strong>
                            {q.explanation}
                          </p>
                          <p className="text-slate-400 text-[11px] italic leading-relaxed">
                            <strong className="text-slate-500 font-serif not-italic">सम्बन्धित तथ्य: </strong>
                            {q.relatedFact}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Actions retry */}
              <div className="flex justify-center pt-4 border-t border-slate-200 dark:border-slate-800">
                <button 
                  onClick={handleRetry}
                  className="border border-border text-slate-400 hover:text-primary px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>पुनः प्रयास करें (Retry Quiz)</span>
                </button>
              </div>

            </div>
          )}

        </GlassCard>
      )}

    </div>
  );
}
