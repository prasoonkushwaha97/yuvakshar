"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Mail, Lock, Key, ShieldCheck, User } from "lucide-react";
import { useCms } from "@/store/CmsContext";
import GlassCard from "./GlassCard";

export default function AuthModal() {
  const { authModalOpen, closeAuthModal, loginUser, authModalMessage } = useCms();
  const [activeTab, setActiveTab] = useState<"otp" | "google" | "email">("otp");

  // OTP Login States
  const [mobileNum, setMobileNum] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState("");

  // Email Login States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");

  if (!authModalOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNum.trim() || mobileNum.length < 10) {
      setOtpError("कृपया मान्य 10-अंकों का मोबाइल नंबर दर्ज करें।");
      return;
    }
    setOtpError("");
    setOtpSent(true);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode === "123456" || otpCode.length === 6) {
      setOtpError("");
      const success = await loginUser(`${mobileNum}@yuvakshar-otp.com`, "Subscriber");
      if (success) {
        // Reset states
        setMobileNum("");
        setOtpSent(false);
        setOtpCode("");
      }
    } else {
      setOtpError("अमान्य OTP कोड! कृपया '123456' दर्ज करें।");
    }
  };

  const handleGoogleLogin = async () => {
    const success = await loginUser("google.reader@gmail.com", "Subscriber");
    if (success) {
      closeAuthModal();
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setEmailError("कृपया एक मान्य ईमेल पता दर्ज करें।");
      return;
    }
    if (!password.trim() || password.length < 4) {
      setEmailError("पासवर्ड कम से कम 4 अक्षरों का होना चाहिए।");
      return;
    }
    setEmailError("");
    const success = await loginUser(email, "Subscriber");
    if (success) {
      setEmail("");
      setPassword("");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-[#0A0F1D]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md"
        >
          <GlassCard glow="gold" className="relative p-6 md:p-8 space-y-6">
            
            {/* Close Button */}
            <button
              onClick={closeAuthModal}
              className="absolute right-4 top-4 text-slate-400 hover:text-primary transition-colors p-1.5 border border-slate-200 dark:border-slate-800/80 rounded-xl cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Title */}
            <div className="text-center space-y-1.5">
              <h2 className="font-serif text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
                युवाक्षर एकात्मक लॉगिन
              </h2>
              <p className="text-[10px] text-slate-400 font-sans uppercase tracking-widest font-semibold">
                Unified Authentication & Identity
              </p>
            </div>

            {/* Warning Message */}
            {authModalMessage && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-2xl text-center text-xs text-amber-600 dark:text-amber-400 font-serif leading-relaxed flex items-center justify-center space-x-2">
                <span className="text-sm">⚠️</span>
                <span>{authModalMessage}</span>
              </div>
            )}

            {/* Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800/40 text-[10px] font-bold font-serif">
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
                onClick={() => setActiveTab("google")}
                className={`py-2 rounded-lg text-center transition-all cursor-pointer ${
                  activeTab === "google"
                    ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                गूगल लॉगिन
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
                ईमेल / पासवर्ड
              </button>
            </div>

            {/* Tab Contents */}
            <div className="pt-2 text-xs font-serif">
              {activeTab === "otp" && (
                <div className="space-y-4">
                  {!otpSent ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-slate-500 font-medium flex items-center space-x-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>अपना मोबाइल नंबर दर्ज करें</span>
                        </label>
                        <input
                          type="tel"
                          placeholder="उदा. 9876543210"
                          value={mobileNum}
                          onChange={(e) => setMobileNum(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 font-mono text-sm"
                          required
                        />
                        {otpError && (
                          <p className="text-[10px] text-red-500 font-bold font-sans">{otpError}</p>
                        )}
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-xl font-bold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>OTP प्राप्त करें</span>
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-slate-500 font-medium flex items-center space-x-1.5">
                          <Key className="w-3.5 h-3.5 text-slate-400" />
                          <span>6-अंकीय OTP कोड दर्ज करें</span>
                        </label>
                        <input
                          type="text"
                          placeholder="123456 दर्ज करें"
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 font-mono text-center text-lg tracking-widest"
                          required
                        />
                        <p className="text-[10px] text-slate-400 text-center font-sans mt-1">
                          परीक्षण के लिए कोड <strong>123456</strong> का उपयोग करें।
                        </p>
                        {otpError && (
                          <p className="text-[10px] text-red-500 font-bold font-sans text-center">{otpError}</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="w-1/3 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 py-3 rounded-xl font-bold transition-all cursor-pointer text-center"
                        >
                          पीछे जाएँ
                        </button>
                        <button
                          type="submit"
                          className="w-2/3 bg-primary hover:bg-primary/95 text-white py-3 rounded-xl font-bold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
                        >
                          <User className="w-4 h-4" />
                          <span>सत्यापन करें</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {activeTab === "google" && (
                <div className="py-4 text-center space-y-4">
                  <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                    युवाक्षर पर सुरक्षित रूप से लॉगिन करने के लिए अपने Google खाते का उपयोग करें।
                  </p>
                  <button
                    onClick={handleGoogleLogin}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/50 text-slate-700 dark:text-slate-200 py-3.5 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center space-x-2.5 cursor-pointer font-sans"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                    </svg>
                    <span>Google से जारी रखें</span>
                  </button>
                </div>
              )}

              {activeTab === "email" && (
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-slate-500 font-medium flex items-center space-x-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>ईमेल पता (Email)</span>
                      </label>
                      <input
                        type="email"
                        placeholder="उदा. reader@gmail.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 text-xs"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500 font-medium flex items-center space-x-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>पासवर्ड (Password)</span>
                      </label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 text-xs"
                        required
                      />
                    </div>
                    {emailError && (
                      <p className="text-[10px] text-red-500 font-bold font-sans">{emailError}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-xl font-bold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
                  >
                    <User className="w-4 h-4" />
                    <span>लॉगिन करें</span>
                  </button>
                </form>
              )}
            </div>

            {/* Footer Notice */}
            <div className="text-[10px] text-slate-400 text-center leading-relaxed font-sans border-t border-slate-100 dark:border-slate-800/40 pt-3">
              जारी रखकर, आप हमारी <a href="/terms-and-conditions" className="text-primary hover:underline">सेवा की शर्तों</a> और <a href="/privacy-policy" className="text-primary hover:underline">गोपनीयता नीति</a> से सहमत होते हैं।
            </div>

          </GlassCard>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
