import React from "react";
import { 
  BookOpen, 
  Image as ImageIcon, 
  User,
  FileEdit,
  Bookmark
} from "lucide-react";

export type ProfileTabId = "articles" | "media" | "about" | "drafts" | "bookmarks";

interface ProfileTabsProps {
  activeTab: ProfileTabId;
  setActiveTab: (tab: ProfileTabId) => void;
  isOwner: boolean;
}

export default function ProfileTabs({ activeTab, setActiveTab, isOwner }: ProfileTabsProps) {
  const publicTabs = [
    { id: "articles" as ProfileTabId, label: "लेख", icon: BookOpen },
    { id: "media" as ProfileTabId, label: "मीडिया", icon: ImageIcon },
  ];

  const ownerTabs = isOwner ? [
    { id: "drafts" as ProfileTabId, label: "ड्राफ्ट", icon: FileEdit },
    { id: "bookmarks" as ProfileTabId, label: "बुकमार्क", icon: Bookmark },
  ] : [];
  
  // "About" always comes last
  const aboutTab = { id: "about" as ProfileTabId, label: "परिचय", icon: User };

  const tabs = [...publicTabs, ...ownerTabs, aboutTab];

  return (
    <div className="sticky top-[72px] z-30 bg-slate-50/80 dark:bg-[#0A0F1D]/80 backdrop-blur-md pt-2 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar px-2 sm:px-0 pb-1">
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
