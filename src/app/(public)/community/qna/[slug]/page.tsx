"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, notFound } from "next/navigation";
import {
  ArrowLeft,
  ThumbsUp,
  MessageSquare,
  Eye,
  CheckCircle,
  Clock,
  Tag,
  Send,
  Share2,
  Bookmark,
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import {
  getQuestionBySlug,
  addQnaAnswer,
  voteQuestion,
  voteAnswer,
  acceptAnswer,
  QnaQuestion,
  QnaAnswer,
} from "@/lib/qnaService";
import { CH_CLASS, CH_COLORS, CH_ANIMATIONS, CH_RADIUS } from "@/components/chaupal/shared/design";
import Avatar from "@/components/shared/Avatar";
import AnswerCard from "@/components/chaupal/qna/AnswerCard";
import ShareModal from "@/components/shared/ShareModal";

export default function QuestionDetailPage() {
  const params = useParams();
  const rawSlug = params?.slug as string;
  const slug = rawSlug ? decodeURIComponent(rawSlug) : "";

  const { currentUser, openAuthModal } = useCms();
  const [question, setQuestion] = useState<QnaQuestion | null>(null);
  const [answerContent, setAnswerContent] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (slug) {
      const q = getQuestionBySlug(slug);
      setQuestion(q);
    }
  }, [slug]);

  if (!question) {
    return (
      <div className="p-8 text-center font-sans text-slate-500 min-h-screen flex items-center justify-center">
        प्रश्न लोड हो रहा है...
      </div>
    );
  }

  const isQuestionOwner = currentUser?.id === question.author_id;
  const isVoted = question.user_voted === "up";

  const handleQuestionVote = () => {
    if (!currentUser) {
      openAuthModal();
      return;
    }
    const updated = voteQuestion(question.id, currentUser.id);
    if (updated) setQuestion({ ...updated });
  };

  const handleVoteAnswer = (answerId: string) => {
    if (!currentUser) {
      openAuthModal();
      return;
    }
    const updatedAns = voteAnswer(question.id, answerId);
    if (updatedAns && question) {
      const updatedAnswers = (question.answers || []).map((a) =>
        a.id === answerId ? { ...updatedAns } : a
      );
      setQuestion({ ...question, answers: updatedAnswers });
    }
  };

  const handleAcceptAnswer = (answerId: string) => {
    if (!currentUser || !isQuestionOwner) return;
    const success = acceptAnswer(question.id, answerId);
    if (success) {
      const reloaded = getQuestionBySlug(slug);
      if (reloaded) setQuestion({ ...reloaded });
    }
  };

  const handlePostAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      openAuthModal();
      return;
    }

    if (!answerContent.trim()) return;

    setSubmittingAnswer(true);
    try {
      addQnaAnswer(question.id, {
        author_id: currentUser.id,
        author_name: currentUser.name || "चौपाल उपयोगकर्ता",
        author_username: currentUser.username || currentUser.slug,
        author_avatar: currentUser.avatar_url,
        content: answerContent.trim(),
      });

      const updated = getQuestionBySlug(slug);
      if (updated) setQuestion({ ...updated });
      setAnswerContent("");
    } finally {
      setSubmittingAnswer(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 font-sans min-h-screen">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <Link
          href="/community/qna"
          className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-[#F97316] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>सभी प्रश्न</span>
        </Link>

        <button
          onClick={() => setShareOpen(true)}
          className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          title="साझा करें"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {/* Question Main Card */}
      <div className={`${CH_CLASS.card} p-6 sm:p-8 flex flex-col gap-5`}>
        {/* Badges & Meta */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-bold text-[#F97316] bg-[#F97316]/10 px-3 py-1 rounded-full border border-[#F97316]/20">
            {question.category}
          </span>

          {question.is_solved && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
              <CheckCircle className="w-4 h-4" />
              हल किया गया
            </span>
          )}
        </div>

        {/* Question Title */}
        <h1 className="font-serif font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white leading-tight">
          {question.title}
        </h1>

        {/* Author Header */}
        <div className="flex items-center gap-3 pt-2">
          <Avatar
            url={question.author_avatar}
            name={question.author_name}
            className="w-11 h-11 rounded-full shrink-0 border border-slate-200 dark:border-slate-800"
          />
          <div>
            <span className="font-serif font-bold text-sm text-slate-900 dark:text-white block">
              {question.author_name}
            </span>
            <span className="text-xs text-slate-400 font-sans flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(question.created_at).toLocaleDateString("hi-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Full Question Description */}
        <div className="text-slate-700 dark:text-slate-200 text-base sm:text-lg leading-relaxed whitespace-pre-wrap pt-2">
          {question.description}
        </div>

        {/* Tags */}
        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            {question.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs font-sans text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full"
              >
                <Tag className="w-3.5 h-3.5 opacity-60" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={handleQuestionVote}
              className={`flex items-center gap-2 px-4 py-2 ${CH_RADIUS.button} ${CH_ANIMATIONS.transition} ${
                isVoted
                  ? "bg-[#F97316]/10 text-[#F97316] font-bold"
                  : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
              }`}
            >
              <ThumbsUp className={`w-4 h-4 ${isVoted ? "fill-[#F97316]" : ""}`} />
              <span>{question.upvotes} वोट</span>
            </button>

            <span className="flex items-center gap-1.5 text-slate-500">
              <MessageSquare className="w-4 h-4" />
              <span>{question.answers_count} उत्तर</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400">
            <Eye className="w-4 h-4" />
            <span>{question.views} दृश्य</span>
          </div>
        </div>
      </div>

      {/* Post Answer Form Box */}
      <div className={`${CH_CLASS.card} p-5 sm:p-6 flex flex-col gap-4`}>
        <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
          अपना उत्तर दें
        </h3>

        {!currentUser ? (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 text-center space-y-3 border border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              उत्तर देने के लिए कृपया अपने खाते में प्रवेश करें।
            </p>
            <button
              onClick={() => openAuthModal()}
              className={`${CH_CLASS.buttonPrimary} mx-auto px-5 py-2 text-xs`}
            >
              लॉग इन करें
            </button>
          </div>
        ) : (
          <form onSubmit={handlePostAnswer} className="flex flex-col gap-3">
            <textarea
              rows={4}
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              placeholder="यहाँ अपना समाधान या उत्तर विस्तार से लिखें..."
              className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#F97316] transition-colors leading-relaxed"
            />
            <button
              type="submit"
              disabled={submittingAnswer || !answerContent.trim()}
              className={`${CH_CLASS.buttonPrimary} self-end px-5 py-2.5 shadow-md shadow-orange-500/20 disabled:opacity-50`}
            >
              <Send className="w-4 h-4" />
              <span>{submittingAnswer ? "उत्तर भेजा जा रहा है..." : "उत्तर पोस्ट करें"}</span>
            </button>
          </form>
        )}
      </div>

      {/* Answers List Section */}
      <div className="flex flex-col gap-4 mt-2">
        <h2 className="font-serif font-extrabold text-xl text-slate-900 dark:text-white">
          उत्तर ({question.answers?.length || 0})
        </h2>

        {question.answers && question.answers.length > 0 ? (
          question.answers.map((ans) => (
            <AnswerCard
              key={ans.id}
              answer={ans}
              isQuestionOwner={isQuestionOwner}
              onVoteAnswer={handleVoteAnswer}
              onAcceptAnswer={handleAcceptAnswer}
            />
          ))
        ) : (
          <div className="p-8 text-center font-sans text-slate-400 text-sm bg-white dark:bg-[#0F172A] rounded-2xl border border-slate-100 dark:border-slate-800">
            अभी तक कोई उत्तर नहीं दिया गया है। पहला उत्तर देकर सहायता करें!
          </div>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={question.title}
        url={typeof window !== "undefined" ? window.location.href : ""}
        summary={question.description}
      />
    </div>
  );
}
