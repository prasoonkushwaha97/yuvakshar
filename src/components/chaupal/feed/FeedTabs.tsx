import React from "react";
import { CH_ANIMATIONS, CH_COLORS } from "../shared/design";

interface FeedTabsProps {
  activeTab: "for-you" | "latest" | "trending" | "following" | "groups";
  onTabChange: (tab: "for-you" | "latest" | "trending" | "following" | "groups") => void;
}

export default function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  const tabs = [
    { id: "for-you", label: "आपके लिए" },
    { id: "latest", label: "नवीनतम" },
    { id: "trending", label: "ट्रेंडिंग" },
    { id: "following", label: "फॉलोइंग" },
    { id: "groups", label: "समूह" },
  ] as const;

  return (
    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2 border-b border-slate-200 dark:border-slate-800">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id as any)}
            className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-sm ${CH_ANIMATIONS.transition} ${
              isActive 
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
