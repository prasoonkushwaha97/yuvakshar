import React from "react";
import Link from "next/link";
import { FileEdit, Clock, AlertCircle, FileText, XCircle } from "lucide-react";
import { Profile } from "@/store/types";

interface ProfileDraftsTabProps {
  user: Profile;
}

// Temporary mock data since backend for this isn't specified yet
const MOCK_DRAFTS = [
  { id: "1", title: "भारत की अर्थव्यवस्था: एक नया दृष्टिकोण", status: "draft", lastEdited: "2 घंटे पहले" },
  { id: "2", title: "तकनीकी विकास और हमारा समाज", status: "submitted", lastEdited: "कल" },
  { id: "3", title: "जलवायु परिवर्तन का प्रभाव", status: "revision_required", lastEdited: "3 दिन पहले" },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "draft":
      return <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 px-2 py-1 rounded-full"><FileEdit className="w-3 h-3" /> ड्राफ्ट</span>;
    case "submitted":
      return <span className="flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded-full"><FileText className="w-3 h-3" /> समीक्षा के लिए</span>;
    case "revision_required":
      return <span className="flex items-center gap-1 text-xs font-bold text-[#F97316] bg-[#F97316]/10 dark:bg-[#F97316]/20 dark:text-[#F97316] px-2 py-1 rounded-full"><AlertCircle className="w-3 h-3" /> संशोधन आवश्यक</span>;
    case "scheduled":
      return <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400 px-2 py-1 rounded-full"><Clock className="w-3 h-3" /> शेड्यूल्ड</span>;
    case "rejected":
      return <span className="flex items-center gap-1 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded-full"><XCircle className="w-3 h-3" /> अस्वीकृत</span>;
    default:
      return null;
  }
};

export default function ProfileDraftsTab({ user }: ProfileDraftsTabProps) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">आपके ड्राफ्ट्स</h3>
        <Link href="/workspace/articles/new" className="text-sm font-bold text-[#F97316] hover:underline">
          नया लेख लिखें →
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {MOCK_DRAFTS.map((draft) => (
          <div key={draft.id} className="bg-white dark:bg-[#0F172A] p-5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                {getStatusBadge(draft.status)}
                <span className="text-xs text-slate-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {draft.lastEdited}</span>
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white truncate leading-[1.5]">
                {draft.title}
              </h4>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <Link href={`/workspace/articles/${draft.id}/edit`} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors">
                संपादित करें
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
