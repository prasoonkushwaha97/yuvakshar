"use client";

import React, { useState, useEffect } from "react";
import { useCms } from "@/store/CmsContext";
import { getRoom } from "@/lib/actions/chaupalRoomActions";
import { checkGroupMembership, joinGroup } from "@/lib/actions/chaupalGroupActions";
import ChatInterface from "@/components/chaupal/discussion/ChatInterface";
import { Users, Lock, Globe } from "lucide-react";
import { CH_CLASS } from "@/components/chaupal/shared/design";
import ChaupalAvatar from "@/components/chaupal/shared/ChaupalAvatar";

export default function GroupDetailsPage({ params }: { params: Promise<{ groupId: string }> }) {
  const resolvedParams = React.use(params);
  const { currentUser } = useCms();
  
  const [group, setGroup] = useState<any>(null);
  const [membershipStatus, setMembershipStatus] = useState<string | false>(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadGroup() {
      setIsLoading(true);
      try {
        const [groupData, memberRole] = await Promise.all([
          getRoom(resolvedParams.groupId),
          checkGroupMembership(resolvedParams.groupId)
        ]);
        if (isMounted) {
          setGroup(groupData);
          setMembershipStatus(memberRole);
        }
      } catch (err) {
        console.error("Failed to load group:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadGroup();
    return () => { isMounted = false; };
  }, [resolvedParams.groupId, currentUser]);

  const handleJoin = async () => {
    if (!currentUser) {
      alert("समूह में शामिल होने के लिए कृपया लॉगिन करें।");
      return;
    }
    setIsJoining(true);
    try {
      await joinGroup(resolvedParams.groupId);
      setMembershipStatus('member');
    } catch (err) {
      console.error("Failed to join group:", err);
      alert("समूह में शामिल होने में त्रुटि हुई।");
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-[#090D16]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 bg-slate-50 dark:bg-[#090D16]">
        यह समूह उपलब्ध नहीं है।
      </div>
    );
  }

  // If user is a member, show the chat interface directly
  if (membershipStatus) {
    return (
      <div className="absolute inset-0">
        <ChatInterface roomId={resolvedParams.groupId} />
      </div>
    );
  }

  // If user is not a member, show the join screen
  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#090D16] p-4 sm:p-6 md:p-12 items-center justify-center">
      <div className={`${CH_CLASS.card} max-w-md w-full p-8 text-center flex flex-col items-center`}>
        <ChaupalAvatar name={group.title} size="lg" className="mb-6 w-24 h-24 text-3xl" />
        <div className="flex items-center justify-center gap-2 mb-2">
          <h1 className="font-serif font-bold text-2xl text-slate-900 dark:text-white">
            {group.title}
          </h1>
          {group.is_private ? (
            <Lock className="w-5 h-5 text-slate-400" />
          ) : (
            <Globe className="w-5 h-5 text-slate-400" />
          )}
        </div>
        
        <p className="text-slate-500 dark:text-slate-400 mb-8">
          {group.description}
        </p>
        
        <button 
          onClick={handleJoin}
          disabled={isJoining}
          className={`${CH_CLASS.buttonPrimary} w-full py-3 text-lg ${isJoining ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isJoining ? 'शामिल हो रहे हैं...' : 'समूह में शामिल हों'}
        </button>
      </div>
    </div>
  );
}
