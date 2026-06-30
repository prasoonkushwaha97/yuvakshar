import React from "react";
import { Award, Briefcase, GraduationCap, Lightbulb, Quote } from "lucide-react";
import { Profile } from "@/store/types";

interface ProfileSidebarProps {
  user: Profile;
}

export default function ProfileSidebar({ user }: ProfileSidebarProps) {
  return (
    <div className="space-y-8 w-full md:w-[320px] lg:w-[360px] shrink-0">
      
      {/* Introduction / About */}
      <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm font-serif">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800/60 pb-3">
          परिचय
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
          {user.bio || "युवाक्षर के सक्रिय सदस्य। ज्ञान, विचार और रचनात्मकता के मंच पर अपने अनुभवों को साझा करते हुए।"}
        </p>
      </div>

      {/* Details (Education, Occupation, Interests) */}
      <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm font-serif space-y-6">
        
        {user.institution && (
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#F97316]" />
              <span>शिक्षा एवं संस्थान</span>
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {user.institution}
            </p>
          </div>
        )}

        {(user.current_role || user.designation) && (
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#F97316]" />
              <span>पेशा एवं भूमिका</span>
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {user.designation || user.role} {user.current_role && `• ${user.current_role}`}
            </p>
          </div>
        )}

        {user.expertise_tags && user.expertise_tags.length > 0 && (
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#F97316]" />
              <span>रुचियां एवं विशेषज्ञता</span>
            </h3>
            <div className="flex flex-wrap gap-2">
              {user.expertise_tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Achievements Section */}
      {user.achievements && user.achievements.length > 0 && (
        <div className="bg-white dark:bg-[#0F172A] p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm font-serif">
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-4 border-b border-slate-100 dark:border-slate-800/60 pb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-[#F97316]" />
            <span>पुरस्कार एवं उपलब्धियाँ</span>
          </h3>
          <div className="space-y-4">
            {user.achievements.map((ach) => (
              <div key={ach.id} className="flex gap-3 items-start border-b border-slate-50 dark:border-slate-800/40 pb-4 last:border-0 last:pb-0">
                <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-snug">{ach.title}</h4>
                  {ach.year && <span className="text-[10px] text-slate-400 font-sans font-bold block mt-1">{ach.year}</span>}
                  {ach.description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{ach.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quote Sidebar Widget */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#F97316]/10 to-transparent dark:from-[#F97316]/5 dark:to-[#0A0F1D] p-6 rounded-3xl border border-[#F97316]/20 shadow-sm">
        <Quote className="w-10 h-10 text-[#F97316]/20 absolute top-4 left-4" />
        <div className="relative z-10 pt-4">
          <p className="text-slate-700 dark:text-slate-300 font-serif text-lg font-medium italic leading-relaxed text-center px-2">
            "साहित्य और विचार वह दर्पण हैं जिसमें समाज अपना वास्तविक रूप देखता है।"
          </p>
          <div className="mt-4 text-center">
            <span className="text-xs font-bold text-[#F97316] uppercase tracking-wider">— युवाक्षर दर्शन</span>
          </div>
        </div>
      </div>

    </div>
  );
}
