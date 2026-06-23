"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function FounderSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: '/founder', label: 'Dashboard Overview' },
    { href: '/founder/users', label: 'User Governance' },
    { href: '/founder/roles', label: 'Roles' },
    { href: '/founder/permissions', label: 'Permissions' },
    { href: '/founder/audit', label: 'Audit Logs' },
    { href: '/founder/revenue', label: 'Revenue' },
    { href: '/founder/memberships', label: 'Membership Oversight' },
    { href: '/founder/analytics', label: 'Platform Analytics' },
    { href: '/founder/cms/settings', label: 'Global Settings' },
    { href: '/founder/cms/navigation', label: 'Navigation Menu' },
    { href: '/founder/cms/homepage', label: 'Homepage Layout' },
    { href: '/founder/cms/ads', label: 'Advertisements' },
    { href: '/founder/cms/seo', label: 'SEO Settings' },
    { href: '/founder/system', label: 'System Operations' },
    { href: '/founder/emergency', label: 'Emergency Controls' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden p-4 flex items-center border-b border-border bg-card">
        <button onClick={() => setIsOpen(!isOpen)} className="p-2 -ml-2 rounded-md hover:bg-accent text-foreground">
          <Menu className="w-6 h-6" />
        </button>
        <span className="ml-4 font-semibold text-lg">Founder Workspace</span>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border p-4 flex flex-col gap-4 transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between md:mb-4">
          <div className="text-lg font-bold hidden md:block">Founder Workspace</div>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-2 rounded-md hover:bg-accent">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-2">
          {navLinks?.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href}
                href={link.href} 
                className={`p-2 rounded-md transition-colors ${isActive ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-accent hover:text-accent-foreground'}`}
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
