import React from "react";
import { 
  BookOpen, 
  Bookmark, 
  Edit2, 
  MessageSquare, 
  Image as ImageIcon, 
  Settings, 
  LayoutDashboard, 
  BookType, 
  Activity, 
  Users, 
  UserPlus, 
  Info 
} from "lucide-react";

export type ProfileTabId = "overview" | "articles" | "community" | "magazine" | "media" | "activity" | "followers" | "following" | "about" | "bookmarks" | "drafts" | "settings";

interface ProfileTabsProps {
  activeTab: ProfileTabId;
  setActiveTab: (tab: ProfileTabId) => void;
  isOwner: boolean;
}

export default function ProfileTabs({ activeTab, setActiveTab, isOwner }: ProfileTabsProps) {
  const publicTabs = [
    { id: "overview" as ProfileTabId, label: "अवलोकन (Overview)", icon: LayoutDashboard },
    { id: "articles" as ProfileTabId, label: "लेख (Articles)", icon: BookOpen },
    { id: "community" as ProfileTabId, label: "चौपाल (Community)", icon: MessageSquare },
    { id: "magazine" as ProfileTabId, label: "पत्रिका (Magazine)", icon: BookType },
    { id: "media" as ProfileTabId, label: "मीडिया (Media)", icon: ImageIcon },
    { id: "activity" as ProfileTabId, label: "गतिविधि (Activity)", icon: Activity },
    { id: "followers" as ProfileTabId, label: "फ़ॉलोअर्स", icon: Users },
    { id: "following" as ProfileTabId, label: "फ़ॉलोइंग", icon: UserPlus },
    { id: "about" as ProfileTabId, label: "परिचय (About)", icon: Info },
  ];

  const ownerTabs = isOwner ? [
    { id: "drafts" as ProfileTabId, label: "ड्राफ्ट्स (Drafts)", icon: Edit2 },
    { id: "bookmarks" as ProfileTabId, label: "बुकमार्क्स (Bookmarks)", icon: Bookmark },
    { id: "settings" as ProfileTabId, label: "सेटिंग्स (Settings)", icon: Settings },
  ] : [];

  const tabs = [...publicTabs, ...ownerTabs];

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
