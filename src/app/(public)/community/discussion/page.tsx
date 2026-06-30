"use client";

import React from "react";
import { MessageSquare } from "lucide-react";
import EmptyState from "@/components/chaupal/shared/EmptyState";
import RoomListSidebar from "@/components/chaupal/discussion/RoomListSidebar";

export default function DiscussionPage() {
  return (
    <>
      {/* Mobile view shows the room list when no room is selected */}
      <div className="md:hidden w-full h-full bg-white dark:bg-[#0F172A]">
        <RoomListSidebar />
      </div>

      {/* Desktop view shows an empty state */}
      <div className="hidden md:flex items-center justify-center h-full w-full bg-slate-50 dark:bg-[#090D16]">
        <EmptyState
          icon={MessageSquare}
          title="चर्चा में शामिल हों"
          description="बाईं ओर से किसी चर्चा कक्ष का चयन करें और विचारों के इस महाकुंभ में हिस्सा लें।"
        />
      </div>
    </>
  );
}
