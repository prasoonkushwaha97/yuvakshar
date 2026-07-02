"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Search, CheckCircle2, UserCheck, Users, AlertCircle } from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { Profile } from "@/store/types";
import { getProfileUrl } from "@/utils/routes";

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string; // e.g. "फ़ॉलोअर्स" or "फ़ॉलोइंग"
  type: "followers" | "following";
  targetUser: Profile;
}

export default function FollowersModal({
  isOpen,
  onClose,
  title,
  type,
  targetUser,
}: FollowersModalProps) {
  const { users, currentUser, followAuthor, openAuthModal } = useCms();
  const [searchQuery, setSearchQuery] = useState("");

  // Resolve matching profiles
  const matchedUsers = useMemo(() => {
    const listIds = type === "followers" ? (targetUser.followers || []) : (targetUser.following || []);
    return (users || []).filter((u) => listIds.includes(u.id));
  }, [users, targetUser, type]);

  // Real-time filtering
  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return matchedUsers;
    return matchedUsers.filter(
      (u) =>
        u.name?.toLowerCase().includes(query) ||
        u.username?.toLowerCase().includes(query)
    );
  }, [matchedUsers, searchQuery]);

  const handleFollowToggle = (userId: string) => {
    if (!currentUser) {
      openAuthModal();
      return;
    }
    followAuthor(userId, currentUser.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#0F172A] rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden font-sans flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-extrabold font-serif text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#F97316]" />
              <span>{title}</span>
              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-sans">
                {matchedUsers.length}
              </span>
            </h3>
            <p className="text-[11px] text-slate-450 dark:text-slate-500 mt-0.5">
              {type === "followers" ? "वे लोग जो इस लेखक को फ़ॉलो करते हैं" : "वे लेखक जिन्हें यह फ़ॉलो करते हैं"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search input bar */}
        <div className="p-4 border-b border-slate-50 dark:border-slate-800/50 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="नाम या @यूज़रनेम से खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:border-[#F97316] transition-all text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Users list container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((u) => {
              const profileHref = getProfileUrl(u);
              const isUserVerified = (u as any).is_verified || u.verified || false;
              const isFollowing = currentUser ? (u.followers?.includes(currentUser.id) || false) : false;
              const isSelf = currentUser?.id === u.id;

              return (
                <div
                  key={u.id}
                  className="flex items-center justify-between gap-4 p-3 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-900 rounded-2xl border border-slate-100/50 dark:border-slate-800/50 transition-colors"
                >
                  {/* User Profile Info */}
                  <Link
                    href={profileHref || "#"}
                    onClick={onClose}
                    className="flex items-center space-x-3 flex-1 min-w-0 hover:opacity-80 transition-opacity"
                  >
                    <div className="relative w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0">
                      {u.avatar_url ? (
                        <Image
                          src={u.avatar_url}
                          alt={u.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold uppercase text-xs">
                          {u.name?.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        <span className="truncate">{u.name || (u as any).full_name}</span>
                        {isUserVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10 shrink-0" />
                        )}
                      </h4>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        @{u.username}
                      </span>
                      {u.designation || u.role ? (
                        <span className="text-[9px] text-[#F97316] font-extrabold uppercase mt-0.5 block tracking-wide">
                          {u.designation || u.role}
                        </span>
                      ) : null}
                    </div>
                  </Link>

                  {/* Follow Actions */}
                  {!isSelf && (
                    <button
                      onClick={() => handleFollowToggle(u.id)}
                      className={`text-[10px] font-bold px-4 py-2 rounded-xl transition-all active:scale-95 shrink-0 ${
                        isFollowing
                          ? "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                          : "bg-[#F97316] hover:bg-[#EA580C] text-white"
                      }`}
                    >
                      {isFollowing ? (
                        <span className="flex items-center gap-1">
                          <UserCheck className="w-3 h-3 text-green-500" />
                          <span>फ़ॉलोइंग</span>
                        </span>
                      ) : (
                        <span>फ़ॉलो करें</span>
                      )}
                    </button>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-12 space-y-2">
              <AlertCircle className="w-8 h-8 text-slate-350 dark:text-slate-650 mx-auto" />
              <p className="text-xs text-slate-450 dark:text-slate-550 font-serif">
                कोई मिलान नहीं मिला (No matches found)
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
