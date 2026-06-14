"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { 
  ArrowLeft, 
  BookMarked, 
  Highlighter, 
  Download, 
  Volume2, 
  Timer, 
  Trash2, 
  Sparkles,
  Share2,
  Bookmark,
  BookmarkCheck,
  Send,
  ThumbsUp,
  AlertTriangle,
  Clock,
  ChevronRight,
  BookOpen,
  Unlock,
  Lock,
  Award,
  Brain,
  MessageSquare,
  ArrowRight
} from "lucide-react";

import { useCms, Article, Comment } from "@/store/CmsContext";
import GlassCard from "@/components/yuvakshar/GlassCard";
import { parseMarkdownToHtmlBlocks, stripMarkdown } from "@/lib/markdown";
import ArticleQuiz from "@/components/yuvakshar/ArticleQuiz";
import { generateAuthorSlug } from "@/lib/authorService";
import AiAssistantSidebar from "@/components/yuvakshar/AiAssistantSidebar";
import ProfilePreviewWrapper from "@/components/yuvakshar/ProfilePreviewCard";
import { motion, AnimatePresence } from "framer-motion";


const translateRole = (role?: string | null) => {
  if (role === null) return "à¤¸à¤¦à¤¸à¥à¤¯";
  if (!role) return "अतिथि पाठक";
  switch (role) {
    case "Owner": return "à¤¸à¥à¤µà¤¾à¤®à¥€";
    case "Admin": return "à¤ªà¥à¤°à¤¶à¤¾à¤¸à¤•";
    case "Editor-in-Chief": return "à¤ªà¥à¤°à¤§à¤¾à¤¨ संपादक";
    case "Managing Editor": return "à¤ªà¥à¤°à¤¬à¤‚à¤§ संपादक";
    case "Editor": return "संपादक";
    case "Fact Check Reviewer": return "à¤¸à¤¤à¥à¤¯à¤¤à¤¾ à¤¸à¤®à¥€à¤•à¥à¤·à¤•";
    case "Author": return "लेखक";
    case "Contributor": return "à¤¯à¥‹à¤—à¤¦à¤¾à¤¨à¤•à¤°à¥à¤¤à¤¾";
    default: return role;
  }
};

const safeIsoDate = (dateStr?: string) => {
  if (!dateStr) return new Date().toISOString();
  const parsed = Date.parse(dateStr);
  if (!isNaN(parsed)) {
    return new Date(parsed).toISOString();
  }
  
  const match = dateStr.match(/(\d+)\s+([^\s0-9]+)\s+(\d+)/);
  if (match) {
    const day = parseInt(match[1]);
    const monthHindi = match[2];
    const year = parseInt(match[3]);
    
    const monthsMap: Record<string, number> = {
      "जनवरी": 0, "फ़रवरी": 1, "à¤®à¤¾à¤°à¥à¤š": 2, "à¤…à¤ªà¥à¤°à¥ˆà¤²": 3, "मई": 4, "जून": 5,
      "à¤œà¥à¤²à¤¾à¤ˆ": 6, "à¤…à¤—à¤¸à¥à¤¤": 7, "सितंबर": 8, "à¤…à¤•à¥à¤Ÿà¥‚à¤¬à¤°": 9, "नवंबर": 10, "दिसंबर": 11,
      "फरवरी": 1, "सितम्बर": 8, "à¤…à¤•à¥à¤Ÿà¥à¤¬à¤°": 9, "नम्बर": 10, "नवम्बर": 10, "दिसम्बर": 11
    };
    
    const month = monthsMap[monthHindi] !== undefined ? monthsMap[monthHindi] : 5;
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) {
      return date.toISOString();
    }
  }
  return new Date().toISOString();
};

function EditorialPageContent() {
  const searchParams = useSearchParams();
  const articleId = searchParams.get("id");
  const articleSlug = searchParams.get("slug");
  
  const { 
    articles, 
    comments, 
    addComment, 
    reportComment, 
    incrementArticleLike, 
    incrementArticleView, 
    ads,
    currentUser,
    openAuthModal,
    users,
  } = useCms();

  // Load target article or fallback to first article
  const article = articles.find(a => a.id === articleId || a.slug === articleSlug) || articles[0];

  const [scrollProgress, setScrollProgress] = useState(0);
  const [fontSize, setFontSize] = useState<"sm" | "base" | "lg" | "xl">("base");
  const [highlights, setHighlights] = useState<any[]>([]);
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [activeColor, setActiveColor] = useState<"yellow" | "blue" | "red" | "green">("yellow");
  const [selectedText, setSelectedText] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isPlayingNarration, setIsPlayingNarration] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(1500); // 25 min default
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [totalDurationSeconds, setTotalDurationSeconds] = useState(1500);
  const [customMinutesInput, setCustomMinutesInput] = useState("25");
  const [timerError, setTimerError] = useState("");
  const [timerSettings, setTimerSettings] = useState({
    enabled: true,
    sound: true,
    statistics: true
  });
  const [todayTime, setTodayTime] = useState(0);
  const [weeklyTime, setWeeklyTime] = useState(0);
  const [monthlyTime, setMonthlyTime] = useState(0);

  // Comments state
  const [commentText, setCommentText] = useState("");
  const [replyToId, setReplyToId] = useState<string | null>(null);

  // References for selection detection
  const articleContentRef = useRef<HTMLDivElement>(null);

  // Track page view once
  useEffect(() => {
    if (article) {
      incrementArticleView(article.id);
    }
  }, [article?.id]);

  // Monitor scroll for progress bar
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Load study stats helper
  const loadStudyStats = () => {
    const historyStr = localStorage.getItem("yuvakshar_study_history");
    const history = historyStr ? JSON.parse(historyStr) : [];
    const today = new Date().toISOString().split("T")[0];
    
    // Today's stats
    const todayEntry = history.find((e: any) => e.date === today);
    setTodayTime(todayEntry ? todayEntry.seconds : 0);

    // Weekly stats (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklySum = history
      .filter((e: any) => new Date(e.date) >= sevenDaysAgo)
      .reduce((acc: number, curr: any) => acc + curr.seconds, 0);
    setWeeklyTime(weeklySum);

    // Monthly stats (this calendar month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);
    const monthlySum = history
      .filter((e: any) => new Date(e.date) >= startOfMonth)
      .reduce((acc: number, curr: any) => acc + curr.seconds, 0);
    setMonthlyTime(monthlySum);
  };

  // Update study stats helper
  const updateStudyHistoryInLocalStorage = (secondsAdded: number) => {
    const historyStr = localStorage.getItem("yuvakshar_study_history");
    const history = historyStr ? JSON.parse(historyStr) : [];
    const today = new Date().toISOString().split("T")[0];
    
    const todayEntry = history.find((e: any) => e.date === today);
    if (todayEntry) {
      todayEntry.seconds += secondsAdded;
    } else {
      history.push({ date: today, seconds: secondsAdded });
    }
    localStorage.setItem("yuvakshar_study_history", JSON.stringify(history));
    
    // Reload state stats
    loadStudyStats();
  };

  // Timer complete chime & notification
  const handleTimerComplete = () => {
    alert("⏱️ à¤¸à¥à¤µà¤¾à¤§à¥à¤¯à¤¾à¤¯ समय à¤ªà¥‚à¤°à¥à¤£ à¤¹à¥à¤†! (Study session completed!)");
    
    // Play chime sound
    if (timerSettings.sound) {
      try {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.6);
      } catch (err) {
        console.error("Audio failed", err);
      }
    }

    // Trigger local push notification
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification("à¤¯à¥à¤µà¤¾à¤•à¥à¤·à¤° à¤¸à¥à¤µà¤¾à¤§à¥à¤¯à¤¾à¤¯", { body: "à¤¸à¥à¤µà¤¾à¤§à¥à¤¯à¤¾à¤¯ समय à¤ªà¥‚à¤°à¥à¤£ à¤¹à¥à¤†!" });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
          if (permission === "granted") {
            new Notification("à¤¯à¥à¤µà¤¾à¤•à¥à¤·à¤° à¤¸à¥à¤µà¤¾à¤§à¥à¤¯à¤¾à¤¯", { body: "à¤¸à¥à¤µà¤¾à¤§à¥à¤¯à¤¾à¤¯ समय à¤ªà¥‚à¤°à¥à¤£ à¤¹à¥à¤†!" });
          }
        });
      }
    }

    // Reset to last set duration
    const lastTime = localStorage.getItem("yuvakshar_last_timer_minutes") || "25";
    const secs = parseInt(lastTime, 10) * 60;
    setPomodoroTime(secs);
    setTotalDurationSeconds(secs);
  };

  // Upgraded Timer Logic Effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            handleTimerComplete();
            return 0;
          }
          // Increment statistics
          updateStudyHistoryInLocalStorage(1);
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, pomodoroTime, timerSettings]);

  // Load preferences and stats on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("yuvakshar_timer_settings");
    if (savedSettings) {
      setTimerSettings(JSON.parse(savedSettings));
    }
    const lastMinutes = localStorage.getItem("yuvakshar_last_timer_minutes") || "25";
    setCustomMinutesInput(lastMinutes);
    const secs = parseInt(lastMinutes, 10) * 60;
    setPomodoroTime(secs);
    setTotalDurationSeconds(secs);
    loadStudyStats();
  }, []);

  const handleReset = () => {
    setIsTimerRunning(false);
    const lastTime = localStorage.getItem("yuvakshar_last_timer_minutes") || "25";
    const secs = parseInt(lastTime, 10) * 60;
    setPomodoroTime(secs);
    setTotalDurationSeconds(secs);
  };

  // Keyboard accessibility hook
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputFocused = activeEl && (
        activeEl.tagName === "INPUT" || 
        activeEl.tagName === "TEXTAREA" || 
        activeEl.tagName === "SELECT" || 
        activeEl.getAttribute("contenteditable") === "true"
      );
      if (isInputFocused) return;

      if (e.code === "Space") {
        e.preventDefault();
        setIsTimerRunning(prev => !prev);
      } else if (e.code === "KeyR" || e.key === "r" || e.key === "R") {
        e.preventDefault();
        handleReset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSetTime = (val: string) => {
    setCustomMinutesInput(val);
    const mins = parseInt(val, 10);
    if (val === "") {
      setTimerError("");
      return;
    }
    if (isNaN(mins) || mins < 1 || mins > 720) {
      setTimerError("à¤•à¥ƒà¤ªà¤¯à¤¾ 1 à¤¸à¥‡ 720 मिनट à¤•à¥‡ à¤¬à¥€à¤š समय à¤¦à¤°à¥à¤œ à¤•à¤°à¥‡à¤‚");
    } else {
      setTimerError("");
      const secs = mins * 60;
      setPomodoroTime(secs);
      setTotalDurationSeconds(secs);
      localStorage.setItem("yuvakshar_last_timer_minutes", val);
    }
  };

  const adjustTimer = (minutes: number) => {
    setPomodoroTime(prev => {
      const newTime = prev + (minutes * 60);
      if (newTime <= 0) return 0;
      setTotalDurationSeconds(prevTotal => {
        const nextTotal = prevTotal + (minutes * 60);
        return nextTotal > 0 ? nextTotal : 1;
      });
      return newTime;
    });
  };

  const formatDuration = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hours > 0) return `${hours} घंटे ${mins} मिनट`;
    if (mins > 0) return `${mins} मिनट ${secs} सेकंड`;
    return `${secs} सेकंड`;
  };

  // Load Highlights and Bookmark status
  useEffect(() => {
    if (article) {
      const savedHighlights = localStorage.getItem(`yuvakshar_highlights_${article.id}`);
      if (savedHighlights) {
        setHighlights(JSON.parse(savedHighlights));
      }
      const savedBookmarks = localStorage.getItem("yuvakshar_bookmarks");
      if (savedBookmarks) {
        const list = JSON.parse(savedBookmarks);
        setIsBookmarked(list.includes(article.id));
      }
    }
  }, [article?.id]);

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center text-slate-400 font-serif">à¤•à¥‹à¤ˆ à¤²à¥‡à¤– à¤‰à¤ªà¤²à¤¬à¥à¤§ à¤¨à¤¹à¥€à¤‚ à¤¹à¥ˆà¥¤</div>
      </div>
    );
  }

  const scrollToHeading = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      window.history.pushState(null, "", `#${id}`);
    }
  };

  const toggleGlobalBookmark = () => {
    const saved = localStorage.getItem("yuvakshar_bookmarks");
    let list: string[] = saved ? JSON.parse(saved) : [];
    if (list.includes(article.id)) {
      list = list.filter(id => id !== article.id);
      setIsBookmarked(false);
    } else {
      list.push(article.id);
      setIsBookmarked(true);
    }
    localStorage.setItem("yuvakshar_bookmarks", JSON.stringify(list));
  };

  // Capture selected text
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setSelectedText(selection.toString().trim());
    }
  };

  // Add a highlight
  const addHighlight = () => {
    if (!selectedText.trim()) return;
    if (!currentUser) {
      openAuthModal(undefined, "Please login or create an account to continue.");
      return;
    }

    const newHighlight = {
      id: `hl-${Date.now()}`,
      text: selectedText,
      color: activeColor,
      note: noteText,
      date: new Date().toLocaleDateString("hi-IN")
    };

    const updated = [...highlights, newHighlight];
    setHighlights(updated);
    localStorage.setItem(`yuvakshar_highlights_${article.id}`, JSON.stringify(updated));
    
    setSelectedText("");
    setNoteText("");
    window.getSelection()?.removeAllRanges();
  };

  // Delete a highlight
  const handleDeleteHighlight = (id: string) => {
    const updated = highlights.filter(hl => hl.id !== id);
    setHighlights(updated);
    localStorage.setItem(`yuvakshar_highlights_${article.id}`, JSON.stringify(updated));
  };

  // Submit comment
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!currentUser) {
      openAuthModal(undefined, "Please login or create an account to continue.");
      return;
    }
    await addComment(article.id, currentUser.name, commentText, replyToId);
    setCommentText("");
    setReplyToId(null);
    alert("à¤Ÿà¤¿à¤ªà¥à¤ªà¤£à¥€ à¤¦à¤°à¥à¤œ à¤•à¥€ à¤—à¤ˆ! à¤¸à¤®à¥€à¤•à¥à¤·à¤¾ à¤•à¥‡ बाद à¤ªà¥à¤°à¤•à¤¾à¤¶à¤¿à¤¤ à¤¹à¥‹à¤—à¥€à¥¤");
  };

  const handleLikeClick = async () => {
    if (!currentUser) {
      openAuthModal(undefined, "Please login or create an account to continue.");
      return;
    }
    await incrementArticleLike(article.id);
    alert("लेख को पसंद किया गया!");
  };

  const handleBookmarkClick = () => {
    if (!currentUser) {
      openAuthModal(undefined, "Please login or create an account to continue.");
      return;
    }
    toggleGlobalBookmark();
  };

  const handleReplyClick = (parentId: string) => {
    if (!currentUser) {
      openAuthModal(undefined, "Please login or create an account to continue.");
      return;
    }
    setReplyToId(parentId);
    document.querySelector("textarea")?.focus();
  };

  const formatTimer = () => {
    const mins = Math.floor(pomodoroTime / 60);
    const secs = pomodoroTime % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const highlightColors = {
    yellow: { bg: "bg-[#EAB308]/20 border-[#EAB308]", text: "text-[#EAB308]" },
    blue: { bg: "bg-[#3B82F6]/20 border-[#3B82F6]", text: "text-[#3B82F6]" },
    red: { bg: "bg-[#EF4444]/20 border-[#EF4444]", text: "text-[#EF4444]" },
    green: { bg: "bg-[#22C55E]/20 border-[#22C55E]", text: "text-[#22C55E]" }
  };

  // Generate Table of Contents from headings
  const parseHeadings = (text: string) => {
    const headingRegex = /^(#{2,3})\s+(.*)$/gm;
    const list = [];
    let match;
    while ((match = headingRegex.exec(text)) !== null) {
      const level = match[1].length; // 2 or 3
      const title = stripMarkdown(match[2]);
      const id = title.replace(/\s+/g, "-").toLowerCase();
      list.push({ level, title, id });
    }
    return list;
  };

  const headings = parseHeadings(article.content);

  // Split and inject Ads into article body paragraphs
  const renderArticleBodyWithAds = () => {
    const fontSizeClass = fontSize === "sm" ? "text-sm" : fontSize === "lg" ? "text-lg" : fontSize === "xl" ? "text-xl" : "text-base md:text-lg";
    const blocks = parseMarkdownToHtmlBlocks(article.content, fontSizeClass);
    if (blocks.length === 0) return <p className="font-light">{article.content}</p>;

    const adFirst = ads.find(a => a.zone === "after_first_p" && a.active);
    const adMid = ads.find(a => a.zone === "mid_content" && a.active);

    return blocks.map((block, idx) => {
      let html = block.html;

      // 1. Drop Cap on first paragraph
      if (idx === 0 && block.type === 'paragraph') {
        html = html.replace('<p ', '<p class="first-letter:float-left first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-2.5 first-letter:mt-1 " ');
      }

      // 2. Styling Blockquotes as Pull Quotes
      if (block.type === 'blockquote') {
        html = html.replace('<blockquote ', '<blockquote class="border-l-4 border-primary/80 pl-6 my-6 italic text-slate-700 dark:text-slate-350 bg-slate-50/50 dark:bg-slate-900/30 p-6 rounded-r-2xl font-serif text-lg leading-relaxed relative " ');
      }

      // 3. Injecting dynamic IDs to H2/H3 for TOC scroll link mapping
      if (block.type === 'heading') {
        const match = html.match(/<h([1-6])[^>]*>(.*?)<\/h\1>/);
        if (match) {
          const level = match[1];
          const content = match[2];
          const cleanTitle = stripMarkdown(content.replace(/<[^>]*>/g, ''));
          const id = cleanTitle.replace(/\s+/g, "-").toLowerCase();
          html = `<h${level} id="${id}" class="font-serif text-xl sm:text-2xl font-bold leading-tight my-5 border-b border-slate-100 dark:border-slate-800/60 pb-2 text-slate-900 dark:text-white">${content}</h${level}>`;
        }
      }

      // 4. Custom Fact Boxes parsing
      if (html.includes('[à¤®à¤¹à¤¤à¥à¤µà¤ªà¥‚à¤°à¥à¤£ तथ्य]') || html.includes('[à¤•à¥à¤¯à¤¾ à¤†à¤ª à¤œà¤¾à¤¨à¤¤à¥‡ à¤¹à¥ˆà¤‚?]') || html.includes('[à¤µà¤¿à¤¶à¥‡à¤· à¤Ÿà¤¿à¤ªà¥à¤ªà¤£à¥€]')) {
        let title = "à¤®à¤¹à¤¤à¥à¤µà¤ªà¥‚à¤°à¥à¤£ तथ्य";
        let colorClass = "border-amber-500 bg-amber-50/40 dark:bg-amber-950/15";
        let textColor = "text-amber-600 dark:text-amber-400";
        if (html.includes('[à¤•à¥à¤¯à¤¾ à¤†à¤ª à¤œà¤¾à¤¨à¤¤à¥‡ à¤¹à¥ˆà¤‚?]')) {
          title = "à¤•à¥à¤¯à¤¾ à¤†à¤ª à¤œà¤¾à¤¨à¤¤à¥‡ à¤¹à¥ˆà¤‚?";
          colorClass = "border-blue-500 bg-blue-50/40 dark:bg-blue-950/15";
          textColor = "text-blue-600 dark:text-blue-400";
        } else if (html.includes('[à¤µà¤¿à¤¶à¥‡à¤· à¤Ÿà¤¿à¤ªà¥à¤ªà¤£à¥€]')) {
          title = "à¤µà¤¿à¤¶à¥‡à¤· à¤Ÿà¤¿à¤ªà¥à¤ªà¤£à¥€";
          colorClass = "border-primary bg-primary/5 dark:bg-primary/10";
          textColor = "text-primary";
        }
        
        const cleanContent = html
          .replace('[à¤®à¤¹à¤¤à¥à¤µà¤ªà¥‚à¤°à¥à¤£ तथ्य]', '')
          .replace('[à¤•à¥à¤¯à¤¾ à¤†à¤ª à¤œà¤¾à¤¨à¤¤à¥‡ à¤¹à¥ˆà¤‚?]', '')
          .replace('[à¤µà¤¿à¤¶à¥‡à¤· à¤Ÿà¤¿à¤ªà¥à¤ªà¤£à¥€]', '');
          
        html = `
          <div class="my-6 border-l-4 p-5 rounded-r-2xl shadow-sm ${colorClass} font-serif text-xs sm:text-sm">
            <h5 class="font-bold uppercase tracking-wider mb-2 ${textColor}">${title}</h5>
            <div class="leading-relaxed text-slate-700 dark:text-slate-350">${cleanContent}</div>
          </div>
        `;
      }

      // 5. YouTube Video / Shorts Embedding
      if (html.includes('[youtube:') || html.includes('[shorts:')) {
        const youtubeRegex = /\[youtube:\s*([a-zA-Z0-9_-]+)\s*\]/g;
        const shortsRegex = /\[shorts:\s*([a-zA-Z0-9_-]+)\s*\]/g;
        
        html = html.replace(youtubeRegex, `
          <div class="my-6 aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg">
            <iframe
              src="https://www.youtube.com/embed/$1"
              title="YouTube Video Player"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
              class="w-full h-full"
            ></iframe>
          </div>
        `);
        
        html = html.replace(shortsRegex, `
          <div class="my-6 flex justify-center">
            <div class="w-full max-w-[280px] aspect-[9/16] overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg bg-black">
              <iframe
                src="https://www.youtube.com/embed/$1"
                title="YouTube Shorts Player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
                class="w-full h-full"
              ></iframe>
            </div>
          </div>
        `);
      }

      return (
        <React.Fragment key={idx}>
          <div dangerouslySetInnerHTML={{ __html: html }} />

          {/* Ad Slot 1: After First Paragraph */}
          {idx === 0 && adFirst && (
            <div className="w-full my-6 p-4 bg-slate-50 dark:bg-[#0F172A]/30 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex items-center justify-center relative overflow-hidden select-none">
              {adFirst.type === "banner" ? (
                <a href={adFirst.link_url} target="_blank" rel="noopener noreferrer" className="block max-w-full">
                  <img src={adFirst.image_url} alt="Advertisement" className="mx-auto rounded-lg max-h-36 object-cover" />
                </a>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: adFirst.code || "" }} />
              )}
            </div>
          )}

          {/* Ad Slot 2: Mid Content */}
          {idx === Math.floor(blocks.length / 2) && adMid && (
            <div className="w-full my-6 p-4 bg-slate-50 dark:bg-[#0F172A]/30 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex items-center justify-center relative overflow-hidden select-none">
              {adMid.type === "banner" ? (
                <a href={adMid.link_url} target="_blank" rel="noopener noreferrer" className="block max-w-full">
                  <img src={adMid.image_url} alt="Advertisement" className="mx-auto rounded-lg max-h-36 object-cover" />
                </a>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: adMid.code || "" }} />
              )}
            </div>
          )}
        </React.Fragment>
      );
    });
  };

  const renderArticlePreview = () => {
    const fontSizeClass = fontSize === "sm" ? "text-sm" : fontSize === "lg" ? "text-lg" : fontSize === "xl" ? "text-xl" : "text-base md:text-lg";
    const blocks = parseMarkdownToHtmlBlocks(article.content, fontSizeClass);
    if (blocks.length === 0) return <p className="font-light line-clamp-3">{article.content}</p>;
    
    // Render only the first block/paragraph
    let html = blocks[0].html;
    if (blocks[0].type === 'paragraph') {
      html = html.replace('<p ', '<p class="first-letter:float-left first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-2.5 first-letter:mt-1 " ');
    }
    
    return (
      <div className="relative">
        <div dangerouslySetInnerHTML={{ __html: html }} />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#FAF8F3] to-transparent dark:from-[#0A0F1D] pointer-events-none" />
      </div>
    );
  };


  // Filter approved comments
  const articleComments = comments.filter(c => c.article_id === article.id && (c.status === "approved" || !c.status));
  const topLevelComments = articleComments.filter(c => !c.parent_id);
  const getRepliesForComment = (parentId: string) => articleComments.filter(c => c.parent_id === parentId);

  const adBeforeRelated = ads.find(a => a.zone === "before_related" && a.active);

  // Schema.org NewsArticle JSON-LD Payload
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": stripMarkdown(article.title),
    "description": stripMarkdown(article.summary),
    "image": [article.coverImage].filter(Boolean),
    "datePublished": safeIsoDate(article.date),
    "dateModified": safeIsoDate(article.date),
    "author": [{
      "@type": "Person",
      "name": article.author,
      "url": `https://yuvakshar.org/authors/${generateAuthorSlug(article.author)}`
    }],
    "publisher": {
      "@type": "Organization",
      "name": "à¤¯à¥à¤µà¤¾à¤•à¥à¤·à¤°",
      "logo": {
        "@type": "ImageObject",
        "url": "https://yuvakshar.org/icon.png"
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-[#FAF8F3] dark:bg-[#0A0F1D] text-[#1E1E1E] dark:text-slate-200 pb-20">
      {/* Schema.org NewsArticle Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* 1. TOP READING PROGRESS BAR */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-850 z-50">
        <div 
          className="h-full bg-primary shadow-[0_0_8px_#EA580C]" 
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      {/* Back desk link */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        <Link 
          href="/" 
          className="inline-flex items-center space-x-2 text-xs text-slate-500 hover:text-primary transition-colors font-medium font-serif"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>à¤®à¥à¤–à¥à¤¯ प॒ष्ठ पर वापस à¤œà¤¾à¤à¤‚</span>
        </Link>
      </div>

      {/* 2. HERO COVER HEADER SECTION */}
      <div className="relative w-full min-h-[380px] md:min-h-[520px] bg-slate-950 overflow-hidden flex flex-col justify-end text-white pb-12 pt-20 mt-4">
        {article.coverImage ? (
          <img src={article.coverImage} alt={stripMarkdown(article.title)} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 to-primary/45" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
        
        <div className="max-w-5xl mx-auto px-4 md:px-8 w-full relative z-10 space-y-4">
          <span className="bg-primary text-white font-bold uppercase tracking-widest text-[9px] px-3.5 py-1.5 rounded-full inline-block font-sans shadow-md">
            {article.category}
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
            {stripMarkdown(article.title)}
          </h1>
          {article.englishTitle && (
            <h2 className="font-sans text-lg md:text-xl text-primary font-medium tracking-wide">
              â€œ{stripMarkdown(article.englishTitle)}⬝
            </h2>
          )}
          <p className="text-sm md:text-base text-slate-300 font-serif leading-relaxed max-w-3xl font-light">
            {stripMarkdown(article.summary)}
          </p>
          
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-sans pt-2">
            <span>लेखक: <ProfilePreviewWrapper userId={article.author}><Link href={`/authors/${generateAuthorSlug(article.author)}`} className="hover:text-primary hover:underline font-bold transition-colors">{article.author}</Link></ProfilePreviewWrapper></span>

            <span>⬢</span>
            <span>दिनांक: {article.date}</span>
            <span>⬢</span>
            <span>पठन समय: {article.readTime}</span>
            <span>⬢</span>
            <span>à¤µà¥à¤¯à¥‚à¤œà¤¼: {article.views || 0}</span>
          </div>
        </div>
      </div>

      {/* 3. HORIZONTAL META BAR */}
      <div className="border-y border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/10 py-4 px-4 md:px-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-serif">
          <div className="flex items-center space-x-3">
            <ProfilePreviewWrapper userId={article.author}>
              <Link href={`/authors/${generateAuthorSlug(article.author)}`} className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-sm hover:border-primary transition-all">
                {article.author?.[0]}
              </Link>
            </ProfilePreviewWrapper>
            <div>
              <ProfilePreviewWrapper userId={article.author}>
                <Link href={`/authors/${generateAuthorSlug(article.author)}`} className="hover:text-primary transition-colors">
                  <p className="font-bold text-slate-800 dark:text-white leading-none">{article.author}</p>
                </Link>
              </ProfilePreviewWrapper>
              <p className="text-[10px] text-slate-400 mt-1">{article.authorRole || "वरिष्ठ संपादक"}</p>
            </div>
          </div>

          
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLikeClick}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer text-slate-500 hover:text-primary"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>पसंद ({article.likes || 0})</span>
            </button>

            <button 
              onClick={handleBookmarkClick}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer text-slate-500 hover:text-primary"
            >
              {isBookmarked ? <BookmarkCheck className="w-4 h-4 text-primary" /> : <Bookmark className="w-4 h-4" />}
              <span>{isBookmarked ? "सहेजा गया" : "सहेजें (Bookmark)"}</span>
            </button>

            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("à¤²à¥‡à¤– à¤•à¤¾ à¤²à¤¿à¤‚à¤• à¤•à¥à¤²à¤¿à¤ªà¤¬à¥‹à¤°à¥à¤¡ पर à¤•à¥‰à¤ªà¥€ à¤•à¤¿à¤¯à¤¾ à¤—à¤¯à¤¾!");
              }}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-primary transition-colors cursor-pointer"
              title="Share Link"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. MAIN TWO-COLUMN GRID */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Main Editorial Content (Col Span 9) */}
        <div className="lg:col-span-9 space-y-8">
          {/* Highlights summary Box */}
          <div className="border-l-4 border-primary bg-primary/5 dark:bg-primary/10 p-5 rounded-r-2xl space-y-2 max-w-[850px]">
            <h4 className="font-serif text-sm font-bold text-primary flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>à¤®à¥à¤–à¥à¤¯ à¤¬à¤¿à¤‚à¤¦à¥ (Highlights)</span>
            </h4>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300 italic font-serif">
              {stripMarkdown(article.summary)}
            </p>
          </div>

          {/* Collapsible Index Accordion (📄 इस लेख में) - Hidden for short articles (headings <= 2) */}
          {headings.length > 2 && (
            <div className="bg-white dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-w-[850px] shadow-sm">
              <button 
                onClick={() => setIsIndexOpen(!isIndexOpen)}
                className="w-full flex items-center justify-between p-4 font-serif font-bold text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors cursor-pointer"
              >
                <span className="flex items-center space-x-2">
                  <span className="text-primary text-base">📄</span>
                  <span className="text-sm md:text-base">इस लेख में</span>
                </span>
                <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isIndexOpen ? "rotate-90 text-primary" : "text-slate-400"}`} />
              </button>
              
              <AnimatePresence>
                {isIndexOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-slate-200 dark:border-slate-800"
                  >
                    <div className="p-4 bg-slate-50/50 dark:bg-slate-900/10">
                      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-2.5 text-xs md:text-sm pl-0">
                        {headings.map((h, i) => (
                          <li 
                            key={i} 
                            style={{ paddingLeft: `${(h.level - 2) * 12}px` }}
                            className="list-none"
                          >
                            <a 
                              href={`#${h.id}`}
                              onClick={(e) => scrollToHeading(h.id, e)}
                              className="text-slate-600 dark:text-slate-400 hover:text-primary transition-colors block leading-relaxed hover:underline truncate"
                            >
                              ⬢ {h.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Reading body container (Max 850px width for absolute legibility and optimal line length) */}
          <div 
              ref={articleContentRef}
              onMouseUp={handleTextSelection}
              className="prose dark:prose-invert max-w-[850px] mx-auto lg:mx-0 text-slate-800 dark:text-slate-300 font-serif leading-[1.9] text-base md:text-[17px] space-y-6"
            >
              {renderArticleBodyWithAds()}
            </div>

          {/* Ad Slot before Related Articles */}
          {adBeforeRelated && (
            <div className="w-full max-w-[850px] my-8 p-4 bg-slate-50 dark:bg-[#0F172A]/30 border border-slate-200 dark:border-slate-800/80 rounded-2xl flex items-center justify-center relative overflow-hidden select-none">
              {adBeforeRelated.type === "banner" ? (
                <a href={adBeforeRelated.link_url} target="_blank" rel="noopener noreferrer" className="block max-w-full">
                  <img src={adBeforeRelated.image_url} alt="Advertisement" className="mx-auto rounded-lg max-h-36 object-cover" />
                </a>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: adBeforeRelated.code || "" }} />
              )}
            </div>
          )}

          {/* Author Biography Info Card */}
          <div className="bg-white dark:bg-slate-900/10 border border-slate-200 dark:border-slate-800/80 p-6 rounded-3xl flex flex-col sm:flex-row items-center sm:items-start gap-4 mt-12 shadow-sm max-w-[850px]">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xl uppercase shrink-0">
              {article.author?.[0]}
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <ProfilePreviewWrapper userId={article.author}>
                  <Link href={`/authors/${generateAuthorSlug(article.author)}`} className="hover:text-primary transition-colors">
                    <h4 className="font-serif font-bold text-base text-slate-855 dark:text-white leading-none">{article.author}</h4>
                  </Link>
                </ProfilePreviewWrapper>

                <span className="text-[9px] uppercase tracking-wider font-bold bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 rounded-full font-sans mt-1 sm:mt-0">
                  {article.authorRole || "वरिष्ठ लेखक"}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-serif leading-relaxed font-light">
                {article.authorBio || "à¤¯à¥à¤µà¤¾à¤•à¥à¤·à¤° à¤¡à¤¿à¤œà¤¿à¤Ÿà¤² संपादकà¥€à¤¯ मण्डल à¤•à¥‡ à¤ªà¥à¤°à¤®à¥à¤– à¤µà¤¿à¤¶à¥à¤²à¥‡à¤·à¤•à¥¤ à¤°à¤¾à¤·à¥à¤Ÿà¥à¤°à¥€à¤¯ à¤à¤µà¤‚ à¤¸à¤¾à¤®à¤¯à¤¿à¤• विषयà¥‹à¤‚ पर à¤—à¤¹à¤¨ à¤šà¤¿à¤‚à¤¤à¤¨ à¤”à¤° à¤¨à¤¿à¤·à¥à¤ªà¤•à¥à¤· à¤²à¥‡à¤–à¤¨à¥¤"}
              </p>
            </div>
          </div>

          {/* Related Articles Grid (4 cards required) */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-4 max-w-[850px]">
            <h3 className="font-serif text-lg font-bold text-foreground border-l-2 border-primary pl-2">
              à¤¸à¤®à¥à¤¬à¤‚à¤§à¤¿à¤¤ à¤²à¥‡à¤– (Related Stories)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(() => {
                const scoredArticles = articles
                  .filter(a => a.id !== article.id)
                  .map(a => {
                    let score = 0;
                    if (a.category === article.category) score += 10;
                    if (a.author === article.author) score += 5;
                    if (a.tags && article.tags) {
                      const commonTags = a.tags.filter(t => article.tags.includes(t));
                      score += commonTags.length * 3;
                    }
                    if (a.accessLevel === article.accessLevel) score += 2;
                    return { art: a, score };
                  })
                  .sort((x, y) => y.score - x.score)
                  .map(x => x.art)
                  .slice(0, 4);

                return scoredArticles.map((relArt) => (
                  <Link 
                    key={relArt.id} 
                    href={`/editorial?id=${relArt.id}`} 
                    className="flex space-x-3 bg-white dark:bg-slate-900/10 border border-border p-3.5 rounded-2xl hover:shadow-md hover:border-primary/40 transition-all group"
                  >
                    <img 
                      src={relArt.coverImage} 
                      alt={stripMarkdown(relArt.title)} 
                      className="w-16 h-16 object-cover rounded-xl border border-border shrink-0"
                    />
                    <div className="flex flex-col justify-center">
                      <span className="text-[9px] uppercase font-bold text-primary tracking-wider font-sans">{relArt.category}</span>
                      <h4 className="font-serif font-bold text-xs text-foreground group-hover:text-primary transition-colors line-clamp-2 mt-0.5 leading-snug">
                        {stripMarkdown(relArt.title)}
                      </h4>
                    </div>
                  </Link>
                ));
              })()}
            </div>
          </div>

          {/* Article Interactive Quiz Section */}
          <div className="max-w-[850px]">
            <ArticleQuiz articleId={article.id} />
          </div>

          {/* Chaupal Discussion Bridge */}
          <div className="max-w-[850px] py-8 mt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-xl font-black font-hindi text-slate-800 dark:text-white flex items-center justify-center md:justify-start gap-2">
                  <span>ðŸ›ï¸</span> à¤‡à¤¸ à¤²à¥‡à¤– पर à¤šà¥Œà¤ªà¤¾à¤² à¤®à¥‡à¤‚ à¤šà¤°à¥à¤šà¤¾ à¤•à¤°à¥‡à¤‚
                </h3>
                <p className="text-sm font-hindi text-slate-600 dark:text-slate-400 max-w-md leading-relaxed">
                  à¤¯à¥à¤µà¤¾à¤•à¥à¤·à¤° à¤šà¥Œà¤ªà¤¾à¤² पर à¤…à¤¨à¥à¤¯ à¤ªà¤¾à¤ à¤•à¥‹à¤‚, लेखकà¥‹à¤‚ à¤”à¤° à¤¬à¥à¤¦à¥à¤§à¤¿à¤œà¥€à¤µà¤¿à¤¯à¥‹à¤‚ à¤•à¥‡ साथ à¤‡à¤¸ विषय पर à¤…à¤ªà¤¨à¥‡ à¤µà¤¿à¤šà¤¾à¤° à¤¸à¤¾à¤à¤¾ à¤•à¤°à¥‡à¤‚à¥¤
                </p>
              </div>
              <Link 
                href={`/community/discussion?articleId=${article.id}&title=${encodeURIComponent(article.title)}`}
                className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-bold font-hindi px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95"
              >
                <MessageSquare className="w-5 h-5" />
                <span>à¤šà¥Œà¤ªà¤¾à¤² पर à¤œà¤¾à¤à¤‚</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Comments section */}
          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6 max-w-[850px]">
            <h3 className="font-serif text-lg font-bold text-slate-850 dark:text-white border-l-2 border-primary pl-2">
              à¤Ÿà¤¿à¤ªà¥à¤ªà¤£à¥€ विमर्श ({articleComments.length})
            </h3>

            {/* Comment Form (Auth Controlled) */}
            {currentUser ? (
              <form onSubmit={handleCommentSubmit} className="bg-white dark:bg-slate-900/10 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4 text-xs font-serif">
                <div className="flex items-center space-x-3 pb-3 border-b border-slate-200/60 dark:border-slate-800/40">
                  <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs overflow-hidden">
                    {currentUser.avatar_url ? (
                      <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" />
                    ) : (
                      currentUser.name[0]
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 dark:text-white leading-none">{currentUser.name}</p>
                    <p className="text-[9px] text-slate-400 mt-1">{translateRole(currentUser.role)}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-medium">à¤…à¤ªà¤¨à¥€ à¤Ÿà¤¿à¤ªà¥à¤ªà¤£à¥€ à¤²à¤¿à¤–à¥‡à¤‚</label>
                  <textarea 
                    rows={4}
                    placeholder="à¤…à¤ªà¤¨à¥‡ à¤µà¤¿à¤šà¤¾à¤° यहाँ à¤¸à¤¾à¤à¤¾ à¤•à¤°à¥‡à¤‚..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  className="bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  à¤Ÿà¤¿à¤ªà¥à¤ªà¤£à¥€ à¤¸à¤¬मिà¤Ÿ à¤•à¤°à¥‡à¤‚
                </button>
              </form>
            ) : (
              <div className="bg-white dark:bg-slate-900/10 border border-slate-250 dark:border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center gap-4 text-center">
                <Lock className="w-8 h-8 text-primary animate-bounce" />
                <div className="space-y-1">
                  <h4 className="font-serif text-base font-bold text-slate-800 dark:text-white font-hindi">à¤Ÿà¤¿à¤ªà¥à¤ªà¤£à¥€ विमर्श à¤•à¥‡ लिए लॉगिन करें</h4>
                  <p className="text-xs text-slate-505 dark:text-slate-400 font-serif leading-relaxed">
                    à¤µà¥ˆà¤šà¤¾à¤°à¤¿à¤• à¤Ÿà¤¿à¤ªà¥à¤ªà¤£à¥€ विमर्श à¤®à¥‡à¤‚ à¤­à¤¾à¤— à¤²à¥‡à¤¨à¥‡ à¤”à¤° à¤…à¤ªà¤¨à¥‡ à¤µà¤¿à¤šà¤¾à¤° à¤¸à¤¾à¤à¤¾ à¤•à¤°à¤¨à¥‡ à¤•à¥‡ लिए à¤•à¥ƒà¤ªà¤¯à¤¾ à¤ªà¤¹à¤²à¥‡ लॉगिन करेंà¥¤
                  </p>
                </div>
                <button 
                  onClick={() => openAuthModal(undefined, "Please login or create an account to continue.")}
                  className="bg-primary hover:bg-primary/95 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  लॉगिन करें
                </button>
              </div>
            )}

            {/* Nested Comments thread */}
            <div className="space-y-4 pt-2">
              {topLevelComments.map(c => {
                const replies = getRepliesForComment(c.id);
                const commenter = users.find(u => u.name === c.name || u.id === c.user_id);
                return (
                  <div key={c.id} className="space-y-3">
                    {/* Top Level Comment Card */}
                    <div className="p-4 border border-slate-100 dark:border-slate-800/40 bg-white dark:bg-slate-900/10 rounded-2xl space-y-2.5 text-xs font-serif">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase overflow-hidden">
                            {commenter?.avatar_url ? (
                              <img src={commenter.avatar_url} alt={c.name} className="w-full h-full object-cover" />
                            ) : (
                              c.name[0]
                            )}
                          </div>
                          <div>
                            <ProfilePreviewWrapper userId={commenter?.id || c.name}>
                              <Link href={`/authors/${commenter?.slug || generateAuthorSlug(c.name)}`} className="font-serif font-bold text-slate-700 dark:text-slate-350 hover:text-primary transition-colors">
                                {c.name}
                              </Link>
                            </ProfilePreviewWrapper>

                            <span className="text-[8px] uppercase tracking-wider font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-400 px-1.5 py-0.5 rounded-md ml-2 inline-block">
                              {translateRole(commenter?.role || "Subscriber")}
                            </span>
                          </div>
                        </div>
                        <span className="font-mono text-[9px] text-slate-400">{new Date(c.created_at).toLocaleDateString("hi-IN")}</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-450 leading-relaxed font-light pl-9">{c.content}</p>
                      
                      <div className="flex items-center space-x-4 pt-2 text-[10px] text-slate-400 font-mono pl-9">
                        <button className="flex items-center space-x-1 hover:text-primary transition-colors cursor-pointer">
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{c.likes} Likes</span>
                        </button>
                        <button 
                          onClick={() => handleReplyClick(c.id)}
                          className="hover:text-primary transition-colors cursor-pointer"
                        >
                          Reply
                        </button>
                        <button 
                          onClick={async () => {
                            await reportComment(c.id);
                            alert("à¤Ÿà¤¿à¤ªà¥à¤ªà¤£à¥€ à¤°à¤¿à¤ªà¥‹à¤°à¥à¤Ÿ à¤•à¤° द६ à¤—à¤ˆ à¤¹à¥ˆà¥¤ संपादक à¤‡à¤¸à¤•à¥€ à¤¸à¤®à¥€à¤•à¥à¤·à¤¾ à¤•à¤°à¥‡à¤‚à¤—à¥‡à¥¤");
                          }}
                          className="flex items-center space-x-1 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Report</span>
                        </button>
                      </div>
                    </div>

                    {/* Indented Replies block */}
                    {replies.length > 0 && (
                      <div className="pl-8 space-y-2 border-l border-slate-200 dark:border-slate-800 ml-4">
                        {replies.map(rep => {
                          const repCommenter = users.find(u => u.name === rep.name || u.id === rep.user_id);
                          return (
                            <div key={rep.id} className="p-3 bg-white/30 dark:bg-slate-900/5 border border-slate-100 dark:border-slate-800/40 rounded-xl space-y-2 text-xs font-serif">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-[10px] uppercase overflow-hidden">
                                    {repCommenter?.avatar_url ? (
                                      <img src={repCommenter.avatar_url} alt={rep.name} className="w-full h-full object-cover" />
                                    ) : (
                                      rep.name[0]
                                    )}
                                  </div>
                                  <div>
                                    <ProfilePreviewWrapper userId={repCommenter?.id || rep.name}>
                                      <Link href={`/authors/${repCommenter?.slug || generateAuthorSlug(rep.name)}`} className="font-serif font-bold text-slate-700 dark:text-slate-350 hover:text-primary transition-colors">
                                        {rep.name}
                                      </Link>
                                    </ProfilePreviewWrapper>

                                    <span className="text-[7px] uppercase tracking-wider font-bold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-400 px-1.5 py-0.5 rounded ml-1.5 inline-block">
                                      {translateRole(repCommenter?.role || "Subscriber")}
                                    </span>
                                  </div>
                                </div>
                                <span className="font-mono text-[9px] text-slate-400">{new Date(rep.created_at).toLocaleDateString("hi-IN")}</span>
                              </div>
                              <p className="text-slate-600 dark:text-slate-450 leading-relaxed font-light pl-8">{rep.content}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selection Tooltip box */}
          {selectedText && (
            <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-[45] bg-white dark:bg-slate-950 border border-primary/20 rounded-2xl p-4 shadow-2xl flex flex-col space-y-3 max-w-sm w-full text-xs">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                <span className="font-serif font-bold text-primary flex items-center space-x-1">
                  <Highlighter className="w-3.5 h-3.5 animate-pulse" />
                  <span>हाइलाइट चयन</span>
                </span>
                <button onClick={() => setSelectedText("")} className="text-slate-400 hover:text-primary cursor-pointer">
                  <XIcon className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[10px] text-slate-400 italic line-clamp-2">"{selectedText}"</p>

              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  {(["yellow", "blue", "red", "green"] as const).map((col) => (
                    <button
                      key={col}
                      onClick={() => setActiveColor(col)}
                      className={`w-6 h-6 rounded-full transition-transform ${
                        col === "yellow" ? "bg-[#EAB308]" : col === "blue" ? "bg-[#3B82F6]" : col === "red" ? "bg-[#EF4444]" : "bg-[#22C55E]"
                      } ${activeColor === col ? "scale-125 ring-2 ring-primary/45" : "hover:scale-110"}`}
                    />
                  ))}
                </div>
                <span className="text-[9px] text-slate-400 font-mono capitalize">{activeColor}</span>
              </div>

              <input 
                type="text" 
                placeholder="à¤¨à¥‹à¤Ÿ à¤²à¤¿à¤–à¥‡à¤‚ (à¤µà¥ˆà¤•à¤²à¥à¤ªà¤¿à¤•)..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-[10px] focus:outline-none"
              />

              <button 
                onClick={addHighlight}
                className="w-full text-center bg-primary hover:bg-primary/95 text-white py-2 rounded-lg font-bold transition-all cursor-pointer"
              >
                à¤¹à¤¾à¤‡à¤²à¤¾à¤‡à¤Ÿ à¤¸à¥à¤°à¤•à¥à¤·à¤¿à¤¤ à¤•à¤°à¥‡à¤‚
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Revision Notes Deck & Focus timer (Col Span 3) */}
        <aside className="lg:col-span-3 space-y-6">
          {/* Advanced Custom Study Timer */}
          {timerSettings.enabled && (
            <GlassCard glow="gold" className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center space-x-2 text-primary">
                  <Timer className="w-5 h-5 animate-pulse" />
                  <span className="text-[10px] uppercase font-bold tracking-widest font-mono">à¤¸à¥à¤µà¤¾à¤§à¥à¤¯à¤¾à¤¯ à¤Ÿà¤¾à¤‡à¤®à¤°</span>
                </div>
                <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-serif">
                  {isTimerRunning ? "à¤¸à¤•à¥à¤°à¤¿à¤¯" : "विराम"}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
                <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      className="stroke-slate-100 dark:stroke-slate-800"
                      strokeWidth="5"
                      fill="transparent"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      className="stroke-primary transition-all duration-300"
                      strokeWidth="5"
                      fill="transparent"
                      strokeDasharray="251.327"
                      strokeDashoffset={251.327 * (1 - (totalDurationSeconds > 0 ? pomodoroTime / totalDurationSeconds : 0))}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
                    <span className="text-sm font-extrabold font-mono text-primary leading-none">
                      {totalDurationSeconds > 0 ? Math.round((pomodoroTime / totalDurationSeconds) * 100) : 0}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 font-bold">{formatTimer()}</span>
                  </div>
                </div>

                <div className="space-y-2 w-full text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-medium block">समय निर्धारित à¤•à¤°à¥‡à¤‚:</label>
                    <input
                      type="number"
                      placeholder="मिनट"
                      value={customMinutesInput}
                      onChange={(e) => handleSetTime(e.target.value)}
                      disabled={isTimerRunning}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs focus:outline-none focus:border-primary disabled:opacity-50 text-slate-700 dark:text-slate-200 font-mono"
                    />
                    {timerError && (
                      <p className="text-[9px] text-red-500 font-bold leading-none mt-1">{timerError}</p>
                    )}
                  </div>

                  {isTimerRunning && (
                    <div className="flex flex-wrap gap-1 pt-1 justify-center sm:justify-start">
                      {[-5, -1, 1, 5, 10].map(mins => (
                        <button
                          key={mins}
                          onClick={() => adjustTimer(mins)}
                          className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 border border-slate-200 dark:border-slate-800 rounded text-[9px] font-bold text-slate-500 hover:text-primary transition-all cursor-pointer font-mono"
                        >
                          {mins > 0 ? `+${mins}` : mins} मि.
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-4 gap-1.5 pt-1">
                <button
                  onClick={() => setIsTimerRunning(true)}
                  disabled={isTimerRunning || !!timerError || pomodoroTime <= 0}
                  className="bg-primary hover:bg-primary/95 text-white py-2 rounded-lg text-[10px] font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 text-center"
                >
                  प्रारम्भ
                </button>
                <button
                  onClick={() => setIsTimerRunning(false)}
                  disabled={!isTimerRunning}
                  className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50 text-center"
                >
                  विराम
                </button>
                <button
                  onClick={() => setIsTimerRunning(true)}
                  disabled={isTimerRunning || !!timerError}
                  className="border border-primary/30 hover:border-primary bg-primary/5 hover:bg-primary/10 text-primary py-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer disabled:opacity-50 text-center"
                >
                  पुनऒ प्रारम्भ
                </button>
                <button
                  onClick={handleReset}
                  className="border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-primary py-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer text-center"
                >
                  रीसेट
                </button>
              </div>

              {/* Stats Summary */}
              {timerSettings.statistics && (
                <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl space-y-2 text-[10px] font-serif leading-none">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>à¤†à¤œ à¤•à¤¾ à¤…à¤§à¥à¤¯à¤¯à¤¨ समय:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 font-sans">{formatDuration(todayTime)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>à¤‡à¤¸ सप्ताह à¤•à¤¾ à¤…à¤§à¥à¤¯à¤¯à¤¨ समय:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 font-sans">{formatDuration(weeklyTime)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-400">
                    <span>à¤‡à¤¸ माह à¤•à¤¾ à¤…à¤§à¥à¤¯à¤¯à¤¨ समय:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200 font-sans">{formatDuration(monthlyTime)}</span>
                  </div>
                </div>
              )}
            </GlassCard>
          )}

          {/* Highlights & Revision Deck */}
          <GlassCard glow="blue" className="min-h-[350px] flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2 text-primary">
                  <BookMarked className="w-5 h-5" />
                  <h3 className="font-serif text-sm font-bold">à¤¸à¥à¤µà¤¾à¤§à¥à¤¯à¤¾à¤¯ à¤¨à¥‹à¤Ÿ à¤¸à¤‚à¤•à¤²à¤¨</h3>
                </div>
                <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary font-bold px-2 py-0.5 rounded">
                  {highlights.length} Highlights
                </span>
              </div>

              {highlights.length === 0 && (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Highlighter className="w-8 h-8 text-primary/40 mx-auto animate-bounce" />
                  <p className="text-xs">à¤²à¥‡à¤– à¤•à¥‡ à¤µà¤¾à¤•à¥à¤¯à¥‹à¤‚ à¤•à¥‹ à¤®à¤¾à¤‰à¤¸ à¤¸à¥‡ à¤¸à¥‡à¤²à¥‡à¤•à¥à¤Ÿ à¤•à¤° à¤¹à¤¾à¤‡à¤²à¤¾à¤‡à¤Ÿ à¤•à¤°à¥‡à¤‚ à¤”à¤° à¤…à¤ªà¤¨à¥‡ à¤¨à¥‹à¤Ÿà¥à¤¸ à¤¬à¤¨à¤¾à¤à¤‚!</p>
                </div>
              )}

              <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
                {highlights.map(hl => (
                  <div key={hl.id} className={`p-3 rounded-xl border text-[11px] leading-relaxed space-y-2 bg-slate-50/50 dark:bg-slate-900/30 ${highlightColors[hl.color as keyof typeof highlightColors]?.bg || ""}`}>
                    <div className="flex justify-between items-start">
                      <span className="text-[8px] uppercase font-mono font-bold text-slate-400">{hl.color} highlight</span>
                      <button 
                        onClick={() => handleDeleteHighlight(hl.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="italic text-slate-700 dark:text-slate-350 font-light">"{hl.text}"</p>
                    
                    {hl.note && (
                      <div className="border-t border-slate-200 dark:border-slate-700 pt-1.5 mt-1.5">
                        <span className="font-bold text-primary text-[10px]">नोट: </span>
                        <span className="text-slate-550 dark:text-slate-400 font-light">{hl.note}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {highlights.length > 0 && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2 mt-4 text-xs">
                <button 
                  onClick={() => {
                    let text = `YUVAKSHAR NOTES: ${article.title}\n\n`;
                    highlights.forEach((h, idx) => {
                      text += `[${idx+1}] "${h.text}"\nNote: ${h.note || "none"}\n\n`;
                    });
                    const blob = new Blob([text], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = `Yuvakshar_Notes_${article.slug}.txt`;
                    link.click();
                  }}
                  className="w-full text-center bg-primary hover:bg-primary/95 text-white py-2.5 rounded-xl font-bold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>à¤¨à¥‹à¤Ÿà¥à¤¸ à¤¡à¤¾à¤‰à¤¨à¤²à¥‹à¤¡ à¤•à¤°à¥‡à¤‚ (.txt)</span>
                </button>
              </div>
            )}
          </GlassCard>
        </aside>

      </div>

      {/* FLOATING READER ACCESSIBILITY TOOLBAR PANEL */}
      <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] left-4 lg:bottom-auto lg:top-1/3 lg:left-8 z-[40] bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800/80 p-2 rounded-full shadow-2xl flex lg:flex-col gap-3.5 items-center">
        <button
          onClick={() => {
            if (!currentUser) {
              openAuthModal(undefined, "Please login or create an account to continue.");
              return;
            }
            window.dispatchEvent(new CustomEvent("open-ai-sidebar", { detail: { tab: "audio" } }));
          }}
          className="p-2.5 rounded-full text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          title="à¤²à¥‡à¤– à¤¸à¥à¤¨à¥‡à¤‚ (AI Speech)"
        >
          <Volume2 className="w-4.5 h-4.5" />
        </button>

        <button
          onClick={() => setFontSize(prev => prev === "sm" ? "base" : prev === "base" ? "lg" : prev === "lg" ? "xl" : "xl")}
          className="p-2 rounded-full text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          title="Increase Font Size"
        >
          <span className="text-[10px] font-bold font-sans">अ+</span>
        </button>

        <button
          onClick={() => setFontSize(prev => prev === "xl" ? "lg" : prev === "lg" ? "base" : prev === "base" ? "sm" : "sm")}
          className="p-2 rounded-full text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          title="Decrease Font Size"
        >
          <span className="text-[10px] font-bold font-sans">अ-</span>
        </button>

        <button
          onClick={handleBookmarkClick}
          className={`p-2.5 rounded-full transition-all cursor-pointer ${
            isBookmarked
              ? "bg-primary text-white shadow-md"
              : "text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800"
          }`}
          title="Save Article"
        >
          {isBookmarked ? <BookmarkCheck className="w-4.5 h-4.5" /> : <Bookmark className="w-4.5 h-4.5" />}
        </button>
      </div>

      {/* AI Reader Assistant Sidebar */}
      <AiAssistantSidebar articleId={article?.id} />

    </div>
  );
}

export default function EditorialPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1D] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    }>
      <EditorialPageContent />
    </Suspense>
  );
}

// X Icon helper
function XIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}
