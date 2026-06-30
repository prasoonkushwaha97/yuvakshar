"use client";

import React, { useState, useEffect } from "react";
import ChaupalPageHeader from "@/components/chaupal/layout/ChaupalPageHeader";
import GroupDirectoryCard from "@/components/chaupal/groups/GroupDirectoryCard";
import { Search } from "lucide-react";
import { getGroups } from "@/lib/actions/chaupalGroupActions";

export default function GroupsDirectoryPage() {
  const [search, setSearch] = useState("");
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadGroups() {
      setIsLoading(true);
      try {
        const fetchedGroups = await getGroups();
        if (isMounted) setGroups(fetchedGroups);
      } catch (err) {
        console.error("Failed to load groups:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadGroups();
    return () => { isMounted = false; };
  }, []);

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase()) || 
    (g.description && g.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <div className="lg:hidden">
        <ChaupalPageHeader title="समूह" />
      </div>

      <div className="p-4 sm:p-6 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <h2 className="hidden lg:block font-serif font-bold text-2xl text-slate-900 dark:text-white">
            समूह खोजें
          </h2>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="समूह खोजें..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800/50 text-slate-900 dark:text-white pl-9 pr-4 py-2 rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#F97316] transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {isLoading ? (
            <div className="text-center py-12 text-slate-500">समूह लोड हो रहे हैं...</div>
          ) : filteredGroups.length === 0 ? (
            <div className="text-center py-12 text-slate-500">कोई समूह नहीं मिला।</div>
          ) : (
            filteredGroups.map(group => (
              <GroupDirectoryCard key={group.id} group={group} />
            ))
          )}
        </div>
      </div>
    </>
  );
}
