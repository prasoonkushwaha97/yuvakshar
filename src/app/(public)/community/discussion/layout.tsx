"use client";

import React from "react";
import RoomListSidebar from "@/components/chaupal/discussion/RoomListSidebar";
import ChaupalPageHeader from "@/components/chaupal/layout/ChaupalPageHeader";

export default function DiscussionLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-full h-[calc(100vh-4rem)] lg:h-[calc(100vh)]">
      {/* Mobile Top Header */}
      <div className="lg:hidden">
        <ChaupalPageHeader title="चर्चा कक्ष" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Side: Room List (Hidden on mobile if looking at a chat room) */}
        {/* For simplicity in App Router, we hide the sidebar on mobile if the URL has an ID. We handle this responsiveness purely with CSS via group/layout trick or check path. Since we are in layout, it's easier to use a media query trick. */}
        <div className="hidden md:flex w-full md:w-[280px] shrink-0 h-full">
          <RoomListSidebar />
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-[#090D16] relative overflow-hidden">
          {children}
        </div>
      </div>
    </div>
  );
}
