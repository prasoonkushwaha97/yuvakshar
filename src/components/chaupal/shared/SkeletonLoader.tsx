import React from "react";
import { CH_CLASS } from "./design";

interface SkeletonProps {
  type: "feed-card" | "room-item" | "chat-bubble" | "group-card" | "profile-header";
  count?: number;
}

function FeedCardSkeleton() {
  return (
    <div className={`p-4 sm:p-6 flex flex-col gap-4 animate-pulse ${CH_CLASS.card}`}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800" />
        <div className="flex flex-col gap-2">
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
        </div>
      </div>
      <div className="flex flex-col gap-2 mt-2">
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="h-4 w-[90%] bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="h-4 w-[60%] bg-slate-200 dark:bg-slate-800 rounded-md" />
      </div>
      <div className="w-full h-48 bg-slate-200 dark:bg-slate-800 rounded-xl mt-2" />
    </div>
  );
}

function RoomItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-3 animate-pulse">
      <div className="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 shrink-0" />
      <div className="flex flex-col gap-2 flex-1">
        <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-md" />
        <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-md" />
      </div>
    </div>
  );
}

export default function SkeletonLoader({ type, count = 1 }: SkeletonProps) {
  const Skeletons = Array.from({ length: count }).map((_, i) => {
    switch (type) {
      case "feed-card":
        return <FeedCardSkeleton key={i} />;
      case "room-item":
        return <RoomItemSkeleton key={i} />;
      default:
        return <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />;
    }
  });

  return <>{Skeletons}</>;
}
