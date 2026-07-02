import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageSquare, Bell, User, Plus } from "lucide-react";
import { getCanonicalProfileUrl } from "@/utils/username";
import { Profile } from "@/store/types";

export default function ChaupalMobileBottomNav({ currentUserId }: { currentUserId?: string }) {
  const pathname = usePathname();

  const navItems = [
    { name: "होम", href: "/community", icon: Home },
    { name: "चर्चा", href: "/community/discussion", icon: MessageSquare },
    { name: "सूचनाएं", href: "/community/notifications", icon: Bell },
    { name: "प्रोफाइल", href: currentUserId ? (getCanonicalProfileUrl({ id: currentUserId } as Partial<Profile>) || "/login") : "/login", icon: User },
  ];

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="md:hidden fixed bottom-20 right-4 z-50">
        <button className="w-14 h-14 bg-[#F97316] text-white rounded-full flex items-center justify-center shadow-lg shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all">
          <Plus className="w-6 h-6 stroke-[2.5px]" />
        </button>
      </div>

      {/* Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 safe-area-bottom">
        <nav className="flex items-center justify-around h-16">
          {navItems.map((item, index) => {
            // We split at index 2 to leave space for the FAB visually if we wanted it center, 
            // but the prompt specified it floats. The prompt said: "Mobile Bottom Navigation: Home, Discussion, +, Notifications, Profile".
            // Let's render the + inline as a special nav item if they wanted it center.
            const isCenterAdd = index === 2; // We inject + at index 2
            const isActive = pathname === item.href || (item.href !== "/community" && pathname.startsWith(item.href));

            if (isCenterAdd) {
              return (
                <React.Fragment key="fab-placeholder">
                  <div className="w-12 flex items-center justify-center">
                    {/* The actual FAB floats above, this just creates spacing, OR we render it exactly inline */}
                    <button className="w-12 h-12 -mt-6 bg-[#F97316] text-white rounded-full flex items-center justify-center shadow-lg shadow-orange-500/40 active:scale-95 transition-all border-4 border-white dark:border-[#0F172A]">
                      <Plus className="w-6 h-6 stroke-[2.5px]" />
                    </button>
                  </div>
                  <Link
                    href={item.href}
                    className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${isActive ? 'text-[#F97316]' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    <item.icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                    <span className="text-[10px] font-bold font-sans">{item.name}</span>
                  </Link>
                </React.Fragment>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center w-16 h-full gap-1 transition-colors ${isActive ? 'text-[#F97316]' : 'text-slate-500 dark:text-slate-400'}`}
              >
                <item.icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                <span className="text-[10px] font-bold font-sans">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
