import React from "react";
import { Profile } from "@/store/types";
import { Calendar, Globe, MapPin, ExternalLink } from "lucide-react";

interface ProfileAboutTabProps {
  user: Profile;
}

export default function ProfileAboutTab({ user }: ProfileAboutTabProps) {
  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-100 dark:border-slate-800 p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Biography Section */}
      <section className="space-y-3">
        <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          लेखक का परिचय
        </h3>
        <div className="text-slate-600 dark:text-slate-300 font-sans text-[15px] leading-relaxed whitespace-pre-wrap bg-slate-50 dark:bg-slate-900/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/50">
          {user.bio || "इस लेखक ने अभी तक अपना परिचय नहीं जोड़ा है।"}
        </div>
      </section>

      {/* Details Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-2">विवरण (Details)</h4>
          
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>सदस्य: {new Date().getFullYear()} से</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <Globe className="w-4 h-4 text-slate-400" />
            {user.website ? (
              <a href={user.website} target="_blank" rel="noreferrer" className="hover:text-[#F97316] hover:underline transition-colors">
                {user.website.replace(/^https?:\/\//, '')}
              </a>
            ) : (
              <span>वेबसाइट उपलब्ध नहीं</span>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <MapPin className="w-4 h-4 text-slate-400" />
            <span>{(user as any).location || "स्थान उपलब्ध नहीं"}</span>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-2">संपर्क (Contact)</h4>
          <div className="flex flex-wrap gap-2">
            {(user as any).twitter_url && (
              <a href={(user as any).twitter_url} target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-slate-50 hover:bg-[#F97316]/10 text-slate-500 hover:text-[#F97316] transition-colors border border-slate-100 dark:border-slate-800 dark:bg-slate-900" title="Twitter">
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {(user as any).linkedin_url && (
              <a href={(user as any).linkedin_url} target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-slate-50 hover:bg-[#F97316]/10 text-slate-500 hover:text-[#F97316] transition-colors border border-slate-100 dark:border-slate-800 dark:bg-slate-900" title="LinkedIn">
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {(user as any).facebook_url && (
              <a href={(user as any).facebook_url} target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-slate-50 hover:bg-[#F97316]/10 text-slate-500 hover:text-[#F97316] transition-colors border border-slate-100 dark:border-slate-800 dark:bg-slate-900" title="Facebook">
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {(user as any).instagram_url && (
              <a href={(user as any).instagram_url} target="_blank" rel="noreferrer" className="p-2.5 rounded-full bg-slate-50 hover:bg-[#F97316]/10 text-slate-500 hover:text-[#F97316] transition-colors border border-slate-100 dark:border-slate-800 dark:bg-slate-900" title="Instagram">
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            {!((user as any).twitter_url || (user as any).linkedin_url || (user as any).facebook_url || (user as any).instagram_url) && (
              <span className="text-sm text-slate-400">कोई सोशल लिंक नहीं</span>
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
