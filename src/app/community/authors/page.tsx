"use client";

import React, { useState, useEffect } from "react";
import { 
  Award, 
  Search, 
  UserCheck, 
  TrendingUp, 
  Star,
  Users
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import GlassCard from "@/components/yuvakshar/GlassCard";
import Link from "next/link";
import { getLiteraryIdentities } from "@/lib/repositoryService";

export default function AuthorDirectoryPage() {
  const { users, currentUser, followAuthor } = useCms();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"name" | "followers">("name");

  // Filter to authors and contributors
  const authorsList = users.filter(u => 
    ["Admin", "Owner", "Editor", "Author", "Contributor"].includes(u.role || "")
  );

  const toggleFollow = async (authorId: string) => {
    if (!currentUser) {
      alert("फॉलो करने के लिए कृपया पहले लॉगिन करें।");
      return;
    }
    try {
      await followAuthor(authorId, currentUser.id);
    } catch (err) {
      console.error("Error following author:", err);
    }
  };

  const filteredAuthors = authorsList.filter(auth => 
    auth.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (auth.designation && auth.designation.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (auth.institution && auth.institution.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const sortedAuthors = [...filteredAuthors].sort((a, b) => {
    if (filterType === "name") {
      return a.name.localeCompare(b.name, "hi");
    } else {
      return (b.followers?.length || 0) - (a.followers?.length || 0);
    }
  });

  return (
    <div className="space-y-6">
      
      {/* Search and Sorting row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-[#0F172A]/35 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/40">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <input
            type="text"
            placeholder="विशिष्ट लेखकों या शोधकर्ताओं को खोजें..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background border border-slate-200 dark:border-slate-800 hover:border-primary/45 rounded-xl px-4 py-2.5 text-xs text-foreground pl-9 focus:outline-none focus:border-primary transition-all font-hindi"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
        </div>

        {/* Filter sorting */}
        <div className="flex space-x-2 shrink-0">
          <button
            onClick={() => setFilterType("name")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer font-hindi flex items-center space-x-1 ${
              filterType === "name"
                ? "bg-primary text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-200/30"
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>वर्णानुक्रम (Name A-Z)</span>
          </button>
          <button
            onClick={() => setFilterType("followers")}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer font-hindi flex items-center space-x-1 ${
              filterType === "followers"
                ? "bg-primary text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 hover:bg-slate-200/30"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>फॉलोवर्स क्रम</span>
          </button>
        </div>

      </div>

      {/* Authors list grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedAuthors.map((author, index) => {
          const isFollowing = currentUser ? (author.followers || []).includes(currentUser.id) : false;
          
          return (
            <GlassCard key={author.id} className="p-5 border-slate-200/60 dark:border-slate-800/40 flex flex-col justify-between h-[220px]">
              
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  
                  {/* Literary Identity tag */}
                  <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/40 dark:border-slate-700/40 px-2 py-0.5 rounded-full font-serif font-bold font-hindi">
                    {getLiteraryIdentities(author, []).slice(0, 1)[0] || "लेखक"}
                  </span>
                  
                  {/* Verification Badge */}
                  {author.verification_badge && (
                    <span className="text-[9px] bg-green-500/10 text-green-600 border border-green-200/30 px-2 py-0.5 rounded-full font-serif font-bold font-hindi">
                      {author.verification_badge}
                    </span>
                  )}
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-amber-500 p-0.5 flex items-center justify-center shrink-0">
                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center font-bold text-xs text-primary uppercase">
                      {author.name[0]}
                    </div>
                  </div>
                  
                  <div className="min-w-0">
                    <Link href={`/community/authors/${author.slug || author.id}`} className="block text-xs font-bold text-slate-800 dark:text-white hover:text-primary font-hindi truncate">
                      {author.name}
                    </Link>
                    <span className="block text-[10px] text-slate-400 font-serif truncate">
                      {author.designation || author.role} {author.institution ? `| ${author.institution}` : ""}
                    </span>
                    
                    {/* Expertise Tags */}
                    {author.expertise_tags && author.expertise_tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {author.expertise_tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-[8px] bg-slate-50 dark:bg-slate-900 text-slate-400 border border-slate-200/50 dark:border-slate-800 px-1.5 py-0.5 rounded font-hindi">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/60 mt-4">
                <div className="grid grid-cols-2 gap-4 text-center text-[10px]">
                  <div>
                    <span className="block font-black text-primary font-hindi">
                      {getLiteraryIdentities(author, []).slice(0, 1)[0] || "लेखक"}
                    </span>
                    <span className="text-[9px] text-slate-400 font-serif">साहित्यिक पहचान</span>
                  </div>
                  <div>
                    <span className="block font-black text-slate-700 dark:text-slate-350 font-mono">
                      {author.followers?.length || 0}
                    </span>
                    <span className="text-[9px] text-slate-400 font-serif">फॉलोवर्स</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleFollow(author.id)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer font-hindi flex items-center space-x-1 ${
                      isFollowing
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-primary/10 hover:bg-primary/20 text-primary"
                    }`}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>फॉलो किया</span>
                      </>
                    ) : (
                      <span>फॉलो करें</span>
                    )}
                  </button>
                </div>
              </div>

            </GlassCard>
          );
        })}
      </div>

    </div>
  );
}
