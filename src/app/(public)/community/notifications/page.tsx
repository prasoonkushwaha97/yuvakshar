"use client";

import React from "react";
import ChaupalPageHeader from "@/components/chaupal/layout/ChaupalPageHeader";
import EmptyState from "@/components/chaupal/shared/EmptyState";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <>
      <div className="lg:hidden">
        <ChaupalPageHeader title="सूचनाएं" />
      </div>

      <div className="p-4 sm:p-6 max-w-[680px] mx-auto">
        <h2 className="hidden lg:block font-serif font-bold text-2xl text-slate-900 dark:text-white mb-6">
          सूचनाएं
        </h2>
        
        <EmptyState
          icon={Bell}
          title="कोई नई सूचना नहीं"
          description="जब भी चौपाल पर कोई आपकी पोस्ट पर प्रतिक्रिया देगा या आपको टैग करेगा, तो यहाँ सूचना दिखाई देगी।"
        />
      </div>
    </>
  );
}
