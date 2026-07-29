import React from "react";
import { ThumbsUp, CheckCircle, Clock } from "lucide-react";
import { QnaAnswer } from "@/lib/qnaService";
import { CH_CLASS, CH_ANIMATIONS, CH_RADIUS } from "../shared/design";
import Avatar from "@/components/shared/Avatar";

interface AnswerCardProps {
  answer: QnaAnswer;
  isQuestionOwner: boolean;
  onVoteAnswer: (answerId: string) => void;
  onAcceptAnswer: (answerId: string) => void;
}

export default function AnswerCard({
  answer,
  isQuestionOwner,
  onVoteAnswer,
  onAcceptAnswer,
}: AnswerCardProps) {
  const isVoted = answer.user_voted === "up";

  return (
    <div
      className={`${CH_CLASS.card} p-5 sm:p-6 flex flex-col gap-4 font-sans ${
        answer.is_accepted
          ? "border-2 border-emerald-500/80 bg-emerald-50/20 dark:bg-emerald-950/10"
          : ""
      }`}
    >
      {/* Answer Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar
            url={answer.author_avatar}
            name={answer.author_name}
            className="w-10 h-10 rounded-full shrink-0 border border-slate-200 dark:border-slate-800"
          />
          <div>
            <span className="font-serif font-bold text-sm text-slate-900 dark:text-white block">
              {answer.author_name}
            </span>
            <span className="text-[11px] text-slate-400 font-sans flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(answer.created_at).toLocaleDateString("hi-IN", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
        </div>

        {answer.is_accepted && (
          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-700">
            <CheckCircle className="w-4 h-4" />
            स्वीकृत उत्तर (Accepted)
          </span>
        )}
      </div>

      {/* Answer Content */}
      <div className="text-slate-700 dark:text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
        {answer.content}
      </div>

      {/* Footer Controls: Upvote & Accept Answer Button */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/60 text-xs">
        <button
          onClick={() => onVoteAnswer(answer.id)}
          className={`flex items-center gap-1.5 px-3 py-1.5 ${CH_RADIUS.button} ${CH_ANIMATIONS.transition} ${
            isVoted
              ? "bg-[#F97316]/10 text-[#F97316] font-bold"
              : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          }`}
        >
          <ThumbsUp className={`w-4 h-4 ${isVoted ? "fill-[#F97316]" : ""}`} />
          <span>{answer.upvotes} वोट</span>
        </button>

        {isQuestionOwner && !answer.is_accepted && (
          <button
            onClick={() => onAcceptAnswer(answer.id)}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>उत्तर स्वीकृत करें</span>
          </button>
        )}
      </div>
    </div>
  );
}
