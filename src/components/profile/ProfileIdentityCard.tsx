import React from "react";
import Image from "next/image";
import { CheckCircle2, Calendar, MapPin, Link as LinkIcon } from "lucide-react";
import { Profile } from "@/store/types";

// Social SVG Icons for cleaner presentation
const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);
const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
);

interface ProfileIdentityCardProps {
  user: Profile;
}

export default function ProfileIdentityCard({ user }: ProfileIdentityCardProps) {
  const isVerified = (user as any).is_verified || user.verified || false;
  const joinDate = user.joinDate || "जून २०२६";

  return (
    <div className="relative z-20 -mt-24 sm:-mt-28 md:-mt-32 p-6 sm:p-8 bg-white dark:bg-[#0F172A] rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/40 border border-slate-100 dark:border-slate-800 font-sans">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start text-center md:text-left">
        
        {/* Profile Photo */}
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white dark:border-[#0F172A] overflow-hidden bg-slate-50 dark:bg-slate-900 shadow-md shrink-0 relative group">
          {user.avatar_url ? (
            <Image 
              src={user.avatar_url} 
              alt={user.display_name || user.name || ""} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              fill 
              sizes="160px"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <span className="text-4xl font-bold uppercase">{(user.display_name || user.name || "U")?.[0]}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4 flex-grow w-full">
          <div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold font-serif text-slate-850 dark:text-white flex items-center gap-2">
                <span>{user.display_name || user.name}</span>
                {isVerified && (
                  <CheckCircle2 className="w-6 h-6 text-blue-500 fill-blue-500/10 shrink-0" />
                )}
              </h1>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                @{user.username || user.slug || user.id}
              </span>
              
              {user.designation || user.role ? (
                <span className="inline-flex items-center text-[10px] font-bold font-sans rounded-full px-2.5 py-0.5 bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20">
                  {user.designation || user.role}
                </span>
              ) : null}
            </div>
          </div>

          {/* Short Bio */}
          {user.bio && (
            <p className="text-slate-655 dark:text-slate-300 text-sm sm:text-base font-serif leading-relaxed max-w-3xl">
              {user.bio}
            </p>
          )}

          {/* Metadata: Join Date & Location */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-xs text-slate-450 dark:text-slate-500 font-sans pt-1">
            {user.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{user.location}</span>
              </span>
            )}
            
            {user.website && (
              <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#F97316] transition-colors">
                <LinkIcon className="w-3.5 h-3.5" />
                <span className="underline decoration-slate-300 dark:decoration-slate-700 underline-offset-4">वेबसाइट</span>
              </a>
            )}

            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>सदस्यता (Joined): {joinDate}</span>
            </span>
          </div>

          {/* Social Links */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 mt-3">
            {user.social_links?.twitter && (
              <a href={user.social_links.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 hover:bg-[#1DA1F2]/10 text-slate-600 hover:text-[#1DA1F2] dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-[#1DA1F2]/20 dark:hover:text-[#1DA1F2] transition-colors">
                <TwitterIcon className="w-4 h-4" />
              </a>
            )}
            {user.social_links?.linkedin && (
              <a href={user.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 hover:bg-[#0A66C2]/10 text-slate-600 hover:text-[#0A66C2] dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-[#0A66C2]/20 dark:hover:text-[#0A66C2] transition-colors">
                <LinkedinIcon className="w-4 h-4" />
              </a>
            )}
            {!user.social_links?.twitter && !user.social_links?.linkedin && (
              <span className="text-[10px] text-slate-400 font-sans italic">सोशल मीडिया लिंक उपलब्ध नहीं हैं</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
