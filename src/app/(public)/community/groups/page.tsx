"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  Plus, 
  ArrowRight, 
  BookOpen, 
  Search, 
  Check, 
  Shield 
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { fetchGroups, toggleGroupMembership, isUserGroupMember, CommunityGroup } from "@/lib/communityService";
import GlassCard from "@/components/yuvakshar/GlassCard";
import Link from "next/link";

export default function GroupsListPage() {
  const { currentUser } = useCms();
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [joinedGroupIds, setJoinedGroupIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const loadGroups = async () => {
    setLoading(true);
    try {
      const data = await fetchGroups();
      setGroups(data);
      if (currentUser) {
        const joined = [];
        for (const g of data) {
          const isMember = await isUserGroupMember(g.id, currentUser.id);
          if (isMember) joined.push(g.id);
        }
        setJoinedGroupIds(joined);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGroups();
  }, [currentUser]);

  const handleJoinLeave = async (groupId: string) => {
    if (!currentUser) {
      alert("समूह में शामिल होने के लिए कृपया पहले लॉगिन करें।");
      return;
    }
    try {
      const joined = await toggleGroupMembership(groupId, currentUser.id);
      loadGroups(); // reload
      alert(joined ? "आप समूह में सफलतापूर्वक शामिल हो गए हैं!" : "आपने समूह छोड़ दिया है।");
    } catch (err) {
      console.error(err);
    }
  };

  const filteredGroups = groups.filter(g => {
    const matchesSearch = g.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          g.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || g.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      
      {/* Search and Filters row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-[#0F172A]/35 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/40">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="साहित्यिक समूह खोजें..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-slate-200 dark:border-slate-800 hover:border-primary/45 rounded-xl px-4 py-2.5 text-xs text-foreground pl-9 focus:outline-none focus:border-primary transition-all font-hindi"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
        </div>

        {/* Category Filters */}
        <div className="flex space-x-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none shrink-0">
          {[
            { id: "all", name: "सभी" },
            { id: "Poetry", name: "कविता" },
            { id: "Story Writing", name: "कहानी" },
            { id: "Reading Club", name: "पठन क्लब" },
            { id: "Exams", name: "परीक्षा" }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer font-hindi ${
                selectedCategory === cat.id
                  ? "bg-primary text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-250/30"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-xs text-slate-450 animate-pulse font-serif">
            साहित्यिक समूह लोड किए जा रहे हैं...
          </div>
        ) : filteredGroups.length > 0 ? (
          filteredGroups.map((group) => {
            const isReadingClub = group.category === "Reading Club";
            
            return (
              <GlassCard key={group.id} className="p-5 border-slate-200/60 dark:border-slate-800/40 flex flex-col justify-between h-[210px]">
                <div>
                  
                  {/* Category Badge & Member Count */}
                  <div className="flex items-center justify-between text-[10px] font-bold mb-3">
                    <span className={`px-2 py-0.5 rounded font-serif font-hindi ${
                      isReadingClub 
                        ? "bg-green-500/10 text-green-500 border border-green-200/40" 
                        : "bg-primary/10 text-primary border border-primary/20"
                    }`}>
                      {group.category === "Reading Club" ? "पठन क्लब (Reading Club)" : group.category}
                    </span>
                    <span className="text-slate-400 font-mono flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{group.membersCount || 0} सदस्य</span>
                    </span>
                  </div>

                  {/* Group Name */}
                  <h3 className="font-serif text-sm font-bold text-slate-800 dark:text-white line-clamp-1 font-hindi">
                    {group.name}
                  </h3>
                  
                  {/* Current Reading Book indicator */}
                  {group.current_book && (
                    <div className="flex items-center space-x-1.5 text-[10px] text-green-600 font-serif font-bold mt-1.5">
                      <BookOpen className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-hindi truncate">चल रही पुस्तक: {group.current_book}</span>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 leading-relaxed line-clamp-2 font-hindi">
                    {group.description}
                  </p>

                </div>

                {/* Actions row */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/60 mt-4">
                  <button
                    onClick={() => handleJoinLeave(group.id)}
                    className={`px-3.5 py-1.8 rounded-lg text-[10px] font-bold transition-all cursor-pointer font-hindi flex items-center space-x-1 ${
                      joinedGroupIds.includes(group.id)
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{joinedGroupIds.includes(group.id) ? "सदस्य हैं" : "शामिल हों"}</span>
                  </button>

                  <Link
                    href={`/community/groups/${group.id}`}
                    className="text-primary hover:text-primary/95 text-[11px] font-bold flex items-center space-x-1 font-hindi"
                  >
                    <span>समूह खोलें</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </GlassCard>
            );
          })
        ) : (
          <div className="col-span-full py-20 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl font-serif text-xs">
            इस खोज के साथ कोई समूह नहीं मिला।
          </div>
        )}
      </div>

    </div>
  );
}
