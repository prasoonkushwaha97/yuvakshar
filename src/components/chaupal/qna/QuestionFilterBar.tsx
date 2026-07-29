import React from "react";
import { Search, Filter, Layers } from "lucide-react";
import { QNA_CATEGORIES, QNA_FILTERS } from "@/lib/qnaService";
import { CH_CLASS, CH_ANIMATIONS, CH_RADIUS } from "../shared/design";

interface QuestionFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeFilter: string;
  onFilterChange: (f: string) => void;
  activeCategory: string;
  onCategoryChange: (c: string) => void;
}

export default function QuestionFilterBar({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  activeCategory,
  onCategoryChange,
}: QuestionFilterBarProps) {
  return (
    <div className="flex flex-col gap-4 font-sans">
      {/* Search Input */}
      <div className="relative w-full">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="अपना प्रश्न खोजें..."
          className="w-full pl-12 pr-4 py-3 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#F97316] transition-colors shadow-sm"
        />
      </div>

      {/* Primary Status & Sort Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-bold text-slate-400 shrink-0 mr-1 hidden sm:flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" /> फ़िल्टर:
        </span>
        {QNA_FILTERS.map((filter) => {
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={`px-3.5 py-1.5 text-xs font-bold font-sans rounded-full shrink-0 ${CH_ANIMATIONS.transition} ${
                isActive
                  ? "bg-[#F97316] text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Category Pills Selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-t border-slate-100 dark:border-slate-800/80 pt-3">
        <span className="text-xs font-bold text-slate-400 shrink-0 mr-1 hidden sm:flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" /> श्रेणी:
        </span>
        {QNA_CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1 text-[11px] font-semibold font-sans rounded-full shrink-0 ${CH_ANIMATIONS.transition} ${
                isActive
                  ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                  : "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
