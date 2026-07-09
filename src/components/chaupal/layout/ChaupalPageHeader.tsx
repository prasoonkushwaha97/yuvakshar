import React from "react";
import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { CH_CLASS } from "../shared/design";

interface ChaupalPageHeaderProps {
  title: string;
  showBack?: boolean;
  backUrl?: string;
  rightAction?: React.ReactNode;
}

export default function ChaupalPageHeader({ title, showBack, backUrl, rightAction }: ChaupalPageHeaderProps) {
  return (
    <div className="sticky top-0 z-30 bg-white/90 dark:bg-[#090D16]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-3">
          {showBack && (
            <Link 
              href={backUrl || "/community"} 
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </Link>
          )}
          <h1 className="font-serif font-bold text-xl text-slate-900 dark:text-white">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {rightAction ? (
            rightAction
          ) : (
            <Link href="/community/search" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Search className="w-5 h-5 text-slate-700 dark:text-slate-300" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
