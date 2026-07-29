import React from "react";
import Link from "next/link";
import { MessageSquare, Eye, ThumbsUp, CheckCircle, Clock, Tag } from "lucide-react";
import { QnaQuestion } from "@/lib/qnaService";
import { CH_CLASS, CH_ANIMATIONS, CH_RADIUS } from "../shared/design";
import Avatar from "@/components/shared/Avatar";

interface QuestionCardProps {
  question: QnaQuestion;
  onVote?: (e: React.MouseEvent, qId: string) => void;
}

export default function QuestionCard({ question, onVote }: QuestionCardProps) {
  const isVoted = question.user_voted === "up";

  return (
    <div className={`${CH_CLASS.card} p-5 sm:p-6 flex flex-col gap-4 ${CH_ANIMATIONS.transition} hover:border-[#F97316]/30`}>
      {/* Top Header: Author Info & Status Badges */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar
            url={question.author_avatar}
            name={question.author_name}
            className="w-10 h-10 rounded-full shrink-0 border border-slate-200 dark:border-slate-800"
          />
          <div className="min-w-0 flex flex-col">
            <span className="font-serif font-bold text-sm text-slate-900 dark:text-white truncate">
              {question.author_name}
            </span>
            <span className="text-[11px] text-slate-400 font-sans flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date(question.created_at).toLocaleDateString("hi-IN", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {question.is_solved && (
            <span className="inline-flex items-center gap-1 text-xs font-bold font-sans text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
              <CheckCircle className="w-3.5 h-3.5" />
              हल किया गया
            </span>
          )}
          <span className="text-xs font-bold font-sans text-[#F97316] bg-[#F97316]/10 px-2.5 py-1 rounded-full border border-[#F97316]/20">
            {question.category}
          </span>
        </div>
      </div>

      {/* Title & Excerpt */}
      <Link href={`/community/qna/${question.slug}`} className="group space-y-2">
        <h2 className="font-serif font-bold text-lg sm:text-xl text-slate-900 dark:text-white group-hover:text-[#F97316] transition-colors leading-[1.5]">
          {question.title}
        </h2>
        <p className="text-slate-600 dark:text-slate-300 font-sans text-sm line-clamp-2 leading-relaxed">
          {question.description}
        </p>
      </Link>

      {/* Tags Chips */}
      {question.tags && question.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {question.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-[11px] font-sans text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-full"
            >
              <Tag className="w-3 h-3 opacity-60" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Action Stats Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/60 text-xs font-sans text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => onVote?.(e, question.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 ${CH_RADIUS.button} transition-colors ${
              isVoted
                ? "bg-[#F97316]/10 text-[#F97316] font-bold"
                : "hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            <ThumbsUp className={`w-4 h-4 ${isVoted ? "fill-[#F97316]" : ""}`} />
            <span>{question.upvotes} वोट</span>
          </button>

          <Link
            href={`/community/qna/${question.slug}`}
            className="flex items-center gap-1.5 hover:text-[#F97316] transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{question.answers_count} उत्तर</span>
          </Link>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <Eye className="w-3.5 h-3.5" />
          <span>{question.views} दृश्य</span>
        </div>
      </div>
    </div>
  );
}
