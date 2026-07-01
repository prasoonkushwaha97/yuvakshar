"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ChaupalPageHeader from "@/components/chaupal/layout/ChaupalPageHeader";
import UserIdentity from "@/components/shared/UserIdentity";
import { CH_CLASS, CH_COLORS, CH_ANIMATIONS } from "@/components/chaupal/shared/design";

export default function GroupLayout({ children, params }: { children: React.ReactNode, params: Promise<{ groupId: string }> }) {
  const pathname = usePathname();
  const resolvedParams = React.use(params);
  
  const tabs = [
    { name: "फ़ीड", href: `/community/groups/${resolvedParams.groupId}` },
    { name: "कक्ष", href: `/community/groups/${resolvedParams.groupId}/rooms` },
    { name: "सदस्य", href: `/community/groups/${resolvedParams.groupId}/members` },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="lg:hidden">
        <ChaupalPageHeader title="समूह विवरण" showBack backUrl="/community/groups" />
      </div>

      {/* Group Cover */}
      <div className="h-32 sm:h-48 bg-slate-800 w-full relative">
        {/* If we had an image it would go here */}
      </div>

      <div className="px-4 sm:px-6 relative pb-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-end -mt-10 sm:-mt-12 mb-4">
          <div className="p-1 bg-white dark:bg-[#0F172A] rounded-full">
            <UserIdentity user={{ name: "रवि कुमार शर्मा" }} variant="hero" avatarSize={48} showUsername={false} clickable={false} />
          </div>
          <button className={`${CH_CLASS.buttonPrimary}`}>
            शामिल हों
          </button>
        </div>

        <h1 className="font-serif font-bold text-2xl text-slate-900 dark:text-white">
          युवा लेखक संघ
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-sans text-sm mt-2 max-w-2xl">
          उभरते लेखकों का एक समूह जहाँ हम अपनी रचनाएँ साझा करते हैं और रचनात्मक आलोचना प्राप्त करते हैं।
        </p>

        {/* Group Tabs */}
        <div className="flex items-center gap-6 mt-6">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link 
                key={tab.name}
                href={tab.href}
                className={`pb-2 font-bold text-sm border-b-2 ${CH_ANIMATIONS.transition} ${
                  isActive 
                    ? "border-[#F97316] text-[#F97316]" 
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex-1 bg-slate-50 dark:bg-[#090D16]">
        {children}
      </div>
    </div>
  );
}
