import React from "react";
import Link from "next/link";
import { Bookmark, FileText, Video, BookOpen } from "lucide-react";
import { Profile } from "@/store/types";

interface ProfileBookmarksTabProps {
  user: Profile;
}

// Temporary mock data
const MOCK_BOOKMARKS = [
  { id: "1", type: "article", title: "भारत में स्टार्टअप इकोसिस्टम का भविष्य", author: "प्रसून कुशवाहा", date: "5 जुलाई 2026", link: "#" },
  { id: "2", type: "magazine", title: "युवाक्षर पत्रिका - जुलाई 2026 अंक", author: "संपादकीय टीम", date: "1 जुलाई 2026", link: "#" },
  { id: "3", type: "video", title: "विशेष साक्षात्कार: शिक्षा नीति पर चर्चा", author: "युवाक्षर टीवी", date: "28 जून 2026", link: "#" },
];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "article": return <FileText className="w-4 h-4 text-blue-500" />;
    case "magazine": return <BookOpen className="w-4 h-4 text-green-500" />;
    case "video": return <Video className="w-4 h-4 text-red-500" />;
    default: return <Bookmark className="w-4 h-4 text-slate-500" />;
  }
};

const getTypeName = (type: string) => {
  switch (type) {
    case "article": return "लेख";
    case "magazine": return "पत्रिका";
    case "video": return "वीडियो";
    default: return "अन्य";
  }
};

export default function ProfileBookmarksTab({ user }: ProfileBookmarksTabProps) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">आपके बुकमार्क</h3>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {MOCK_BOOKMARKS.map((item) => (
          <Link key={item.id} href={item.link} className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all group flex flex-col sm:flex-row sm:items-center gap-4 hover:border-slate-200 dark:hover:border-slate-700">
            <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800">
              {getTypeIcon(item.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {getTypeName(item.type)}
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-[11px] text-slate-400 font-sans">{item.date}</span>
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white truncate leading-[1.5]">
                {item.title}
              </h4>
              <p className="text-xs text-slate-500 mt-1">द्वारा {item.author}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
