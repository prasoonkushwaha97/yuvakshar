"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, HelpCircle, Send, Save, AlertCircle } from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { addQnaQuestion, QNA_CATEGORIES } from "@/lib/qnaService";
import { CH_CLASS, CH_COLORS, CH_ANIMATIONS, CH_RADIUS } from "@/components/chaupal/shared/design";

export default function AskQuestionPage() {
  const router = useRouter();
  const { currentUser, openAuthModal } = useCms();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("सामान्य");
  const [tagsInput, setTagsInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent, isDraft = false) => {
    e.preventDefault();
    if (!currentUser) {
      openAuthModal();
      return;
    }

    if (!title.trim()) {
      setErrorMsg("कृपया प्रश्न का शीर्षक दर्ज करें।");
      return;
    }

    if (!description.trim()) {
      setErrorMsg("कृपया प्रश्न का विवरण प्रदान करें।");
      return;
    }

    setErrorMsg("");
    setSubmitting(true);

    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const created = addQnaQuestion({
        title: title.trim(),
        description: description.trim(),
        author_id: currentUser.id,
        author_name: currentUser.name || "चौपाल उपयोगकर्ता",
        author_username: currentUser.username || currentUser.slug,
        author_avatar: currentUser.avatar_url,
        category,
        tags: tags.length > 0 ? tags : [category],
      });

      router.push(`/community/qna/${created.slug}`);
    } catch (err: any) {
      setErrorMsg("प्रश्न सहेजने में विफल। कृपया पुनः प्रयास करें।");
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 font-sans min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link
            href="/community/qna"
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-serif font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-[#F97316]" />
              <span>नया प्रश्न पूछें</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
              चौपाल समुदाय के साथ ज्ञान और विचार साझा करें।
            </p>
          </div>
        </div>
      </div>

      {/* Guest Notice Banner */}
      {!currentUser && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-3 text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-medium">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>प्रश्न प्रकाशित करने के लिए लॉग इन होना आवश्यक है।</span>
          </div>
          <button
            onClick={() => openAuthModal()}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors shrink-0"
          >
            लॉग इन करें
          </button>
        </div>
      )}

      {/* Error Message */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 text-red-600 dark:text-red-400 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {/* Question Form */}
      <form onSubmit={(e) => handleSubmit(e, false)} className={`${CH_CLASS.card} p-5 sm:p-8 flex flex-col gap-6`}>
        {/* Title Field */}
        <div className="flex flex-col gap-2">
          <label className="font-bold text-sm text-slate-900 dark:text-white">
            प्रश्न का शीर्षक <span className="text-[#F97316]">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="उदा. हिंदी पत्रकारिता में नए अवसर कहाँ हैं?"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#F97316] transition-colors"
            maxLength={150}
          />
          <span className="text-[11px] text-slate-400 self-end">{title.length}/150</span>
        </div>

        {/* Category Field */}
        <div className="flex flex-col gap-2">
          <label className="font-bold text-sm text-slate-900 dark:text-white">
            श्रेणी चुनें <span className="text-[#F97316]">*</span>
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-[#F97316] transition-colors"
          >
            {QNA_CATEGORIES.filter((c) => c !== "सभी").map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Description Field */}
        <div className="flex flex-col gap-2">
          <label className="font-bold text-sm text-slate-900 dark:text-white">
            प्रश्न का पूर्ण विवरण <span className="text-[#F97316]">*</span>
          </label>
          <textarea
            rows={6}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="अपने प्रश्न का विस्तार से वर्णन करें ताकि समुदाय के सदस्य आपको सही और स्पष्ट उत्तर दे सकें..."
            className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#F97316] transition-colors leading-relaxed"
          />
        </div>

        {/* Tags Field */}
        <div className="flex flex-col gap-2">
          <label className="font-bold text-sm text-slate-900 dark:text-white">
            टैग्स (कॉमा से अलग करें)
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="उदा. पत्रकारिता, करियर, लेखन"
            className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#F97316] transition-colors"
          />
        </div>

        {/* Form Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            disabled={submitting}
            className={`${CH_CLASS.buttonSecondary} disabled:opacity-50`}
          >
            <Save className="w-4 h-4" />
            <span>ड्राफ्ट सहेजें</span>
          </button>

          <button
            type="submit"
            disabled={submitting}
            className={`${CH_CLASS.buttonPrimary} shadow-md shadow-orange-500/20 disabled:opacity-50`}
          >
            <Send className="w-4 h-4" />
            <span>{submitting ? "प्रकाशन हो रहा है..." : "प्रश्न प्रकाशित करें"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
