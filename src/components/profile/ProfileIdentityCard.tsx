import React from "react";
import { CheckCircle2, MapPin, Link as LinkIcon } from "lucide-react";
import { Profile } from "@/store/types";
import Avatar from "@/components/shared/Avatar";
import { getProfileSocialLinks } from "@/config/socialPlatforms";
import SocialIcon from "@/components/shared/SocialIcon";
import { formatProfileLocation } from "@/utils/formatLocation";
import ProfileActions from "./ProfileActions";

interface ProfileIdentityCardProps {
  user: Profile;
  isOwner?: boolean;
  onMessageClick?: () => void;
  onShareClick?: () => void;
}

export default function ProfileIdentityCard({
  user,
  isOwner = false,
  onMessageClick = () => {},
  onShareClick = () => {},
}: ProfileIdentityCardProps) {
  const isVerified = (user as any).is_verified || user.verified || false;
  const username = user.username || user.slug;
  const socialLinks = getProfileSocialLinks(user);
  const hasSocialLinks = socialLinks.length > 0;
  const formattedLocation = formatProfileLocation(user);

  return (
    <div className="relative z-20 -mt-14 sm:-mt-20 md:-mt-24 font-sans">
      
      {/* Top Header Row: Floating Avatar & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        {/* Floating Profile Photo overlapping the banner */}
        <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full border-4 border-[#FDFCF7] dark:border-[#0B0F19] overflow-hidden bg-white dark:bg-slate-900 shadow-xl shrink-0 relative">
          <Avatar 
            url={user.avatar_url} 
            alt={user.name || ""} 
            className="w-full h-full object-cover" 
            name={user.name || ""} 
          />
        </div>

        {/* Action Buttons (Right-aligned on desktop, full width/aligned on mobile) */}
        <div className="pt-2 sm:pt-0 sm:pb-2">
          <ProfileActions 
            isOwner={isOwner} 
            onMessageClick={onMessageClick}
            onShareClick={onShareClick}
          />
        </div>
      </div>

      {/* Floating Profile Details (Unwrapped, modern typography) */}
      <div className="mt-5 space-y-4">
        
        {/* Name, Handle, Location */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold font-serif text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>{user.name}</span>
              {isVerified && (
                <CheckCircle2 className="w-6 h-6 text-blue-500 fill-blue-500/10 shrink-0" />
              )}
            </h1>
          </div>

          {/* Username */}
          {username && username !== "undefined" && username !== "null" && (
            <div className="mt-1">
              <span className="text-sm sm:text-base font-semibold font-mono text-slate-500 dark:text-slate-400">
                @{username}
              </span>
            </div>
          )}

          {/* Location (Directly below Username) */}
          {formattedLocation && (
            <div className="flex items-center gap-1.5 mt-2 text-xs sm:text-sm font-sans font-medium text-slate-600 dark:text-slate-400">
              <MapPin className="w-4 h-4 text-[#F97316] shrink-0" />
              <span className="leading-snug">{formattedLocation}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-slate-700 dark:text-slate-300 text-sm sm:text-base font-serif leading-relaxed max-w-3xl">
            {user.bio}
          </p>
        )}

        {/* Website URL */}
        {user.website && (
          <div className="pt-1">
            <a 
              href={user.website} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 hover:text-[#F97316] dark:hover:text-[#F97316] transition-colors"
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span className="underline underline-offset-4 decoration-slate-300 dark:decoration-slate-700">
                {user.website.replace(/^https?:\/\//, '')}
              </span>
            </a>
          </div>
        )}

        {/* Social Icons */}
        {hasSocialLinks && (
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            {socialLinks.map((link) => (
              <a
                key={link.key}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full flex items-center justify-center bg-slate-100 hover:bg-[#F97316]/10 text-slate-600 hover:text-[#F97316] dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-[#F97316]/20 dark:hover:text-[#F97316] transition-colors border border-slate-200/80 dark:border-slate-700/60"
                title={link.label}
                aria-label={link.label}
              >
                <SocialIcon iconName={link.iconName} className="w-4 h-4" />
              </a>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
