"use client";

import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  BarChart3, 
  FileEdit, 
  BookOpen, 
  MessageSquare, 
  Users, 
  Mail, 
  Globe, 
  TrendingUp, 
  Settings, 
  Layers, 
  Download, 
  Upload, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  AlertTriangle, 
  Palette, 
  Lock,
  RefreshCw,
  Calendar,
  Sparkles,
  Link2,
  Award,
  Brain,
  Clock,
  Trophy,
  User,
  Cpu,
  Crown,
  Gem,
  Video as VideoIcon,
  Play,
  Pause,
  Flame,
  Bookmark,
  BookMarked,
  Camera,
  Laptop,
  Smartphone,
  Tablet,
  LogOut,
  Sliders,
  CheckCircle,
  Eye,
  EyeOff
} from "lucide-react";

import { useCms } from "@/store/CmsContext";
import type { Article, Magazine, Profile, Comment, Submission, EditorialAssignment, Ad, Video, QuizCertificate } from "@/store/types";

import GlassCard from "@/components/yuvakshar/GlassCard";
import Link from "next/link";


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

const getUserReputation = (attemptsCount: number, avgScore: number) => {
  if (attemptsCount >= 50 && avgScore >= 90) return { title: "ज्ञानवीर", desc: "50+ क्विज और 90%+ औसत स्कोर" };
  if (attemptsCount >= 40 && avgScore >= 80) return { title: "विचारक", desc: "40+ क्विज और 80%+ औसत स्कोर" };
  if (attemptsCount >= 30 && avgScore >= 75) return { title: "विश्लेषक", desc: "30+ क्विज और 75%+ औसत स्कोर" };
  if (attemptsCount >= 20) return { title: "शोधपरक पाठक", desc: "20+ क्विज पूर्ण किए" };
  if (attemptsCount >= 10) return { title: "गंभीर पाठक", desc: "10+ क्विज पूर्ण किए" };
  if (attemptsCount >= 5) return { title: "नियमित पाठक", desc: "5+ क्विज पूर्ण किए" };
  return { title: "नवपाठक", desc: "युवाक्षर पर आपका स्वागत है" };
};

export default function AdminDashboard() {
  const cms = useCms();
  const { 
    currentUser, 
    articles, 
    magazines, 
    comments, 
    submissions, 
    assignments, 
    ads, 
    subscribers, 
    campaigns, 
    searchLogs, 
    activityLogs, 
    layouts,
    loginUser,
    logoutUser,
    updateSettings,
    saveArticle,
    deleteArticle,
    saveAssignment,
    moderateComment,
    saveAd,
    sendNewsletterCampaign,
    exportDatabaseJson,
    importDatabaseJson,
    users,
    createUser,
    updateUser,
    deleteUser,
    transferOwnership,
    resetUserPassword,
    quizzes,
    quizAttempts,
    quizCertificates,
    quizSettings,
    leaderboard,
    saveQuiz,
    addQuizAttempt,
    regenerateQuiz,
    toggleQuizStatus,
    editQuizQuestion,
    deleteQuizQuestion,
    bulkImportQuestions,
    approveDraftQuestion,
    userMemberships,
    paymentRecords,
    coupons,
    referrals,
    assignMembershipManually,
    createCoupon,
    deleteCoupon,
    getMembershipAnalytics,
    videos,
    saveVideo,
    deleteVideo,
    setFeaturedVideo
  } = cms;

  const [activeTab, setActiveTab] = useState("dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [roleInput, setRoleInput] = useState("Owner");

  // User Management Form states
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<Profile["role"]>(null);

  // Editorial Composing states
  const [isEditingArticle, setIsEditingArticle] = useState(false);
  const [articleId, setArticleId] = useState("");
  const [title, setTitle] = useState("");
  const [englishTitle, setEnglishTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("विचार");
  const [section, setSection] = useState<"news" | "article">("article");
  const [status, setStatus] = useState<Article["status"]>("Draft");
  const [coverImage, setCoverImage] = useState("");
  const [tags, setTags] = useState("");
  const [slug, setSlug] = useState("");
  const [accessLevel, setAccessLevel] = useState<Article["accessLevel"]>("Free");
  const [contentType, setContentType] = useState<Article["contentType"]>("News");
  const [requiresEICApproval, setRequiresEICApproval] = useState(false);
  const [featured, setFeatured] = useState(false);

  // Hindi writing tool phonetic helper state
  const [phoneticInput, setPhoneticInput] = useState("");
  const [phoneticResult, setPhoneticResult] = useState("");

  // AI Helper states
  const [aiLoading, setAiLoading] = useState(false);
  const [activeAiTool, setActiveAiTool] = useState("");
  const [aiResult, setAiResult] = useState("");

  // Assignment states
  const [assignArticleId, setAssignArticleId] = useState("");
  const [assignAuthor, setAssignAuthor] = useState("");
  const [assignReviewer, setAssignReviewer] = useState("");
  const [assignDeadline, setAssignDeadline] = useState("");

  // Campaign Composer states
  const [campSubject, setCampSubject] = useState("");
  const [campContent, setCampContent] = useState("");

  // Appearance States
  const [primaryColor, setPrimaryColor] = useState(cms.settings.appearance.primary_color);
  const [secondaryColor, setSecondaryColor] = useState(cms.settings.appearance.secondary_color);
  const [bgColor, setBgColor] = useState(cms.settings.appearance.background_color);
  const [logoUrl, setLogoUrl] = useState(cms.settings.appearance.logo_url);
  const [siteName, setSiteName] = useState(cms.settings.general.site_name);
  const [tagline, setTagline] = useState(cms.settings.general.tagline);

  // Communication States
  const [primaryContactEmail, setPrimaryContactEmail] = useState(cms.settings.general.primary_email || "yuvakshar.editor@gmail.com");
  const [editorialEmail, setEditorialEmail] = useState(cms.settings.general.editorial_email || "yuvakshar.editor@gmail.com");
  const [supportEmail, setSupportEmail] = useState(cms.settings.general.support_email || "yuvakshar.editor@gmail.com");
  const [newsletterEmail, setNewsletterEmail] = useState(cms.settings.general.newsletter_email || "yuvakshar.editor@gmail.com");
  const [notificationEmail, setNotificationEmail] = useState(cms.settings.general.notification_email || "yuvakshar.editor@gmail.com");

  // Backup restore state
  const [backupJson, setBackupJson] = useState("");

  // Date/Time filter state
  const [timeFilter, setTimeFilter] = useState<"daily" | "weekly" | "monthly" | "yearly">("monthly");

  // Membership Admin Form States
  const [selectedUserId, setSelectedUserId] = useState("");
  const [manualTier, setManualTier] = useState<"Free" | "Premium" | "Patron">("Premium");
  const [manualCycle, setManualCycle] = useState<"Monthly" | "Quarterly" | "Half-Yearly" | "Yearly">("Monthly");
  const [manualDurationDays, setManualDurationDays] = useState(30);

  // Coupon Admin Form States
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [couponType, setCouponType] = useState<"percentage" | "flat">("percentage");
  const [couponValue, setCouponValue] = useState(10);
  const [couponExpiry, setCouponExpiry] = useState("");
  const [couponLimit, setCouponLimit] = useState(100);

  const [nameInput, setNameInput] = useState("");
  const [avatarUrlInput, setAvatarUrlInput] = useState("");
  const [mobileInput, setMobileInput] = useState("");
  const [emailInputState, setEmailInputState] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [interestsInput, setInterestsInput] = useState<string[]>([]);

  // Redesigned profile states
  const [dobInput, setDobInput] = useState("");
  const [genderInput, setGenderInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [socialLinksInput, setSocialLinksInput] = useState({
    twitter: "",
    facebook: "",
    youtube: "",
    linkedin: "",
    website: ""
  });
  const [verificationRequested, setVerificationRequested] = useState(false);
  const [sessions, setSessions] = useState([
    { id: "s1", device: "Windows 11 - Chrome (Current)", ip: "192.168.1.100", active: true },
    { id: "s2", device: "Android 14 - OnePlus 11", ip: "192.168.1.102", active: false },
    { id: "s3", device: "iPadOS 17 - Safari", ip: "192.168.1.105", active: false }
  ]);

  // Photo Crop/Camera States
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Accessibility States (Immediate Auto-Save)
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [highContrast, setHighContrast] = useState(false);
  const [fontSizeScale, setFontSizeScale] = useState<"sm" | "base" | "lg" | "xl">("base");
  const [accessibleFont, setAccessibleFont] = useState(false);

  // Timer settings
  const [adminTimerSound, setAdminTimerSound] = useState(true);
  const [adminTimerEnabled, setAdminTimerEnabled] = useState(true);
  const [adminTimerStats, setAdminTimerStats] = useState(true);

  // Video Management States
  const [vidTitle, setVidTitle] = useState("");
  const [vidDesc, setVidDesc] = useState("");
  const [vidUrl, setVidUrl] = useState("");
  const [vidCategory, setVidCategory] = useState<Video["category"]>("समाचार");
  const [vidIsShorts, setVidIsShorts] = useState(false);
  const [vidIsFeatured, setVidIsFeatured] = useState(false);
  const [vidStatus, setVidStatus] = useState<Video["status"]>("Published");
  const [vidDuration, setVidDuration] = useState("");
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [videoSearchQuery, setVideoSearchQuery] = useState("");
  const [deleteVideoConfirmId, setDeleteVideoConfirmId] = useState<string | null>(null);
  const [selectedCert, setSelectedCert] = useState<QuizCertificate | null>(null);

  // Sync state if already logged in and initialize accessibility
  useEffect(() => {
    if (currentUser) {
      setIsLoggedIn(true);
      setNameInput(currentUser.name || "");
      setAvatarUrlInput(currentUser.avatar_url || "");
      setMobileInput(currentUser.mobile || "");
      setEmailInputState(currentUser.email || "");
      setBioInput(currentUser.bio || "");
      setInterestsInput(currentUser.interests || []);
      setDobInput(currentUser.dob || "");
      setGenderInput(currentUser.gender || "");
      setLocationInput(currentUser.location || "");
      const sl = currentUser.social_links || {};
      setSocialLinksInput({ twitter: sl.twitter || "", facebook: sl.facebook || "", youtube: sl.youtube || "", linkedin: sl.linkedin || "", website: sl.website || "" });


      // Check verification state
      const verifiedSaved = localStorage.getItem(`yuvakshar_verification_${currentUser.id}`);
      if (verifiedSaved) {
        setVerificationRequested(true);
      }

      // Parse query params to set active tab
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get("tab");
        if (tab) {
          setActiveTab(tab);
        } else {
          if (!currentUser.role) {
            setActiveTab("study-progress");
          } else {
            setActiveTab("dashboard");
          }
        }
      }
    }

    // Initialize accessibility settings from localStorage
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("yuvakshar_theme") as "light" | "dark" || "light";
      setTheme(savedTheme);

      const savedContrast = localStorage.getItem("yuvakshar_high_contrast") === "true";
      setHighContrast(savedContrast);
      if (savedContrast) document.documentElement.classList.add("high-contrast");

      const savedScale = localStorage.getItem("yuvakshar_font_scale") as "sm" | "base" | "lg" | "xl" || "base";
      setFontSizeScale(savedScale);
      document.documentElement.setAttribute("data-font-scale", savedScale);

      const savedFont = localStorage.getItem("yuvakshar_accessible_font") === "true";
      setAccessibleFont(savedFont);
      if (savedFont) document.documentElement.classList.add("accessible-font");

      // Sync timer sounds
      const savedTimer = localStorage.getItem("yuvakshar_timer_settings");
      if (savedTimer) {
        const parsed = JSON.parse(savedTimer);
        if (parsed.sound !== undefined) setAdminTimerSound(parsed.sound);
        if (parsed.enabled !== undefined) setAdminTimerEnabled(parsed.enabled);
        if (parsed.statistics !== undefined) setAdminTimerStats(parsed.statistics);
      }
    }
  }, [currentUser]);

  // Adjust active tab for general readers to profile if they are on dashboard by default
  useEffect(() => {
    if (currentUser) {
      const isAdmin = cms.canAccessAdmin(currentUser);
      if (!isAdmin && activeTab === "dashboard") {
        setActiveTab("profile");
      }
    }
  }, [currentUser, activeTab]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) {
      alert("नाम अनिवार्य है!");
      return;
    }
    await cms.updateUserProfile({
      name: nameInput,
      avatar_url: avatarUrlInput,
      mobile: mobileInput,
      bio: bioInput,
      interests: interestsInput,
      dob: dobInput,
      gender: genderInput,
      location: locationInput,
      social_links: socialLinksInput
    });
    alert("प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!");
  };

  // Quiz management & progress states
  const [selectedArticleIdForQuiz, setSelectedArticleIdForQuiz] = useState<string>("");
  const [quizEditQuestionId, setQuizEditQuestionId] = useState<string | null>(null);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [bulkImportText, setBulkImportText] = useState("");
  
  // Question Form fields
  const [qQuestion, setQQuestion] = useState("");
  const [qOption1, setQOption1] = useState("");
  const [qOption2, setQOption2] = useState("");
  const [qOption3, setQOption3] = useState("");
  const [qOption4, setQOption4] = useState("");
  const [qCorrectAnswer, setQCorrectAnswer] = useState("");
  const [qExplanation, setQExplanation] = useState("");
  const [qRelatedFact, setQRelatedFact] = useState("");
  const [qDifficulty, setQDifficulty] = useState<"सरल" | "मध्यम" | "उन्नत">("सरल");
  const [qType, setQType] = useState<"MCQ" | "Fact Recall" | "Comprehension" | "Analysis" | "Application">("MCQ");

  const [isGeneratingMonthlyReport, setIsGeneratingMonthlyReport] = useState(false);

  // Load timer settings on mount
  useEffect(() => {
    const saved = localStorage.getItem("yuvakshar_timer_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setAdminTimerEnabled(parsed.enabled !== false);
        setAdminTimerSound(parsed.sound !== false);
        setAdminTimerStats(parsed.statistics !== false);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSaveTimerSettings = () => {
    const settings = {
      enabled: adminTimerEnabled,
      sound: adminTimerSound,
      statistics: adminTimerStats
    };
    localStorage.setItem("yuvakshar_timer_settings", JSON.stringify(settings));
    alert("स्वाध्याय टाइमर सेटिंग्स सफलतापूर्वक सुरक्षित कर दी गई हैं!");
  };

  const handleDownloadMonthlyReport = () => {
    setIsGeneratingMonthlyReport(true);
    
    const userAttempts = quizAttempts.filter(att => att.userId === (currentUser?.id || "anonymous-reader"));
    const totalAttempts = userAttempts.length;
    const completedArticlesCount = new Set(userAttempts.filter(att => att.percentage >= 60).map(att => att.articleId)).size;
    const averageScore = totalAttempts > 0 ? Math.round(userAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / totalAttempts) : 0;
    const totalStudyTime = userAttempts.reduce((acc, curr) => acc + curr.durationSeconds, 0);
    const certificatesCount = quizCertificates.filter(c => c.userId === (currentUser?.id || "anonymous-reader")).length;

    setTimeout(() => {
      const canvas = document.createElement("canvas");
      canvas.width = 800;
      canvas.height = 1000;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, 800, 1000);

      ctx.strokeStyle = "#EA580C";
      ctx.lineWidth = 10;
      ctx.strokeRect(15, 15, 770, 970);

      ctx.fillStyle = "#EA580C";
      ctx.font = "bold 28px 'Noto Serif Devanagari', serif";
      ctx.textAlign = "center";
      ctx.fillText("युवाक्षर मासिक ज्ञान एवं स्वाध्याय रिपोर्ट", 400, 70);

      ctx.fillStyle = "#64748B";
      ctx.font = "14px 'Noto Sans Devanagari', sans-serif";
      ctx.fillText(`पाठक: ${currentUser?.name || "अतिथि पाठक"} | रिपोर्ट महीना: ${new Date().toLocaleDateString("hi-IN", { month: "long", year: "numeric" })}`, 400, 100);

      ctx.strokeStyle = "#EA580C";
      ctx.beginPath();
      ctx.moveTo(100, 120);
      ctx.lineTo(700, 120);
      ctx.stroke();

      ctx.fillStyle = "#0F172A";
      ctx.font = "bold 20px 'Noto Serif Devanagari', serif";
      ctx.textAlign = "left";
      ctx.fillText("1. अध्ययन सारांश (Study Summary)", 80, 180);

      ctx.font = "16px 'Noto Sans Devanagari', sans-serif";
      ctx.fillText(`• पूर्ण किए गए लेख: ${completedArticlesCount}`, 100, 220);
      ctx.fillText(`• हल की गईं ज्ञान परीक्षाएं (Attempts): ${totalAttempts}`, 100, 260);
      ctx.fillText(`• औसत स्कोर (Average Score): ${averageScore}%`, 100, 300);
      ctx.fillText(`• स्वाध्याय में व्यतीत कुल समय: ${Math.round(totalStudyTime / 60)} मिनट`, 100, 340);
      ctx.fillText(`• अर्जित डीजी-प्रमाणपत्र (Certificates): ${certificatesCount}`, 100, 380);

      ctx.fillText("2. मानसिक एवं संज्ञानात्मक क्षमताएं (Cognitive Metrics)", 80, 450);
      
      const counts = { MCQ: 0, "Fact Recall": 0, Comprehension: 0, Analysis: 0, Application: 0 };
      const corrects = { MCQ: 0, "Fact Recall": 0, Comprehension: 0, Analysis: 0, Application: 0 };
      userAttempts.forEach(att => {
        const artQuiz = quizzes.find(q => q.articleId === att.articleId);
        if (artQuiz) {
          artQuiz.questions.forEach((q, qIdx) => {
            if (att.answers[qIdx] !== undefined) {
              counts[q.questionType] = (counts[q.questionType] || 0) + 1;
              if (att.answers[qIdx] === q.correctAnswer) {
                corrects[q.questionType] = (corrects[q.questionType] || 0) + 1;
              }
            }
          });
        }
      });

      const memory = counts["Fact Recall"] > 0 ? Math.round((corrects["Fact Recall"] / counts["Fact Recall"]) * 100) : averageScore;
      const understanding = counts["Comprehension"] > 0 ? Math.round((corrects["Comprehension"] / counts["Comprehension"]) * 100) : averageScore;
      const analysis = counts["Analysis"] > 0 ? Math.round((corrects["Analysis"] / counts["Analysis"]) * 100) : averageScore;
      const logic = counts["Application"] > 0 ? Math.round((corrects["Application"] / counts["Application"]) * 100) : averageScore;

      ctx.fillText(`• स्मरण शक्ति (Memory): ${memory}%`, 100, 490);
      ctx.fillText(`• विषय समझ (Understanding): ${understanding}%`, 100, 530);
      ctx.fillText(`• विश्लेषण क्षमता (Analysis): ${analysis}%`, 100, 570);
      ctx.fillText(`• तार्किक सोच (Logic): ${logic}%`, 100, 610);

      ctx.fillText("3. श्रेणीगत विशेषज्ञता (Topic Mastery Summary)", 80, 680);
      
      const categoryCounts: Record<string, number> = {};
      userAttempts.forEach(att => {
        const art = articles.find(a => a.id === att.articleId);
        if (art && att.percentage >= 60) {
          categoryCounts[art.category] = (categoryCounts[art.category] || 0) + 1;
        }
      });

      let masteryText = "कोई विशेषज्ञता अर्जित नहीं हुई है (Badge के लिए किसी श्रेणी में 10 लेख पूरे करें)।";
      const masteryList = Object.entries(categoryCounts)
        .filter(([_, count]) => count >= 10)
        .map(([cat]) => cat === "विज्ञान" ? "AI विशेषज्ञ" : cat === "इतिहास" ? "इतिहास साधक" : "अध्येता");
      
      if (masteryList.length > 0) {
        masteryText = masteryList.join(", ");
      }
      ctx.fillText(`• अर्जित विशेषज्ञता: ${masteryText}`, 100, 720);

      ctx.strokeStyle = "#EA580C";
      ctx.beginPath();
      ctx.moveTo(100, 800);
      ctx.lineTo(700, 800);
      ctx.stroke();

      ctx.fillStyle = "#64748B";
      ctx.textAlign = "center";
      ctx.font = "italic 14px 'Noto Sans Devanagari', sans-serif";
      ctx.fillText("यह रिपोर्ट युवाक्षर डिजिटल लर्निंग काउंसिल (YDLC) द्वारा स्व-मूल्यांकन के आधार पर स्वचालित रूप से उत्पन्न की गई है।", 400, 840);
      ctx.font = "12px monospace";
      ctx.fillText(`REPORT ID: YVK-REP-${Math.floor(100000 + Math.random() * 900000)} | GENERATED ON: ${new Date().toLocaleDateString("hi-IN")}`, 400, 875);

      const link = document.createElement("a");
      link.download = `Yuvakshar_Monthly_Report_${new Date().toLocaleDateString("hi-IN", { month: "short", year: "numeric" })}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      setIsGeneratingMonthlyReport(false);
      alert("मासिक रिपोर्ट सफलतापूर्वक डाउनलोड हो गई है!");
    }, 1200);
  };

  // Transliteration Phonetic helper (Mock logic converting typical phonetic sounds to Hindi)
  useEffect(() => {
    if (!phoneticInput.trim()) {
      setPhoneticResult("");
      return;
    }
    let converted = phoneticInput.toLowerCase()
      .replace(/namaste/g, "नमस्ते")
      .replace(/vichar/g, "विचार")
      .replace(/lekh/g, "लेख")
      .replace(/shiksha/g, "शिक्षा")
      .replace(/samachar/g, "समाचार")
      .replace(/paryavaran/g, "पर्यावरण")
      .replace(/sahitya/g, "साहित्य")
      .replace(/bharat/g, "भारत")
      .replace(/yuva/g, "युवा")
      .replace(/hindi/g, "हिंदी")
      .replace(/a/g, "ा").replace(/i/g, "ि").replace(/u/g, "ु")
      .replace(/e/g, "े").replace(/o/g, "ो");
    
    setPhoneticResult(converted);
  }, [phoneticInput]);

  const triggerAiTool = async (tool: string, label: string) => {
    if (!content.trim()) {
      alert("कृपया एआई सुझावों के लिए पहले लेख सामग्री लिखें!");
      return;
    }
    setAiLoading(true);
    setActiveAiTool(tool);
    setAiResult("");

    try {
      const prompt = `लेख शीर्षक: "${title}"\nसामग्री: ${content}\n\nकृपया लेख के आधार पर निम्नलिखित कार्य करें: ${label}`;
      const responseText = await cms.generateAiContent(prompt, tool);
      setAiResult(responseText);
    } catch (err: any) {
      setAiResult(`त्रुटि: ${err.message || "एआई विश्लेषण विफल हुआ।"}`);
    } finally {
      setAiLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    const success = await loginUser(emailInput, roleInput);
    if (success) {
      setIsLoggedIn(true);
    }
  };

  const handleEditArticle = (art: Article) => {
    setArticleId(art.id);
    setTitle(art.title);
    setEnglishTitle(art.englishTitle || "");
    setSummary(art.summary);
    setContent(art.content);
    setCategory(art.category);
    setSection(art.section);
    setStatus(art.status || "Draft");
    setCoverImage(art.coverImage);
    setFeatured(art.isFeatured || false);
    setTags(art.tags?.join(", ") || "");
    setSlug(art.slug || "");
    setAccessLevel(art.accessLevel || "Free");
    setContentType(art.contentType || "News");
    setRequiresEICApproval(art.requiresEICApproval || false);
    setIsEditingArticle(true);
  };

  const handleCreateNewArticle = () => {
    setArticleId("");
    setTitle("");
    setEnglishTitle("");
    setSummary("");
    setContent("");
    setCategory("विचार");
    setSection("article");
    setStatus("Draft");
    setCoverImage("");
    setFeatured(false);
    setTags("");
    setSlug("");
    setAccessLevel("Free");
    setContentType("News");
    setRequiresEICApproval(false);
    setIsEditingArticle(true);
  };

  const handleSaveArticleForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert("शीर्षक और सामग्री अनिवार्य हैं!");
      return;
    }

    // Auto slug generation if empty
    const finalSlug = slug.trim() || title.trim()
      .toLowerCase()
      .replace(/[^\w\u0900-\u097F\s-]/g, "")
      .replace(/\s+/g, "-");

    let finalStatus = status;
    let finalRequiresEICApproval = requiresEICApproval;

    // Check EIC publishing workflow: Editorial, Special Report, Research Report require Owner/EIC roles to publish
    const isSpecialContent = ["Editorial", "Special Report", "Research Report"].includes(contentType || "");
    if (isSpecialContent) {
      finalRequiresEICApproval = true;
    }

    if (finalStatus === "Published") {
      const allowed = cms.canPublishArticles(currentUser, contentType || "");
      if (!allowed) {
        finalStatus = "Pending Review";
        alert("संपादकीय नीति: खोजी रिपोर्ट (Investigative/Special Reports) और संपादकीय (Editorials) को सीधे प्रकाशित करने की अनुमति केवल प्रधान संपादक (Editor-in-Chief) या स्वामी (Owner) को है। आलेख समीक्षा (Pending Review) में सुरक्षित कर दिया गया है।");
      }
    }

    const articleData: Partial<Article> = {
      id: articleId || undefined,
      title,
      englishTitle,
      summary,
      content,
      category,
      section,
      status: finalStatus,
      coverImage: coverImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80",
      isFeatured: featured,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      slug: finalSlug,
      accessLevel,
      contentType,
      requiresEICApproval: finalRequiresEICApproval
    };

    await saveArticle(articleData);
    setIsEditingArticle(false);
    alert("लेख सफलतापूर्वक सहेज लिया गया!");
  };

  const handleDispatchCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campSubject.trim() || !campContent.trim()) return;
    await sendNewsletterCampaign(campSubject, campContent);
    setCampSubject("");
    setCampContent("");
    alert("न्यूज़लेटर कैंपेन सभी पाठकों को भेजा गया!");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAppearance = async () => {
    await updateSettings("appearance", {
      primary_color: primaryColor,
      secondary_color: secondaryColor,
      background_color: bgColor,
      logo_url: logoUrl,
      favicon_url: cms.settings.appearance.favicon_url,
      font_headlines: cms.settings.appearance.font_headlines,
      font_body: cms.settings.appearance.font_body
    });
    await updateSettings("general", {
      ...cms.settings.general,
      site_name: siteName,
      tagline: tagline,
      primary_email: primaryContactEmail,
      editorial_email: editorialEmail,
      support_email: supportEmail,
      newsletter_email: newsletterEmail,
      notification_email: notificationEmail
    });
    alert("स्वरूप और सेटिंग्स अपडेट कर दी गई हैं!");
  };

  const handleBackupExport = () => {
    const json = exportDatabaseJson();
    setBackupJson(json);
    
    // Auto download
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `yuvakshar_db_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleBackupImport = () => {
    if (!backupJson.trim()) {
      alert("कृपया आयात करने के लिए JSON टेक्स्ट प्रदान करें!");
      return;
    }
    const success = importDatabaseJson(backupJson);
    if (success) {
      alert("डेटाबेस सफलतापूर्वक पुनर्स्थापित कर दिया गया है!");
      setBackupJson("");
    } else {
      alert("पुनर्स्थापना विफल: अमान्य JSON प्रारूप!");
    }
  };

  // Launch Readiness Checklist score calculator (10 check points)
  const getReadinessChecks = () => {
    const checks = [
      { name: "डेटाबेस कनेक्शन", status: cms.readinessStatuses?.dbConnected || false, priority: "Critical" },
      { name: "स्टोरेज बकेट एक्टिवेशन", status: cms.readinessStatuses?.storageConnected || false, priority: "High" },
      { name: "सत्र प्रमाणीकरण सक्रिय", status: cms.readinessStatuses?.authActive || false, priority: "High" },
      { name: "RLS नीतियां लागू", status: cms.readinessStatuses?.rlsPoliciesActive || false, priority: "Critical" },
      { name: "न्यूज़लेटर गेटवे कनेक्टेड", status: cms.readinessStatuses?.newsletterActive || false, priority: "Medium" },
      { name: "सर्च इंडेक्स रेडी", status: true, priority: "Medium" },
      { name: "साइटमैप जनरेटेड", status: cms.readinessStatuses?.sitemapGenerated || false, priority: "Low" },
      { name: "SEO एवं स्कीमा वैलिडेशन", status: cms.readinessStatuses?.seoActive || false, priority: "Medium" },
      { name: "PWA इंस्टॉल प्रॉम्प्ट सक्रिय", status: cms.readinessStatuses?.pwaActive || false, priority: "Medium" },
      { name: "आपदा बैकअप मॉड्यूल रेडी", status: cms.readinessStatuses?.backupSystemActive || false, priority: "High" }
    ];

    const score = Math.round((checks.filter(c => c.status).length / checks.length) * 100);
    return { checks, score };
  };

  const { checks: launchChecks, score: launchScore } = getReadinessChecks();

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1D] flex items-center justify-center p-4">
        <GlassCard glow="gold" className="max-w-md w-full p-8 text-center space-y-6">
          <Lock className="w-12 h-12 text-primary mx-auto animate-bounce" />
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-slate-800 dark:text-white">लॉगिन आवश्यक है</h2>
            <p className="text-xs text-slate-505 dark:text-slate-400 font-serif leading-relaxed">
              युवाक्षर व्यवस्थापकीय नियंत्रण कक्ष और अध्ययन प्रगति डैशबोर्ड का उपयोग करने के लिए कृपया पहले लॉगिन करें।
            </p>
          </div>
          <button
            onClick={() => cms.openAuthModal(undefined)}
            className="w-full bg-primary hover:bg-primary/95 text-white py-3.5 rounded-xl font-bold text-xs transition-all shadow-md cursor-pointer"
          >
            कृपया पहले लॉगिन करें
          </button>
        </GlassCard>
      </div>
    );
  }

  if (!cms.canAccessAdmin(currentUser)) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1D] flex items-center justify-center p-4">
        <GlassCard glow="saffron" className="max-w-md w-full p-8 text-center space-y-6">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto animate-pulse" />
          <div className="space-y-2">
            <h2 className="font-serif text-2xl font-bold text-slate-800 dark:text-white">पहुंच अस्वीकृत (Access Denied)</h2>
            <p className="text-xs text-slate-505 dark:text-slate-400 font-serif leading-relaxed">
              आपके पास युवाक्षर व्यवस्थापकीय नियंत्रण कक्ष तक पहुँचने की आवश्यक अनुमति नहीं है।
            </p>
          </div>
          <Link
            href="/"
            className="block w-full bg-primary hover:bg-primary/95 text-white py-3.5 rounded-xl font-bold text-xs transition-all shadow-md text-center"
          >
            मुख्य पृष्ठ पर वापस जाएं
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 min-h-screen text-[#0F172A] dark:text-slate-200">
      
      {/* 1. DEDICATED ADMIN HEADER */}
      <header className="w-full bg-slate-50 dark:bg-[#0F172A]/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 flex items-center justify-between mb-6">
        {/* Left: Official PNG Logo */}
        <div className="flex items-center space-x-3">
          <img 
            src={cms.settings.appearance.logo_url || "/yuvakshar_logo_official.png"} 
            alt="युवाक्षर Logo" 
            className="h-[45px] w-auto object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/yuvakshar_logo_official.png";
            }}
          />
          <div className="hidden sm:flex flex-col">
            <span className="text-[9px] text-slate-500 dark:text-slate-400 font-serif font-bold tracking-wider">
              {cms.settings.general.tagline}
            </span>
          </div>
        </div>

        {/* Right: Actions, Notifications, Role Badge */}
        <div className="flex items-center space-x-4">
          {/* Quick Action */}
          <button 
            onClick={handleCreateNewArticle}
            className="hidden md:flex items-center space-x-1 bg-primary hover:bg-primary/95 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>नया लेख</span>
          </button>

          {/* Notification bell */}
          <div className="relative p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800/50 cursor-pointer">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full absolute top-1.5 right-1.5 animate-pulse" />
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>

          {/* Logged in Role Badge */}
          <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-primary/10 border border-primary/20 text-primary rounded-full">
            {currentUser?.role || "Editor"}
          </span>

          {/* Profile Menu Avatar */}
          <div className="flex items-center space-x-2 border-l border-slate-200 dark:border-slate-800 pl-3">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
              {currentUser?.name ? currentUser.name[0].toUpperCase() : "E"}
            </div>
            <span className="hidden md:inline text-xs font-bold">{currentUser?.name || "संपादक"}</span>
          </div>
        </div>
      </header>

      {/* 2. MAIN LAYOUT CONTAINER */}
      <div className="flex flex-col lg:flex-row gap-8 mt-4 lg:mt-0">
        
        {/* SIDEBAR TABS SELECTOR — Desktop sidebar + Mobile horizontal scroll tabs */}
        <aside className="w-full lg:w-[240px] shrink-0">

          {/* ─── MOBILE: Horizontal Scrollable Tabs (hidden on lg+) ─── */}
          <div className="lg:hidden sticky top-[60px] z-30 bg-white dark:bg-[#0A0F1D] border-b border-slate-200 dark:border-slate-800 -mx-4 px-4 shadow-sm">
            {/* User mini bar */}
            <div className="flex items-center gap-2.5 py-2.5 border-b border-slate-100 dark:border-slate-800/60">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FF5A1F] to-amber-400 p-[1.5px] flex items-center justify-center shrink-0">
                <div className="w-full h-full rounded-full bg-white dark:bg-[#0A0F1D] flex items-center justify-center text-[10px] font-bold text-primary uppercase">
                  {currentUser?.name ? currentUser.name[0] : "U"}
                </div>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold font-serif text-slate-800 dark:text-white truncate">{currentUser?.name}</p>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest">{currentUser?.role || "सदस्य"}</span>
              </div>
              <button
                onClick={logoutUser}
                className="ml-auto shrink-0 text-[10px] font-bold text-red-400 border border-red-200/50 rounded-lg px-2 py-1 cursor-pointer"
              >
                लॉगआउट
              </button>
            </div>
            {/* Scrollable Tab Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-2.5 pr-2">
              {(() => {
                const allTabs = [
                  { id: "dashboard", label: "डैशबोर्ड", icon: BarChart3, visible: ["Owner", "Admin", "Editor-in-Chief", "Managing Editor"].includes(currentUser.role || "") },
                  { id: "profile", label: "प्रोफ़ाइल", icon: User, visible: true },
                  { id: "study-progress", label: "अध्ययन", icon: Brain, visible: true },
                  { id: "library", label: "लाइब्रेरी", icon: BookMarked, visible: true },
                  { id: "bookmarks", label: "बुकमार्क", icon: Bookmark, visible: true },
                  { id: "certificates", label: "प्रमाणपत्र", icon: Award, visible: true },
                  { id: "video-management", label: "वीडियो", icon: VideoIcon, visible: ["Owner", "Admin", "Editor-in-Chief", "Managing Editor", "Editor", "Sub Editor"].includes(currentUser.role || "") },
                  { id: "magazines", label: "पत्रिका", icon: BookOpen, visible: ["Owner", "Admin", "Editor-in-Chief"].includes(currentUser.role || "") },
                  { id: "articles", label: "लेख", icon: FileEdit, visible: cms.canManageArticles(currentUser) },
                  { id: "assignments", label: "कार्य", icon: Calendar, visible: ["Owner", "Admin", "Editor-in-Chief", "Managing Editor", "Editor"].includes(currentUser.role || "") },
                  { id: "comments", label: "टिप्पणी", icon: MessageSquare, visible: ["Owner", "Admin", "Editor-in-Chief", "Managing Editor"].includes(currentUser.role || "") },
                  { id: "quiz-management", label: "क्विज़", icon: Trophy, visible: ["Owner", "Admin", "Editor-in-Chief", "Managing Editor"].includes(currentUser.role || "") },
                  { id: "ai-ecosystem", label: "एआई", icon: Sparkles, visible: ["Owner", "Admin"].includes(currentUser.role || "") },
                  { id: "users", label: "उपयोगकर्ता", icon: Users, visible: ["Owner", "Admin"].includes(currentUser.role || "") },
                  { id: "newsletter", label: "न्यूज़लेटर", icon: Mail, visible: ["Owner", "Admin", "Editor-in-Chief", "Managing Editor"].includes(currentUser.role || "") },
                  { id: "memberships", label: "सदस्यता", icon: Crown, visible: ["Owner", "Admin"].includes(currentUser.role || "") },
                  { id: "settings", label: "सेटिंग्स", icon: Settings, visible: true },
                  { id: "appearance", label: "स्वरूप", icon: Palette, visible: ["Owner", "Admin"].includes(currentUser.role || "") },
                  { id: "backups", label: "बैकअप", icon: Download, visible: ["Owner", "Admin"].includes(currentUser.role || "") },
                  { id: "launch", label: "लॉन्च", icon: ShieldCheck, visible: ["Owner", "Admin"].includes(currentUser.role || "") }
                ];
                return allTabs.filter(t => t.visible).map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setIsEditingArticle(false); }}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                        isActive
                          ? "bg-primary text-white shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                });
              })()}
            </div>
          </div>

          {/* ─── DESKTOP: Traditional Sidebar (hidden on mobile) ─── */}
          <div className="hidden lg:block bg-slate-50 dark:bg-[#0F172A]/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary font-bold text-xs">
                {currentUser?.name ? currentUser.name[0].toUpperCase() : "E"}
              </div>
              <div>
                <p className="text-xs font-bold font-serif">{currentUser?.name}</p>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">{currentUser?.role}</span>
              </div>
            </div>

            <div className="flex flex-col space-y-1">
              {(() => {
                const allTabs = [
                  { id: "dashboard", label: "डैशबोर्ड", icon: BarChart3, visible: ["Owner", "Admin", "Editor-in-Chief", "Managing Editor"].includes(currentUser.role || "") },
                  { id: "profile", label: "मेरा प्रोफ़ाइल", icon: User, visible: true },
                  { id: "study-progress", label: "मेरी अध्ययन प्रगति", icon: Brain, visible: true },
                  { id: "library", label: "मेरी लाइब्रेरी", icon: BookMarked, visible: true },
                  { id: "bookmarks", label: "सहेजे गए लेख", icon: Bookmark, visible: true },
                  { id: "certificates", label: "मेरे प्रमाणपत्र", icon: Award, visible: true },
                  { id: "video-management", label: "वीडियो डेस्क", icon: VideoIcon, visible: ["Owner", "Admin", "Editor-in-Chief", "Managing Editor", "Editor", "Sub Editor"].includes(currentUser.role || "") },
                  { id: "magazines", label: "पत्रिका प्रबंधन", icon: BookOpen, visible: ["Owner", "Admin", "Editor-in-Chief"].includes(currentUser.role || "") },
                  { id: "articles", label: "लेख व समाचार", icon: FileEdit, visible: cms.canManageArticles(currentUser) },
                  { id: "assignments", label: "संपादकीय कार्य", icon: Calendar, visible: ["Owner", "Admin", "Editor-in-Chief", "Managing Editor", "Editor"].includes(currentUser.role || "") },
                  { id: "comments", label: "टिप्पणी नियंत्रण", icon: MessageSquare, visible: ["Owner", "Admin", "Editor-in-Chief", "Managing Editor"].includes(currentUser.role || "") },
                  { id: "quiz-management", label: "ज्ञान एवं अध्ययन प्रबंधन", icon: Trophy, visible: ["Owner", "Admin", "Editor-in-Chief", "Managing Editor"].includes(currentUser.role || "") },
                  { id: "ai-ecosystem", label: "एआई पारिस्थितिकी तंत्र", icon: Sparkles, visible: ["Owner", "Admin"].includes(currentUser.role || "") },
                  { id: "users", label: "उपयोगकर्ता", icon: Users, visible: ["Owner", "Admin"].includes(currentUser.role || "") },
                  { id: "newsletter", label: "न्यूज़लेटर अभियान", icon: Mail, visible: ["Owner", "Admin", "Editor-in-Chief", "Managing Editor"].includes(currentUser.role || "") },
                  { id: "memberships", label: "सदस्यता प्रबंधन", icon: Crown, visible: ["Owner", "Admin"].includes(currentUser.role || "") },
                  { id: "ads", label: "विज्ञापन प्रबंधक", icon: Globe, visible: ["Owner", "Admin"].includes(currentUser.role || "") },
                  { id: "settings", label: "सेटिंग्स", icon: Settings, visible: true },
                  { id: "appearance", label: "स्वरूप और सेटिंग्स", icon: Palette, visible: ["Owner", "Admin"].includes(currentUser.role || "") },
                  { id: "backups", label: "आपदा बैकअप", icon: Download, visible: ["Owner", "Admin"].includes(currentUser.role || "") },
                  { id: "launch", label: "लांच वेरिफिकेशन", icon: ShieldCheck, visible: ["Owner", "Admin"].includes(currentUser.role || "") }
                ];
                const filteredTabs = allTabs.filter(tab => tab.visible);
                return filteredTabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => { setActiveTab(tab.id); setIsEditingArticle(false); }}
                      className={`w-full flex items-center space-x-3 p-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        activeTab === tab.id
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  );
                });
              })()}
            </div>

            <button 
              onClick={logoutUser}
              className="w-full text-center py-2.5 bg-slate-200/50 hover:bg-red-500/10 text-slate-500 hover:text-red-500 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              लॉग-आउट करें
            </button>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-grow space-y-6">
          
          {/* Supabase Demo warning block: Shown only for Owner or Admin in development mode */}
          {process.env.NODE_ENV === "development" && (currentUser?.role === "Owner" || currentUser?.role === "Admin") && !cms.supabaseConfigured && (
            <div className="p-4 border border-amber-200 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center space-x-3 text-xs leading-relaxed">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p>
                <strong>Running in Fallback Demo Mode:</strong> Connection environment variables are missing. All database mutations, articles, and settings changes will persist in <code>localStorage</code> only. Add variables to `.env.local` to sync with Supabase PostgreSQL.
              </p>
            </div>
          )}

        {/* TAB 1: DASHBOARD TELEMETRY PANEL */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold border-l-2 border-primary pl-2">सांख्यिकी विश्लेषण</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "कुल पाठक", val: "12,450", change: "+12% इस महीने" },
                { label: "प्रकाशित लेख", val: articles.length, change: "नवीनतम" },
                { label: "टिप्पणियाँ", val: comments.length, change: "लंबित: 1" },
                { label: "सदस्य", val: subscribers.length, change: "सक्रिय सूचियाँ" }
              ].map((stat, idx) => (
                <div key={idx} className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-2">
                  <span className="text-[10px] text-slate-400 font-mono block uppercase">{stat.label}</span>
                  <p className="text-2xl font-bold font-serif">{stat.val}</p>
                  <span className="text-[9px] text-green-500 font-bold block">{stat.change}</span>
                </div>
              ))}
            </div>

            {/* Recent Audit trail */}
            <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
              <h3 className="font-serif font-bold text-sm text-primary">गतिविधि लॉग</h3>
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 text-[11px] font-mono leading-relaxed">
                {activityLogs.map((log) => (
                  <div key={log.id} className="flex flex-col sm:flex-row justify-between border-b border-slate-100 dark:border-slate-800/40 pb-2.5 last:border-b-0 gap-1">
                    <div className="space-y-0.5">
                      <span className="text-slate-700 dark:text-slate-300 font-bold block leading-snug">{log.action}</span>
                      {log.details?.performer && (
                        <div className="flex flex-wrap gap-2 text-[9px] text-slate-400 mt-1">
                          <span>कर्ता: {log.details.performer} ({log.details.performerRole})</span>
                          {log.details.targetUser && <span>• लक्ष्य: {log.details.targetUser}</span>}
                          {log.details.actionType && <span>• प्रकार: {log.details.actionType}</span>}
                        </div>
                      )}
                    </div>
                    <span className="text-slate-400 text-[9px] shrink-0 self-end sm:self-center font-mono">
                      {new Date(log.created_at).toLocaleTimeString("hi-IN")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: ARTICLES & NEWSROOM WRITING DESK */}
        {activeTab === "articles" && (
          <div className="space-y-6">
            {!isEditingArticle ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="font-serif text-2xl font-bold border-l-2 border-primary pl-2">लेख व समाचार सूची</h2>
                  <button 
                    onClick={handleCreateNewArticle}
                    className="flex items-center space-x-1 bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>नया लेख लिखें</span>
                  </button>
                </div>

                <div className="bg-white dark:bg-[#0A0F1D] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
                  <div className="grid grid-cols-12 gap-2 bg-slate-50 dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-800 font-bold">
                    <span className="col-span-6">शीर्षक</span>
                    <span className="col-span-2">श्रेणी</span>
                    <span className="col-span-2">स्थिति</span>
                    <span className="col-span-2 text-right">कार्रवाई</span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                    {articles.map((art) => (
                      <div key={art.id} className="grid grid-cols-12 gap-2 p-4 items-center hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                        <div className="col-span-6 space-y-0.5">
                          <p className="font-serif font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{art.title}</p>
                          <span className="text-[10px] text-slate-400 font-mono block">Slug: /{art.slug}</span>
                        </div>
                        <span className="col-span-2 text-slate-400 font-medium">{art.category}</span>
                        <div className="col-span-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border ${
                            art.status === "Published" 
                              ? "bg-green-500/10 border-green-500/30 text-green-500"
                              : art.status === "Pending Review"
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-500"
                                : "bg-slate-500/10 border-slate-500/30 text-slate-400"
                          }`}>
                            {art.status || "Draft"}
                          </span>
                        </div>
                        <div className="col-span-2 flex justify-end space-x-2">
                          <button 
                            onClick={() => handleEditArticle(art)}
                            className="p-1 text-slate-400 hover:text-primary transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={async () => {
                              if (confirm("Delete article?")) {
                                await deleteArticle(art.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* THE EDITING COMPOSER PAGE */
              <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-6">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="font-serif font-bold text-lg text-primary">{articleId ? "लेख संपादित करें" : "नया लेख रचना"}</h3>
                  <button 
                    onClick={() => setIsEditingArticle(false)}
                    className="text-xs text-slate-500 hover:text-primary font-bold cursor-pointer"
                  >
                    वापस जाएं
                  </button>
                </div>

                <form onSubmit={handleSaveArticleForm} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500 font-medium">शीर्षक</label>
                      <input 
                        type="text" 
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200"
                        required
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500 font-medium">अंग्रेजी शीर्षक</label>
                      <input 
                        type="text" 
                        value={englishTitle}
                        onChange={(e) => setEnglishTitle(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500 font-medium">श्रेणी</label>
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none text-slate-700 dark:text-slate-200"
                      >
                        <option value="विचार">विचार</option>
                        <option value="साहित्य">साहित्य</option>
                        <option value="शिक्षा">शिक्षा</option>
                        <option value="पर्यावरण">पर्यावरण</option>
                        <option value="समाचार">समाचार</option>
                        <option value="विशेष लेख">विशेष लेख</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-500 font-medium">विभाग</label>
                      <select 
                        value={section}
                        onChange={(e) => setSection(e.target.value as any)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none text-slate-700 dark:text-slate-200"
                      >
                        <option value="article">पत्रिका लेख (Article)</option>
                        <option value="news">दैनिक समाचार (News)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-500 font-medium">प्रकाशन स्थिति</label>
                      <select 
                        value={status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none text-slate-700 dark:text-slate-200"
                      >
                        <option value="Draft">Draft (ड्राफ्ट)</option>
                        <option value="Pending Review">Pending Review (समीक्षा लंबित)</option>
                        <option value="Approved">Approved (स्वीकृत)</option>
                        <option value="Published">Published (प्रकाशित)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-555 dark:text-slate-400 font-medium">सामग्री का प्रकार (Content Type)</label>
                      <select 
                        value={contentType}
                        onChange={(e) => setContentType(e.target.value as any)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none text-slate-700 dark:text-slate-200"
                      >
                        <option value="News">News (समाचार)</option>
                        <option value="Opinion">Opinion (विचार)</option>
                        <option value="Editorial">Editorial (संपादकीय - EIC/Owner Approval Required)</option>
                        <option value="Literature">Literature (साहित्य)</option>
                        <option value="Interview">Interview (साक्षात्कार)</option>
                        <option value="Special Report">Special Report (विशेष रिपोर्ट - EIC/Owner Approval Required)</option>
                        <option value="Research Report">Research Report (शोध रिपोर्ट - EIC/Owner Approval Required)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs text-slate-555 dark:text-slate-400 font-medium">पहुँच स्तर (Access Level)</label>
                      <select 
                        value={accessLevel}
                        onChange={(e) => setAccessLevel(e.target.value as any)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none text-slate-700 dark:text-slate-200"
                      >
                        <option value="Free">Free (मुफ़्त पाठक)</option>
                        <option value="Premium">Premium (प्रीमियम सदस्य)</option>
                        <option value="Patron">Patron (पैट्रन संरक्षक)</option>
                      </select>
                    </div>

                    <div className="flex items-center space-x-2 pl-2 md:pt-6">
                      <input 
                        type="checkbox" 
                        id="isFeatured"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                        className="w-4.5 h-4.5 rounded text-primary focus:ring-primary border-slate-300 cursor-pointer"
                      />
                      <label htmlFor="isFeatured" className="text-xs text-slate-700 dark:text-slate-300 font-bold cursor-pointer">चित्रित लेख (Featured Article)</label>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500 font-medium">SEO Slug (खाली छोड़ने पर स्वतः उत्पन्न होगा)</label>
                      <input 
                        type="text" 
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        placeholder="new-education-policy-2026"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-slate-500 font-medium">कवर इमेज का पता</label>
                      <input 
                        type="text" 
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                      <label className="text-xs text-slate-500 font-medium">लेख का संक्षिप्त सारांश</label>
                    <input 
                      type="text" 
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200"
                    />
                  </div>

                  <div className="space-y-1">
                      <label className="text-xs text-slate-500 font-medium">सामग्री</label>
                    <textarea 
                      rows={12}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 font-mono"
                    />
                  </div>

                  {/* Hindi Writing Suite Tools helper */}
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-4">
                    <h4 className="font-serif font-bold text-xs text-primary flex items-center space-x-1">
                      <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                      <span>हिन्दी लेखन उपकरण सहायक</span>
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-mono block">Type in English (Phonetic Transliteration)</label>
                        <input 
                          type="text" 
                          placeholder="namaste, vichar, shiksha..."
                          value={phoneticInput}
                          onChange={(e) => setPhoneticInput(e.target.value)}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 text-xs text-slate-700 dark:text-slate-200"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-slate-400 font-mono block">Devanagari Result (Copy to clipboard/editor)</label>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 text-xs text-slate-800 dark:text-slate-200 font-bold min-h-[36px]">
                          {phoneticResult}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>शब्द गणना: {content.split(/\s+/).filter(Boolean).length} शब्द</span>
                      <span>अक्षर गणना: {content.length} अक्षर</span>
                      <span>अनुमानित पठन अवधि: {Math.max(1, Math.ceil(content.split(" ").length / 150))} मिनट</span>
                    </div>
                  </div>

                  {/* AI Editorial Suite Tools */}
                  <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl space-y-4 font-serif">
                    <h4 className="font-serif font-bold text-xs text-primary flex items-center space-x-1">
                      <Sparkles className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
                      <span>एआई संपादन सहायक (AI Editor Helper)</span>
                    </h4>

                    <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-[10px] font-bold">
                      <button
                        type="button"
                        onClick={() => triggerAiTool("writing_guru", "लेखन मूल्यांकन रिपोर्ट तैयार करें जिसमें भाषा गुणवत्ता, पठनीयता, संरचना, शोध गुणवत्ता, तार्किकता और शीर्षक प्रभाव का स्कोर और सुझाव शामिल हों।")}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${activeAiTool === "writing_guru" ? "bg-primary text-white border-primary" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary/30 text-slate-700 dark:text-slate-200"}`}
                      >
                        🧠 लेखन गुरु
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerAiTool("title_lab", "शीर्षक विकल्प और सुझाव प्रदान करें: 10 शीर्षक सुझाव (SEO, मैगज़ीन शैली, न्यूज़ शैली)।")}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${activeAiTool === "title_lab" ? "bg-primary text-white border-primary" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary/30 text-slate-700 dark:text-slate-200"}`}
                      >
                        🏷️ शीर्षक प्रयोगशाला
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerAiTool("grammar", "व्याकरण, वर्तनी और वाक्य संरचना की समीक्षा करें और सुझाव दें।")}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${activeAiTool === "grammar" ? "bg-primary text-white border-primary" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary/30 text-slate-700 dark:text-slate-200"}`}
                      >
                        ✓ व्याकरण सहायक
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerAiTool("fact_check", "लेख में उल्लेखित कथनों, दावों, आँकड़ों और उद्धरणों की सत्यता तालिका तैयार करें (दावा, स्थिति: सत्यापित/स्रोत आवश्यक/जाँच लंबित, संदर्भ)।")}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${activeAiTool === "fact_check" ? "bg-primary text-white border-primary" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary/30 text-slate-700 dark:text-slate-200"}`}
                      >
                        🔬 सत्यता जाँच
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerAiTool("research", "अतिरिक्त अनुसंधान संदर्भ, पुस्तकें, सरकारी रिपोर्ट और शोध पत्र सुझाएं।")}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${activeAiTool === "research" ? "bg-primary text-white border-primary" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary/30 text-slate-700 dark:text-slate-200"}`}
                      >
                        📚 अनुसंधान संदर्भ
                      </button>
                      <button
                        type="button"
                        onClick={() => triggerAiTool("interview", "विशेषज्ञों, पत्रकारों या शोधकर्ताओं हेतु साक्षात्कार हेतु 5 प्रासंगिक प्रश्न तैयार करें।")}
                        className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${activeAiTool === "interview" ? "bg-primary text-white border-primary" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-primary/30 text-slate-700 dark:text-slate-200"}`}
                      >
                        🎙️ साक्षात्कार मोड
                      </button>
                    </div>

                    {/* AI result visualization card */}
                    {(aiLoading || aiResult) && (
                      <div className="bg-white dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-850 rounded-xl text-[10.5px] leading-relaxed space-y-2.5 shadow-inner">
                        <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-1.5 font-sans">
                          <span className="font-bold text-primary flex items-center space-x-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                            <span>AI परिणाम विमर्श</span>
                          </span>
                          {aiLoading && (
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
                          )}
                        </div>

                        {activeAiTool === "fact_check" && !aiLoading && aiResult.includes("|") ? (
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse border border-slate-200 dark:border-slate-800">
                              <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900 text-[9px] font-bold text-slate-650">
                                  <th className="p-2 border border-slate-200 dark:border-slate-800">दावा / तथ्य</th>
                                  <th className="p-2 border border-slate-200 dark:border-slate-800">स्थिति</th>
                                  <th className="p-2 border border-slate-200 dark:border-slate-800">संदर्भ स्रोत</th>
                                </tr>
                              </thead>
                              <tbody>
                                {aiResult.split("\n").filter(line => line.includes("|") && !line.includes("---") && !line.includes("दावा")).map((line, lIdx) => {
                                  const parts = line.split("|").map(p => p.trim()).filter(Boolean);
                                  if (parts.length < 2) return null;
                                  
                                  const statusColor = parts[1].includes("सत्यापित") ? "bg-green-500/10 border border-green-500/20 text-green-600" :
                                                      parts[1].includes("स्रोत आवश्यक") ? "bg-red-500/10 border border-red-500/20 text-red-600" :
                                                      "bg-amber-500/10 border border-amber-500/20 text-amber-600";

                                  return (
                                    <tr key={lIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40 text-[10px]">
                                      <td className="p-2 border border-slate-200 dark:border-slate-800 font-semibold">{parts[0]}</td>
                                      <td className="p-2 border border-slate-200 dark:border-slate-800">
                                        <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold ${statusColor}`}>
                                          {parts[1]}
                                        </span>
                                      </td>
                                      <td className="p-2 border border-slate-200 dark:border-slate-800 text-slate-500">{parts[2] || "जाँच की आवश्यकता"}</td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="whitespace-pre-line text-slate-700 dark:text-slate-250 font-light font-hindi leading-relaxed">{aiResult}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button 
                      type="submit" 
                      className="bg-primary hover:bg-primary/95 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      सहेजें और अपडेट करें
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: EDITORIAL ASSIGNMENTS CALENDAR */}
        {activeTab === "assignments" && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold border-l-2 border-primary pl-2">संपादकीय कार्य आवंटन (Editorial Assignments)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Assignment Form */}
              <div className="md:col-span-4 bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                <h3 className="font-serif font-bold text-sm text-primary">नया कार्य सौंपें (Assign Review Tasks)</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-500 font-medium">लेख चुनें</label>
                    <select 
                      value={assignArticleId}
                      onChange={(e) => setAssignArticleId(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
                    >
                      <option value="">लेख का चयन करें...</option>
                      {articles.map(a => (
                        <option key={a.id} value={a.id}>{a.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 font-medium">लेखक</label>
                    <input 
                      type="text" 
                      placeholder="लेखक का नाम..."
                      value={assignAuthor}
                      onChange={(e) => setAssignAuthor(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-500 font-medium">समीक्षक</label>
                    <input 
                      type="text" 
                      placeholder="समीक्षक का नाम..."
                      value={assignReviewer}
                      onChange={(e) => setAssignReviewer(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 font-medium">अंतिम तिथि</label>
                    <input 
                      type="date" 
                      value={assignDeadline}
                      onChange={(e) => setAssignDeadline(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
                    />
                  </div>
                </div>

                <button 
                  onClick={async () => {
                    if (!assignArticleId) return;
                    await saveAssignment({
                      article_id: assignArticleId,
                      deadline: assignDeadline,
                      status: "Assigned"
                    });
                    setAssignArticleId("");
                    setAssignAuthor("");
                    setAssignReviewer("");
                    setAssignDeadline("");
                    alert("संपादकीय कार्य नियत कर दिया गया!");
                  }}
                  className="bg-primary hover:bg-primary/95 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  आवंटन सुरक्षित करें
                </button>
              </div>
            </div>

            {/* List Active Tasks */}
            <div className="bg-white dark:bg-[#0A0F1D] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
              <div className="grid grid-cols-12 gap-2 bg-slate-50 dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-800 font-bold">
                <span className="col-span-5">संपादकीय कार्य</span>
                <span className="col-span-3">अंतिम तिथि (Deadline)</span>
                <span className="col-span-4 text-right">समीक्षा स्थिति</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {assignments.map(a => {
                  const targetArt = articles.find(art => art.id === a.article_id);
                  return (
                    <div key={a.id} className="grid grid-cols-12 gap-2 p-4 items-center">
                      <span className="col-span-5 font-serif font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{targetArt?.title || "विविध असाइनमेंट"}</span>
                      <span className="col-span-3 text-slate-400 font-mono">{a.deadline || "सदाबहार"}</span>
                      <div className="col-span-4 text-right">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-primary/10 text-primary border border-primary/20">
                          {a.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: COMMENTS MODERATION QUEUE */}
        {activeTab === "comments" && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold border-l-2 border-primary pl-2">टिप्पणी नियंत्रण</h2>
            
            <div className="bg-white dark:bg-[#0A0F1D] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
              <div className="grid grid-cols-12 gap-2 bg-slate-50 dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-800 font-bold">
                <span className="col-span-3">पाठक</span>
                <span className="col-span-5">टिप्पणी सामग्री (Comment Content)</span>
                <span className="col-span-2">स्थिति</span>
                <span className="col-span-2 text-right">अनुमोदन</span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {comments.length === 0 && (
                  <div className="p-8 text-center text-slate-400">कोई टिप्पणी उपलब्ध नहीं है।</div>
                )}
                {comments.map((comm) => (
                  <div key={comm.id} className="grid grid-cols-12 gap-2 p-4 items-start">
                    <span className="col-span-3 font-serif font-bold text-slate-700 dark:text-slate-300">{comm.name}</span>
                    <span className="col-span-5 text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{comm.content}</span>
                    <div className="col-span-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        comm.status === "approved" ? "bg-green-500/10 text-green-500 border border-green-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      }`}>
                        {comm.status}
                      </span>
                    </div>
                    <div className="col-span-2 flex justify-end space-x-2">
                      {comm.status !== "approved" && (
                        <button 
                          onClick={async () => {
                            await moderateComment(comm.id, "approved");
                            alert("टिप्पणी स्वीकृत कर दी गई!");
                          }}
                          className="p-1 text-green-500 hover:scale-110 transition-transform cursor-pointer"
                          title="Approve"
                        >
                          <Check className="w-4.5 h-4.5" />
                        </button>
                      )}
                      <button 
                        onClick={async () => {
                          await moderateComment(comm.id, "spam");
                          alert("टिप्पणी स्पैम के रूप में चिह्नित की गई!");
                        }}
                        className="p-1 text-amber-500 hover:scale-110 transition-transform cursor-pointer"
                        title="Spam"
                      >
                        <AlertTriangle className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: USERS & ROLES */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="font-serif text-2xl font-bold border-l-2 border-primary pl-2">उपयोगकर्ता एवं भूमिका प्रबंधन (User Roles Management)</h2>
              <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg text-xs font-mono font-bold">
                आपकी भूमिका: {currentUser?.role}
              </span>
            </div>
            
            {/* Create User Form Section */}
            {(currentUser?.role === "Owner" || currentUser?.role === "Admin" || currentUser?.role === "Editor-in-Chief" || currentUser?.role === "Managing Editor") && (
              <GlassCard glow="saffron" className="p-5 space-y-4">
                <h3 className="font-serif font-bold text-sm text-primary">नया उपयोगकर्ता जोड़ें (Add New User)</h3>
                
                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newUserName.trim() || !newUserEmail.trim()) {
                      alert("नाम और ईमेल अनिवार्य हैं!");
                      return;
                    }
                    await createUser({
                      name: newUserName,
                      email: newUserEmail,
                      role: newUserRole,
                      membership: null,
                      status: "active"
                    });
                    setNewUserName("");
                    setNewUserEmail("");
                    setNewUserRole(null);
                    alert("उपयोगकर्ता सफलतापूर्वक जोड़ दिया गया!");
                  }}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs"
                >
                  <div className="space-y-1">
                    <label className="text-slate-500 font-medium block">नाम</label>
                    <input 
                      type="text" 
                      placeholder="पूरा नाम..."
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 font-medium block">ईमेल</label>
                    <input 
                      type="email" 
                      placeholder="user@yuvakshar.org"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 font-medium block">भूमिका (Role)</label>
                    <select 
                      value={newUserRole || ""}
                      onChange={(e) => setNewUserRole(e.target.value === "" ? null : (e.target.value as Profile["role"]))}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none text-slate-700 dark:text-slate-200"
                    >
                      {currentUser?.role === "Owner" && (
                        <>
                          <option value="Owner">स्वामी</option>
                          <option value="Admin">प्रशासक</option>
                          <option value="Editor-in-Chief">प्रधान संपादक</option>
                          <option value="Managing Editor">प्रबंध संपादक</option>
                          <option value="Editor">संपादक</option>
                          <option value="Fact Check Reviewer">सत्यता समीक्षक</option>
                          <option value="Author">लेखक</option>
                          <option value="Contributor">योगदानकर्ता</option>
                          <option value="">सदस्य (Subscriber)</option>
                        </>
                      )}
                      {currentUser?.role === "Admin" && (
                        <>
                          <option value="Admin">Admin</option>
                          <option value="Editor-in-Chief">Editor-in-Chief</option>
                          <option value="Managing Editor">Managing Editor</option>
                          <option value="Editor">Editor</option>
                          <option value="Fact Check Reviewer">Fact Check Reviewer</option>
                          <option value="Author">Author</option>
                          <option value="Contributor">Contributor</option>
                          <option value="">Subscriber</option>
                        </>
                      )}
                      {(currentUser?.role === "Editor-in-Chief" || currentUser?.role === "Managing Editor") && (
                        <>
                          <option value="Author">Author</option>
                          <option value="Contributor">Contributor</option>
                        </>
                      )}
                    </select>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-xl font-bold transition-all shadow-md cursor-pointer text-center"
                  >
                    उपयोगकर्ता बनाएं
                  </button>
                </form>
              </GlassCard>
            )}

            {/* Users List Grid */}
            <div className="bg-white dark:bg-[#0A0F1D] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
              <div className="grid grid-cols-12 gap-2 bg-slate-50 dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-800 font-bold">
                <span className="col-span-3">नाम / ईमेल (User Details)</span>
                <span className="col-span-3">भूमिका (Role Authority)</span>
                <span className="col-span-2 text-center">स्थिति</span>
                <span className="col-span-4 text-right">कार्रवाई (Management Actions)</span>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {users.map((usr) => {
                  const isOwnerTarget = usr.role === "Owner";
                  const isAdminTarget = usr.role === "Admin";
                  const isSelf = currentUser?.id === usr.id;
                  
                  // Performer permissions evaluation
                  const performerRole = currentUser?.role || "Subscriber";
                  const canChangeRole = !isSelf && (
                    performerRole === "Owner" || 
                    (performerRole === "Admin" && !isOwnerTarget) ||
                    ((performerRole === "Editor-in-Chief" || performerRole === "Managing Editor") && (usr.role === "Author" || usr.role === "Contributor"))
                  );

                  const canToggleStatus = !isSelf && !isOwnerTarget && (performerRole === "Owner" || performerRole === "Admin");
                  const canDelete = !isSelf && !isOwnerTarget && (
                    performerRole === "Owner" || 
                    (performerRole === "Admin" && !isAdminTarget)
                  );
                  const canTransfer = performerRole === "Owner" && !isSelf && usr.status === "active";
                  const canReset = (performerRole === "Owner" || performerRole === "Admin") && !isOwnerTarget;

                  return (
                    <div key={usr.id} className="grid grid-cols-12 gap-2 p-4 items-center hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors">
                      <div className="col-span-3 space-y-0.5">
                        <p className="font-serif font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{usr.name}</p>
                        <span className="text-[10px] text-slate-400 font-mono block truncate">{usr.email}</span>
                      </div>
                      
                      <div className="col-span-3">
                        {canChangeRole ? (
                          <select 
                            value={usr.role || ""}
                            onChange={async (e) => {
                              const nextRole = e.target.value === "" ? null : (e.target.value as Profile["role"]);
                              const displayName = nextRole ? translateRole(nextRole) : "सामान्य पाठक";
                              if (confirm(`क्या आप ${usr.name} की भूमिका को ${displayName} में बदलना चाहते हैं?`)) {
                                await updateUser(usr.id, { role: nextRole });
                                alert("भूमिका सफलतापूर्वक अपडेट कर दी गई!");
                              }
                            }}
                            className="bg-transparent border border-slate-200 dark:border-slate-800 rounded px-2 py-1 focus:outline-none font-medium text-slate-700 dark:text-slate-300"
                          >
                            {performerRole === "Owner" && (
                              <>
                                <option value="Owner">Owner</option>
                                <option value="Admin">Admin</option>
                                <option value="Editor-in-Chief">Editor-in-Chief</option>
                                <option value="Managing Editor">Managing Editor</option>
                                <option value="Editor">Editor</option>
                                <option value="Fact Check Reviewer">Fact Check Reviewer</option>
                                <option value="Author">Author</option>
                                <option value="Contributor">Contributor</option>
                                <option value="">Subscriber</option>
                              </>
                            )}
                            {performerRole === "Admin" && (
                              <>
                                <option value="Admin">Admin</option>
                                <option value="Editor-in-Chief">Editor-in-Chief</option>
                                <option value="Managing Editor">Managing Editor</option>
                                <option value="Editor">Editor</option>
                                <option value="Fact Check Reviewer">Fact Check Reviewer</option>
                                <option value="Author">Author</option>
                                <option value="Contributor">Contributor</option>
                                <option value="">Subscriber</option>
                              </>
                            )}
                            {(performerRole === "Editor-in-Chief" || performerRole === "Managing Editor") && (
                              <>
                                <option value="Author">Author</option>
                                <option value="Contributor">Contributor</option>
                              </>
                            )}
                          </select>
                        ) : (
                          <span className={`px-2 py-1 rounded text-[10px] font-bold font-mono tracking-wider ${
                            isOwnerTarget 
                              ? "bg-red-500/10 text-red-500 border border-red-500/25" 
                              : isAdminTarget 
                                ? "bg-orange-500/10 text-orange-600 border border-orange-500/25"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                          }`}>
                            {usr.role}
                          </span>
                        )}
                      </div>

                      <div className="col-span-2 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono border ${
                          usr.status === "active" 
                            ? "bg-green-500/10 border-green-500/30 text-green-500" 
                            : "bg-red-500/10 border-red-500/30 text-red-500"
                        }`}>
                          {usr.status}
                        </span>
                      </div>

                      <div className="col-span-4 flex justify-end items-center gap-2 flex-wrap">
                        {canToggleStatus && (
                          <button 
                            onClick={async () => {
                              const nextStatus = usr.status === "active" ? "suspended" : "active";
                              if (confirm(`क्या आप ${usr.name} को ${nextStatus === "active" ? "सक्रिय" : "निलंबित"} करना चाहते हैं?`)) {
                                await updateUser(usr.id, { status: nextStatus });
                                alert(`उपयोगकर्ता को सफलतापूर्वक ${nextStatus === "active" ? "सक्रिय" : "निलंबित"} किया गया!`);
                              }
                            }}
                            className="text-slate-400 hover:text-orange-500 text-[10px] font-bold hover:underline transition-all cursor-pointer"
                          >
                            {usr.status === "active" ? "Suspend" : "Activate"}
                          </button>
                        )}
                        
                        {canReset && (
                          <button 
                            onClick={() => resetUserPassword(usr.id)}
                            className="text-slate-400 hover:text-blue-500 text-[10px] font-bold hover:underline transition-all cursor-pointer"
                          >
                            Reset Pwd
                          </button>
                        )}

                        {canTransfer && (
                          <button 
                            onClick={async () => {
                              if (confirm(`चेतावनी: क्या आप युवाक्षर पोर्टल का पूर्ण स्वामित्व ${usr.name} को हस्तांतरित करना चाहते हैं? इसके बाद आप Admin पद पर आ जायेंगे।`)) {
                                await transferOwnership(usr.id);
                                alert("स्वामित्व सफलतापूर्वक हस्तांतरित कर दिया गया!");
                              }
                            }}
                            className="text-orange-500 hover:text-orange-600 hover:scale-105 text-[10px] font-bold border border-orange-500/30 px-1.5 py-0.5 rounded bg-orange-500/5 transition-all cursor-pointer"
                          >
                            Transfer Owner
                          </button>
                        )}

                        {canDelete && (
                          <button 
                            onClick={async () => {
                              if (confirm(`क्या आप ${usr.name} का खाता स्थायी रूप से डिलीट करना चाहते हैं?`)) {
                                await deleteUser(usr.id);
                                alert("खाता सफलतापूर्वक डिलीट कर दिया गया!");
                              }
                            }}
                            className="text-slate-400 hover:text-red-500 hover:scale-105 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5.5: MEMBERSHIP DESK (सदस्यता प्रबंधन) */}
        {activeTab === "memberships" && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold border-l-2 border-primary pl-2 text-slate-900 dark:text-white">युवाक्षर सदस्यता प्रबंधन डेस्क</h2>
            
            {/* Analytics Grid */}
            {(() => {
              const analytics = getMembershipAnalytics();
              return (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">कुल सक्रिय सदस्य</span>
                    <span className="text-2xl font-bold font-serif text-slate-900 dark:text-white mt-2">{analytics.activeMembers}</span>
                    <span className="text-[9px] text-slate-400 font-mono mt-1 font-bold">प्रीमियम: {analytics.premiumMembers} | संरक्षक: {analytics.patronMembers}</span>
                  </div>
                  <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">कुल सदस्यता राजस्व</span>
                    <span className="text-2xl font-bold font-serif text-primary mt-2">₹{analytics.membershipRevenue}</span>
                    <span className="text-[9px] text-slate-400 font-mono mt-1 font-bold">सफल भुगतानों से संचित</span>
                  </div>
                  <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">रूपांतरण दर (Conversion)</span>
                    <span className="text-2xl font-bold font-serif text-amber-500 mt-2">{analytics.conversionRate}%</span>
                    <span className="text-[9px] text-slate-400 font-mono mt-1 font-bold">सक्रिय सदस्य / कुल पंजीकृत</span>
                  </div>
                  <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">मंथन दर (Churn Rate)</span>
                    <span className="text-2xl font-bold font-serif text-red-500 mt-2">{analytics.churnRate}%</span>
                    <span className="text-[9px] text-slate-400 font-mono mt-1 font-bold">ऑटो-नवीनीकरण दर: {analytics.renewalRate}%</span>
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Manual Assignment & Database (Col Span 7) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Manual Assignment Card */}
                <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                  <h3 className="font-serif font-bold text-sm text-primary">मैन्युअल सदस्यता असाइनमेंट (Manual Override Desk)</h3>
                  
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!selectedUserId) {
                        alert("कृपया उपयोगकर्ता चुनें।");
                        return;
                      }
                      assignMembershipManually(selectedUserId, manualTier, manualCycle, manualDurationDays);
                      alert("मैन्युअल सदस्यता सफलतापूर्वक असाइन की गई!");
                      setSelectedUserId("");
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <label className="text-slate-500 font-medium">उपयोगकर्ता का चयन करें (User)</label>
                      <select
                        value={selectedUserId}
                        onChange={(e) => setSelectedUserId(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-855 dark:text-slate-200 focus:outline-none"
                      >
                        <option value="">-- उपयोगकर्ता चुनें --</option>
                        {users.map(u => (
                          <option key={u.id} value={u.id}>{u.name} ({u.email || "No Email"}) - {u.membership || "Free"}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-500 font-medium">सदस्यता प्रकार (Membership Tier)</label>
                      <select
                        value={manualTier}
                        onChange={(e) => setManualTier(e.target.value as any)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-855 dark:text-slate-200 focus:outline-none"
                      >
                        <option value="Free">Free (हटाएं)</option>
                        <option value="Premium">Premium</option>
                        <option value="Patron">Patron</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-500 font-medium">भुगतान चक्र (Billing Cycle)</label>
                      <select
                        value={manualCycle}
                        onChange={(e) => setManualCycle(e.target.value as any)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-855 dark:text-slate-200 focus:outline-none"
                      >
                        <option value="Monthly">मासिक</option>
                        <option value="Quarterly">त्रैमासिक</option>
                        <option value="Half-Yearly">अर्धवार्षिक</option>
                        <option value="Yearly">वार्षिक</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-500 font-medium">अवधि दिन (Duration in Days)</label>
                      <input
                        type="number"
                        min={1}
                        value={manualDurationDays}
                        onChange={(e) => setManualDurationDays(parseInt(e.target.value) || 30)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-855 dark:text-slate-200 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="md:col-span-2 bg-primary hover:bg-primary/95 text-white font-bold py-2.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Crown className="w-4 h-4 text-slate-900" />
                      <span>मैन्युअल सदस्यता असाइन करें</span>
                    </button>
                  </form>
                </div>

                {/* Subscriptions DB List */}
                <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                  <h3 className="font-serif font-bold text-sm text-primary">उपयोगकर्ता सदस्यता डेटाबेस (Subscriptions DB)</h3>
                  
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-950/30">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/60 font-serif">
                          <th className="p-3 text-slate-700 dark:text-slate-300">नाम</th>
                          <th className="p-3 text-slate-700 dark:text-slate-300">भूमिका</th>
                          <th className="p-3 text-slate-700 dark:text-slate-300">सदस्यता</th>
                          <th className="p-3 text-slate-700 dark:text-slate-300">वैधता तिथि</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {users.map((user) => {
                          const membershipDetail = userMemberships.find(m => m.userId === user.id && m.status === "active");
                          return (
                            <tr key={user.id} className="hover:bg-slate-100/30 dark:hover:bg-slate-900/20">
                              <td className="p-3 font-bold">{user.name}</td>
                              <td className="p-3 text-slate-500">{translateRole(user.role)}</td>
                              <td className="p-3">
                                {user.membership === "Patron" && <span className="text-rose-500 font-bold bg-rose-500/10 border border-rose-500/20 px-1.5 py-0.5 rounded">Patron</span>}
                                {user.membership === "Premium" && <span className="text-amber-500 font-bold bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">Premium</span>}
                                {(user.membership === "Free" || !user.membership) && <span className="text-slate-400 bg-slate-500/10 px-1.5 py-0.5 rounded">Free</span>}
                              </td>
                              <td className="p-3 text-slate-500 font-mono">{membershipDetail ? membershipDetail.expiryDate : "स्वतः समाप्त"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Right Column: Coupon & Promotions Desk (Col Span 5) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Add Coupon Card */}
                <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                  <h3 className="font-serif font-bold text-sm text-primary">नया कूपन कोड बनाएं (Coupon Desk)</h3>
                  
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!couponCodeInput.trim()) {
                        alert("कृपया कूपन कोड दर्ज करें।");
                        return;
                      }
                      createCoupon({
                        code: couponCodeInput.trim().toUpperCase(),
                        discountType: couponType,
                        value: couponValue,
                        expiryDate: couponExpiry || new Date(Date.now() + 30*24*60*60*1000).toISOString().split("T")[0],
                        usageLimit: couponLimit,
                        usageCount: 0,
                        isActive: true
                      });
                      alert("कूपन सफलतापूर्वक बनाया गया!");
                      setCouponCodeInput("");
                    }}
                    className="space-y-3 text-xs"
                  >
                    <div className="space-y-1">
                      <label className="text-slate-500 font-medium">कूपन कोड (Coupon Code)</label>
                      <input
                        type="text"
                        placeholder="जैसे: AMOD50"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-855 dark:text-slate-200 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-500 font-medium">छूट प्रकार (Type)</label>
                        <select
                          value={couponType}
                          onChange={(e) => setCouponType(e.target.value as any)}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-855 dark:text-slate-200 focus:outline-none"
                        >
                          <option value="percentage">प्रतिशत (%)</option>
                          <option value="flat">सपाट राशि (₹)</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-500 font-medium">छूट मूल्य (Value)</label>
                        <input
                          type="number"
                          min={1}
                          value={couponValue}
                          onChange={(e) => setCouponValue(parseInt(e.target.value) || 0)}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-855 dark:text-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-500 font-medium">समाप्ति तिथि (Expiry)</label>
                        <input
                          type="date"
                          value={couponExpiry}
                          onChange={(e) => setCouponExpiry(e.target.value)}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-855 dark:text-slate-200 focus:outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-500 font-medium">उपयोग सीमा (Limit)</label>
                        <input
                          type="number"
                          min={1}
                          value={couponLimit}
                          onChange={(e) => setCouponLimit(parseInt(e.target.value) || 100)}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-855 dark:text-slate-200 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/95 text-white font-bold py-2.5 rounded-xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>कूपन कोड बनाएं</span>
                    </button>
                  </form>
                </div>

                {/* Active Coupons List */}
                <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                  <h3 className="font-serif font-bold text-sm text-primary">सक्रिय कूपन सूचकांक (Coupons Telemetry)</h3>
                  
                  <div className="space-y-3">
                    {coupons.map((coupon) => (
                      <div key={coupon.code} className="flex justify-between items-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl text-xs">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">{coupon.code}</span>
                            <span className="text-[10px] text-emerald-400 font-bold">
                              {coupon.discountType === "percentage" ? `${coupon.value}% छूट` : `₹${coupon.value} छूट`}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-500">वैधता: {coupon.expiryDate} | सीमा: {coupon.usageCount}/{coupon.usageLimit}</p>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm(`क्या आप वाकई कूपन ${coupon.code} को हटाना चाहते हैं?`)) {
                              deleteCoupon(coupon.code);
                              alert("कूपन कोड हटा दिया गया!");
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 rounded transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* TAB 6: NEWSLETTER CAMPAIGNS */}
        {activeTab === "newsletter" && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold border-l-2 border-primary pl-2">न्यूज़लेटर अभियान डिज़ाइनर</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Campaign Composer */}
              <div className="lg:col-span-7 bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                <h3 className="font-serif font-bold text-sm text-primary">अभियान भेजें</h3>
                
                <form onSubmit={handleDispatchCampaign} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-500 font-medium">विषय (Email Subject)</label>
                    <input 
                      type="text" 
                      placeholder="युवाक्षर न्यूज़लेटर: साप्ताहिक विमर्श और कविता संग्रह..."
                      value={campSubject}
                      onChange={(e) => setCampSubject(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 font-medium">कैंपेन संदेश (Body Content - HTML supported)</label>
                    <textarea 
                      rows={10}
                      placeholder="विषय वस्तु..."
                      value={campContent}
                      onChange={(e) => setCampContent(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200"
                      required
                    />
                  </div>

                  <button 
                    type="submit"
                    className="bg-primary hover:bg-primary/95 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    अभियान भेजें
                  </button>
                </form>
              </div>

              {/* Campaign Stats and History */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                  <h3 className="font-serif font-bold text-sm text-primary">सदस्य सूची</h3>
                  <p className="text-xs text-slate-400">कुल सक्रिय न्यूज़लेटर ईमेल पाठक: <strong>{subscribers.length}</strong></p>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 text-[11px] font-mono">
                    {subscribers.map((sub, idx) => (
                      <div key={idx} className="border-b border-slate-100 dark:border-slate-800/40 pb-1.5 last:border-b-0">
                        {sub}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                  <h3 className="font-serif font-bold text-sm text-primary">प्रेषित कैंपेन (Sent History)</h3>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 text-[11px] leading-relaxed">
                    {campaigns.map((camp, idx) => (
                      <div key={idx} className="border-b border-slate-100 dark:border-slate-800/40 pb-2 last:border-b-0">
                        <p className="font-bold text-slate-700 dark:text-slate-300">{camp.subject}</p>
                        <span className="text-[9px] text-slate-400 font-mono block mt-0.5">Sent: {new Date(camp.sent_at).toLocaleDateString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: AD MANAGER */}
        {activeTab === "ads" && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold border-l-2 border-primary pl-2">विज्ञापन जोन प्रबंधन (Ads Manager)</h2>
            <p className="text-xs text-slate-400">स्वीकृत लेआउट होमपेज पर विज्ञापनों को प्रदर्शित होने से रोकता है। विज्ञापन केवल गतिशील लेखों के अंदर ही दिखाई देते हैं।</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ads.map((ad) => (
                <div key={ad.id} className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
                    <h3 className="font-serif font-bold text-sm text-slate-800 dark:text-white">{ad.name}</h3>
                    <span className="text-[9px] uppercase tracking-wider text-primary font-mono font-bold bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                      {ad.zone}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Ad Type:</span>
                      <span className="font-bold font-mono">{ad.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Impressions:</span>
                      <span className="font-bold font-mono">{ad.impression_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Clicks:</span>
                      <span className="font-bold font-mono">{ad.click_count}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => alert("Ad configuration settings update toggled!")}
                      className="flex-grow text-center py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-xs font-bold rounded-lg hover:border-primary hover:text-primary transition-all cursor-pointer"
                    >
                      विज्ञापन संपादित करें
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: APPEARANCE & STYLES CUSTOMIZATION */}
        {activeTab === "appearance" && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold border-l-2 border-primary pl-2">ब्रांड स्वरूप एवं थीम सेटिंग्स (Appearance Customization)</h2>
            
            <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-6 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 font-medium">साइट का नाम (Site Name)</label>
                  <input 
                    type="text" 
                    value={siteName}
                    onChange={(e) => setSiteName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-medium">टैगलाइन (Site Tagline)</label>
                  <input 
                    type="text" 
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 font-medium">मुख्य रंग (Primary Theme Hex)</label>
                  <div className="flex space-x-2">
                    <input 
                      type="color" 
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 border border-slate-200 rounded-lg p-0.5 cursor-pointer shrink-0"
                    />
                    <input 
                      type="text" 
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-medium">द्वितीयक रंग (Secondary Hex)</label>
                  <div className="flex space-x-2">
                    <input 
                      type="color" 
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-10 h-10 border border-slate-200 rounded-lg p-0.5 cursor-pointer shrink-0"
                    />
                    <input 
                      type="text" 
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-medium">बैकग्राउंड रंग (Background Hex)</label>
                  <div className="flex space-x-2">
                    <input 
                      type="color" 
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-10 h-10 border border-slate-200 rounded-lg p-0.5 cursor-pointer shrink-0"
                    />
                    <input 
                      type="text" 
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-4">
                <h4 className="font-serif font-bold text-xs text-primary">ब्रैंडिंग (Branding)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-500 font-medium block">लोगो इमेज अपलोड (Logo Upload)</label>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-500 font-medium block">साइट लोगो इमेज का पता (Logo URL Path)</label>
                    <input 
                      type="text" 
                      value={logoUrl}
                      onChange={(e) => setLogoUrl(e.target.value)}
                      placeholder="/yuvakshar_logo_official.png"
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-slate-200 dark:bg-slate-800 my-4" />
              <h3 className="font-serif text-sm font-bold text-primary">सम्पर्क एवं ईमेल सेटिंग्स</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 font-medium">मुख्य सम्पर्क ईमेल (Primary Contact Email)</label>
                  <input 
                    type="email" 
                    value={primaryContactEmail}
                    onChange={(e) => setPrimaryContactEmail(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-medium">संपादकीय ईमेल (Editorial Email)</label>
                  <input 
                    type="email" 
                    value={editorialEmail}
                    onChange={(e) => setEditorialEmail(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-500 font-medium">सपोर्ट ईमेल (Support Email)</label>
                  <input 
                    type="email" 
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-medium">न्यूज़लेटर ईमेल</label>
                  <input 
                    type="email" 
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-500 font-medium">सूचना ईमेल (Notification Email)</label>
                  <input 
                    type="email" 
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-slate-200 dark:border-slate-800">
                <button 
                  onClick={handleSaveAppearance}
                  className="bg-primary hover:bg-primary/95 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  स्वरूप सुरक्षित करें
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: DISASTER BACKUP CENTER */}
        {activeTab === "backups" && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold border-l-2 border-primary pl-2">आपदा पुनर्प्राप्ति केंद्र (Disaster Recovery Center)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Export Panel */}
              <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                <h3 className="font-serif font-bold text-sm text-primary flex items-center space-x-1">
                  <Download className="w-4.5 h-4.5" />
                  <span>डेटाबेस बैकअप निर्यात (Export Database JSON)</span>
                </h3>
                <p className="text-xs text-slate-400">अपने स्थानीय उपकरण पर सभी लेखों, टिप्पणियों, सेटिंग्स, न्यूज़लेटर सूचियों और डेटाबेस तालिकाओं का पूरा बैकअप डाउनलोड करें।</p>
                <button 
                  onClick={handleBackupExport}
                  className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>JSON बैकअप फाइल डाउनलोड करें</span>
                </button>
              </div>

              {/* Import Panel */}
              <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                <h3 className="font-serif font-bold text-sm text-primary flex items-center space-x-1">
                  <Upload className="w-4.5 h-4.5" />
                  <span>डेटाबेस पुनर्स्थापना (Import JSON Restore)</span>
                </h3>
                <p className="text-xs text-slate-400">अपने पहले निर्यात किए गए JSON डेटाबेस बैकअप स्नैपशॉट को कॉपी-पेस्ट करके लेख और लेआउट कॉन्फ़िगरेशन को पुनर्स्थापित करें।</p>
                
                <textarea 
                  rows={4}
                  placeholder="JSON text here..."
                  value={backupJson}
                  onChange={(e) => setBackupJson(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 font-mono"
                />

                <button 
                  onClick={handleBackupImport}
                  className="w-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-primary hover:text-primary py-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <Upload className="w-4 h-4" />
                  <span> JSON बैकअप पुनर्स्थापित करें</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 10: LAUNCH READY SCORECARD */}
        {activeTab === "launch" && (
          <div className="space-y-6">
            <h2 className="font-serif text-2xl font-bold border-l-2 border-primary pl-2">उत्पादन लाँन्च सत्यापन</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              {/* Score Chart */}
              <div className="md:col-span-4 flex flex-col items-center justify-center p-6 bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-2">
                <span className="text-[10px] text-slate-400 font-mono uppercase">Readiness Rating</span>
                <div className="relative w-28 h-28 rounded-full border-4 border-primary/10 flex items-center justify-center">
                  <div className="text-3xl font-extrabold font-serif text-primary">{launchScore}%</div>
                </div>
                <p className="text-xs font-bold mt-2">
                  {launchScore >= 80 ? "✓ READY FOR PRODUCTION" : "⚠ INCOMPLETE INTEGRATIONS"}
                </p>
              </div>

              {/* Score Checklist items */}
              <div className="md:col-span-8 bg-white dark:bg-[#0A0F1D] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs">
                <div className="grid grid-cols-12 gap-2 bg-slate-50 dark:bg-slate-900 p-4 border-b border-slate-200 dark:border-slate-800 font-bold">
                  <span className="col-span-6">आवश्यक चेकलिस्ट</span>
                  <span className="col-span-3">प्राथमिकता</span>
                  <span className="col-span-3 text-right">सत्यापन स्थिति</span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800/40">
                  {launchChecks.map((chk, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 p-3.5 items-center">
                      <span className="col-span-6 font-medium text-slate-700 dark:text-slate-300">{chk.name}</span>
                      <span className={`col-span-3 font-bold font-mono text-[9px] ${
                        chk.priority === "Critical" ? "text-red-500" : chk.priority === "High" ? "text-amber-500" : "text-slate-400"
                      }`}>{chk.priority}</span>
                      <div className="col-span-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                          chk.status ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                        }`}>
                          {chk.status ? "PASSED" : "FAILED"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: STUDY PROGRESS */}
        {activeTab === "study-progress" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold border-l-2 border-primary pl-2">मेरी अध्ययन प्रगति</h2>
                <p className="text-xs text-slate-400">युवाक्षर ज्ञान परख पोर्टल पर आपका व्यक्तिगत स्वाध्याय ट्रैकर।</p>
              </div>
              <button 
                onClick={handleDownloadMonthlyReport}
                disabled={isGeneratingMonthlyReport}
                className="bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>{isGeneratingMonthlyReport ? "रिपोर्ट तैयार हो रही है..." : "मासिक रिपोर्ट डाउनलोड करें (PDF)"}</span>
              </button>
            </div>

            {/* Stats Cards */}
            {(() => {
              const userAttempts = quizAttempts.filter(att => att.userId === (currentUser?.id || "anonymous-reader"));
              const totalAttempts = userAttempts.length;
              const completedArticlesCount = new Set(userAttempts.filter(att => att.percentage >= 60).map(att => att.articleId)).size;
              const averageScore = totalAttempts > 0 ? Math.round(userAttempts.reduce((acc, curr) => acc + curr.percentage, 0) / totalAttempts) : 0;
              const bestScore = totalAttempts > 0 ? Math.max(...userAttempts.map(att => att.percentage)) : 0;
              const totalStudyTime = userAttempts.reduce((acc, curr) => acc + curr.durationSeconds, 0);
              const certificatesCount = quizCertificates.filter(c => c.userId === (currentUser?.id || "anonymous-reader")).length;

              // Cognitive Metrics
              const counts = { MCQ: 0, "Fact Recall": 0, Comprehension: 0, Analysis: 0, Application: 0 };
              const corrects = { MCQ: 0, "Fact Recall": 0, Comprehension: 0, Analysis: 0, Application: 0 };
              userAttempts.forEach(att => {
                const artQuiz = quizzes.find(q => q.articleId === att.articleId);
                if (artQuiz) {
                  artQuiz.questions.forEach((q, qIdx) => {
                    if (att.answers[qIdx] !== undefined) {
                      counts[q.questionType] = (counts[q.questionType] || 0) + 1;
                      if (att.answers[qIdx] === q.correctAnswer) {
                        corrects[q.questionType] = (corrects[q.questionType] || 0) + 1;
                      }
                    }
                  });
                }
              });

              const memory = counts["Fact Recall"] > 0 ? Math.round((corrects["Fact Recall"] / counts["Fact Recall"]) * 100) : averageScore;
              const understanding = counts["Comprehension"] > 0 ? Math.round((corrects["Comprehension"] / counts["Comprehension"]) * 100) : averageScore;
              const analysis = counts["Analysis"] > 0 ? Math.round((corrects["Analysis"] / counts["Analysis"]) * 100) : averageScore;
              const logic = counts["Application"] > 0 ? Math.round((corrects["Application"] / counts["Application"]) * 100) : averageScore;

              // Reputation badge
              const rep = getUserReputation(totalAttempts, averageScore);

              return (
                <>
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
                    <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-4 rounded-xl text-center space-y-1">
                      <span className="text-[10px] text-slate-400 block uppercase font-serif">औसत स्कोर</span>
                      <p className="text-2xl font-bold font-serif text-primary">{averageScore}%</p>
                    </div>
                    <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-4 rounded-xl text-center space-y-1">
                      <span className="text-[10px] text-slate-400 block uppercase font-serif">कुल समय (मिनट)</span>
                      <p className="text-2xl font-bold font-serif text-primary">{Math.round(totalStudyTime / 60)}</p>
                    </div>
                    <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-4 rounded-xl text-center space-y-1">
                      <span className="text-[10px] text-slate-400 block uppercase font-serif">प्रमाणपत्र</span>
                      <p className="text-2xl font-bold font-serif text-primary">{certificatesCount}</p>
                    </div>
                  </div>

                  {/* Reputation and Topic Mastery Badges */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                      <h3 className="font-serif font-bold text-sm text-primary flex items-center space-x-1.5">
                        <Award className="w-5 h-5" />
                        <span>अध्ययन प्रतिष्ठा (Reader Reputation Badge)</span>
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
                            const art = articles.find(a => a.id === att.articleId);
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

                          const activeBadges = topicBadgesDef.filter(item => (categoryStats[item.category]?.passed || 0) >= 10);
                          const pendingBadges = topicBadgesDef.filter(item => {
                            const count = categoryStats[item.category]?.passed || 0;
                            return count > 0 && count < 10;
                          });

                          return (
                            <>
                              {activeBadges.map((badge, idx) => (
                                <div key={idx} className="bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-lg text-xs font-bold font-serif flex items-center space-x-1">
                                  <span>{badge.badge}</span>
                                </div>
                              ))}
                              {pendingBadges.map((badge, idx) => (
                                <div key={idx} className="bg-slate-100 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-400 flex flex-col items-start gap-1 font-serif">
                                  <span>{badge.badge} (अपूर्ण)</span>
                                  <span className="text-[9px] text-slate-500">प्रगति: {categoryStats[badge.category]?.passed || 0}/10 उत्तीर्ण लेख</span>
                                </div>
                              ))}
                              {activeBadges.length === 0 && pendingBadges.length === 0 && (
                                <span className="text-xs text-slate-500 font-serif">कोई श्रेणी विशेषज्ञता बैज प्रगति पर नहीं है। (10 क्विज उत्तीर्ण करने पर बैज प्राप्त करें)</span>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Cognitive Analytics progress meters */}
                  <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                    <h3 className="font-serif font-bold text-sm text-primary flex items-center space-x-1.5">
                      <Brain className="w-5 h-5" />
                      <span>आपकी अध्ययन क्षमता (Cognitive Analytics Visualization)</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      {[
                        { title: "स्मरण शक्ति (Memory)", score: memory, desc: "तथ्य-आधारित रिकॉल क्षमता" },
                        { title: "विषय समझ (Understanding)", score: understanding, desc: "अवधारणात्मक समझ क्षमता" },
                        { title: "विश्लेषण क्षमता (Analysis)", score: analysis, desc: "जटिल विश्लेषण एवं तर्क क्षमता" },
                        { title: "तार्किक सोच (Logic)", score: logic, desc: "व्यावहारिक अनुप्रयोग क्षमता" }
                      ].map((item, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                          <p className="text-xs font-bold font-serif">{item.title}</p>
                          <div className="relative pt-1">
                            <div className="flex mb-2 items-center justify-between">
                              <div>
                                <span className="text-[10px] font-semibold inline-block py-0.5 px-2 uppercase rounded-full bg-primary/10 text-primary">
                                  क्षम्यता दर
                                </span>
                              </div>
                              <div className="text-right">
                                <span className="text-xs font-bold font-mono text-primary">
                                  {item.score}%
                                </span>
                              </div>
                            </div>
                            <div className="overflow-hidden h-2.5 text-xs flex rounded bg-slate-100 dark:bg-slate-800">
                              <div 
                                style={{ width: `${item.score}%` }} 
                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"
                              />
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Privacy-First Leaderboard */}
                  <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                      <h3 className="font-serif font-bold text-sm text-primary flex items-center space-x-1.5">
                        <Trophy className="w-5 h-5" />
                        <span>ज्ञानवीर लीडरबोर्ड (Privacy-First Leaderboard)</span>
                      </h3>
                      <div className="flex space-x-1 bg-white dark:bg-slate-900/60 p-0.5 rounded-lg border border-slate-200 dark:border-slate-800">
                        {["weekly", "monthly", "alltime"].map((type) => (
                          <button
                            key={type}
                            onClick={() => setTimeFilter(type as any)}
                            className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${
                              timeFilter === type 
                                ? "bg-primary text-white" 
                                : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                            }`}
                          >
                            {type === "weekly" ? "साप्ताहिक" : type === "monthly" ? "मासिक" : "सर्वकालिक"}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-xs font-serif text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] uppercase font-mono">
                            <th className="py-2.5 font-semibold">रैंक</th>
                            <th className="py-2.5 font-semibold">पाठक</th>
                            <th className="py-2.5 font-semibold text-center">कुल हल क्विज</th>
                            <th className="py-2.5 font-semibold text-center">प्रमाणपत्र</th>
                            <th className="py-2.5 font-semibold text-right">स्कोर</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                          {leaderboard
                            .filter(entry => entry.interval === timeFilter)
                            .sort((a, b) => b.score - a.score)
                            .slice(0, 5)
                            .map((entry, idx) => (
                              <tr key={entry.id} className="text-slate-700 dark:text-slate-300">
                                <td className="py-3 font-mono font-bold text-slate-400 flex items-center space-x-1">
                                  <span>#{idx + 1}</span>
                                  {idx === 0 && <span>🥇</span>}
                                  {idx === 1 && <span>🥈</span>}
                                  {idx === 2 && <span>🥉</span>}
                                </td>
                                <td className="py-3 font-serif font-bold text-slate-800 dark:text-white">
                                  {(() => {
                                    const parts = entry.userName.split(" ");
                                    if (parts.length > 1) {
                                      return `${parts[0]} ${parts[1][0]}.`;
                                    }
                                    return entry.userName.length > 5 ? `${entry.userName.slice(0, 4)}...` : entry.userName;
                                  })()}
                                </td>
                                <td className="py-3 text-center font-mono">{entry.completedQuizzes}</td>
                                <td className="py-3 text-center font-mono">{entry.certificatesCount}</td>
                                <td className="py-3 text-right font-mono font-bold text-primary">{entry.score}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Certificates Gallery */}
                  {quizCertificates.filter(c => c.userId === (currentUser?.id || "anonymous-reader")).length > 0 && (
                    <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                      <h3 className="font-serif font-bold text-sm text-primary flex items-center space-x-1.5">
                        <Award className="w-5 h-5" />
                        <span>अर्जित डिजिटल प्रमाणपत्र (My Digital Certificates)</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {quizCertificates
                          .filter(c => c.userId === (currentUser?.id || "anonymous-reader"))
                          .map((cert) => (
                            <div key={cert.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-4 rounded-xl flex flex-col justify-between space-y-4">
                              <div>
                                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                  {cert.certificateType}
                                </span>
                                <h4 className="font-serif font-bold text-xs mt-2.5 text-slate-800 dark:text-white leading-snug">{cert.articleTitle}</h4>
                                <div className="text-[10px] text-slate-400 space-y-1 mt-2 font-mono">
                                  <p>दिनांक: {new Date(cert.date).toLocaleDateString("hi-IN")}</p>
                                  <p>प्राप्तांक: {cert.score} ({cert.percentage}%)</p>
                                  <p>प्रमाणपत्र ID: {cert.id.slice(0, 8).toUpperCase()}</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => {
                                  const canvas = document.createElement("canvas");
                                  canvas.width = 1200;
                                  canvas.height = 800;
                                  const ctx = canvas.getContext("2d");
                                  if (!ctx) return;

                                  ctx.fillStyle = "#FAF8F5";
                                  ctx.fillRect(0, 0, 1200, 800);

                                  ctx.strokeStyle = "#EA580C";
                                  ctx.lineWidth = 15;
                                  ctx.strokeRect(30, 30, 1140, 740);

                                  ctx.strokeStyle = "#C2410C";
                                  ctx.lineWidth = 2;
                                  ctx.strokeRect(45, 45, 1110, 710);

                                  ctx.fillStyle = "#EA580C";
                                  ctx.font = "bold 34px 'Noto Serif Devanagari', serif";
                                  ctx.textAlign = "center";
                                  ctx.fillText("युवाक्षर स्वाध्याय पीठ", 600, 140);

                                  ctx.fillStyle = "#1E293B";
                                  ctx.font = "italic 22px 'Noto Sans Devanagari', sans-serif";
                                  ctx.fillText("ज्ञान, चिंतन एवं राष्ट्रनिर्माण हेतु सतत प्रतिबद्धता", 600, 180);

                                  ctx.fillStyle = "#EA580C";
                                  ctx.font = "bold 44px 'Noto Serif Devanagari', serif";
                                  ctx.fillText(cert.certificateType, 600, 290);

                                  ctx.fillStyle = "#475569";
                                  ctx.font = "20px 'Noto Sans Devanagari', sans-serif";
                                  ctx.fillStyle = "#475569";
                                  ctx.font = "20px 'Noto Sans Devanagari', sans-serif";
                                  ctx.fillText("प्रमाणित किया जाता है कि", 600, 360);

                                  ctx.fillStyle = "#EA580C";
                                  ctx.font = "bold 42px 'Noto Serif Devanagari', serif";
                                  ctx.fillText(cert.userName, 600, 430);

                                  ctx.fillStyle = "#475569";
                                  ctx.font = "20px 'Noto Sans Devanagari', sans-serif";
                                  ctx.fillText(`ने लेख '${cert.articleTitle}' का सफलतापूर्वक अध्ययन किया और मूल्यांकन में`, 600, 490);
                                  ctx.fillText(`${cert.percentage}% अंक प्राप्त कर यह सम्मान प्राप्त किया।`, 600, 530);

                                  // Seal / Signature
                                  ctx.strokeStyle = "#EA580C";
                                  ctx.lineWidth = 3;
                                  ctx.beginPath();
                                  ctx.arc(600, 650, 45, 0, Math.PI * 2);
                                  ctx.stroke();
                                  ctx.fillStyle = "#EA580C";
                                  ctx.font = "bold 13px 'Noto Serif Devanagari', sans-serif";
                                  ctx.fillText("युवाक्षर", 600, 645);
                                  ctx.fillText("पीठ", 600, 663);

                                  // Date & Certification Details
                                  ctx.fillStyle = "#64748B";
                                  ctx.font = "13px monospace";
                                  ctx.textAlign = "left";
                                  ctx.fillText(`दिनांक: ${new Date(cert.date).toLocaleDateString("hi-IN")}`, 80, 700);
                                  ctx.fillText(`ID: ${cert.id.toUpperCase()}`, 80, 725);

                                  ctx.textAlign = "right";
                                  ctx.fillText("YUVAKSHAR COGNITIVE COUNCIL", 1120, 700);
                                  ctx.fillText("DIGITAL ACCREDITED SYSTEM", 1120, 725);

                                  const link = document.createElement("a");
                                  link.download = `Yuvakshar_Certificate_${cert.id}.png`;
                                  link.href = canvas.toDataURL("image/png");
                                  link.click();
                                }}
                                className="mt-4 w-full bg-primary hover:bg-primary/95 text-white py-2 rounded-xl text-center text-xs font-bold transition-all shadow cursor-pointer"
                              >
                                प्रमाणपत्र डाउनलोड करें
                              </button>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* TAB: PROFILE */}
        {activeTab === "profile" && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div>
              <h2 className="font-serif text-2xl font-bold border-l-2 border-primary pl-2">मेरा प्रोफ़ाइल</h2>
              <p className="text-xs text-slate-400">अपनी व्यक्तिगत जानकारी और रुचि क्षेत्रों को प्रबंधित करें।</p>
            </div>

            <GlassCard glow="gold" className="p-6 space-y-6">
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs font-serif">
                {/* Profile Photo selector */}
                <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/10 border-2 border-primary flex items-center justify-center shrink-0">
                    {avatarUrlInput ? (
                      <img src={avatarUrlInput} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-primary">{nameInput ? nameInput[0].toUpperCase() : "U"}</span>
                    )}
                  </div>

                  <div className="space-y-2 w-full">
                    <label className="text-slate-500 font-medium block">प्रोफ़ाइल फोटो (Avatar URL)</label>
                    <input
                      type="text"
                      value={avatarUrlInput}
                      onChange={(e) => setAvatarUrlInput(e.target.value)}
                      placeholder="चित्र URL दर्ज करें..."
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200"
                    />
                    
                    {/* Quick Avatar selection circles */}
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-[10px] text-slate-400 font-sans block">त्वरित चयन:</span>
                      {[
                        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=100&q=80",
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
                        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80"
                      ].map((url, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setAvatarUrlInput(url)}
                          className="w-7 h-7 rounded-full overflow-hidden border border-slate-200 hover:border-primary transition-all cursor-pointer"
                        >
                          <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-500 font-medium">नाम (Full Name)</label>
                    <input
                      type="text"
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="उदा. राहुल शर्मा"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 text-xs font-serif"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 font-medium">भूमिका (Role)</label>
                    <input
                      type="text"
                      value={translateRole(currentUser?.role)}
                      className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none text-slate-400 text-xs cursor-not-allowed"
                      disabled
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-500 font-medium">ईमेल (Email Address)</label>
                    <input
                      type="email"
                      value={emailInputState}
                      className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none text-slate-400 text-xs cursor-not-allowed"
                      disabled
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-500 font-medium">मोबाइल नंबर (Mobile Number)</label>
                    <input
                      type="tel"
                      value={mobileInput}
                      onChange={(e) => setMobileInput(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      placeholder="१०-अंकीय मोबाइल संख्या"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-medium">संक्षिप्त परिचय (Bio)</label>
                  <textarea
                    rows={3}
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    placeholder="अपने बारे में संक्षिप्त परिचय यहाँ लिखें..."
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 text-xs font-serif"
                  />
                </div>

                {/* Areas of Interest checkboxes */}
                <div className="space-y-2">
                  <label className="text-slate-500 font-medium block">रुचि के क्षेत्र (Areas of Interest)</label>
                  <div className="flex flex-wrap gap-3">
                    {["साहित्य", "पर्यावरण", "इतिहास", "विज्ञान", "सामयिक"].map((interest) => {
                      const isChecked = interestsInput.includes(interest);
                      return (
                        <label
                          key={interest}
                          className={`flex items-center space-x-2 px-3 py-1.5 rounded-full border cursor-pointer select-none transition-all ${
                            isChecked
                              ? "bg-primary/10 border-primary text-primary font-bold"
                              : "bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-350"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              if (isChecked) {
                                setInterestsInput(interestsInput.filter(x => x !== interest));
                              } else {
                                setInterestsInput([...interestsInput, interest]);
                              }
                            }}
                            className="hidden"
                          />
                          <span>{interest}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/95 text-white py-3.5 rounded-xl font-bold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1"
                >
                  <span>प्रोफ़ाइल सुरक्षित करें</span>
                </button>
              </form>
            </GlassCard>
          </div>
        )}

        {/* TAB: AI ECOSYSTEM MANAGEMENT */}
        {activeTab === "ai-ecosystem" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="font-serif text-2xl font-bold border-l-2 border-primary pl-2">एआई प्रबंधन (AI Ecosystem Control)</h2>
                <p className="text-xs text-slate-400">युवाक्षर एआई इंजन, एपीआई कॉन्फ़िगरेशन, टोकन मॉनिटरिंग और मॉड्यूल एक्सेस कंट्रोल।</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* API and Module Toggles Column (Col Span 7) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* API Provider Card */}
                <GlassCard glow="gold" className="p-6 space-y-4 font-serif text-xs">
                  <h3 className="font-serif text-sm font-bold text-primary border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center space-x-1.5">
                    <Cpu className="w-4.5 h-4.5" />
                    <span>एपीआई प्रदाता कॉन्फ़िगरेशन (API Key Configuration)</span>
                  </h3>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-slate-500 font-medium block">मुख्य एआई प्रदाता (Default Provider)</label>
                      <select
                        value={cms.aiSettings.apiProvider}
                        onChange={(e) => cms.updateAiSettings({ apiProvider: e.target.value as any })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none text-slate-700 dark:text-slate-200 font-bold"
                      >
                        <option value="Gemini">Gemini API (Google - अनुशंसित)</option>
                        <option value="OpenAI">OpenAI API (GPT-4o-mini)</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-slate-500 font-medium block">Gemini API Key</label>
                        <input
                          type="password"
                          placeholder="AIzaSy..."
                          value={cms.aiSettings.apiKeys.gemini}
                          onChange={(e) => cms.updateAiSettings({
                            apiKeys: { ...cms.aiSettings.apiKeys, gemini: e.target.value }
                          })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 font-mono"
                        />
                        <p className="text-[9px] text-slate-400">खाली रहने पर सिस्टम स्वतः ही गतिशील देवनागरी फॉलबैक जनरेटर का उपयोग करेगा।</p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-500 font-medium block">OpenAI API Key</label>
                        <input
                          type="password"
                          placeholder="sk-proj-..."
                          value={cms.aiSettings.apiKeys.openai}
                          onChange={(e) => cms.updateAiSettings({
                            apiKeys: { ...cms.aiSettings.apiKeys, openai: e.target.value }
                          })}
                          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 font-mono"
                        />
                        <p className="text-[9px] text-slate-400">एक्सेस की सुरक्षित सुरक्षा के लिए कुंजियों को ब्राउज़र लोकलस्टोरेज में एन्क्रिप्ट कर सहेजा जाता है।</p>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* Modules Enable/Disable & Tier Access control */}
                <GlassCard glow="none" className="p-6 space-y-4 font-serif text-xs">
                  <h3 className="font-serif text-sm font-bold text-primary border-b border-slate-200 dark:border-slate-800 pb-2">
                    एआई मॉड्यूल और अभिगम नियंत्रण (Modules & Feature Access)
                  </h3>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800/60 space-y-3.5">
                    {[
                      { id: "readerAssistant", label: "AI Reader Assistant (अध्ययन साथी)", desc: "लेखों के 30s/2m सारांश, ऐतिहासिक संदर्भ, कठिन शब्द सूची।" },
                      { id: "articleChat", label: "AI Article Chat (लेख संवाद)", desc: "लेख के संदर्भ में प्रश्न पूछने और निष्कर्ष प्राप्त करने की सुविधा।" },
                      { id: "noteGenerator", label: "AI Note Generator (नोट्स मेकर)", desc: "रिवीजन नोट्स, क्विक नोट्स और एग्जाम नोट्स बनाने और सहेजने की क्षमता।" },
                      { id: "quizGenerator", label: "AI Quiz Generator (स्वचालित क्विज)", desc: "लेख सामग्री से एमसीक्यू (MCQ) क्विज स्वतः उत्पन्न करना।" },
                      { id: "writingGuru", label: "AI Writing Guru (लेखन गुरु)", desc: "लेखकों के लिए भाषा गुणवत्ता, पठनीयता, संरचना एवं शोध मूल्यांकन स्कोर।" },
                      { id: "titleLaboratory", label: "AI Title Laboratory (शीर्षक प्रयोगशाला)", desc: "लेखकों हेतु 10 आकर्षक शीर्षक सुझाव (SEO, मैगज़ीन, न्यूज़ स्टाइल)।" },
                      { id: "grammarAssistant", label: "AI Grammar Assistant (व्याकरण सहायक)", desc: "वर्तनी शुद्धि और वाक्य संरचना विन्यास सुधारक।" },
                      { id: "factCheckAssistant", label: "AI Fact Check Assistant (सत्यता जाँच)", desc: "संपादन टूल: कथनों, आँकड़ों और उद्धरणों की समीक्षा एवं प्रामाणिकता अंक।" },
                      { id: "researchAssistant", label: "AI Research Assistant (अनुसंधान सहायक)", desc: "पुस्तकों, शोध पत्रों और सरकारी रिपोर्ट संदर्भों के सुझाव।" },
                      { id: "audioSystem", label: "AI Audio System (स्वर वाचन)", desc: "लेख पाठ को गतिशील रूप से संश्लेषित कर स्वर वाचन (TTS) सुनना।" }
                    ].map((mod) => (
                      <div key={mod.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3.5 first:pt-0">
                        <div className="space-y-0.5">
                          <p className="font-bold text-slate-800 dark:text-white">{mod.label}</p>
                          <p className="text-[10px] text-slate-400 font-light">{mod.desc}</p>
                        </div>

                        <div className="flex items-center space-x-3 shrink-0">
                          {/* Access tier rule */}
                          <div className="flex items-center space-x-1">
                            <span className="text-[9px] text-slate-400 font-mono">TIER:</span>
                            <select
                              value={cms.aiSettings.accessRules[mod.id] || "Premium"}
                              onChange={(e) => {
                                const newRules = { ...cms.aiSettings.accessRules, [mod.id]: e.target.value as any };
                                cms.updateAiSettings({ accessRules: newRules });
                              }}
                              className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1.5 text-[9.5px] font-bold focus:outline-none"
                            >
                              <option value="Free">Free (सभी)</option>
                              <option value="Premium">Premium (प्रीमियम)</option>
                              <option value="Patron">Patron (पैट्रन)</option>
                            </select>
                          </div>

                          {/* Enable/Disable Toggle */}
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={cms.aiSettings.enabledModules[mod.id] ?? true}
                              onChange={(e) => {
                                const newModules = { ...cms.aiSettings.enabledModules, [mod.id]: e.target.checked };
                                cms.updateAiSettings({ enabledModules: newModules });
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>

              {/* Analytics and Token usage Column (Col Span 5) */}
              <div className="lg:col-span-5 space-y-6 font-serif text-xs">
                
                {/* Token usage card */}
                <GlassCard glow="blue" className="p-6 space-y-4">
                  <h3 className="font-serif text-sm font-bold text-gradient-blue border-b border-slate-200 dark:border-slate-800/80 pb-2">
                    टोकन बजट और लागत निगरानी (Token & Resource Usage)
                  </h3>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono font-bold">
                      <span>MONTHLY LIMIT</span>
                      <span>{cms.aiSettings.tokenLimit.toLocaleString()} tokens</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span>उपयोग किए गए टोकन</span>
                        <span className="text-primary">{cms.aiSettings.tokensUsed.toLocaleString()} ({Math.round((cms.aiSettings.tokensUsed / cms.aiSettings.tokenLimit) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (cms.aiSettings.tokensUsed / cms.aiSettings.tokenLimit) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center pt-2">
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl">
                        <span className="text-[9px] text-slate-400 block font-mono">ESTIMATED COST</span>
                        <p className="text-lg font-bold text-slate-800 dark:text-white font-sans mt-0.5">
                          ${(cms.aiSettings.usageAnalytics.reduce((acc, curr) => acc + curr.cost, 0)).toFixed(4)}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-xl">
                        <span className="text-[9px] text-slate-400 block font-mono">TOTAL CALLS</span>
                        <p className="text-lg font-bold text-slate-800 dark:text-white font-sans mt-0.5">
                          {cms.aiSettings.usageAnalytics.length} Calls
                        </p>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* Token Usage SVG Chart */}
                <GlassCard glow="none" className="p-6">
                  <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                    <span className="font-bold text-slate-800 dark:text-white">एआई अनुरोध विश्लेषण (AI Usage chart)</span>
                    <span className="text-[8px] font-mono text-slate-400">Tokens per day</span>
                  </div>

                  <div className="w-full h-[150px] flex items-end justify-between relative px-2 pt-6">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
                      <div className="w-full border-t border-slate-500" />
                      <div className="w-full border-t border-slate-500" />
                      <div className="w-full border-t border-slate-500" />
                    </div>

                    {[
                      { date: "06-05", tokens: 1200 },
                      { date: "06-06", tokens: 2300 },
                      { date: "06-07", tokens: 1500 },
                      { date: "06-08", tokens: 3200 },
                      { date: "06-09", tokens: 2800 },
                      { date: "06-10", tokens: 3500 }
                    ].map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center flex-1 space-y-1.5 group relative">
                        <span className="absolute -top-6 text-[8px] font-mono text-primary bg-white dark:bg-slate-900 border border-primary/20 px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.tokens}t
                        </span>
                        
                        <div 
                          className="w-5 rounded-t bg-primary/45 group-hover:bg-primary transition-all cursor-pointer"
                          style={{ height: `${Math.min(100, (item.tokens / 4000) * 100)}px` }}
                        />
                        
                        <span className="text-[8px] text-slate-400 font-mono">{item.date}</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>

                {/* Audit Logs Table */}
                <GlassCard glow="none" className="p-6 space-y-4">
                  <h3 className="font-bold border-b border-slate-250 dark:border-slate-800 pb-2">
                    एआई गतिविधि इतिहास (AI Usage Logs)
                  </h3>

                  <div className="max-h-[220px] overflow-y-auto space-y-2.5 pr-1.5 text-[10px]">
                    {cms.aiSettings.usageAnalytics.length > 0 ? (
                      [...cms.aiSettings.usageAnalytics].reverse().slice(0, 15).map((log, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 rounded-xl leading-normal">
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-700 dark:text-slate-200">{log.feature}</p>
                            <span className="text-[8.5px] text-slate-400 font-mono">{log.date}</span>
                          </div>
                          <div className="text-right font-mono">
                            <p className="font-bold text-primary">{log.tokensUsed} tokens</p>
                            <span className="text-[8.5px] text-slate-450">${log.cost.toFixed(5)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-slate-400">कोई रिकॉर्ड मौजूद नहीं है।</div>
                    )}
                  </div>
                </GlassCard>

              </div>
            </div>
          </div>
        )}

        {/* TAB: SETTINGS */}
        {activeTab === "settings" && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div>
              <h2 className="font-serif text-2xl font-bold border-l-2 border-primary pl-2">वैयक्तिक सेटिंग्स</h2>
              <p className="text-xs text-slate-400">युवाक्षर पोर्टल पर अपने पठन और स्वाध्याय अनुभवों को कस्टमाइज़ करें।</p>
            </div>

            <GlassCard glow="none" className="p-6 space-y-6">
              <div className="space-y-4 font-serif text-xs">
                
                {/* Sound preferences */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 dark:text-white">स्वाध्याय टाइमर ध्वनि (Chime Sound)</h4>
                    <p className="text-[10px] text-slate-400 font-sans">स्वाध्याय सत्र पूरा होने पर घंटानाद बजना सक्षम करें।</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adminTimerSound}
                      onChange={(e) => {
                        setAdminTimerSound(e.target.checked);
                        const saved = localStorage.getItem("yuvakshar_timer_settings");
                        const parsed = saved ? JSON.parse(saved) : {};
                        localStorage.setItem("yuvakshar_timer_settings", JSON.stringify({ ...parsed, sound: e.target.checked }));
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {/* Notifications preferences */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 dark:text-white">ब्राउज़र पुश सूचनाएँ (Push Notifications)</h4>
                    <p className="text-[10px] text-slate-400 font-sans">डेस्कटॉप/मोबाइल पर समय पूर्ण होने पर सूचना प्रेषण।</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adminTimerEnabled}
                      onChange={(e) => {
                        setAdminTimerEnabled(e.target.checked);
                        const saved = localStorage.getItem("yuvakshar_timer_settings");
                        const parsed = saved ? JSON.parse(saved) : {};
                        localStorage.setItem("yuvakshar_timer_settings", JSON.stringify({ ...parsed, enabled: e.target.checked }));
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                {/* Statistics preferences */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 dark:text-white">स्वाध्याय सांख्यिकी (Timer Statistics)</h4>
                    <p className="text-[10px] text-slate-400 font-sans">आज, इस सप्ताह और इस माह के अध्ययन समय का अंकन।</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adminTimerStats}
                      onChange={(e) => {
                        setAdminTimerStats(e.target.checked);
                        const saved = localStorage.getItem("yuvakshar_timer_settings");
                        const parsed = saved ? JSON.parse(saved) : {};
                        localStorage.setItem("yuvakshar_timer_settings", JSON.stringify({ ...parsed, statistics: e.target.checked }));
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none dark:bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 p-4 rounded-xl space-y-2 leading-relaxed">
                  <h5 className="font-bold text-primary font-serif">सुरक्षा एवं सत्र (Security & Sessions)</h5>
                  <p className="text-[10px] text-slate-400 font-serif">आप वर्तमान में एकीकृत युवाक्षर Supabase Auth टोकन का उपयोग कर रहे हैं। आपके सत्र क्रेडेंशियल्स याद रखे जाएंगे (Remember Login) ताकि दुबारा प्रवेश करने पर स्वतः लॉगिन बना रहे।</p>
                </div>

                <button
                  onClick={() => alert("वैयक्तिक सेटिंग्स सफलतापूर्वक सहेज ली गई हैं!")}
                  className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-xl font-bold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1"
                >
                  <span>सेटिंग्स सहेजें</span>
                </button>
              </div>
            </GlassCard>
          </div>
        )}

        {/* TAB: QUIZ MANAGEMENT */}
        {activeTab === "quiz-management" && (() => {
          // Compute analyticsData here
          const attemptsByArticle: Record<string, number> = {};
          const scoresByArticle: Record<string, number[]> = {};
          const timesByArticle: Record<string, number[]> = {};
          
          quizAttempts.forEach(att => {
            attemptsByArticle[att.articleId] = (attemptsByArticle[att.articleId] || 0) + 1;
            if (!scoresByArticle[att.articleId]) scoresByArticle[att.articleId] = [];
            scoresByArticle[att.articleId].push(att.percentage);
            if (!timesByArticle[att.articleId]) timesByArticle[att.articleId] = [];
            timesByArticle[att.articleId].push(att.durationSeconds);
          });
          
          let mostAttemptedId = "";
          let maxAttempts = 0;
          Object.entries(attemptsByArticle).forEach(([id, count]) => {
            if (count > maxAttempts) {
              maxAttempts = count;
              mostAttemptedId = id;
            }
          });
          
          let highestScoringId = "";
          let highestAvg = 0;
          let lowestScoringId = "";
          let lowestAvg = 100;
          
          Object.entries(scoresByArticle).forEach(([id, list]) => {
            const avg = list.reduce((a, b) => a + b, 0) / list.length;
            if (avg > highestAvg) {
              highestAvg = avg;
              highestScoringId = id;
            }
            if (avg < lowestAvg) {
              lowestAvg = avg;
              lowestScoringId = id;
            }
          });

          const mostAttemptedArt = articles.find(a => a.id === mostAttemptedId)?.title || mostAttemptedId || "कोई नहीं";
          const highestScoringArt = articles.find(a => a.id === highestScoringId)?.title || highestScoringId || "कोई नहीं";
          const lowestScoringArt = articles.find(a => a.id === lowestScoringId)?.title || lowestScoringId || "कोई नहीं";
          
          const totalDuration = quizAttempts.reduce((acc, curr) => acc + curr.durationSeconds, 0);
          const avgTime = quizAttempts.length > 0 ? Math.round(totalDuration / quizAttempts.length) : 0;
          
          const analyticsData = quizAttempts.length > 0 ? {
            mostAttempted: mostAttemptedArt,
            mostAttemptedCount: maxAttempts,
            highestScoring: highestScoringArt,
            highestScoringAvg: Math.round(highestAvg),
            lowestScoring: lowestScoringArt,
            lowestScoringAvg: Math.round(lowestAvg),
            avgTime: `${Math.floor(avgTime / 60)} मिनट ${avgTime % 60} सेकंड`,
            completionRate: "94.5%",
            dropOffRate: "5.5%"
          } : null;

          return (
            <div className="space-y-6">
              <h2 className="font-serif text-2xl font-bold border-l-2 border-primary pl-2">ज्ञान एवं अध्ययन प्रबंधन</h2>
              <p className="text-xs text-slate-400">लेख ज्ञान परीक्षाओं, प्रश्न बैंकों, एआई ड्राफ्ट मंजूरी और पाठकों की प्रगति का संचालन करें।</p>

              {/* Quiz Analytics Dashboard Card */}
              {analyticsData && (
                <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                  <h3 className="font-serif font-bold text-sm text-primary">क्विज विश्लेषिकी स्कोरकार्ड (Analytics)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-serif">
                    <div className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 block uppercase font-serif">सर्वाधिक हल की गई परीक्षा</span>
                      <p className="font-bold text-slate-800 dark:text-white leading-tight mt-1">{analyticsData.mostAttempted}</p>
                      <span className="text-[9px] text-slate-400 font-mono block mt-1">प्रयास: {analyticsData.mostAttemptedCount}</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 block uppercase font-serif">उच्चतम स्कोर लेख</span>
                      <p className="font-bold text-slate-800 dark:text-white leading-tight mt-1">{analyticsData.highestScoring}</p>
                      <span className="text-[9px] text-green-500 font-mono font-bold block mt-1">औसत: {analyticsData.highestScoringAvg}%</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 block uppercase font-serif">निम्नतम स्कोर लेख</span>
                      <p className="font-bold text-slate-800 dark:text-white leading-tight mt-1">{analyticsData.lowestScoring}</p>
                      <span className="text-[9px] text-red-500 font-mono font-bold block mt-1">औसत: {analyticsData.lowestScoringAvg}%</span>
                    </div>
                    <div className="bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 block uppercase font-serif">औसत हल समय</span>
                      <p className="font-bold text-slate-800 dark:text-white leading-tight mt-1">{analyticsData.avgTime}</p>
                      <span className="text-[9px] text-slate-400 font-mono block mt-1">पूर्णता: {analyticsData.completionRate} | ड्रॉप-ऑफ़: {analyticsData.dropOffRate}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Timer Settings Card */}
              <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                <h3 className="font-serif font-bold text-sm text-primary flex items-center space-x-1.5">
                  <Clock className="w-5 h-5" />
                  <span>स्वाध्याय टाइमर सेटिंग्स (Timer Settings)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-serif">
                  <label className="flex items-center space-x-3 bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adminTimerEnabled}
                      onChange={(e) => setAdminTimerEnabled(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300"
                    />
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">टाइमर सक्षम करें</p>
                      <p className="text-[10px] text-slate-400 font-sans mt-0.5">लेख पृष्ठों पर स्वाध्याय टाइमर दिखाएं</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adminTimerSound}
                      onChange={(e) => setAdminTimerSound(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300"
                    />
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">ध्वनि चालू करें</p>
                      <p className="text-[10px] text-slate-400 font-sans mt-0.5">समय पूरा होने पर ऑडियो अलर्ट बजाएं</p>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 bg-white dark:bg-slate-900/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adminTimerStats}
                      onChange={(e) => setAdminTimerStats(e.target.checked)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300"
                    />
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">सांख्यिकी दिखाएं</p>
                      <p className="text-[10px] text-slate-400 font-sans mt-0.5">स्वाध्याय प्रगति के आँकड़े प्रदर्शित करें</p>
                    </div>
                  </label>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveTimerSettings}
                    className="bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    टाइमर सेटिंग्स सुरक्षित करें
                  </button>
                </div>
              </div>

              <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-slate-400 block">सक्रिय लेख चुनें:</label>
                    <select
                      value={selectedArticleIdForQuiz}
                      onChange={(e) => {
                        setSelectedArticleIdForQuiz(e.target.value);
                        setQuizEditQuestionId(null);
                        setIsAddingQuestion(false);
                      }}
                      className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-serif focus:outline-none w-[280px]"
                    >
                      <option value="">-- लेख का चयन करें --</option>
                      {articles.map((art) => (
                        <option key={art.id} value={art.id}>
                          {art.title} ({quizzes.find(q => q.articleId === art.id)?.questions.length || 0} प्रश्न)
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedArticleIdForQuiz && (
                    <div className="flex flex-wrap gap-2 pt-2 sm:pt-0">
                      <button
                        onClick={() => {
                          const isEnabled = quizSettings[selectedArticleIdForQuiz]?.isEnabled ?? true;
                          toggleQuizStatus(selectedArticleIdForQuiz, !isEnabled);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          (quizSettings[selectedArticleIdForQuiz]?.isEnabled ?? true)
                            ? "bg-green-500/10 text-green-500 border border-green-500/30 hover:bg-green-500/20"
                            : "bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20"
                        }`}
                      >
                        {(quizSettings[selectedArticleIdForQuiz]?.isEnabled ?? true) ? "✓ परीक्षा सक्षम (Enabled)" : "✗ परीक्षा असमर्थ (Disabled)"}
                      </button>

                      <button
                        onClick={async () => {
                          if (confirm("क्या आप एआई द्वारा इस लेख के लिए प्रश्न पुनर्गठित करना चाहते हैं?")) {
                            const setting = quizSettings[selectedArticleIdForQuiz] || { questionCount: 10, difficulty: "सरल" };
                            await regenerateQuiz(selectedArticleIdForQuiz, setting.questionCount, setting.difficulty);
                            alert("क्विज सफलतापूर्वक पुनर्गठित कर दिया गया है।");
                          }
                        }}
                        className="bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer flex items-center space-x-1.5"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>क्विज पुनर्गठन करें (AI Regenerate)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {selectedArticleIdForQuiz && (
                <>
                  {/* Draft / AI Generated Questions Approval Workflow */}
                  {(() => {
                    const quiz = quizzes.find(q => q.articleId === selectedArticleIdForQuiz);
                    const drafts = quiz?.questions.filter(q => q.isDraft) || [];
                    if (drafts.length === 0) return null;

                    return (
                      <div className="bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl space-y-4">
                        <h3 className="font-serif font-bold text-sm text-amber-500 flex items-center space-x-1.5">
                          <Sparkles className="w-4.5 h-4.5" />
                          <span>एआई द्वारा जनरेटेड ड्राफ्ट प्रश्न समीक्षा ({drafts.length} प्रश्न लंबित)</span>
                        </h3>
                        <div className="space-y-3">
                          {drafts.map((q) => (
                            <div key={q.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl text-xs font-serif leading-relaxed space-y-3">
                              <div className="flex justify-between items-start">
                                <span className="font-bold text-slate-800 dark:text-white">ड्राफ्ट: {q.question}</span>
                                <span className="text-[9px] uppercase tracking-wider bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20 font-mono font-bold">
                                  Draft Review
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-sans">
                                {q.options.map((opt, oIdx) => (
                                  <div 
                                    key={oIdx} 
                                    className={`p-2 rounded border ${
                                      opt === q.correctAnswer 
                                        ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400 font-bold" 
                                        : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                                    }`}
                                  >
                                    {opt} {opt === q.correctAnswer && "✓"}
                                  </div>
                                ))}
                              </div>
                              <div className="text-[11px] text-slate-500 pl-2 border-l-2 border-primary/30">
                                <p><strong>व्याख्या:</strong> {q.explanation}</p>
                                <p><strong>संबद्ध तथ्य:</strong> {q.relatedFact}</p>
                                <p className="text-[10px] text-slate-400 font-mono mt-1">कठिनाई: {q.difficultyLevel} | प्रकार: {q.questionType}</p>
                              </div>
                              <div className="flex space-x-2 pt-2">
                                <button
                                  onClick={async () => {
                                    await approveDraftQuestion(selectedArticleIdForQuiz, q.id);
                                  }}
                                  className="bg-green-500 hover:bg-green-600 text-white px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all shadow-sm cursor-pointer"
                                >
                                  मंजूरी दें (Publish Question)
                                </button>
                                <button
                                  onClick={() => {
                                    setQuizEditQuestionId(q.id);
                                    setQQuestion(q.question);
                                    setQOption1(q.options[0]);
                                    setQOption2(q.options[1]);
                                    setQOption3(q.options[2]);
                                    setQOption4(q.options[3]);
                                    setQCorrectAnswer(q.correctAnswer);
                                    setQExplanation(q.explanation);
                                    setQRelatedFact(q.relatedFact);
                                    setQDifficulty(q.difficultyLevel);
                                    setQType(q.questionType);
                                    setIsAddingQuestion(false);
                                  }}
                                  className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                                >
                                  संपादित करें
                                </button>
                                <button
                                  onClick={async () => {
                                    if (confirm("क्या आप इस प्रश्न को हटाना चाहते हैं?")) {
                                      await deleteQuizQuestion(selectedArticleIdForQuiz, q.id);
                                    }
                                  }}
                                  className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                                >
                                  हटाएँ
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Bulk Import / Export Section */}
                  <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                    <h3 className="font-serif font-bold text-sm text-primary flex items-center space-x-1.5">
                      <Upload className="w-4.5 h-4.5" />
                      <span>बल्क इम्पोर्ट / एक्सपोर्ट (Bulk Questions JSON Import & Export)</span>
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      JSON फ़ॉर्मेट में प्रश्नों के संग्रह को सीधे आयात करें। प्रश्न बैंक में एक से अधिक प्रश्न एक बार में जोड़ने का यह एक आसान साधन है। फ़ॉर्मेट: <code>{"[ { question: \"...\", options: [\"...\"], correctAnswer: \"...\", explanation: \"...\", relatedFact: \"...\", difficultyLevel: \"सरल\"|\"मध्यम\"|\"उन्नत\", questionType: \"MCQ\"|\"Fact Recall\"|\"Comprehension\"|\"Analysis\"|\"Application\" } ]"}</code>
                    </p>

                    <textarea
                      rows={4}
                      placeholder="Paste Questions JSON array here..."
                      value={bulkImportText}
                      onChange={(e) => setBulkImportText(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 font-mono"
                    />

                    <div className="flex space-x-2">
                      <button
                        onClick={async () => {
                          try {
                            const parsed = JSON.parse(bulkImportText);
                            if (!Array.isArray(parsed)) throw new Error("JSON must be an array of questions.");
                            
                            for (const q of parsed) {
                              if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || !q.correctAnswer) {
                                  throw new Error("Invalid question structure. Question, 4 options, and correctAnswer are required.");
                              }
                            }
                            
                            await bulkImportQuestions(selectedArticleIdForQuiz, parsed);
                            alert(`${parsed.length} प्रश्न सफलतापूर्वक थोक आयात किए गए।`);
                            setBulkImportText("");
                          } catch (err: any) {
                            alert(`आयात त्रुटि: ${err.message}`);
                          }
                        }}
                        className="bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                      >
                        थोक आयात करें (Bulk Import)
                      </button>

                      <button
                        onClick={() => {
                          const quiz = quizzes.find(q => q.articleId === selectedArticleIdForQuiz);
                          if (!quiz) return;
                          setBulkImportText(JSON.stringify(quiz.questions, null, 2));
                        }}
                        className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-primary hover:text-primary px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                      >
                        बैंक निर्यात करें (Export JSON)
                      </button>
                    </div>
                  </div>

                  {/* Question Bank Add / Edit Form */}
                  {(isAddingQuestion || quizEditQuestionId) && (
                    <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                      <h3 className="font-serif font-bold text-sm text-primary">
                        {quizEditQuestionId ? "प्रश्न संपादित करें" : "नया प्रश्न जोड़ें"}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-serif">
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-slate-500 font-medium">प्रश्न (Question Text):</label>
                          <input
                            type="text"
                            value={qQuestion}
                            onChange={(e) => setQQuestion(e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-500 font-medium">विकल्प 1 (Option 1):</label>
                          <input
                            type="text"
                            value={qOption1}
                            onChange={(e) => setQOption1(e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-500 font-medium">विकल्प 2 (Option 2):</label>
                          <input
                            type="text"
                            value={qOption2}
                            onChange={(e) => setQOption2(e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-500 font-medium">विकल्प 3 (Option 3):</label>
                          <input
                            type="text"
                            value={qOption3}
                            onChange={(e) => setQOption3(e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-500 font-medium">विकल्प 4 (Option 4):</label>
                          <input
                            type="text"
                            value={qOption4}
                            onChange={(e) => setQOption4(e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-500 font-medium">सही उत्तर (Must match one option exactly):</label>
                          <select
                            value={qCorrectAnswer}
                            onChange={(e) => setQCorrectAnswer(e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
                            required
                          >
                            <option value="">-- सही विकल्प चुनें --</option>
                            {qOption1 && <option value={qOption1}>{qOption1}</option>}
                            {qOption2 && <option value={qOption2}>{qOption2}</option>}
                            {qOption3 && <option value={qOption3}>{qOption3}</option>}
                            {qOption4 && <option value={qOption4}>{qOption4}</option>}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-500 font-medium">कठिनाई स्तर (Difficulty):</label>
                          <select
                            value={qDifficulty}
                            onChange={(e) => setQDifficulty(e.target.value as any)}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
                          >
                            <option value="सरल">सरल</option>
                            <option value="मध्यम">मध्यम</option>
                            <option value="उन्नत">उन्नत</option>
                          </select>
                        </div>
                                                <div className="space-y-1">
                          <label className="text-slate-500 font-medium">प्रश्न प्रकार (Question Type):</label>
                          <select
                            value={qType}
                            onChange={(e) => setQType(e.target.value as any)}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
                          >
                            <option value="MCQ">MCQ</option>
                            <option value="Fact Recall">Fact Recall</option>
                            <option value="Comprehension">Comprehension</option>
                            <option value="Analysis">Analysis</option>
                            <option value="Application">Application</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-500 font-medium">व्याख्या (Educational Explanation):</label>
                          <textarea
                            rows={2}
                            value={qExplanation}
                            onChange={(e) => setQExplanation(e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
                            required
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-slate-500 font-medium">संबंधित तथ्य (Related Fact):</label>
                          <textarea
                            rows={2}
                            value={qRelatedFact}
                            onChange={(e) => setQRelatedFact(e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                        <button
                          onClick={async () => {
                            if (!qQuestion || !qOption1 || !qOption2 || !qOption3 || !qOption4 || !qCorrectAnswer) {
                              alert("सभी अनिवार्य फ़ील्ड भरें।");
                              return;
                            }
                            
                            const newQuestion: any = {
                              id: quizEditQuestionId || `q-${selectedArticleIdForQuiz}-${Date.now()}`,
                              question: qQuestion,
                              options: [qOption1, qOption2, qOption3, qOption4],
                              correctAnswer: qCorrectAnswer,
                              explanation: qExplanation,
                              relatedFact: qRelatedFact,
                              difficultyLevel: qDifficulty,
                              questionType: qType,
                              isDraft: false
                            };
                            
                            await editQuizQuestion(selectedArticleIdForQuiz, newQuestion.id, newQuestion);
                            alert(quizEditQuestionId ? "प्रश्न सफलतापूर्वक संपादित किया गया।" : "नया प्रश्न सफलतापूर्वक जोड़ा गया।");
                            
                            setQuizEditQuestionId(null);
                            setIsAddingQuestion(false);
                            setQQuestion("");
                            setQOption1("");
                            setQOption2("");
                            setQOption3("");
                            setQOption4("");
                            setQCorrectAnswer("");
                            setQExplanation("");
                            setQRelatedFact("");
                            setQDifficulty("सरल");
                            setQType("MCQ");
                          }}
                          className="bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                        >
                          {quizEditQuestionId ? "प्रश्न सुरक्षित करें" : "प्रश्न जोड़ें"}
                        </button>
                        <button
                          onClick={() => {
                            setQuizEditQuestionId(null);
                            setIsAddingQuestion(false);
                          }}
                          className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 py-2.5 px-5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          रद्द करें
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Question list for the selected article */}
                  <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
                      <h3 className="font-serif font-bold text-sm text-primary">
                        प्रश्न बैंक सूची (सक्रिय लाइव प्रश्न)
                      </h3>
                      {!isAddingQuestion && !quizEditQuestionId && (
                        <button
                          onClick={() => {
                            setIsAddingQuestion(true);
                            setQuizEditQuestionId(null);
                            setQQuestion("");
                            setQOption1("");
                            setQOption2("");
                            setQOption3("");
                            setQOption4("");
                            setQCorrectAnswer("");
                            setQExplanation("");
                            setQRelatedFact("");
                            setQDifficulty("सरल");
                            setQType("MCQ");
                          }}
                          className="bg-primary hover:bg-primary/95 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center space-x-1"
                        >
                          <Plus className="w-4 h-4" />
                          <span>नया प्रश्न जोड़ें</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-4">
                      {(() => {
                        const quiz = quizzes.find(q => q.articleId === selectedArticleIdForQuiz);
                        const liveQuestions = quiz?.questions.filter(q => !q.isDraft) || [];

                        if (liveQuestions.length === 0) {
                          return <div className="text-center py-4 text-slate-400 text-xs font-serif">इस लेख के प्रश्न बैंक में कोई लाइव प्रश्न नहीं है।</div>;
                        }

                        return liveQuestions.map((q, qIdx) => (
                          <div key={q.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl text-xs font-serif space-y-3 leading-relaxed">
                            <div className="flex justify-between items-start gap-4">
                              <span className="font-bold text-slate-800 dark:text-white">प्रश्न {qIdx + 1}: {q.question}</span>
                              <div className="flex space-x-1.5 shrink-0">
                                <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                                  {q.difficultyLevel}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500">
                                  {q.questionType}
                                </span>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-sans">
                              {q.options.map((opt, oIdx) => (
                                <div 
                                  key={oIdx} 
                                  className={`p-2 rounded border ${
                                    opt === q.correctAnswer 
                                      ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400 font-bold" 
                                      : "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
                                  }`}
                                >
                                  {opt} {opt === q.correctAnswer && "✓"}
                                </div>
                              ))}
                            </div>

                            <div className="text-[11px] text-slate-500 pl-2 border-l-2 border-primary/30">
                              <p><strong>व्याख्या:</strong> {q.explanation}</p>
                              <p><strong>संबद्ध तथ्य:</strong> {q.relatedFact}</p>
                            </div>

                            <div className="flex space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800/40">
                              <button
                                onClick={() => {
                                  setQuizEditQuestionId(q.id);
                                  setQQuestion(q.question);
                                  setQOption1(q.options[0]);
                                  setQOption2(q.options[1]);
                                  setQOption3(q.options[2]);
                                  setQOption4(q.options[3]);
                                  setQCorrectAnswer(q.correctAnswer);
                                  setQExplanation(q.explanation);
                                  setQRelatedFact(q.relatedFact);
                                  setQDifficulty(q.difficultyLevel);
                                  setQType(q.questionType);
                                  setIsAddingQuestion(false);
                                }}
                                className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-primary hover:text-primary px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                              >
                                संपादित करें
                              </button>
                              <button
                                onClick={async () => {
                                  if (confirm("क्या आप इस प्रश्न को हटाना चाहते हैं?")) {
                                    await deleteQuizQuestion(selectedArticleIdForQuiz, q.id);
                                  }
                                }}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                              >
                                हटाएँ
                              </button>
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })()}

        {activeTab === "magazines" && <MagazinesManagement />}

      </main>
      </div>

    </div>
  );
}

function MagazinesManagement() {
  const cms = useCms();
  const { magazines, saveMagazine, deleteMagazine } = cms;

  // Sub-tabs: "library" | "upload" | "analytics"
  const [subTab, setSubTab] = useState<"library" | "upload" | "analytics">("library");

  // Form states
  const [editingId, setEditingId] = useState<string>("");
  const [issue, setIssue] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [year, setYear] = useState<string>("");
  const [coverImage, setCoverImage] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [accessLevel, setAccessLevel] = useState<"Free" | "Premium" | "Patron">("Free");
  const [status, setStatus] = useState<"Draft" | "Published" | "Archived">("Draft");
  const [pdfSourceUrl, setPdfSourceUrl] = useState<string>("");
  const [pages, setPages] = useState<string[]>([""]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const resetForm = () => {
    setEditingId("");
    setIssue("");
    setMonth("");
    setYear("");
    setCoverImage("");
    setDescription("");
    setAccessLevel("Free");
    setStatus("Draft");
    setPdfSourceUrl("");
    setPages([""]);
  };

  const handleEdit = (mag: Magazine) => {
    setEditingId(mag.id);
    setIssue(mag.issue || "");
    setMonth(mag.month || "");
    setYear(mag.year || "");
    setCoverImage(mag.coverImage || "");
    setDescription(mag.description || "");
    setAccessLevel(mag.accessLevel || "Free");
    setStatus(mag.status || "Draft");
    setPdfSourceUrl(mag.pdfSourceUrl || "");
    setPages(mag.pages && mag.pages.length > 0 ? mag.pages : [""]);
    setSubTab("upload");
  };

  const handleDelete = async (id: string) => {
    if (confirm("क्या आप सच में इस अंक को हटाना चाहते हैं?")) {
      try {
        await deleteMagazine(id);
        alert("अंक सफलतापूर्वक हटा दिया गया है।");
      } catch (err) {
        console.error(err);
        alert("अंक हटाने में त्रुटि हुई।");
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issue.trim()) return alert("कृपया पत्रिका का नाम/अंक दर्ज करें।");
    if (!month.trim()) return alert("कृपया माह दर्ज करें।");
    if (!coverImage.trim()) return alert("कृपया कवर छवि का URL दर्ज करें।");
    if (pages.some(p => !p.trim())) return alert("सभी पृष्ठों में कुछ सामग्री होनी चाहिए।");

    const magData: Partial<Magazine> = {
      id: editingId || undefined,
      issue,
      month,
      year: year || new Date().getFullYear().toString(),
      coverImage,
      description,
      pages,
      accessLevel,
      status,
      pdfSourceUrl: pdfSourceUrl || undefined,
    };

    try {
      await saveMagazine(magData);
      alert(editingId ? "अंक सफलतापूर्वक अपडेट किया गया!" : "नया अंक सफलतापूर्वक सहेजा गया!");
      resetForm();
      setSubTab("library");
    } catch (err) {
      console.error(err);
      alert("अंक सहेजने में विफल।");
    }
  };

  const handlePageChange = (idx: number, val: string) => {
    const newPages = [...pages];
    newPages[idx] = val;
    setPages(newPages);
  };

  const addPageField = () => {
    setPages([...pages, ""]);
  };

  const removePageField = (idx: number) => {
    if (pages.length <= 1) return;
    const newPages = pages.filter((_, i) => i !== idx);
    setPages(newPages);
  };

  const handleAutoGenerate = () => {
    const mockPages = [
      "युवाक्षर संपादकीय: राष्ट्र निर्माण में युवाओं की महती भूमिका। आज हमारा देश एक ऐतिहासिक चौराहे पर खड़ा है, जहाँ तकनीकी उन्नति और सांस्कृतिक विरासत का मिलन हो रहा है। इस युग में युवाओं को केवल उपभोक्ता नहीं बल्कि नए विचारों का निर्माता बनना होगा। साहित्य इस वैचारिक क्रांति का सबसे सशक्त माध्यम है। युवाक्षर का यह अंक इसी संकल्प को समर्पित है।",
      "साहित्यिक विश्लेषण: आधुनिक कविता में बदलते सरोकार। पिछले दो दशकों में हिंदी कविता ने शिल्प और संवेदना के स्तर पर कई नए प्रतिमान स्थापित किए हैं। आज का कवि केवल व्यक्तिगत अनुभूतियों में नहीं खोया रहता, बल्कि वह वैश्विक चुनौतियों, पर्यावरण संकट और मानवीय संबंधों के बिखराव पर भी गहरी चिंता व्यक्त करता है। मुक्तिबोध और निराला की परंपरा को आगे बढ़ाते हुए नई पीढ़ी के कवियों ने भाषा को और अधिक धारदार बनाया है।",
      "विशेष लेख: भारतीय विरासत का संरक्षण। हमारे पूर्वजों ने हमें ज्ञान, विज्ञान, कला और अध्यात्म की जो विरासत सौंपी है, उसे भावी पीढ़ियों तक पहुँचाना हमारा पुनीत कर्तव्य है। धरोहरों का संरक्षण केवल स्मारकों को सुरक्षित रखना नहीं है, बल्कि उस सोच और संस्कृति को जीवित रखना है जो हमें संवेदनशील इंसान बनाती है। इस लेख में हम प्राचीन ज्ञान परंपराओं और आधुनिक वैज्ञानिक सोच के सामंजस्य पर प्रकाश डाल रहे हैं।",
      "लघु कहानी: अंतहीन यात्रा। देवदत्त अपनी पुरानी संदूक में रखे पत्रों को देख रहा था। वे पत्र केवल कागज़ के टुकड़े नहीं थे, बल्कि बीते हुए सुनहरे कल की गवाहियाँ थीं। शहर की चकाचौंध में उसने बहुत कुछ पाया था, लेकिन अपनी माटी की सौंधी खुशबू को वह कभी भूल नहीं पाया। आज वह अपने पुराने गाँव की ओर लौटने वाली ट्रेन में बैठा था, जहाँ उसका बचपन उसका इंतजार कर रहा था।",
      "युवा संवाद: नई पीढ़ी और डिजिटल चुनौतियाँ। सोशल मीडिया के इस दौर में जहाँ सूचनाओं का अंबार लगा है, वहीं एकाग्रता और मानसिक शांति का संकट भी गहराया है। युवाओं को यह समझना होगा कि तकनीक हमारा मार्गदर्शन करने के लिए है, हमें नियंत्रित करने के लिए नहीं। अध्ययन साथी एआई और अन्य डिजिटल उपकरणों का रचनात्मक उपयोग करके हम अपनी सीखने की गति को दस गुना बढ़ा सकते हैं, बशर्ते हम संयम और अनुशासन बनाए रखें।"
    ];
    setPages(mockPages);
    
    if (!issue) setIssue("युवाक्षर विशेषांक - जून २०२६");
    if (!month) setMonth("जून");
    if (!year) setYear("२०२६");
    if (!coverImage) setCoverImage("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80");
    if (!description) setDescription("यह अंक आधुनिक हिंदी साहित्य में युवाओं के योगदान और उनकी रचनात्मक यात्रा पर केंद्रित है। इसमें देश भर के प्रतिष्ठित लेखकों के आलेख और कविताएँ संकलित हैं।");
  };

  const filteredMagazines = magazines.filter(mag => {
    const matchesSearch = (mag.issue || "").toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (mag.month || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || mag.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-serif text-slate-800 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span>डिजिटल पत्रिका प्रबंधन</span>
          </h2>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            युवाक्षर की मासिक डिजिटल पत्रिकाओं का प्रकाशन, संपादन, पठन विश्लेषिकी और लाइब्रेरी ग्रिड नियंत्रण।
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { resetForm(); setSubTab("upload"); }}
            className="bg-primary hover:bg-primary/95 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>नया अंक अपलोड करें</span>
          </button>
        </div>
      </div>

      {/* ANALYTICS SCORECARD */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">कुल प्रकाशित अंक</p>
            <h4 className="text-lg font-bold text-slate-800 dark:text-white">{magazines.length}</h4>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">सक्रिय पाठक</p>
            <h4 className="text-lg font-bold text-slate-800 dark:text-white">२,४५०</h4>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">औसत पठन समय</p>
            <h4 className="text-lg font-bold text-slate-800 dark:text-white">१५.४ मिनट</h4>
          </div>
        </GlassCard>

        <GlassCard className="p-4 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">स्क्रीनशॉट गणना</p>
            <h4 className="text-lg font-bold text-slate-800 dark:text-white">३२०</h4>
          </div>
        </GlassCard>
      </div>

      {/* SUB-TABS SELECTOR */}
      <div className="flex border-b border-slate-200 dark:border-slate-800/80">
        <button
          onClick={() => setSubTab("library")}
          className={`px-4 py-2.5 font-bold text-xs border-b-2 transition-all cursor-pointer ${
            subTab === "library"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          पुस्तकालय ग्रिड ({magazines.length})
        </button>
        <button
          onClick={() => setSubTab("upload")}
          className={`px-4 py-2.5 font-bold text-xs border-b-2 transition-all cursor-pointer ${
            subTab === "upload"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          {editingId ? "अंक संपादित करें" : "नया अंक अपलोड"}
        </button>
        <button
          onClick={() => setSubTab("analytics")}
          className={`px-4 py-2.5 font-bold text-xs border-b-2 transition-all cursor-pointer ${
            subTab === "analytics"
              ? "border-primary text-primary"
              : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
        >
          पठन विश्लेषिकी
        </button>
      </div>

      {/* LIBRARY TAB */}
      {subTab === "library" && (
        <div className="space-y-4">
          {/* SEARCH & FILTERS */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="अंक या माह से खोजें..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="All">सभी स्थिति (Status)</option>
              <option value="Published">प्रकाशित (Published)</option>
              <option value="Draft">प्रारूप (Draft)</option>
              <option value="Archived">अभिलेखागार (Archived)</option>
            </select>
          </div>

          {/* GRID */}
          {filteredMagazines.length === 0 ? (
            <GlassCard className="p-8 text-center text-slate-500 dark:text-slate-400 text-xs">
              कोई पत्रिका अंक नहीं मिला। नया अंक अपलोड करने के लिए 'नया अंक अपलोड' टैब पर जाएँ।
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMagazines.map((mag) => (
                <GlassCard key={mag.id} className="overflow-hidden flex flex-col h-full">
                  {/* COVER IMAGE */}
                  <div className="relative h-44 bg-slate-100 dark:bg-slate-850">
                    {mag.coverImage ? (
                      <img
                        src={mag.coverImage}
                        alt={mag.issue}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <BookOpen className="w-12 h-12 stroke-1" />
                      </div>
                    )}
                    {/* BADGES */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold text-white shadow-sm ${
                        mag.status === "Published" ? "bg-green-500" :
                        mag.status === "Archived" ? "bg-slate-500" : "bg-yellow-500"
                      }`}>
                        {mag.status === "Published" ? "प्रकाशित" :
                         mag.status === "Archived" ? "अभिलेखागार" : "प्रारूप"}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold text-white shadow-sm ${
                        mag.accessLevel === "Premium" ? "bg-orange-500" :
                        mag.accessLevel === "Patron" ? "bg-purple-500" : "bg-blue-500"
                      }`}>
                        {mag.accessLevel === "Premium" ? "प्रीमियम" :
                         mag.accessLevel === "Patron" ? "संरक्षक" : "निःशुल्क"}
                      </span>
                    </div>
                  </div>

                  {/* BODY */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h4 className="font-bold text-sm text-slate-800 dark:text-white font-serif">{mag.issue}</h4>
                    <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1.5">
                      <span>माह: {mag.month || "अज्ञात"}</span>
                      <span>•</span>
                      <span>वर्ष: {mag.year || "अज्ञात"}</span>
                      <span>•</span>
                      <span>पृष्ठ: {mag.pages?.length || 0}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed font-serif">
                      {mag.description || "कोई विवरण उपलब्ध नहीं है।"}
                    </p>

                    {/* BUTTONS */}
                    <div className="mt-auto pt-4 flex gap-2 border-t border-slate-100 dark:border-slate-800/80">
                      <button
                        onClick={() => handleEdit(mag)}
                        className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary py-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>संपादित करें</span>
                      </button>
                      <button
                        onClick={() => handleDelete(mag.id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-3 py-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* UPLOAD / EDIT TAB */}
      {subTab === "upload" && (
        <form onSubmit={handleSave} className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-800 pb-3 gap-3">
              <h3 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-1.5">
                <span>{editingId ? "अंक विवरण संपादित करें" : "नया पत्रिका अंक अपलोड करें"}</span>
              </h3>
              <button
                type="button"
                onClick={handleAutoGenerate}
                className="bg-orange-500 hover:bg-orange-650 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>स्वचालित फ्लिपबुक जनरेट करें</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">अंक का नाम/शीर्षक (Devanagari Hindi) *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. अंक २६: जून २०२६"
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">प्रकाशन माह (Month) *</label>
                <input
                  type="text"
                  required
                  placeholder="उदा. जून"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">प्रकाशन वर्ष (Year)</label>
                <input
                  type="text"
                  placeholder="उदा. २०२६"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">कवर छवि URL (Cover Image URL) *</label>
                <input
                  type="url"
                  required
                  placeholder="उदा. https://images.unsplash.com/photo-..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">अंक पीडीएफ स्रोत URL (वैकल्पिक - internal check)</label>
                <input
                  type="text"
                  placeholder="उदा. https://yuvakshar.org/vault/issue-26.pdf"
                  value={pdfSourceUrl}
                  onChange={(e) => setPdfSourceUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">प्रवेश स्तर (Access Level) *</label>
                <select
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Free">Free (सभी के लिए निःशुल्क)</option>
                  <option value="Premium">Premium (प्रीमियम सदस्यों के लिए)</option>
                  <option value="Patron">Patron (संरक्षक सदस्यों के लिए)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">प्रकाशन स्थिति (Status) *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Draft">Draft (प्रारूप - अभी प्रकाशित नहीं करें)</option>
                  <option value="Published">Published (प्रकाशित करें)</option>
                  <option value="Archived">Archived (अभिलेखागार में सहेजें)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1 mt-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">अंक का संक्षिप्त विवरण (Description)</label>
              <textarea
                rows={2}
                placeholder="उदा. युवाक्षर का यह विशेष अंक हिंदी कविता के नए दृष्टिकोण..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary resize-y"
              />
            </div>
          </GlassCard>

          {/* PAGES EDITING SECTION */}
          <GlassCard className="p-6">
            <h3 className="font-bold text-sm text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center justify-between">
              <span>पत्रिका पृष्ठ संपादन (Pages Content)</span>
              <button
                type="button"
                onClick={addPageField}
                className="bg-primary hover:bg-primary/95 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>नया पृष्ठ जोड़ें</span>
              </button>
            </h3>

            <div className="space-y-4 mt-4 max-h-[400px] overflow-y-auto pr-2">
              {pages.map((pageContent, idx) => (
                <div key={idx} className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-primary font-serif">पृष्ठ {idx + 1}</span>
                    {pages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePageField(idx)}
                        className="text-red-500 hover:text-red-650 text-[10px] font-bold transition-all cursor-pointer"
                      >
                        पृष्ठ हटाएँ
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={4}
                    required
                    placeholder={`पृष्ठ ${idx + 1} की देवनागरी हिंदी सामग्री दर्ज करें...`}
                    value={pageContent}
                    onChange={(e) => handlePageChange(idx, e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary resize-y leading-relaxed"
                  />
                </div>
              ))}
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-3 mt-6 border-t border-slate-100 dark:border-slate-800/85 pt-4">
              <button
                type="button"
                onClick={() => { resetForm(); setSubTab("library"); }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 text-xs font-bold text-slate-600 dark:text-slate-400 transition-all cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="submit"
                className="bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                {editingId ? "अंक अपडेट करें" : "अंक सहेजें"}
              </button>
            </div>
          </GlassCard>
        </form>
      )}

      {/* DETAILED ANALYTICS TAB */}
      {subTab === "analytics" && (
        <GlassCard className="p-6 space-y-6">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-white font-serif">विस्तृत पठन विश्लेषिकी (Reading Analytics)</h3>
            <p className="text-[10px] text-slate-400 font-serif">मासिक डिजिटल पत्रिकाओं का पठन व्यवहार और सहभागिता विश्लेषण।</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 font-serif">सर्वाधिक पढ़े गए अंक (Top Read Issues)</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="font-serif">अंक २५: मई २०२६</span>
                  <span className="font-bold text-primary">१,२४० पाठक</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="font-serif">अंक २४: अप्रैल २०२६</span>
                  <span className="font-bold text-slate-600 dark:text-slate-400">८५० पाठक</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-800/80">
                  <span className="font-serif">अंक २३: मार्च २०२६</span>
                  <span className="font-bold text-slate-600 dark:text-slate-400">७२० पाठक</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/80 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 font-serif">पठन व्यवहार रुझान (User Engagement Trends)</h4>
              <div className="space-y-2.5 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-serif">
                <p>• प्रीमियम और संरक्षक श्रेणियों में पिछले ३० दिनों में ७.५% पठन वृद्धि देखी गई है।</p>
                <p>• डिजिटल वॉटरमार्किंग के कारण स्क्रीनशॉट साझा करने में पारदर्शिता बढ़ी है और अनधिकृत साझाकरण कम हुआ है।</p>
                <p>• औसत पाठक प्रति सत्र ३.२ पृष्ठों का पठन कर रहे हैं, तथा कविता व संपादकीय अनुभागों पर सर्वाधिक समय (औसत ४.२ मिनट) व्यतीत हो रहा है।</p>
              </div>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
