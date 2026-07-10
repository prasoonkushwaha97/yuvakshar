"use client";
import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowLeft, Search } from "lucide-react";
import GlobalSearch from "./GlobalSearch";

export default function MobileHeader() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide the header completely on the root admin page (where the Grid Menu will be full screen)
  if (pathname === "/admin") {
    return null;
  }

  // Determine a simple title based on pathname
  let title = "Admin";
  if (pathname.includes("/admin/articles")) title = "Articles";
  else if (pathname.includes("/admin/users")) title = "Users";
  else if (pathname.includes("/admin/categories")) title = "Categories";
  else if (pathname.includes("/admin/magazine")) title = "Magazine";
  else if (pathname.includes("/admin/community")) title = "Chaupal";
  else if (pathname.includes("/admin/cms/settings")) title = "Settings";

  return (
    <header className="md:hidden flex items-center justify-between h-14 px-4 bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shrink-0">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => router.back()}
          className="p-2 -ml-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h1>
      </div>
      
      <div className="flex items-center">
        <GlobalSearch minimal={true} />
      </div>
    </header>
  );
}
