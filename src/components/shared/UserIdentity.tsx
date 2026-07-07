"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCms } from "@/store/CmsContext";
import { Profile } from "@/store/types";
import { getProfileUrl } from "@/utils/routes";
import HoverUserCard from "@/components/yuvakshar/HoverUserCard";

export interface UserIdentityProps {
  userId?: string | null;
  user?: Partial<Profile> | null; // Optional escape hatch if already fetched (e.g. Server Components)
  variant?: "hero" | "card" | "list" | "compact" | "chip" | "inline";
  showAvatar?: boolean;
  showUsername?: boolean;
  showRole?: boolean;
  showBadge?: boolean;
  clickable?: boolean;
  className?: string;
  avatarSize?: number;
}

const AvatarComponent = ({ sizeClass, avatarUrl, name }: { sizeClass: number, avatarUrl: string | null, name: string }) => (
  <div 
    className="relative shrink-0 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700"
    style={{ width: sizeClass, height: sizeClass }}
  >
    {avatarUrl ? (
      <Image
        src={avatarUrl}
        alt={name}
        fill
        className="object-cover"
        sizes={`${sizeClass}px`}
      />
    ) : (
      <span className="font-serif font-bold text-slate-500 dark:text-slate-400" style={{ fontSize: sizeClass * 0.4 }}>
        {name.charAt(0).toUpperCase()}
      </span>
    )}
  </div>
);

const VerifiedBadge = () => (
  <svg className="w-4 h-4 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const RoleBadge = ({ role }: { role: string }) => (
  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium uppercase tracking-wider shrink-0 border border-slate-200 dark:border-slate-700">
    {role}
  </span>
);

export default function UserIdentity({
  userId,
  user: initialUser,
  variant = "inline",
  showAvatar = true,
  showUsername = false,
  showRole = false,
  showBadge = true,
  clickable = true,
  className = "",
  avatarSize
}: UserIdentityProps) {
  const { users } = useCms();

  const resolvedUser = useMemo(() => {
    // If it's already a full profile with identity, return it
    if (initialUser && (initialUser.username || initialUser.slug || initialUser.id)) {
      return initialUser;
    }
    
    // Try to resolve from CmsContext users
    if (users && users.length > 0) {
      if (userId) {
        const found = users.find((u) => u.id === userId);
        if (found) return found;
      }
      if (initialUser?.name) {
        // Find by exact name match
        const found = users.find((u) => u.name === initialUser.name);
        if (found) return found;
      }
    }
    
    // Fallback to the initial object if provided, otherwise null
    return initialUser || null;
  }, [initialUser, userId, users]);

  if (!resolvedUser) {
    return <span className={`text-slate-400 ${className}`}>Unknown User</span>;
  }

  const name = resolvedUser.name || (resolvedUser as any).full_name || "Unknown";
  
  const avatarUrl = resolvedUser.avatar_url || (resolvedUser as any).avatar || null;
  const role = resolvedUser.role || "Member";
  const isVerified = (resolvedUser as any).is_verified || (resolvedUser as any).verified || false;

  const profileHref = getProfileUrl(resolvedUser);
  const username = resolvedUser.username || resolvedUser.slug || resolvedUser.id || "unknown";

  // Sizes based on variant
  const getAvatarSize = () => {
    if (avatarSize) return avatarSize;
    switch (variant) {
      case "hero": return 120;
      case "card": return 64;
      case "list": return 48;
      case "chip": return 32;
      case "compact": return 24;
      case "inline": return 20;
      default: return 32;
    }
  };

  const sizeClass = getAvatarSize();



  const innerContent = (
    <>
      {showAvatar && <AvatarComponent sizeClass={sizeClass} avatarUrl={avatarUrl} name={name} />}
      
      <div className={`flex flex-col justify-center ${variant === "inline" ? "flex-row items-center gap-1.5" : ""}`}>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`font-serif font-bold text-slate-900 dark:text-white transition-colors ${clickable ? "group-hover:text-[#EA580C]" : ""} ${variant === "hero" ? "text-2xl" : variant === "card" ? "text-lg" : variant === "inline" || variant === "compact" ? "text-sm" : "text-base"}`}>
            {name}
          </span>
          {showBadge && isVerified && <VerifiedBadge />}
          {showRole && role && role !== "Member" && <RoleBadge role={role} />}
        </div>
        
        {(showUsername || (variant === "card" || variant === "hero")) && (
          <span className={`text-slate-500 dark:text-slate-400 font-sans ${variant === "hero" ? "text-base" : "text-xs"}`}>
            @{username}
          </span>
        )}
      </div>
    </>
  );

  const wrapperClasses = `
    group inline-flex items-center gap-2.5 
    ${variant === "card" ? "p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 hover:shadow-md transition-shadow w-full" : ""}
    ${variant === "chip" ? "py-1.5 px-2 bg-slate-50 dark:bg-slate-800/50 rounded-full border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" : ""}
    ${variant === "hero" ? "flex-col text-center items-center gap-4" : ""}
    ${className}
  `;

  const isValidProfile = profileHref !== null;
  const targetUserId = resolvedUser.id || username;
  
  if (clickable && isValidProfile && profileHref) {
    const linkElement = (
      <Link href={profileHref} className={wrapperClasses}>
        {innerContent}
      </Link>
    );
    
    // Disable hover card for very small variants to avoid UX clutter, 
    // or include it everywhere as requested.
    return (
      <HoverUserCard userId={targetUserId}>
        {linkElement}
      </HoverUserCard>
    );
  }

  return (
    <div className={wrapperClasses}>
      {innerContent}
    </div>
  );
}
