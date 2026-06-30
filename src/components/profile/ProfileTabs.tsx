import React from "react";
import { BookOpen, Bookmark, Edit2, Heart, MessageSquare, Image as ImageIcon } from "lucide-react";

export type ProfileTabId = "articles" | "community" | "bookmarks" | "drafts" | "likes" | "comments" | "media";

interface ProfileTabsProps {
  activeTab: ProfileTabId;
  setActiveTab: (tab: ProfileTabId) => void;
  isOwner: boolean;
}

export default function ProfileTabs({ activeTab, setActiveTab, isOwner }: ProfileTabsProps) {
  const tabs = [
    { id: "articles" as ProfileTabId, label: "लेख", icon: BookOpen },
    { id: "community" as ProfileTabId, label: "चौपाल", icon: MessageSquare },
    { id: "bookmarks" as ProfileTabId, label: "बुकमार्क्स", icon: Bookmark },
    ...(isOwner ? [{ id: "drafts" as ProfileTabId, label: "ड्राफ्ट्स", icon: Edit2 }] : []),
    { id: "likes" as ProfileTabId, label: "लाइक्स", icon: Heart },
    { id: "comments" as ProfileTabId, label: "टिप्पणियाँ", icon: MessageSquare },
    { id: "media" as ProfileTabId, label: "मीडिया", icon: ImageIcon },
  ];

  return (
    <div className="sticky top-[72px] z-30 bg-slate-50/80 dark:bg-[#0A0F1D]/80 backdrop-blur-md pt-2 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar px-2 sm:px-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 py-4 px-1 text-sm font-bold font-serif whitespace-nowrap transition-colors cursor-pointer ${
                isActive 
                  ? "text-slate-900 dark:text-white" 
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-[#F97316]" : ""}`} />
              <span>{tab.label}</span>
              
              {/* Animated underline */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#F97316] rounded-t-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
