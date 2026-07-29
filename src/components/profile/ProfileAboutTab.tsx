import React from "react";
import { Profile } from "@/store/types";
import { Globe, MapPin } from "lucide-react";
import { getProfileSocialLinks } from "@/config/socialPlatforms";
import SocialIcon from "@/components/shared/SocialIcon";
import { formatProfileLocation } from "@/utils/formatLocation";

interface ProfileAboutTabProps {
  user: Profile;
}

export default function ProfileAboutTab({ user }: ProfileAboutTabProps) {
  const socialLinks = getProfileSocialLinks(user);
  const hasSocialLinks = socialLinks.length > 0;

  return (
    <div className="bg-white dark:bg-[#0F172A] rounded-3xl border border-slate-100 dark:border-slate-800 p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 font-sans">
      
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
            <Globe className="w-4 h-4 text-slate-400 shrink-0" />
            {user.website ? (
              <a href={user.website} target="_blank" rel="noreferrer" className="hover:text-[#F97316] hover:underline transition-colors truncate">
                {user.website.replace(/^https?:\/\//, '')}
              </a>
            ) : (
              <span>वेबसाइट उपलब्ध नहीं</span>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{formatProfileLocation(user) || "स्थान उपलब्ध नहीं"}</span>
          </div>
        </div>

        {hasSocialLinks && (
          <div className="space-y-4">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-2">संपर्क (Contact)</h4>
            <div className="flex flex-wrap gap-2.5">
              {socialLinks.map((link) => (
                <a
                  key={link.key}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-full bg-slate-50 hover:bg-[#F97316]/10 text-slate-500 hover:text-[#F97316] transition-colors border border-slate-100 dark:border-slate-800 dark:bg-slate-900"
                  title={link.label}
                  aria-label={link.label}
                >
                  <SocialIcon iconName={link.iconName} className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>
        )}
      </section>

    </div>
  );
}
