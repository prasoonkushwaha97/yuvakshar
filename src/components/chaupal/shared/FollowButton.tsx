"use client";

import React, { useState, useEffect } from "react";
import { followUser, unfollowUser, isFollowing } from "@/lib/actions/chaupalUserActions";
import { useCms } from "@/store/CmsContext";
import { Loader2 } from "lucide-react";

interface FollowButtonProps {
  targetUserId: string;
  className?: string;
}

export default function FollowButton({ targetUserId, className = "" }: FollowButtonProps) {
  const { currentUser } = useCms();
  const [following, setFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function checkStatus() {
      if (currentUser?.id) {
        try {
          const status = await isFollowing(currentUser.id, targetUserId);
          if (isMounted) setFollowing(status);
        } catch (e) {
          console.error(e);
        }
      }
      if (isMounted) setIsLoading(false);
    }
    checkStatus();
    return () => { isMounted = false; };
  }, [currentUser?.id, targetUserId]);

  if (currentUser?.id === targetUserId) {
    return null; // Can't follow self
  }

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!currentUser?.id || isLoading) return;

    setIsLoading(true);
    try {
      if (following) {
        await unfollowUser(currentUser.id, targetUserId);
        setFollowing(false);
      } else {
        await followUser(currentUser.id, targetUserId);
        setFollowing(true);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const defaultClasses = "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border flex items-center justify-center min-w-[100px]";
  const followingClasses = "border-slate-200 dark:border-slate-700 hover:border-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10";
  const notFollowingClasses = "bg-slate-900 text-white border-transparent hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100";

  return (
    <button 
      onClick={handleToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isLoading}
      className={`${defaultClasses} ${following ? followingClasses : notFollowingClasses} ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : following ? (
        isHovered ? "अनफ़ॉलो" : "फ़ॉलोइंग"
      ) : (
        "फ़ॉलो करें"
      )}
    </button>
  );
}
