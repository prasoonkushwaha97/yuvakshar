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
  { href: "/community", icon: Users, label: "कम्युनिटी", exact: false },
  { href: "/admin", icon: User, label: "प्रोफ़ाइल", exact: false },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { currentUser } = useCms();
  
  if (pathname && (pathname.startsWith("/admin") || pathname.startsWith("/community"))) {
    return null;
  }

  const dynamicNavItems = [
    { href: "/", icon: Home, label: "होम", exact: true },
    { href: "/categories", icon: Newspaper, label: "समाचार", exact: false },
    { href: "/magazine", icon: BookOpen, label: "पत्रिका", exact: false },
    { href: "/community", icon: Users, label: "कम्युनिटी", exact: false },
    { href: "/profile", icon: User, label: "प्रोफ़ाइल", exact: false, activePrefix: "/profile" },
  ];

  const [visible, setVisible] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visibleRef = React.useRef(true);
  const lastScrollYRef = React.useRef(0);



  // Listen to window scroll to show/hide navigation (high-performance once-bound passive listener)
  useEffect(() => {
    let ticking = false;
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const lastScrollY = lastScrollYRef.current;
          const isVisible = visibleRef.current;

          // Prevent iOS rubber-band bounce triggers
          if (currentScrollY < 0) {
            ticking = false;
            return;
          }

          // Scroll Down -> Hide, Scroll Up -> Show
          if (currentScrollY > lastScrollY && currentScrollY > 80) {
            if (isVisible) {
              setVisible(false);
              visibleRef.current = false;
            }
          } else if (currentScrollY < lastScrollY) {
            if (!isVisible) {
              setVisible(true);
              visibleRef.current = true;
            }
          }
          
          lastScrollYRef.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); // Bound only once!

  // Reset navigation visibility to visible on page/route changes
  useEffect(() => {
    setVisible(true);
    visibleRef.current = true;
    lastScrollYRef.current = typeof window !== "undefined" ? window.scrollY : 0;
  }, [pathname]);

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

  if (pathname?.startsWith("/admin") || pathname?.startsWith("/community")) return null;

  return (
    <nav 
      style={{ transform: isNavVisible ? "translateY(0)" : "translateY(100%)" }}
      className="lg:hidden fixed bottom-0 left-0 right-0 z-[30] bg-background border-t border-border safe-area-pb transition-transform duration-300 ease-in-out will-change-transform"
    >
      <div className="flex items-stretch justify-around h-16">
        {dynamicNavItems.map(({ href, icon: Icon, label, exact, activePrefix }) => {
          const checkPrefix = activePrefix || href;
          const isActive = exact ? pathname === href : pathname?.startsWith(checkPrefix) && checkPrefix !== "/";
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
              {href === "/profile" && currentUser && (
                <span className="absolute top-2.5 right-[calc(50%-14px)] w-2 h-2 bg-green-500 rounded-full border-2 border-white dark:border-background" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
