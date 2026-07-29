"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { PlusCircle, MessageSquareOff } from "lucide-react";
import { useCms } from "@/store/CmsContext";
import {
  getQnaQuestions,
  voteQuestion,
  QnaQuestion,
} from "@/lib/qnaService";
import { CH_CLASS, CH_COLORS, CH_ANIMATIONS, CH_RADIUS } from "@/components/chaupal/shared/design";
import QuestionCard from "@/components/chaupal/qna/QuestionCard";
import QuestionFilterBar from "@/components/chaupal/qna/QuestionFilterBar";

export default function QnaListPage() {
  const { currentUser, openAuthModal } = useCms();
  const [questions, setQuestions] = useState<QnaQuestion[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeCategory, setActiveCategory] = useState("सभी");

  useEffect(() => {
    setQuestions(getQnaQuestions());
  }, []);

  const handleVote = (e: React.MouseEvent, qId: string) => {
    e.preventDefault();
    if (!currentUser) {
      openAuthModal();
      return;
    }
    const updated = voteQuestion(qId, currentUser.id);
    if (updated) {
      setQuestions((prev) =>
        prev.map((item) => (item.id === qId ? { ...updated } : item))
      );
    }
  };

  const filteredQuestions = useMemo(() => {
    let list = [...questions];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (activeCategory !== "सभी") {
      list = list.filter((item) => item.category === activeCategory);
    }

    // Status / Tab filter
    switch (activeFilter) {
      case "unsolved":
        list = list.filter((item) => !item.is_solved);
        break;
      case "solved":
        list = list.filter((item) => item.is_solved);
        break;
      case "popular":
        list.sort((a, b) => b.upvotes + b.views - (a.upvotes + a.views));
        break;
      case "latest":
        list.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case "my_questions":
        if (currentUser) {
          list = list.filter((item) => item.author_id === currentUser.id);
        } else {
          list = [];
        }
        break;
      case "my_answers":
        if (currentUser) {
          list = list.filter((item) =>
            item.answers?.some((a) => a.author_id === currentUser.id)
          );
        } else {
          list = [];
        }
        break;
      default:
        break;
    }

    return list;
  }, [questions, searchQuery, activeFilter, activeCategory, currentUser]);

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 font-sans min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="font-serif font-extrabold text-2xl sm:text-3xl lg:text-[42px] text-slate-900 dark:text-white tracking-tight leading-[1.4]">
            प्रश्नोत्तर
          </h1>
          <p className="text-[#6B7280] dark:text-slate-400 text-base mt-2.5">
            युवाक्षर समुदाय से प्रश्न पूछें, समाधान पाएँ और अपना ज्ञान साझा करें।
          </p>
        </div>

        <Link
          href="/community/qna/ask"
          className={`${CH_CLASS.buttonPrimary} whitespace-nowrap shrink-0 shadow-md shadow-orange-500/20`}
        >
          <PlusCircle className="w-5 h-5" />
          <span>प्रश्न पूछें</span>
        </Link>
      </div>

      {/* Search & Filter Controls */}
      <QuestionFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
      />

      {/* Question Cards List */}
      {filteredQuestions.length > 0 ? (
        <div className="flex flex-col gap-4 mt-2">
          {filteredQuestions.map((q) => (
            <QuestionCard key={q.id} question={q} onVote={handleVote} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className={`${CH_CLASS.card} p-10 sm:p-14 text-center flex flex-col items-center justify-center gap-4 my-6`}>
          <div className="w-16 h-16 rounded-full bg-[#F97316]/10 text-[#F97316] flex items-center justify-center">
            <MessageSquareOff className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md">
            <h3 className="font-serif font-extrabold text-xl text-slate-900 dark:text-white">
              अभी तक कोई प्रश्न नहीं पूछा गया।
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              सबसे पहला प्रश्न पूछें और चौपाल में एक सार्थक चर्चा की शुरुआत करें।
            </p>
          </div>
          <Link
            href="/community/qna/ask"
            className={`${CH_CLASS.buttonPrimary} mt-2 px-6 py-2.5 shadow-md shadow-orange-500/20`}
          >
            <PlusCircle className="w-5 h-5" />
            <span>पहला प्रश्न पूछें</span>
          </Link>
        </div>
      )}
    </div>
  );
}
