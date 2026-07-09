"use client";

import React, { useState, useEffect } from "react";
import { joinGroup, leaveGroup, getGroupDetails } from "@/lib/actions/chaupalGroupActions";
import { useCms } from "@/store/CmsContext";
import { Loader2 } from "lucide-react";

interface JoinGroupButtonProps {
  groupId: string;
  initialIsMember?: boolean;
  className?: string;
}

export default function JoinGroupButton({ groupId, initialIsMember, className = "" }: JoinGroupButtonProps) {
  const { currentUser } = useCms();
  const [isMember, setIsMember] = useState(initialIsMember ?? false);
  const [isLoading, setIsLoading] = useState(initialIsMember === undefined);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function checkStatus() {
      if (initialIsMember !== undefined || !currentUser?.id) {
        setIsLoading(false);
        return;
      }
      try {
        const details = await getGroupDetails(groupId);
        if (isMounted) setIsMember(details?.isMember || false);
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    checkStatus();
    return () => { isMounted = false; };
  }, [currentUser?.id, groupId, initialIsMember]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to group page if this is in a card
    if (!currentUser?.id || isLoading) return;

    setIsLoading(true);
    try {
      if (isMember) {
        await leaveGroup(groupId);
        setIsMember(false);
      } else {
        await joinGroup(groupId);
        setIsMember(true);
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const defaultClasses = "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border flex items-center justify-center min-w-[100px]";
  const memberClasses = "border-slate-200 dark:border-slate-700 hover:border-red-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10";
  const notMemberClasses = "bg-[#f97316] text-white border-transparent hover:bg-orange-600";

  return (
    <button 
      onClick={handleToggle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      disabled={isLoading || !currentUser}
      className={`${defaultClasses} ${isMember ? memberClasses : notMemberClasses} ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isMember ? (
        isHovered ? "छोड़ें" : "सदस्य हैं"
      ) : (
        "जुड़ें"
      )}
    </button>
  );
}
