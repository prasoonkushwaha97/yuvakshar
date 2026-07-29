import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, MessageSquare, Users, Bell, HelpCircle, PlusCircle } from "lucide-react";
import { CH_ANIMATIONS, CH_COLORS, CH_RADIUS } from "../shared/design";
import { useCms } from "@/store/CmsContext";
import { openCreateSheet } from "@/components/layout/GlobalCreateSheet";

export default function ChaupalDesktopSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser } = useCms();

  const links = [
    { name: "चौपाल", href: "/community", icon: Home },
    { name: "प्रश्नोत्तर", href: "/community/qna", icon: HelpCircle },
    { name: "चर्चा मंच", href: "/community/discussion", icon: MessageSquare },
    { name: "समूह", href: "/community/groups", icon: Users },
    { name: "सूचनाएं", href: "/community/notifications", icon: Bell },
  ];

  return (
    <div className="hidden md:flex flex-col w-[240px] lg:w-[260px] shrink-0 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto pb-8 pr-4">
      <nav className="flex flex-col gap-2">
        {links.map((link) => {
          const isActive = pathname === link.href || (link.href !== "/community" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-4 px-4 py-3 ${CH_RADIUS.card} font-serif font-bold text-[17px] ${CH_ANIMATIONS.transition} ${
                isActive 
                  ? `${CH_COLORS.primaryLight} ${CH_COLORS.textHeading}` 
                  : `text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white`
              }`}
            >
              <link.icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px] text-[#F97316]' : 'stroke-2'}`} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <button 
        onClick={() => {
          if (!currentUser) router.push("/login");
          else openCreateSheet();
        }}
        className={`mt-6 w-full py-3.5 flex items-center justify-center gap-2 ${CH_COLORS.primary} ${CH_COLORS.primaryHover} ${CH_RADIUS.button} font-bold shadow-md shadow-orange-500/20 ${CH_ANIMATIONS.transition} hover:-translate-y-0.5`}
      >
        <PlusCircle className="w-5 h-5" />
        नया पोस्ट लिखें
      </button>

      <div className="mt-auto pt-8 border-t border-slate-200 dark:border-slate-800">
        <p className="text-xs text-slate-400 font-sans leading-relaxed px-4">
          चौपाल © {new Date().getFullYear()}<br />
          स्वतंत्र, सुरक्षित और सार्थक संवाद।
        </p>
      </div>
    </div>
  );
}
