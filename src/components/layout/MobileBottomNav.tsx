"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Newspaper, BookOpen, Video, User } from "lucide-react";
import { useCms } from "@/store/CmsContext";

const navItems = [
  { href: "/", icon: Home, label: "होम", exact: true },
  { href: "/categories", icon: Newspaper, label: "समाचार", exact: false },
  { href: "/magazine", icon: BookOpen, label: "पत्रिका", exact: false },
  { href: "/category/video", icon: Video, label: "वीडियो", exact: false },
  { href: "/admin", icon: User, label: "प्रोफ़ाइल", exact: false },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { currentUser } = useCms();

  // Hide on admin pages
  if (pathname?.startsWith("/admin")) return null;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-[#0F172A] border-t border-slate-200 dark:border-slate-800 safe-area-pb">
      <div className="flex items-stretch justify-around h-16">
        {navItems.map(({ href, icon: Icon, label, exact }) => {
          const isActive = exact ? pathname === href : pathname?.startsWith(href) && href !== "/";
          const finalActive = href === "/" ? pathname === "/" : isActive;

          return (
            <Link
              key={href}
              href={href}
              className="relative flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] group"
              aria-label={label}
            >
              {/* Active top indicator line */}
              <span
                className={`absolute top-0 left-1/2 -translate-x-1/2 h-[2.5px] rounded-b-full transition-all duration-300 ${
                  finalActive ? "w-8 bg-primary" : "w-0 bg-transparent"
                }`}
              />

              {/* Icon */}
              <span
                className={`transition-all duration-200 ${
                  finalActive
                    ? "text-primary scale-110"
                    : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400"
                }`}
              >
                <Icon
                  className="w-[22px] h-[22px]"
                  strokeWidth={finalActive ? 2.5 : 1.8}
                  fill={finalActive ? "rgba(234,88,12,0.12)" : "none"}
                />
              </span>

              {/* Label */}
              <span
                className={`text-[9.5px] font-bold leading-none tracking-wide transition-colors duration-200 ${
                  finalActive
                    ? "text-primary"
                    : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600"
                }`}
              >
                {label}
              </span>

              {/* Profile indicator dot when logged in */}
              {href === "/admin" && currentUser && (
                <span className="absolute top-2.5 right-[calc(50%-14px)] w-2 h-2 bg-green-500 rounded-full border-2 border-white dark:border-[#0F172A]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
