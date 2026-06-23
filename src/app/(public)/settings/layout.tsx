"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Palette, Bell, Shield, Globe, Lock, Menu, X } from "lucide-react";
import { useCms } from "@/store/CmsContext";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { currentUser } = useCms();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1D] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm text-center border border-slate-200 dark:border-slate-800">
          <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold font-serif mb-2">लॉगिन आवश्यक है</h2>
          <p className="text-sm text-slate-500 mb-6">सेटिंग्स प्रबंधित करने के लिए कृपया लॉगिन करें।</p>
          <Link href="/" className="bg-primary text-white px-6 py-2 rounded-xl font-bold transition-all hover:bg-primary/90">
            मुख्य पृष्ठ पर लौटें
          </Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/settings/account", label: "खाता (Account)", icon: User },
    { href: "/settings/appearance", label: "स्वरूप (Appearance)", icon: Palette },
    { href: "/settings/notifications", label: "सूचनाएं (Notifications)", icon: Bell },
    { href: "/settings/privacy", label: "गोपनीयता (Privacy)", icon: Shield },
    { href: "/settings/language", label: "भाषा (Language)", icon: Globe },
    { href: "/settings/security", label: "सुरक्षा (Security)", icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1D] text-slate-900 dark:text-slate-100 font-hindi pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-black font-serif text-slate-900 dark:text-white">सेटिंग्स</h1>
          
          <button 
            className="md:hidden p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Desktop Sidebar */}
          <aside className="hidden md:block w-64 shrink-0">
            <nav className="flex flex-col gap-1 sticky top-24">
              {navItems?.map(item => {
                const isActive = pathname === item.href || (pathname === "/settings" && item.href === "/settings/account");
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? "bg-primary/10 text-primary font-bold" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"}`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Mobile Drawer Overlay */}
          {mobileMenuOpen && (
            <div className="fixed inset-0 z-50 flex md:hidden">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
              <div className="relative w-4/5 max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col transform transition-transform">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                  <h2 className="font-bold font-serif text-lg">सेटिंग्स मेनू</h2>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4 flex flex-col gap-1 overflow-y-auto">
                  {navItems?.map(item => {
                    const isActive = pathname === item.href || (pathname === "/settings" && item.href === "/settings/account");
                    const Icon = item.icon;
                    return (
                      <Link 
                        key={item.href} 
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? "bg-primary text-white font-bold" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-10 shadow-sm min-h-[500px]">
            {children}
          </main>

        </div>
      </div>
    </div>
  );
}
