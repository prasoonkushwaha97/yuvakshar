"use client";
import Image from "next/image";


import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, Eye, EyeOff, User, Phone, ShieldAlert, RotateCw } from "lucide-react";
import { useCms } from "@/store/CmsContext";
import confetti from "canvas-confetti";

export default function AuthModal() {
  const router = useRouter();
  const { 
    authModalOpen, 
    closeAuthModal, 
    loginUser, 
    registerUser,
    authModalMessage, 
    users,
    sendPasswordReset,
    checkUsernameAvailability,
    supabaseConfigured
  } = useCms();
  
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [shakeKey, setShakeKey] = useState(0);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [mobile, setMobile] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const [emailError, setEmailError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const modalRef = useRef<HTMLDivElement>(null);
  const triggerShake = () => setShakeKey(prev => prev + 1);

  useEffect(() => {
    if (authModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [authModalOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && authModalOpen) {
        handleClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [authModalOpen]);

  const handleClose = () => {
    closeAuthModal();
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    const success = await loginUser("google.reader@gmail.com");
    setIsLoading(false);
    if (success) {
      confetti({ particleCount: 100, spread: 60, origin: { y: 0.7 } });
      setSuccessMessage("Google से सफलतापूर्वक लॉगिन हुआ!");
      setTimeout(() => {
        setSuccessMessage("");
        closeAuthModal();
      }, 1500);
    } else {
      triggerShake();
    }
  };

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
      const success = await loginUser(email.trim(), password);
      setIsLoading(false);
      
      if (success) {
        confetti({ particleCount: 100, spread: 60, origin: { y: 0.7 } });
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

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !email.includes("@") || !mobile.trim() || password.length < 4) {
      setRegisterError("कृपया सभी अनिवार्य फ़ील्ड सही तरीके से भरें।");
      triggerShake();
      return;
    }
    if (password !== confirmPassword) {
      setRegisterError("दोनों पासवर्ड मेल नहीं खाते!");
      triggerShake();
      return;
    }

    setRegisterError("");
    setIsLoading(true);

    setTimeout(async () => {
      const success = await registerUser(email.trim(), username.trim(), "Subscriber", name.trim(), mobile.trim(), password);
      setIsLoading(false);

      if (success) {
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
        setSuccessMessage("नया खाता सफलतापूर्वक बनाया गया!");
        setTimeout(() => {
          setSuccessMessage("");
          setName("");
          setUsername("");
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

  if (!authModalOpen) return null;

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 30 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3 } },
    shake: { x: [0, -10, 10, -10, 10, -5, 5, 0], opacity: 1, scale: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto"
        onClick={(e) => {
          if (e.target === e.currentTarget) handleClose();
        }}
      >
        <motion.div
          ref={modalRef}
          variants={modalVariants}
          initial="hidden"
          animate={shakeKey > 0 ? "shake" : "visible"}
          exit="hidden"
          key={shakeKey}
          className="w-full max-w-[560px] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative my-auto text-slate-800 dark:text-slate-200"
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute right-5 top-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full cursor-pointer z-50"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="p-8 sm:p-10 flex flex-col space-y-8">
            <div className="text-center space-y-2 mt-2">
              <div className="flex justify-center mb-6">
                <Image src="/yuvakshar_logo_official.png" alt="युवाक्षर" className="h-[45px] object-contain drop-shadow-sm" onError={(e) => { (e.target as HTMLImageElement).src = "/yuvakshar_logo.jpg"; }} width={400} height={400} />
              </div>
              <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white">
                {authMode === "login" ? "पुनः स्वागत है" : "खाता बनाएँ"}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-sans">
                {authMode === "login" ? "अपने युवाक्षर खाते में प्रवेश करें" : "ज्ञान और विचार के समुदाय से जुड़ें"}
              </p>
            </div>

            {authModalMessage && (
              <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 p-3.5 rounded-2xl text-center text-sm text-amber-700 dark:text-amber-400 font-medium flex items-center justify-center space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{authModalMessage}</span>
              </div>
            )}

            <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl select-none">
              <button
                onClick={() => { setAuthMode("login"); setRegisterError(""); setEmailError(""); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${authMode === "login" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                लॉगिन
              </button>
              <button
                onClick={() => { setAuthMode("register"); setRegisterError(""); setEmailError(""); }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all ${authMode === "register" ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"}`}
              >
                साइन अप
              </button>
            </div>

            <AnimatePresence>
              {successMessage && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 p-4 rounded-2xl text-center space-y-2">
                  <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto text-lg font-bold">✓</div>
                  <h4 className="font-semibold text-green-700 dark:text-green-400 text-sm">{successMessage}</h4>
                </motion.div>
              )}
            </AnimatePresence>

            {authMode === "login" ? (
              <div className="space-y-6">
                <button
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-200 py-3.5 rounded-2xl font-semibold transition-all shadow-sm flex items-center justify-center space-x-3 cursor-pointer disabled:opacity-50"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                  </svg>
                  <span>Google से जारी रखें</span>
                </button>
                
                <div className="flex items-center justify-center space-x-4">
                  <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                  <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">या ईमेल का उपयोग करें</span>
                  <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1" />
                </div>

                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-600 dark:text-slate-300 font-medium text-sm flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span>ईमेल पता</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-100 text-sm transition-all"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-slate-600 dark:text-slate-300 font-medium text-sm flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span>पासवर्ड</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 pr-11 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-100 text-sm transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-slate-500 pt-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="accent-primary w-4 h-4 rounded border-slate-300"
                      />
                      <span>मुझे याद रखें</span>
                    </label>
                    <button
                      type="button"
                      onClick={async () => {
                        if (!email.trim() || !email.includes("@")) {
                          alert("कृपया पासवर्ड रीसेट करने के लिए पहले अपना ईमेल दर्ज करें।");
                          return;
                        }
                        await sendPasswordReset(email.trim());
                      }}
                      className="text-primary hover:text-primary-dark hover:underline font-medium"
                    >
                      पासवर्ड भूल गए?
                    </button>
                  </div>

                  {emailError && <p className="text-sm text-red-500 font-medium text-center">{emailError}</p>}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary hover:bg-primary/95 text-white py-3.5 rounded-xl font-bold transition-all shadow-md shadow-primary/20 flex items-center justify-center space-x-2 disabled:opacity-50 mt-4"
                  >
                    {isLoading && <RotateCw className="w-4 h-4 animate-spin" />}
                    <span>{isLoading ? "प्रवेश हो रहा है..." : "लॉगिन करें"}</span>
                  </button>
                </form>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-600 dark:text-slate-300 font-medium text-sm flex items-center space-x-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>पूरा नाम</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-100 text-sm transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-600 dark:text-slate-300 font-medium text-sm flex items-center space-x-2">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>यूज़रनेम</span>
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-100 text-sm transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-600 dark:text-slate-300 font-medium text-sm flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>ईमेल पता</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-100 text-sm transition-all"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-600 dark:text-slate-300 font-medium text-sm flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>मोबाइल नंबर</span>
                  </label>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    disabled={isLoading}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-100 text-sm transition-all"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-slate-600 dark:text-slate-300 font-medium text-sm flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span>पासवर्ड</span>
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-100 text-sm transition-all"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-slate-600 dark:text-slate-300 font-medium text-sm flex items-center space-x-2">
                      <Lock className="w-4 h-4 text-slate-400" />
                      <span>पासवर्ड की पुष्टि</span>
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isLoading}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-100 text-sm transition-all"
                      required
                    />
                  </div>
                </div>

                {registerError && <p className="text-sm text-red-500 font-medium text-center pt-2">{registerError}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary hover:bg-primary/95 text-white py-3.5 rounded-xl font-bold transition-all shadow-md shadow-primary/20 flex items-center justify-center space-x-2 disabled:opacity-50 mt-6"
                >
                  {isLoading && <RotateCw className="w-4 h-4 animate-spin" />}
                  <span>{isLoading ? "खाता बन रहा है..." : "साइन अप करें"}</span>
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
