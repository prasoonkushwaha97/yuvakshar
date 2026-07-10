"use client";
import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { Search, FileText, Users, FolderTree, BookOpen } from "lucide-react";

export default function GlobalSearch({ minimal = false }: { minimal?: boolean }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <>
      {minimal ? (
        <button 
          onClick={() => setOpen(true)}
          className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Search className="w-5 h-5" />
        </button>
      ) : (
        <div 
          onClick={() => setOpen(true)}
          className="w-full md:w-64 max-w-full bg-slate-100 dark:bg-slate-900 rounded-xl px-4 py-2 text-sm text-slate-500 flex items-center gap-2 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span className="hidden md:inline">Search (Cmd+K)</span>
          <span className="md:hidden">Search...</span>
        </div>
      )}

      <Command.Dialog 
        open={open} 
        onOpenChange={setOpen}
        label="Global Command Menu"
        className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] sm:pt-[20vh] bg-slate-900/50 backdrop-blur-sm"
      >
        <div className="w-[90vw] max-w-[600px] bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden outline-none">
          <Command.Input 
            placeholder="Search articles, users, categories..." 
            className="w-full px-4 py-4 text-lg border-b border-slate-200 dark:border-slate-800 bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
          />
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-slate-500">
              No results found.
            </Command.Empty>

            <Command.Group heading="Content" className="px-2 py-2 text-xs font-semibold text-slate-500">
              <Command.Item 
                onSelect={() => runCommand(() => router.push('/admin/articles'))}
                className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800 aria-selected:text-primary transition-colors"
              >
                <FileText className="w-4 h-4" /> Search all Articles
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push('/admin/magazine'))}
                className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800 aria-selected:text-primary transition-colors"
              >
                <BookOpen className="w-4 h-4" /> Search Magazine Issues
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Users & Categories" className="px-2 py-2 text-xs font-semibold text-slate-500">
              <Command.Item 
                onSelect={() => runCommand(() => router.push('/admin/users'))}
                className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800 aria-selected:text-primary transition-colors"
              >
                <Users className="w-4 h-4" /> Find Users
              </Command.Item>
              <Command.Item 
                onSelect={() => runCommand(() => router.push('/admin/categories'))}
                className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 aria-selected:bg-slate-100 dark:aria-selected:bg-slate-800 aria-selected:text-primary transition-colors"
              >
                <FolderTree className="w-4 h-4" /> Browse Categories
              </Command.Item>
            </Command.Group>
          </Command.List>
        </div>
      </Command.Dialog>
    </>
  );
}
