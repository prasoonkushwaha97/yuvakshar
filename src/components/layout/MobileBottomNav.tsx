"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Newspaper, BookOpen, Users, User } from "lucide-react";
import { useCms } from "@/store/CmsContext";

const navItems = [
  { href: "/", icon: Home, label: "होम", exact: true },
  { href: "/categories", icon: Newspaper, label: "समाचार", exact: false },
  { href: "/magazine", icon: BookOpen, label: "पत्रिका", exact: false },
  { href: "/category/community", icon: Users, label: "कम्युनिटी", exact: false },
  { href: "/admin", icon: User, label: "प्रोफ़ाइल", exact: false },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { currentUser } = useCms();
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Hide on admin pages
  if (pathname?.startsWith("/admin")) return null;

  // Listen to window scroll to show/hide navigation
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          // Determine scroll direction
          if (currentScrollY > lastScrollY && currentScrollY > 80) {
            // Scrolling down -> hide
            if (visible) setVisible(false);
          } else {
            // Scrolling up -> show
            if (!visible) setVisible(true);
          }
          
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY, visible]);

  // Listen to mobile menu toggle event from Navbar to coordinate mutual exclusivity
  useEffect(() => {
    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent;
      setSidebarOpen(!!customEvent.detail?.open);
    };

    window.addEventListener("yuvakshar:mobileMenuToggle", handleToggle);
    return () => {
      window.removeEventListener("yuvakshar:mobileMenuToggle", handleToggle);
    };
  }, []);

  const isNavVisible = visible && !sidebarOpen;

  return (
    <nav 
      style={{ transform: isNavVisible ? "translateY(0)" : "translateY(100%)" }}
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-pb transition-transform duration-300 ease-in-out will-change-transform"
    >
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
                <span className="absolute top-2.5 right-[calc(50%-14px)] w-2 h-2 bg-green-500 rounded-full border-2 border-white dark:border-background" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
