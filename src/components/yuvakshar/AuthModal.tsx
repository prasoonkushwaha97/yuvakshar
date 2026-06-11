"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Phone, Mail, Lock, Key, ShieldCheck, User, 
  Eye, EyeOff, BookOpen, UserCheck, Sparkles, 
  TrendingUp, Award, Bookmark, ShieldAlert, ArrowLeft,
  RotateCw
} from "lucide-react";
import { useCms, Profile } from "@/store/CmsContext";
import GlassCard from "./GlassCard";
import confetti from "canvas-confetti";

export default function AuthModal() {
  const { authModalOpen, closeAuthModal, loginUser, authModalMessage, users } = useCms();
  
  // Tab states: 'login' | 'register'
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [activeTab, setActiveTab] = useState<"google" | "otp" | "email">("google");

  // Loading & Success States
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [shakeKey, setShakeKey] = useState(0);

  // Common Registration/Login States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // OTP Login States
  const [mobileNum, setMobileNum] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpArray, setOtpArray] = useState<string[]>(Array(6).fill(""));
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState(0);

  // Error States
  const [otpError, setOtpError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [registerError, setRegisterError] = useState("");

  // Password Visibility Toggle
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Founding Member slots remaining
  const [slotsLeft, setSlotsLeft] = useState(327);

  // Shake trigger
  const triggerShake = () => setShakeKey(prev => prev + 1);

  // founding slots countdown effect
  useEffect(() => {
    if (authModalOpen) {
      const savedSlots = localStorage.getItem("yuvakshar_founding_slots");
      let currentSlots = savedSlots ? parseInt(savedSlots, 10) : 327;
      if (Math.random() > 0.3 && currentSlots > 7) {
        currentSlots -= Math.floor(Math.random() * 2) + 1;
        localStorage.setItem("yuvakshar_founding_slots", currentSlots.toString());
      }
      setSlotsLeft(currentSlots);
    }
  }, [authModalOpen]);

  // Resend OTP countdown timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [countdown]);

  // Auto focus first box when OTP screen loads
  useEffect(() => {
    if (otpSent) {
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    }
  }, [otpSent]);

  if (!authModalOpen) return null;

  // Google Login Action
  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(async () => {
      const success = await loginUser("google.reader@gmail.com", "Subscriber");
      setIsLoading(false);
      if (success) {
        confetti({
          particleCount: 100,
          spread: 60,
          origin: { y: 0.7 }
        });
        setSuccessMessage("Google से सफलतापूर्वक लॉगिन हुआ!");
        setTimeout(() => {
          setSuccessMessage("");
          closeAuthModal();
        }, 1500);
      } else {
        triggerShake();
      }
    }, 1000);
  };

  // OTP Login Action step 1: Send OTP code
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNum.trim() || mobileNum.length < 10) {
      setOtpError("कृपया मान्य 10-अंकों का मोबाइल नंबर दर्ज करें।");
      triggerShake();
      return;
    }
    setOtpError("");
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setOtpSent(true);
      setCountdown(30);
      setOtpArray(Array(6).fill(""));
    }, 1200);
  };

  // OTP Resend trigger
  const handleResendOtp = () => {
    setCountdown(30);
    setOtpArray(Array(6).fill(""));
    alert("OTP पुनः भेजा गया! (परीक्षण के लिए '123456' का उपयोग करें)");
  };

  // OTP Input event handlers
  const handleOtpChange = (element: HTMLInputElement, index: number) => {
    const val = element.value.replace(/\D/g, "");
    const newOtp = [...otpArray];
    newOtp[index] = val.slice(-1);
    setOtpArray(newOtp);

    // Auto next box
    if (index < 5 && val) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      if (!otpArray[index] && index > 0) {
        const newOtp = [...otpArray];
        newOtp[index - 1] = "";
        setOtpArray(newOtp);
        otpRefs.current[index - 1]?.focus();
      } else {
        const newOtp = [...otpArray];
        newOtp[index] = "";
        setOtpArray(newOtp);
      }
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasteData.length === 6) {
      const newOtp = pasteData.split("");
      setOtpArray(newOtp);
      otpRefs.current[5]?.focus();
    }
  };

  // OTP Login Action step 2: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const joinedCode = otpArray.join("");
    if (joinedCode === "123456" || (joinedCode.length === 6 && joinedCode === "123456")) {
      setOtpError("");
      setIsLoading(true);

      setTimeout(async () => {
        const success = await loginUser(`${mobileNum}@yuvakshar-otp.com`, "Subscriber");
        setIsLoading(false);
        if (success) {
          confetti({
            particleCount: 120,
            spread: 70,
            origin: { y: 0.7 }
          });
          setSuccessMessage("OTP सत्यापन सफल! लॉगिन पूर्ण हुआ।");
          setTimeout(() => {
            setSuccessMessage("");
            setOtpSent(false);
            setMobileNum("");
            closeAuthModal();
          }, 1500);
        } else {
          triggerShake();
        }
      }, 1000);
    } else {
      setOtpError("अमान्य OTP कोड! कृपया '123456' दर्ज करें।");
      triggerShake();
    }
  };

  // Email / Password Login Action
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setEmailError("कृपया एक मान्य ईमेल पता दर्ज करें।");
      triggerShake();
      return;
    }
    if (!password.trim() || password.length < 4) {
      setEmailError("पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।");
      triggerShake();
      return;
    }

    setEmailError("");
    setIsLoading(true);

    setTimeout(async () => {
      const success = await loginUser(email.trim(), "Subscriber");
      setIsLoading(false);
      
      if (success) {
        confetti({
          particleCount: 100,
          spread: 60,
          origin: { y: 0.7 }
        });
        setSuccessMessage("सफलतापूर्वक लॉगिन हुआ!");
        setTimeout(() => {
          setSuccessMessage("");
          setEmail("");
          setPassword("");
          closeAuthModal();
        }, 1500);
      } else {
        triggerShake();
      }
    }, 1000);
  };

  // Register New User Account Action
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setRegisterError("कृपया अपना नाम दर्ज करें।");
      triggerShake();
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setRegisterError("कृपया एक मान्य ईमेल पता दर्ज करें।");
      triggerShake();
      return;
    }
    if (!mobile.trim() || mobile.length < 10) {
      setRegisterError("कृपया 10-अंकीय मोबाइल नंबर दर्ज करें।");
      triggerShake();
      return;
    }
    if (password.length < 4) {
      setRegisterError("पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।");
      triggerShake();
      return;
    }
    if (password !== confirmPassword) {
      setRegisterError("दोनों पासवर्ड मेल नहीं खाते!");
      triggerShake();
      return;
    }

    // Check if user already exists
    const userExists = users.some(u => u.email === email.trim());
    if (userExists) {
      setRegisterError("इस ईमेल से खाता पहले से मौजूद है। लॉगिन करें।");
      triggerShake();
      return;
    }

    setRegisterError("");
    setIsLoading(true);

    setTimeout(async () => {
      // Call loginUser passing customName and customMobile
      const success = await loginUser(email.trim(), "Subscriber", name.trim(), mobile.trim());
      setIsLoading(false);

      if (success) {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 }
        });
        setSuccessMessage("नया खाता सफलतापूर्वक बनाया गया!");
        setTimeout(() => {
          setSuccessMessage("");
          setName("");
          setEmail("");
          setMobile("");
          setPassword("");
          setConfirmPassword("");
          closeAuthModal();
        }, 1500);
      } else {
        triggerShake();
      }
    }, 1200);
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 30 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { duration: 0.4 }
    },
    shake: {
      x: [0, -10, 10, -10, 10, -5, 5, 0],
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-[#0A0F1D]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate={shakeKey > 0 ? "shake" : "visible"}
          exit="hidden"
          key={shakeKey}
          className="w-full max-w-4xl bg-white/70 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl grid grid-cols-1 lg:grid-cols-12 min-h-[550px] relative mt-10 mb-10 text-slate-800 dark:text-slate-200"
        >
          {/* Close Button */}
          <button
            onClick={closeAuthModal}
            className="absolute right-4 top-4 text-slate-400 hover:text-primary transition-colors p-2 bg-slate-50 dark:bg-slate-900 border border-slate-250 dark:border-slate-800/60 rounded-full cursor-pointer z-50"
            title="बंद करें"
          >
            <X className="w-4 h-4" />
          </button>

          {/* LEFT PANEL: Community branding, Benefits & Social Proof */}
          <div className="lg:col-span-5 bg-gradient-to-br from-primary/10 via-amber-500/5 to-slate-900/5 dark:from-primary/15 dark:via-amber-500/5 dark:to-[#0A0F1D]/10 p-6 md:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/60 dark:border-slate-800/60 text-slate-800 dark:text-slate-100 space-y-6">
            <div className="space-y-4">
              {/* Logo */}
              <div className="flex justify-center lg:justify-start">
                <img 
                  src="/yuvakshar_logo_official.png" 
                  alt="युवाक्षर" 
                  className="h-[50px] md:h-[65px] object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/yuvakshar_logo.jpg";
                  }}
                />
              </div>

              {/* Title Section */}
              <div className="space-y-1 text-center lg:text-left">
                <h2 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  युवाक्षर में आपका स्वागत है
                </h2>
                <h3 className="font-sans text-xs text-primary font-bold tracking-widest uppercase">
                  ज्ञान • विचार • लेखन • परिवर्तन
                </h3>
                <p className="text-xs text-slate-550 dark:text-slate-400 font-serif leading-relaxed pt-2.5">
                  "भारत के उभरते लेखकों, पाठकों, शोधकर्ताओं और विचारकों के समुदाय से जुड़ें।"
                </p>
              </div>

              {/* Benefits Section */}
              <div className="space-y-3 pt-2">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-sans">सदस्यता के लाभ</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 text-xs leading-relaxed font-serif">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-slate-650 dark:text-slate-300 font-medium">सम्पूर्ण पत्रिका पढ़ें</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <UserCheck className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-slate-650 dark:text-slate-300 font-medium">लेखकों को फ़ॉलो करें</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-slate-650 dark:text-slate-300 font-medium">AI अध्ययन साथी का उपयोग करें</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-slate-650 dark:text-slate-300 font-medium">अपनी अध्ययन प्रगति देखें</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Award className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-slate-650 dark:text-slate-300 font-medium">प्रमाणपत्र अर्जित करें</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <div className="w-6 h-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Bookmark className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-slate-650 dark:text-slate-300 font-medium">पसंदीदा लेख सहेजें</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Previews Area */}
            <div className="space-y-4 pt-4 border-t border-slate-200/40 dark:border-slate-800/40">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Premium Membership Preview */}
                <div className="p-3 bg-white/45 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-850/80 rounded-2xl flex flex-col justify-between space-y-2 relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 w-8 h-8 bg-primary/5 rounded-bl-full pointer-events-none" />
                  <div className="space-y-1">
                    <h4 className="font-serif text-xs font-bold text-slate-850 dark:text-white flex items-center space-x-1">
                      <span>💎 प्रीमियम सदस्यता</span>
                    </h4>
                    <p className="text-[9px] text-slate-400 leading-tight font-serif">
                      सम्पूर्ण पत्रिका, AI साथी, AI लेखन समीक्षा, AI अध्ययन रिपोर्ट, विशेष अभिलेखागार
                    </p>
                  </div>
                  <p className="text-[10px] font-bold text-primary tracking-wide pt-1">
                    ₹29 प्रति माह से प्रारंभ
                  </p>
                </div>

                {/* 2. Founding Member Preview */}
                <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex flex-col justify-between space-y-2 relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 w-8 h-8 bg-amber-500/10 rounded-bl-full pointer-events-none" />
                  <div className="space-y-1">
                    <h4 className="font-serif text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center space-x-1">
                      <span>🏛️ संस्थापक सदस्य</span>
                    </h4>
                    <p className="text-[9px] text-slate-400 leading-tight font-serif">
                      "प्रारम्भिक सदस्यों के लिए विशेष सदस्यता"
                    </p>
                  </div>
                  <p className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 tracking-wider font-sans uppercase animate-pulse">
                    केवल {slotsLeft} स्थान शेष
                  </p>
                </div>
              </div>

              {/* Social Proof */}
              <div className="grid grid-cols-4 gap-2 pt-2 text-center border-t border-slate-200/30 dark:border-slate-800/30">
                <div>
                  <p className="text-sm font-black text-primary font-sans leading-none">15,000+</p>
                  <span className="text-[8px] text-slate-400 font-serif leading-none block mt-1">पाठक</span>
                </div>
                <div>
                  <p className="text-sm font-black text-primary font-sans leading-none">250+</p>
                  <span className="text-[8px] text-slate-400 font-serif leading-none block mt-1">लेख</span>
                </div>
                <div>
                  <p className="text-sm font-black text-primary font-sans leading-none">35+</p>
                  <span className="text-[8px] text-slate-400 font-serif leading-none block mt-1">लेखक</span>
                </div>
                <div>
                  <p className="text-sm font-black text-primary font-sans leading-none">25+</p>
                  <span className="text-[8px] text-slate-400 font-serif leading-none block mt-1">पत्रिका</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Interactive Authentication Forms */}
          <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between space-y-6">
            
            {/* Warning Message block if present */}
            {authModalMessage && (
              <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl text-center text-xs text-amber-600 dark:text-amber-400 font-serif leading-relaxed flex items-center justify-center space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{authModalMessage}</span>
              </div>
            )}

            {/* Switch Mode Toggle (लॉगिन करें / नया खाता बनाएं) */}
            <div className="flex border-b border-slate-200 dark:border-slate-800 pb-1 select-none">
              <button
                onClick={() => {
                  setAuthMode("login");
                  setRegisterError("");
                  setEmailError("");
                  setOtpError("");
                }}
                className={`pb-3 text-sm font-serif font-bold transition-all relative px-4 cursor-pointer ${
                  authMode === "login"
                    ? "text-primary border-b-2 border-primary"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                लॉगिन करें
              </button>
              <button
                onClick={() => {
                  setAuthMode("register");
                  setRegisterError("");
                  setEmailError("");
                  setOtpError("");
                }}
                className={`pb-3 text-sm font-serif font-bold transition-all relative px-4 cursor-pointer ${
                  authMode === "register"
                    ? "text-primary border-b-2 border-primary"
                    : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
              >
                नया खाता बनाएं
              </button>
            </div>

            {/* Success overlay state */}
            <AnimatePresence>
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-green-500/15 border border-green-500/30 p-4 rounded-2xl text-center space-y-2 my-2"
                >
                  <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto text-base font-bold">✓</div>
                  <h4 className="font-serif font-bold text-green-600 dark:text-green-400 text-sm">{successMessage}</h4>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FORM CONTAINER */}
            <div className="flex-grow flex flex-col justify-center min-h-[320px]">
              
              {/* 1. LOGIN MODE FLOW */}
              {authMode === "login" && (
                <div className="space-y-6">
                  
                  {/* Primary visually highlighted Google Login Button */}
                  <div className="space-y-3">
                    <button
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                      className="w-full bg-white dark:bg-slate-900 border-2 border-primary hover:border-primary/80 hover:shadow-[0_0_15px_rgba(234,88,12,0.3)] text-slate-700 dark:text-slate-200 py-3.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center space-x-2.5 cursor-pointer font-sans transform hover:scale-101 disabled:opacity-50"
                    >
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                      </svg>
                      <span className="text-sm font-semibold tracking-wide">Google से जारी रखें</span>
                    </button>
                    <div className="flex items-center justify-center space-x-2 py-1 select-none">
                      <div className="h-px bg-slate-200 dark:bg-slate-800 w-16" />
                      <span className="text-[10px] text-slate-400 font-serif">या (Or)</span>
                      <div className="h-px bg-slate-200 dark:bg-slate-800 w-16" />
                    </div>
                  </div>

                  {/* Tabbed Login methods */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800/40 text-xs font-bold font-serif select-none">
                      <button
                        onClick={() => {
                          setActiveTab("otp");
                          setOtpError("");
                        }}
                        className={`py-2 rounded-lg text-center transition-all cursor-pointer ${
                          activeTab === "otp"
                            ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                      >
                        मोबाइल OTP
                      </button>
                      <button
                        onClick={() => {
                          setActiveTab("email");
                          setEmailError("");
                        }}
                        className={`py-2 rounded-lg text-center transition-all cursor-pointer ${
                          activeTab === "email"
                            ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        }`}
                      >
                        Email / पासवर्ड
                      </button>
                    </div>

                    <div className="pt-2 text-xs font-serif">
                      
                      {/* OTP Login Form */}
                      {activeTab === "otp" && (
                        <div className="space-y-4">
                          {!otpSent ? (
                            <form onSubmit={handleSendOtp} className="space-y-4">
                              <div className="space-y-1.5">
                                <label className="text-slate-550 dark:text-slate-400 font-medium flex items-center space-x-1.5">
                                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                                  <span>अपना मोबाइल नंबर दर्ज करें</span>
                                </label>
                                <input
                                  type="tel"
                                  placeholder="उदा. 9876543210"
                                  value={mobileNum}
                                  onChange={(e) => setMobileNum(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                  disabled={isLoading}
                                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 font-mono text-sm disabled:opacity-50"
                                  required
                                />
                                {otpError && (
                                  <p className="text-[10px] text-red-500 font-bold font-sans">{otpError}</p>
                                )}
                              </div>
                              <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-xl font-bold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-50"
                              >
                                {isLoading ? (
                                  <RotateCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <ShieldCheck className="w-4 h-4" />
                                )}
                                <span>{isLoading ? "प्रक्रिया जारी है..." : "OTP प्राप्त करें"}</span>
                              </button>
                            </form>
                          ) : (
                            <form onSubmit={handleVerifyOtp} className="space-y-4">
                              <div className="space-y-3">
                                <div className="flex justify-between items-center select-none">
                                  <label className="text-slate-550 dark:text-slate-400 font-medium flex items-center space-x-1.5">
                                    <Key className="w-3.5 h-3.5 text-slate-400" />
                                    <span>6-अंकीय OTP कोड दर्ज करें</span>
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => setOtpSent(false)}
                                    className="text-[10px] text-primary hover:underline flex items-center space-x-1 cursor-pointer font-bold"
                                  >
                                    <ArrowLeft className="w-3 h-3" />
                                    <span>नंबर बदलें</span>
                                  </button>
                                </div>

                                {/* 6 Individual OTP Boxes */}
                                <div className="flex justify-between gap-2 max-w-[320px] mx-auto py-2">
                                  {otpArray.map((digit, index) => (
                                    <input
                                      key={index}
                                      type="tel"
                                      maxLength={1}
                                      value={digit}
                                      ref={(el) => { otpRefs.current[index] = el; }}
                                      onChange={(e) => handleOtpChange(e.target, index)}
                                      onKeyDown={(e) => handleOtpKeyDown(e, index)}
                                      onPaste={handleOtpPaste}
                                      disabled={isLoading}
                                      className="w-10 h-12 sm:w-12 sm:h-12 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-xl text-center text-xl font-bold text-slate-800 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-mono disabled:opacity-50"
                                      required
                                    />
                                  ))}
                                </div>

                                <p className="text-[10px] text-slate-400 text-center font-sans mt-1">
                                  परीक्षण के लिए कोड <strong>123456</strong> का उपयोग करें।
                                </p>
                                
                                {countdown > 0 ? (
                                  <p className="text-[10px] text-slate-400 text-center font-mono select-none">
                                    {countdown} सेकंड बाद पुनः भेजें
                                  </p>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    className="w-full text-center text-xs text-primary font-bold hover:underline cursor-pointer"
                                  >
                                    OTP पुनः भेजें
                                  </button>
                                )}

                                {otpError && (
                                  <p className="text-[10px] text-red-500 font-bold font-sans text-center">{otpError}</p>
                                )}
                              </div>
                              <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-xl font-bold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-50"
                              >
                                {isLoading ? (
                                  <RotateCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <User className="w-4 h-4" />
                                )}
                                <span>{isLoading ? "सत्यापन हो रहा है..." : "सत्यापन करें"}</span>
                              </button>
                            </form>
                          )}
                        </div>
                      )}

                      {/* Email Login Form */}
                      {activeTab === "email" && (
                        <form onSubmit={handleEmailLogin} className="space-y-4">
                          <div className="space-y-3.5">
                            <div className="space-y-1.5">
                              <label className="text-slate-550 dark:text-slate-400 font-medium flex items-center space-x-1.5">
                                <Mail className="w-3.5 h-3.5 text-slate-400" />
                                <span>ईमेल पता (Email)</span>
                              </label>
                              <input
                                type="email"
                                placeholder="उदा. reader@gmail.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 text-xs disabled:opacity-50"
                                required
                              />
                            </div>
                            
                            <div className="space-y-1.5">
                              <label className="text-slate-550 dark:text-slate-400 font-medium flex items-center space-x-1.5">
                                <Lock className="w-3.5 h-3.5 text-slate-400" />
                                <span>पासवर्ड (Password)</span>
                              </label>
                              <div className="relative">
                                <input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  value={password}
                                  onChange={(e) => setPassword(e.target.value)}
                                  disabled={isLoading}
                                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 pr-10 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 text-xs disabled:opacity-50"
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                >
                                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                            </div>

                            {/* Extra Row: Remember me & Forgot Password */}
                            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-1 select-none">
                              <label className="flex items-center space-x-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={rememberMe}
                                  onChange={(e) => setRememberMe(e.target.checked)}
                                  className="accent-primary rounded"
                                />
                                <span>मुझे याद रखें</span>
                              </label>
                              <button
                                type="button"
                                onClick={() => alert("पासवर्ड रीसेट लिंक आपके ईमेल पर भेजा गया है!")}
                                className="text-primary hover:underline cursor-pointer font-bold"
                              >
                                पासवर्ड भूल गए?
                              </button>
                            </div>

                            {emailError && (
                              <p className="text-[10px] text-red-500 font-bold font-sans">{emailError}</p>
                            )}
                          </div>

                          <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-xl font-bold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-50"
                          >
                            {isLoading ? (
                              <RotateCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <User className="w-4 h-4" />
                            )}
                            <span>{isLoading ? "लॉगिन हो रहा है..." : "लॉगिन करें"}</span>
                          </button>
                        </form>
                      )}

                    </div>
                  </div>

                </div>
              )}

              {/* 2. REGISTRATION MODE FLOW */}
              {authMode === "register" && (
                <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs font-serif">
                  
                  {/* Visual Highlight Google Registration Button */}
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                      className="w-full bg-white dark:bg-slate-900 border-2 border-primary hover:border-primary/80 hover:shadow-[0_0_15px_rgba(234,88,12,0.3)] text-slate-700 dark:text-slate-200 py-3.5 rounded-xl font-bold transition-all shadow-md flex items-center justify-center space-x-2.5 cursor-pointer font-sans transform hover:scale-101 disabled:opacity-50"
                    >
                      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                      </svg>
                      <span className="text-sm font-semibold tracking-wide">Google से खाता बनाएं</span>
                    </button>
                    
                    <div className="flex items-center justify-center space-x-2 py-0.5 select-none">
                      <div className="h-px bg-slate-200 dark:bg-slate-800 w-16" />
                      <span className="text-[10px] text-slate-400 font-serif">या विवरण भरें</span>
                      <div className="h-px bg-slate-200 dark:bg-slate-800 w-16" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    
                    {/* Name */}
                    <div className="space-y-1">
                      <label className="text-slate-550 dark:text-slate-400 font-medium">नाम</label>
                      <input
                        type="text"
                        placeholder="उदा. प्रसून"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isLoading}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 text-xs disabled:opacity-50"
                        required
                      />
                    </div>

                    {/* Grid: Email & Mobile */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-550 dark:text-slate-400 font-medium">ईमेल</label>
                        <input
                          type="email"
                          placeholder="उदा. reader@gmail.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          disabled={isLoading}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 text-xs disabled:opacity-50"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-550 dark:text-slate-400 font-medium">मोबाइल नंबर</label>
                        <input
                          type="tel"
                          placeholder="उदा. 9876543210"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          disabled={isLoading}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 text-xs disabled:opacity-50 font-mono"
                          required
                        />
                      </div>
                    </div>

                    {/* Grid: Password & Confirm Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-slate-550 dark:text-slate-400 font-medium">पासवर्ड</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 pr-8 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 text-xs disabled:opacity-50"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-slate-550 dark:text-slate-400 font-medium">पासवर्ड पुष्टि करें</label>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={isLoading}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 pr-8 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 text-xs disabled:opacity-50"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                          >
                            {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {registerError && (
                      <p className="text-[10px] text-red-500 font-bold font-sans">{registerError}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-xl font-bold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-50 mt-4"
                  >
                    {isLoading ? (
                      <RotateCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <UserCheck className="w-4 h-4" />
                    )}
                    <span>{isLoading ? "खाता बनाया जा रहा है..." : "नया खाता बनाएं"}</span>
                  </button>
                </form>
              )}

            </div>

            {/* Footer Notice */}
            <div className="text-[9px] text-slate-400 text-center leading-relaxed font-sans border-t border-slate-100 dark:border-slate-800/40 pt-3 select-none">
              जारी रखकर, आप हमारी <a href="/terms-and-conditions" className="text-primary hover:underline font-bold">सेवा की शर्तों</a> और <a href="/privacy-policy" className="text-primary hover:underline font-bold">गोपनीयता नीति</a> से सहमत होते हैं।
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
