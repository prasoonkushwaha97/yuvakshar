"use client";

import React, { useState, useEffect } from "react";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  MessageSquare, 
  ShieldCheck, 
  Clock, 
  Lock, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  FileText, 
  Sparkles, 
  CheckCircle, 
  RefreshCw,
  AlertCircle,
  GraduationCap,
  Copyright,
  Inbox,
  ThumbsUp,
  MoreHorizontal
} from "lucide-react";
import GlassCard from "@/components/yuvakshar/GlassCard";
import { useCms } from "@/store/CmsContext";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const CONTACT_CATEGORIES = [
  { id: "Collaboration", label: "सहयोग", desc: "साझेदारी और सहयोग प्रस्ताव", icon: Zap },
  { id: "Advertisement", label: "विज्ञापन", desc: "प्रायोजन और विज्ञापन पूछताछ", icon: Sparkles },
  { id: "Article Submission", label: "लेख प्रस्तुति", desc: "रचनात्मक लेख और कहानियाँ", icon: FileText },
  { id: "Internship", label: "इंटर्नशिप", desc: "संपादकीय और तकनीकी इंटर्नशिप", icon: GraduationCap },
  { id: "Technical Support", label: "तकनीकी सहायता", desc: "वेबसाइट उपयोग संबंधी समस्याएँ", icon: RefreshCw },
  { id: "Copyright", label: "कॉपीराइट शिकायत", desc: "बौद्धिक संपदा संबंधी शिकायतें", icon: Copyright },
  { id: "Letter to Editor", label: "संपादक को पत्र", desc: "संपादक मंडल को अपने विचार", icon: Inbox },
  { id: "Feedback", label: "प्रतिक्रिया", desc: "पत्रिका की सामग्री पर राय", icon: ThumbsUp },
  { id: "Other", label: "अन्य", desc: "किसी अन्य विषय पर प्रश्न", icon: MoreHorizontal },
];

const FAQS = [
  {
    question: "युवाक्षर में रचनाएँ प्रकाशित कराने की क्या प्रक्रिया है?",
    answer: "आप सीधे हमारे 'रचना भेजें' (सबमिट आर्टिकल) डेस्क के माध्यम से अपनी रचनाएं सबमिट कर सकते हैं। हमारा संपादकीय मंडल 48 घंटों के भीतर आपकी रचना की समीक्षा करता है और स्वीकृत होने पर आपको ईमेल के माध्यम से सूचित किया जाता है।"
  },
  {
    question: "क्या रचनाओं के लिए कोई मानदेय दिया जाता है?",
    answer: "युवाक्षर वर्तमान में एक गैर-लाभकारी डिजिटल पत्रिका है जो हिन्दी साहित्य और विमर्श को बढ़ावा देने के लिए प्रतिबद्ध है। उत्कृष्ट लेखकों को समय-समय पर सम्मानित किया जाता है, परंतु नियमित रचनाओं के लिए कोई व्यावसायिक मानदेय देय नहीं है।"
  },
  {
    question: "लेख प्रस्तुत करने के बाद प्रतिक्रिया मिलने में कितना समय लगता है?",
    answer: "सामान्यतः हमारी संपादकीय टीम लेख प्राप्त होने के 3 से 5 कार्य दिवसों के भीतर अपनी प्रारंभिक समीक्षा रिपोर्ट साझा कर देती है। सहयोग या विज्ञापन से जुड़े प्रश्नों पर 24 घंटे के भीतर प्रतिक्रिया दी जाती है।"
  },
  {
    question: "क्या मैं एक से अधिक श्रेणियों में संपर्क कर सकता हूँ?",
    answer: "हाँ, आप अपनी आवश्यकतानुसार अलग-अलग संदेश भेज सकते हैं। हालाँकि, हम अनुशंसा करते हैं कि एक ही विषय पर बार-बार संदेश न भेजें ताकि हमारे संपादकीय मंडल को समीक्षा के लिए पर्याप्त समय मिल सके।"
  }
];

export default function ContactPage() {
  const { settings, submitPublicArticle, currentUser } = useCms();
  
  // Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [category, setCategory] = useState("Collaboration");
  const [message, setMessage] = useState("");
  
  // Validation States
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    email: "",
    mobile: "",
    message: ""
  });

  // Draft States
  const [draftToRestore, setDraftToRestore] = useState<any>(null);
  const [showDraftBanner, setShowDraftBanner] = useState(false);

  // Submission Pipeline & Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingStep, setSubmittingStep] = useState(0);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Prefill when currentUser changes or logs in
  useEffect(() => {
    if (currentUser) {
      if (!name) setName(currentUser.name || "");
      if (!email) setEmail(currentUser.email || "");
      if (!mobile) setMobile(currentUser.mobile || "");
    }
  }, [currentUser]);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = null;
    if (savedDraft) {
      try {
        const parsed = JSON.parse(savedDraft);
        if (parsed.name || parsed.email || parsed.mobile || parsed.message) {
          setDraftToRestore(parsed);
          setShowDraftBanner(true);
        }
      } catch (e) {
        console.error("Failed to parse contact draft", e);
      }
    }
  }, []);

  // Auto-save draft on changes
  useEffect(() => {
    if (isSubmitting || submitSuccess) return;
    const draftData = { name, email, mobile, category, message };
    undefined;
  }, [name, email, mobile, category, message, isSubmitting, submitSuccess]);

  const handleRestoreDraft = () => {
    if (draftToRestore) {
      setName(draftToRestore.name || "");
      setEmail(draftToRestore.email || "");
      setMobile(draftToRestore.mobile || "");
      setCategory(draftToRestore.category || "Collaboration");
      setMessage(draftToRestore.message || "");
      setShowDraftBanner(false);
    }
  };

  const handleDiscardDraft = () => {
    localStorage.removeItem("yuvakshar_contact_draft");
    setDraftToRestore(null);
    setShowDraftBanner(false);
  };

  const handleClearForm = () => {
    setName("");
    setEmail("");
    setMobile("");
    setCategory("Collaboration");
    setMessage("");
    setValidationErrors({ name: "", email: "", mobile: "", message: "" });
    localStorage.removeItem("yuvakshar_contact_draft");
    setDraftToRestore(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(false);
    setSubmitError("");

    let valid = true;
    const errors = { name: "", email: "", mobile: "", message: "" };

    if (!name.trim()) {
      errors.name = "कृपया अपना नाम दर्ज करें।";
      valid = false;
    }
    if (!email.trim()) {
      errors.email = "कृपया अपना ईमेल पता दर्ज करें।";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "कृपया एक मान्य ईमेल पता दर्ज करें (उदा: name@domain.com)।";
      valid = false;
    }
    if (mobile.trim() && !/^\d{10}$/.test(mobile.replace(/\D/g, ""))) {
      errors.mobile = "कृपया एक मान्य 10-अंकीय मोबाइल नंबर दर्ज करें।";
      valid = false;
    }
    if (!message.trim()) {
      errors.message = "कृपया अपना संदेश दर्ज करें।";
      valid = false;
    } else if (message.length > 1000) {
      errors.message = "संदेश 1000 अक्षरों से अधिक नहीं हो सकता।";
      valid = false;
    }

    setValidationErrors(errors);
    if (!valid) return;

    setIsSubmitting(true);
    setSubmittingStep(1);

    try {
      await submitPublicArticle({
        type: "contact",
        name,
        email,
        mobile,
        subject: `संपर्क संदेश: ${CONTACT_CATEGORIES.find(c => c.id === category)?.label || category}`,
        content: message,
        category: category
      });

      // Pipeline simulation for high-fidelity UX (without DB jargon)
      setTimeout(() => {
        setSubmittingStep(2);
        setTimeout(() => {
          setSubmittingStep(3);
          setTimeout(() => {
            setIsSubmitting(false);
            setSubmittingStep(0);
            setSubmitSuccess(true);
            
            // Clear inputs and localStorage draft
            setName(currentUser?.name || "");
            setEmail(currentUser?.email || "");
            setMobile(currentUser?.mobile || "");
            setMessage("");
            setCategory("Collaboration");
            localStorage.removeItem("yuvakshar_contact_draft");
            setDraftToRestore(null);
            
            // Hide success banner after 8 seconds
            setTimeout(() => setSubmitSuccess(false), 8000);
          }, 1000);
        }, 1200);
      }, 1000);

    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setSubmittingStep(0);
      setSubmitError("क्षमा करें, संदेश प्रेषित करने में कोई तकनीकी त्रुटि हुई है। कृपया पुनः प्रयास करें।");
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-screen space-y-16 text-[#0F172A] dark:text-slate-100 font-serif">
      
      {/* SECTION 1 - HERO AREA */}
      <div className="text-center max-w-3xl mx-auto space-y-6 pt-6">
        <div className="inline-flex p-3 bg-orange-500/10 dark:bg-orange-500/20 text-[#EA580C] rounded-full border border-orange-500/20 shadow-inner">
          <MessageSquare className="w-8 h-8" />
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
          संपादकीय डेस्क से संपर्क करें
        </h1>
        <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-[#EA580C] to-transparent mx-auto"></div>
        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
          लेख, विचार, सहयोग, विज्ञापन, कॉपीराइट, सामान्य विमर्श के लिए युवाक्षर संपादकीय कार्यालय।
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-sans leading-relaxed max-w-2xl mx-auto font-light">
          युवाक्षर राष्ट्रीय व अंतर्राष्ट्रीय स्तर पर हिन्दी विमर्श को नया आयाम देने के लिए संकल्पित है। यदि आपके पास कोई लेख, सुझाव, सहयोग का विचार या कोई अन्य प्रश्न है, तो नीचे दिए गए माध्यमों से सीधे संपादकीय डेस्क से संपर्क करें।
        </p>
      </div>

      {/* SECTION 2 - CONTACT OPTIONS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Email */}
        <div className="bg-white dark:bg-[#0F172A]/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg hover:border-orange-500/30 transition-all duration-300 flex flex-col items-center text-center space-y-3">
          <div className="p-3 bg-orange-500/10 dark:bg-orange-500/20 text-[#EA580C] rounded-xl">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-800 dark:text-white">📧 ईमेल</h3>
          <p className="text-sm font-sans font-medium text-slate-600 dark:text-slate-300 break-all">
            <a href="mailto:yuvakshar.editor@gmail.com" className="hover:underline hover:text-[#EA580C]">
              yuvakshar.editor@gmail.com
            </a>
          </p>
          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            संपादकीय संवाद, लेख प्रस्तुति एवं सामान्य संपर्क
          </p>
        </div>

        {/* Card 2: Mobile */}
        <div className="bg-white dark:bg-[#0F172A]/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg hover:border-orange-500/30 transition-all duration-300 flex flex-col items-center text-center space-y-3">
          <div className="p-3 bg-orange-500/10 dark:bg-orange-500/20 text-[#EA580C] rounded-xl">
            <Phone className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-800 dark:text-white">📱 मोबाइल</h3>
          <p className="text-sm font-sans font-medium text-slate-600 dark:text-slate-300 select-all">
            +91 95168 95730
          </p>
          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            त्वरित संपर्क एवं आवश्यक संवाद
          </p>
        </div>

        {/* Card 3: Address */}
        <div className="bg-white dark:bg-[#0F172A]/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg hover:border-orange-500/30 transition-all duration-300 flex flex-col items-center text-center space-y-3">
          <div className="p-3 bg-orange-500/10 dark:bg-orange-500/20 text-[#EA580C] rounded-xl">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-800 dark:text-white">📍 कार्यालय</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
            अंजलि कॉम्प्लेक्स, टी. टी. नगर, भोपाल (मध्य प्रदेश)
          </p>
          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            संपादकीय एवं प्रशासनिक कार्यालय
          </p>
        </div>

        {/* Card 4: Response Time */}
        <div className="bg-white dark:bg-[#0F172A]/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 hover:-translate-y-1 hover:shadow-lg hover:border-orange-500/30 transition-all duration-300 flex flex-col items-center text-center space-y-3">
          <div className="p-3 bg-orange-500/10 dark:bg-orange-500/20 text-[#EA580C] rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-800 dark:text-white">⏱ उत्तर समय</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 font-sans font-medium">
            24–48 घंटे
          </p>
          <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
            अधिकांश संदेशों का उत्तर निर्धारित समय में दिया जाता है।
          </p>
        </div>
      </div>

      {/* GOOGLE MAPS LOCATION CARD */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#FAF8F3] dark:bg-[#0F172A]/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-start space-x-4">
            <div className="p-3.5 bg-orange-500/10 dark:bg-orange-500/20 text-[#EA580C] rounded-xl shrink-0 mt-0.5">
              <MapPin className="w-6 h-6 animate-bounce" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">📍 हमारा कार्यालय</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
                अंजलि कॉम्प्लेक्स, टी. टी. नगर, भोपाल (मध्य प्रदेश), भारत
              </p>
              <p className="text-xs text-slate-400 font-sans font-light">
                भोपाल शहर के हृदय स्थल टी. टी. नगर में स्थित हमारा केंद्रीय कार्यालय।
              </p>
            </div>
          </div>
          <div className="shrink-0 font-sans self-end md:self-center">
            <a 
              href="https://maps.google.com/?q=Anjali+Complex,+TT+Nagar,+Bhopal" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>मानचित्र में देखें</span>
            </a>
          </div>
        </div>
      </div>

      {/* DRAFT RESTORATION BANNER */}
      <AnimatePresence>
        {showDraftBanner && draftToRestore && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto"
          >
            <div className="bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/20 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm text-amber-800 dark:text-amber-300 font-sans leading-relaxed">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-500/15 text-amber-500 rounded-lg shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <span>हमें आपका एक पुराना अधूरा संपर्क संदेश (ड्राफ्ट) मिला है। क्या आप उसे पुनः प्राप्त करना चाहते हैं?</span>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  type="button"
                  onClick={handleRestoreDraft}
                  className="px-4 py-2 bg-[#EA580C] hover:bg-[#EA580C]/90 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  पुनर्स्थापित करें
                </button>
                <button
                  type="button"
                  onClick={handleDiscardDraft}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  हटाएं
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* CONTACT CONTAINER */}
        <GlassCard glow="gold" className="p-6 md:p-10 space-y-8 rounded-[20px]">
          
          <div className="border-b border-slate-200/80 dark:border-slate-800/80 pb-6 space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center space-x-2.5">
              <span className="h-6 w-2.5 bg-[#EA580C] rounded-full inline-block"></span>
              <span>संपर्क सूत्र</span>
            </h2>
            <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-sans uppercase tracking-wider font-semibold">
              Send a Message to the Editorial Desk
            </p>
          </div>

          {/* DYNAMIC SUCCESS/ERROR NOTIFICATIONS */}
          <AnimatePresence mode="wait">
            {submitSuccess && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 p-5 rounded-2xl text-emerald-800 dark:text-emerald-300 font-sans flex items-start space-x-3.5"
              >
                <CheckCircle className="w-5.5 h-5.5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-sm">संदेश सफलतापूर्वक प्रेषित!</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                    आपका संदेश सफलतापूर्वक दर्ज कर लिया गया है। संपादक मंडल जल्द ही आपसे संपर्क करेगा। आपकी प्रतिलिपि ईमेल पर प्रेषित की गई है।
                  </p>
                </div>
              </motion.div>
            )}

            {submitError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-rose-500/10 dark:bg-rose-500/5 border border-rose-500/20 p-5 rounded-2xl text-rose-800 dark:text-rose-300 font-sans flex items-start space-x-3.5"
              >
                <AlertCircle className="w-5.5 h-5.5 text-rose-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-sm">प्रसारण में त्रुटि</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                    {submitError}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* SECTION 3 - CATEGORY SELECTOR CARDS */}
            <div className="space-y-4">
              <label className="block text-slate-700 dark:text-slate-300 font-bold text-sm">
                संपर्क श्रेणी का चयन करें <span className="text-red-500">*</span>
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {CONTACT_CATEGORIES?.map((cat) => {
                  const IconComponent = cat.icon;
                  const isSelected = category === cat.id;
                  
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-4 border rounded-xl text-left transition-all duration-200 cursor-pointer flex flex-col justify-between h-[100px] select-none hover:shadow-sm ${
                        isSelected
                          ? "bg-slate-900 border-slate-900 text-white dark:bg-orange-600 dark:border-orange-600 dark:text-white shadow-[0_4px_16px_rgba(234,88,12,0.15)] scale-[1.01]"
                          : "bg-white dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-orange-500/30"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className={`p-1.5 rounded-lg ${
                          isSelected ? "bg-white/20 text-white" : "bg-orange-500/10 text-[#EA580C] dark:bg-orange-500/20"
                        }`}>
                          <IconComponent className="w-4.5 h-4.5" />
                        </span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                        )}
                      </div>
                      <div className="space-y-0.5 mt-2">
                        <p className="font-bold text-xs leading-none">{cat.label}</p>
                        <p className={`text-[10px] truncate ${isSelected ? "text-white/80" : "text-slate-400"}`}>
                          {cat.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* INPUT FIELDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
              
              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center space-x-1">
                  <span>आपका पूरा नाम</span>
                  <span className="text-red-500">*</span>
                </label>
                <input 
                  type="text" 
                  placeholder="उदा. राहुल शर्मा"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (validationErrors.name) setValidationErrors(prev => ({ ...prev, name: "" }));
                  }}
                  className={`w-full bg-white dark:bg-slate-950/60 border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/30 text-slate-800 dark:text-slate-200 transition-all font-serif ${
                    validationErrors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200 dark:border-slate-800"
                  }`}
                />
                {validationErrors.name && (
                  <p className="text-[10px] text-red-500 font-bold flex items-center space-x-1 animate-pulse">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{validationErrors.name}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center space-x-1">
                  <span>ईमेल पता</span>
                  <span className="text-red-500">*</span>
                </label>
                <input 
                  type="email" 
                  placeholder="उदा. rahul@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (validationErrors.email) setValidationErrors(prev => ({ ...prev, email: "" }));
                  }}
                  className={`w-full bg-white dark:bg-slate-950/60 border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/30 text-slate-800 dark:text-slate-200 transition-all ${
                    validationErrors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200 dark:border-slate-800"
                  }`}
                />
                {validationErrors.email && (
                  <p className="text-[10px] text-red-500 font-bold flex items-center space-x-1 animate-pulse">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{validationErrors.email}</span>
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center space-x-1">
                  <span>मोबाइल नंबर (वैकल्पिक)</span>
                </label>
                <input 
                  type="tel" 
                  placeholder="उदा. 9876543210"
                  value={mobile}
                  onChange={(e) => {
                    setMobile(e.target.value.replace(/\D/g, "").slice(0, 10));
                    if (validationErrors.mobile) setValidationErrors(prev => ({ ...prev, mobile: "" }));
                  }}
                  className={`w-full bg-white dark:bg-slate-950/60 border rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/30 text-slate-800 dark:text-slate-200 transition-all ${
                    validationErrors.mobile ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200 dark:border-slate-800"
                  }`}
                />
                {validationErrors.mobile && (
                  <p className="text-[10px] text-red-500 font-bold flex items-center space-x-1 animate-pulse">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{validationErrors.mobile}</span>
                  </p>
                )}
              </div>

            </div>

            {/* MESSAGE TEXTAREA */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center space-x-1">
                  <span>विस्तृत संदेश</span>
                  <span className="text-red-500">*</span>
                </label>
                <span className={`text-[10px] font-sans font-medium ${message.length > 900 ? "text-orange-500 font-bold" : "text-slate-400"}`}>
                  {message.length} / 1000 अक्षरों की सीमा
                </span>
              </div>
              <textarea 
                rows={6}
                maxLength={1000}
                placeholder="अपना विस्तृत संदेश यहाँ साझा करें..."
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (validationErrors.message) setValidationErrors(prev => ({ ...prev, message: "" }));
                }}
                className={`w-full bg-white dark:bg-slate-950/60 border rounded-xl p-4 text-xs focus:outline-none focus:border-orange-500/80 focus:ring-1 focus:ring-orange-500/30 text-slate-800 dark:text-slate-200 transition-all leading-relaxed ${
                  validationErrors.message ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : "border-slate-200 dark:border-slate-800"
                }`}
              />
              {validationErrors.message && (
                <p className="text-[10px] text-red-500 font-bold flex items-center space-x-1 animate-pulse">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{validationErrors.message}</span>
                </p>
              )}
            </div>

            {/* SUBMISSION PROGRESS FLOW */}
            <AnimatePresence>
              {isSubmitting && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-orange-500/5 border border-orange-500/20 p-5 rounded-2xl flex flex-col md:flex-row items-center md:items-start justify-between gap-4 select-none font-sans"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-5.5 h-5.5 rounded-full border-2 border-slate-300 dark:border-slate-700 border-t-[#EA580C] animate-spin shrink-0"></div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-800 dark:text-white">कृपया प्रतीक्षा करें...</p>
                      <p className="text-xs text-slate-500 font-light">
                        {submittingStep === 1 && "सूचना दर्ज की जा रही है..."}
                        {submittingStep === 2 && "संपादक मंडल को प्रेषित किया जा रहा है..."}
                        {submittingStep === 3 && "पावती पत्र तैयार किया जा रहा है..."}
                      </p>
                    </div>
                  </div>
                  
                  {/* Visual Step Dots */}
                  <div className="flex items-center space-x-2 mt-2 md:mt-1 shrink-0">
                    <span className={`w-2 h-2 rounded-full transition-all duration-300 ${submittingStep >= 1 ? "bg-[#EA580C] scale-110" : "bg-slate-300 dark:bg-slate-800"}`}></span>
                    <span className="h-[1px] w-4 bg-slate-300 dark:bg-slate-800"></span>
                    <span className={`w-2 h-2 rounded-full transition-all duration-300 ${submittingStep >= 2 ? "bg-[#EA580C] scale-110" : "bg-slate-300 dark:bg-slate-800"}`}></span>
                    <span className="h-[1px] w-4 bg-slate-300 dark:bg-slate-800"></span>
                    <span className={`w-2 h-2 rounded-full transition-all duration-300 ${submittingStep >= 3 ? "bg-[#EA580C] scale-110" : "bg-slate-300 dark:bg-slate-800"}`}></span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* BUTTON CONTROLS */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-900/60 font-sans">
              <button
                type="button"
                onClick={handleClearForm}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 text-center"
              >
                फ़ॉर्म साफ करें
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 bg-[#EA580C] text-white hover:bg-[#EA580C]/90 text-xs font-bold rounded-xl transition-all shadow-[0_4px_16px_rgba(234,88,12,0.25)] flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4 shrink-0" />
                <span>संदेश भेजें</span>
              </button>
            </div>

          </form>

          {/* SECTION 5 - PRIVACY & TRUST CARDS / TRUST SECTION */}
          <div className="border-t border-slate-100 dark:border-slate-900/60 pt-8 space-y-6">
            <div className="max-w-2xl mx-auto text-center space-y-2.5 font-sans">
              <h3 className="text-slate-800 dark:text-slate-200 font-bold text-base flex items-center justify-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#EA580C] shrink-0" />
                <span>🛡 आपकी जानकारी सुरक्षित है</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-light">
                आपके द्वारा साझा की गई जानकारी पूर्ण गोपनीयता के साथ सुरक्षित रखी जाती है तथा केवल संपादकीय संवाद और आवश्यक संपर्क हेतु उपयोग की जाती है।
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 font-sans text-center">
              <div className="space-y-1.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all duration-200">
                <div className="mx-auto w-8 h-8 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 text-[#EA580C] flex items-center justify-center">
                  <ShieldCheck className="w-4.5 h-4.5" />
                </div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">जानकारी सुरक्षित है</h4>
                <p className="text-[10px] text-slate-400">आपकी डेटा गोपनीयता प्राथमिकता है</p>
              </div>

              <div className="space-y-1.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all duration-200">
                <div className="mx-auto w-8 h-8 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 text-[#EA580C] flex items-center justify-center">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">केवल संपादकीय उपयोग</h4>
                <p className="text-[10px] text-slate-400">कोई व्यावसायिक प्रसार नहीं</p>
              </div>

              <div className="space-y-1.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all duration-200">
                <div className="mx-auto w-8 h-8 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 text-[#EA580C] flex items-center justify-center">
                  <Zap className="w-4.5 h-4.5" />
                </div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">त्वरित प्रतिक्रिया</h4>
                <p className="text-[10px] text-slate-400">48 घंटे के भीतर संपर्क</p>
              </div>

              <div className="space-y-1.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-all duration-200">
                <div className="mx-auto w-8 h-8 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 text-[#EA580C] flex items-center justify-center">
                  <Lock className="w-4.5 h-4.5" />
                </div>
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">पूर्ण गोपनीयता</h4>
                <p className="text-[10px] text-slate-400">अप्रत्यक्ष संवाद और सुरक्षा</p>
              </div>
            </div>
          </div>

        </GlassCard>

        {/* SECTION 6 - COLLAPSIBLE FAQS ACCORDION */}
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white font-serif">
              अक्सर पूछे जाने वाले प्रश्न (FAQ)
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-sans max-w-xl mx-auto">
              संपादकीय डेस्क से संपर्क करने से पूर्व सामान्य प्रश्नों के उत्तर प्राप्त करें।
            </p>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            {FAQS?.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#0F172A]/40 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    type="button"
                    className="w-full px-6 py-4.5 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50 dark:hover:bg-[#0F172A]/60 transition-colors"
                  >
                    <span className="font-bold text-slate-800 dark:text-white pr-4 text-sm md:text-base leading-snug">
                      {faq.question}
                    </span>
                    <span className="shrink-0 p-1.5 bg-orange-500/10 dark:bg-orange-500/20 text-[#EA580C] rounded-lg">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-6 pb-5 border-t border-slate-100 dark:border-slate-900/60 pt-4 text-xs md:text-sm text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 7 - AUTHOR CONTRIBUTION CTA BANNER */}
        <div className="relative rounded-[24px] bg-gradient-to-br from-[#EA580C] to-[#C2410C] p-8 md:p-12 text-white overflow-hidden shadow-[0_8px_32px_rgba(234,88,12,0.3)]">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-3.5 max-w-2xl">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-sans font-bold">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                <span>लेखक आमंत्रण</span>
              </div>
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold font-serif leading-tight">
                क्या आप नियमित लेखक बनना चाहते हैं?
              </h3>
              <p className="text-white/80 text-sm md:text-base leading-relaxed font-sans font-light">
                अपने विचारों, लेखों and कहानियों को सीधे हमारे लेखक पोर्टल पर सबमिट करें और युवाक्षर लेखक समुदाय का हिस्सा बनें।
              </p>
            </div>
            
            <div className="shrink-0 font-sans">
              <Link 
                href="/submit-article" 
                className="inline-flex items-center space-x-2 px-6 py-3.5 bg-slate-950 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all hover:scale-[1.03] active:scale-[0.98] shadow-lg"
              >
                <span>लेखक पोर्टल पर जाएँ</span>
                <Send className="w-3.5 h-3.5 text-[#EA580C]" />
              </Link>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
