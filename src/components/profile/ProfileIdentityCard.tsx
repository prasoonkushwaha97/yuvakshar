import React from "react";
import Image from "next/image";
import { CheckCircle2, MapPin, Calendar, Link as LinkIcon } from "lucide-react";
import { Profile } from "@/store/types";

// Inline brand SVGs to replace missing lucide-react brand exports
const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
);
const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
);
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
);
const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
);
const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
);

interface ProfileIdentityCardProps {
  user: Profile;
  isLeadership: boolean;
}

export default function ProfileIdentityCard({ user, isLeadership }: ProfileIdentityCardProps) {
  return (
    <div className={`relative z-20 -mt-24 sm:-mt-28 md:-mt-32 p-6 sm:p-8 bg-white dark:bg-[#0F172A] rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-black/40 border ${
      isLeadership 
        ? "border-amber-200/80 dark:border-amber-900/50" 
        : "border-slate-100 dark:border-slate-800"
    }`}>
      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-start text-center md:text-left">
        
        {/* Avatar */}
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-white dark:border-[#0F172A] overflow-hidden bg-slate-50 dark:bg-slate-900 shadow-md shrink-0 relative group">
          {user.avatar_url ? (
            <Image 
              src={user.avatar_url} 
              alt={user.display_name || user.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              fill 
              sizes="160px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400">
              <span className="text-4xl font-bold uppercase">{(user.display_name || user.name)?.[0]}</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-4 flex-grow w-full">
          <div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <h1 className="text-3xl sm:text-4xl font-extrabold font-serif text-slate-850 dark:text-white flex items-center gap-2">
                <span>{user.display_name || user.name}</span>
                {user.verified && (
                  <CheckCircle2 className="w-7 h-7 text-[#1DA1F2] fill-[#1DA1F2]/10 shrink-0" />
                )}
              </h1>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                @{user.username}
              </span>
              
              {user.designation || user.role ? (
                <span className="inline-flex items-center text-xs font-bold font-sans rounded-full px-3 py-1 bg-[#F97316]/10 text-[#F97316] border border-[#F97316]/20">
                  {user.designation || user.role}
                </span>
              ) : null}
            </div>
          </div>

          {user.bio && (
            <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base font-serif leading-relaxed max-w-3xl">
              {user.bio}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-2 text-sm text-slate-500 dark:text-slate-400 font-sans pt-1">
            {user.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{user.location}</span>
              </span>
            )}
            
            {user.website && (
              <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#F97316] transition-colors">
                <LinkIcon className="w-4 h-4" />
                <span className="underline decoration-slate-300 dark:decoration-slate-700 underline-offset-4">वेबसाइट</span>
              </a>
            )}

            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              <span>सदस्यता: {user.joinDate || "जून २०२६"}</span>
            </span>
          </div>

          {/* Social Links Area */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/60 mt-4">
            {user.social_links?.twitter && (
              <a href={user.social_links.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 hover:bg-[#1DA1F2]/10 text-slate-600 hover:text-[#1DA1F2] dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-[#1DA1F2]/20 dark:hover:text-[#1DA1F2] transition-colors">
                <TwitterIcon className="w-4.5 h-4.5" />
              </a>
            )}
            {user.social_links?.linkedin && (
              <a href={user.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 hover:bg-[#0A66C2]/10 text-slate-600 hover:text-[#0A66C2] dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-[#0A66C2]/20 dark:hover:text-[#0A66C2] transition-colors">
                <LinkedinIcon className="w-4.5 h-4.5" />
              </a>
            )}
            {user.social_links?.instagram && (
              <a href={user.social_links.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 hover:bg-[#E4405F]/10 text-slate-600 hover:text-[#E4405F] dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-[#E4405F]/20 dark:hover:text-[#E4405F] transition-colors">
                <InstagramIcon className="w-4.5 h-4.5" />
              </a>
            )}
            {user.social_links?.youtube && (
              <a href={user.social_links.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 hover:bg-[#FF0000]/10 text-slate-600 hover:text-[#FF0000] dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-[#FF0000]/20 dark:hover:text-[#FF0000] transition-colors">
                <YoutubeIcon className="w-4.5 h-4.5" />
              </a>
            )}
            {user.social_links?.github && (
              <a href={user.social_links.github} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-50 hover:bg-slate-200 text-slate-600 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white transition-colors">
                <GithubIcon className="w-4.5 h-4.5" />
              </a>
            )}
            {!user.social_links?.twitter && !user.social_links?.linkedin && !user.social_links?.instagram && !user.social_links?.youtube && (
              <span className="text-xs text-slate-400 font-sans italic">सोशल लिंक्स उपलब्ध नहीं हैं</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
