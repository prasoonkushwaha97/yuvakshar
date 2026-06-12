"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  MapPin, 
  Users, 
  CheckCircle2, 
  Award,
  Sparkles,
  Building,
  ArrowUpDown
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import GlassCard from "@/components/yuvakshar/GlassCard";
import { getLiteraryIdentities } from "@/lib/repositoryService";

export default function AuthorDirectory() {
  const { users } = useCms();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedExpertise, setSelectedExpertise] = useState("all");
  const [selectedVerification, setSelectedVerification] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [sortBy, setSortBy] = useState("name"); // name | followers | newest
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Filter out non-authors or users without public visibility if configured (we'll show all staff/authors in public directory)
  const authorProfiles = useMemo(() => {
    return users.filter(u => u.role !== null);
  }, [users]);

  // Extract unique expertise tags dynamically
  const allExpertiseTags = useMemo(() => {
    const tags = new Set<string>();
    authorProfiles.forEach(u => {
      if (u.expertise_tags) {
        u.expertise_tags.forEach(t => tags.add(t));
      }
    });
    return Array.from(tags);
  }, [authorProfiles]);

  // Extract unique locations dynamically
  const allLocations = useMemo(() => {
    const locs = new Set<string>();
    authorProfiles.forEach(u => {
      if (u.location) {
        // Simple cleaning to get city/state
        const cleanLoc = u.location.split(",")[0].trim();
        if (cleanLoc) locs.add(cleanLoc);
      }
    });
    return Array.from(locs);
  }, [authorProfiles]);

  // Filter & Sort Logic
  const filteredAuthors = useMemo(() => {
    let result = [...authorProfiles];

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(u => 
        u.name.toLowerCase().includes(query) ||
        (u.bio && u.bio.toLowerCase().includes(query)) ||
        (u.designation && u.designation.toLowerCase().includes(query)) ||
        (u.location && u.location.toLowerCase().includes(query)) ||
        (u.expertise_tags && u.expertise_tags.some(t => t.toLowerCase().includes(query))) ||
        (u.academic_credentials && u.academic_credentials.some(c => c.toLowerCase().includes(query)))
      );
    }

    // Role filter
    if (selectedRole !== "all") {
      result = result.filter(u => u.role === selectedRole);
    }

    // Expertise filter
    if (selectedExpertise !== "all") {
      result = result.filter(u => u.expertise_tags && u.expertise_tags.includes(selectedExpertise));
    }

    // Verification filter
    if (selectedVerification !== "all") {
      if (selectedVerification === "verified") {
        result = result.filter(u => u.verification_badge !== null && u.verification_badge !== undefined);
      } else {
        result = result.filter(u => u.verification_badge === null || u.verification_badge === undefined);
      }
    }

    // Location filter
    if (selectedLocation !== "all") {
      result = result.filter(u => u.location && u.location.includes(selectedLocation));
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name, "hi-IN");
      }
      if (sortBy === "followers") {
        return (b.followers?.length || 0) - (a.followers?.length || 0);
      }
      if (sortBy === "newest") {
        return (b.joinDate || "").localeCompare(a.joinDate || "");
      }
      // default: name
      return a.name.localeCompare(b.name, "hi-IN");
    });

    return result;
  }, [authorProfiles, searchQuery, selectedRole, selectedExpertise, selectedVerification, selectedLocation, sortBy]);



  // Helper for role translation
  const translateRole = (role?: string | null) => {
    if (!role) return "सदस्य";
    const map: Record<string, string> = {
      "Owner": "संस्थापक एवं स्वामी",
      "Admin": "प्रशासक",
      "Editor-in-Chief": "प्रधान संपादक",
      "Managing Editor": "प्रबंध संपादक",
      "Editor": "संपादक",
      "Sub Editor": "सह संपादक",
      "Fact Checker": "तथ्य अन्वेषक",
      "Reviewer": "समीक्षक",
      "Author": "लेखक",
      "Contributor": "योगदानकर्ता"
    };
    return map[role] || role;
  };

  // Check if user is leadership
  const isLeadership = (role?: string | null) => {
    return role && ["Owner", "Admin", "Editor-in-Chief", "Managing Editor"].includes(role);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1D] text-slate-800 dark:text-slate-200 transition-colors duration-300">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 py-12 px-4">
        {/* Background glow effects */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto text-center relative z-10 space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold font-serif">
            <Sparkles className="w-3.5 h-3.5" />
            <span>लेखक पारिस्थितिकी तंत्र २.०</span>
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-serif bg-gradient-to-r from-slate-900 via-primary to-amber-600 dark:from-white dark:via-orange-400 dark:to-amber-300 bg-clip-text text-transparent leading-tight">
            युवाक्षर संपादकीय एवं लेखक मंडल
          </h1>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-serif leading-relaxed">
            मिलिए उन प्रबुद्ध विचारकों, शोधकर्ताओं, और संपादकों से जो अपने लेखन और विचारों के माध्यम से युवा समाज में वैचारिक परिवर्तन ला रहे हैं।
          </p>
        </div>
      </div>

      {/* Directory Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block space-y-6">
            <div className="sticky top-24 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-serif font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" />
                  <span>फिल्टर विकल्प</span>
                </span>
                {(selectedRole !== "all" || selectedExpertise !== "all" || selectedVerification !== "all" || selectedLocation !== "all") && (
                  <button 
                    onClick={() => {
                      setSelectedRole("all");
                      setSelectedExpertise("all");
                      setSelectedVerification("all");
                      setSelectedLocation("all");
                    }}
                    className="text-[10px] text-primary font-serif hover:underline"
                  >
                    साफ़ करें
                  </button>
                )}
              </div>

              {/* Role Filter */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wider block">संपादकीय भूमिका</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-serif text-slate-700 dark:text-slate-255 focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="all">सभी भूमिकाएं</option>
                  <option value="Owner">संस्थापक एवं स्वामी</option>
                  <option value="Editor-in-Chief">प्रधान संपादक</option>
                  <option value="Managing Editor">प्रबंध संपादक</option>
                  <option value="Editor">संपादक</option>
                  <option value="Sub Editor">सह संपादक</option>
                  <option value="Author">लेखक</option>
                  <option value="Contributor">योगदानकर्ता</option>
                </select>
              </div>

              {/* Expertise Filter */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wider block">विशेषज्ञता क्षेत्र</label>
                <select
                  value={selectedExpertise}
                  onChange={(e) => setSelectedExpertise(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-serif text-slate-700 dark:text-slate-255 focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="all">सभी विशेषज्ञता</option>
                  {allExpertiseTags.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>

              {/* Verification Filter */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wider block">सत्यापन स्थिति</label>
                <select
                  value={selectedVerification}
                  onChange={(e) => setSelectedVerification(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-serif text-slate-700 dark:text-slate-255 focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="all">सभी खाते</option>
                  <option value="verified">सत्यापित (Verified)</option>
                  <option value="unverified">असतत (Standard)</option>
                </select>
              </div>

              {/* Location Filter */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wider block">भौगोलिक स्थान</label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-serif text-slate-700 dark:text-slate-255 focus:outline-none focus:border-primary cursor-pointer"
                >
                  <option value="all">सभी स्थान</option>
                  {allLocations.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Main List Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Top Toolbar */}
            <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
              {/* Search Bar */}
              <div className="relative w-full md:max-w-md">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="नाम, बायो, विशेषज्ञता या क्रेडेंशियल्स खोजें..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-serif text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-primary"
                />
              </div>

              {/* Sort Controls & Mobile Filters Toggle */}
              <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-3">
                <button 
                  onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                  className="lg:hidden flex items-center gap-1.5 bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 rounded-xl text-xs font-bold cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300"
                >
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  <span>फिल्टर ({[selectedRole, selectedExpertise, selectedVerification, selectedLocation].filter(v => v !== "all").length})</span>
                </button>

                <div className="flex items-center gap-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2.5 text-xs font-serif text-slate-755 dark:text-slate-200 focus:outline-none cursor-pointer"
                  >
                    <option value="name">वर्णानुक्रम (Name A-Z)</option>
                    <option value="followers">सर्वाधिक फॉलोवर्स</option>
                    <option value="newest">नवीनतम सदस्यता</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Mobile Filters Drawer/Dropdown (renders conditionally) */}
            {mobileFiltersOpen && (
              <div className="lg:hidden bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-md transition-all duration-300">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-xs font-serif text-slate-800 dark:text-white">फिल्टर परिष्कृत करें</span>
                  <button 
                    onClick={() => setMobileFiltersOpen(false)}
                    className="text-slate-400 text-xs font-bold hover:text-slate-655"
                  >
                    बंद करें
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 block font-serif">भूमिका</label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg p-2 text-xs font-serif"
                    >
                      <option value="all">सभी भूमिकाएं</option>
                      <option value="Owner">संस्थापक एवं स्वामी</option>
                      <option value="Editor-in-Chief">प्रधान संपादक</option>
                      <option value="Managing Editor">प्रबंध संपादक</option>
                      <option value="Editor">संपादक</option>
                      <option value="Sub Editor">सह संपादक</option>
                      <option value="Author">लेखक</option>
                      <option value="Contributor">योगदानकर्ता</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 block font-serif">विशेषज्ञता</label>
                    <select
                      value={selectedExpertise}
                      onChange={(e) => setSelectedExpertise(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg p-2 text-xs font-serif"
                    >
                      <option value="all">सभी विशेषज्ञता</option>
                      {allExpertiseTags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 block font-serif">सत्यापन स्थिति</label>
                    <select
                      value={selectedVerification}
                      onChange={(e) => setSelectedVerification(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-855 rounded-lg p-2 text-xs font-serif"
                    >
                      <option value="all">सभी खाते</option>
                      <option value="verified">सत्यापित</option>
                      <option value="unverified">असतत</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 block font-serif">स्थान</label>
                    <select
                      value={selectedLocation}
                      onChange={(e) => setSelectedLocation(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-855 rounded-lg p-2 text-xs font-serif"
                    >
                      <option value="all">सभी स्थान</option>
                      {allLocations.map(loc => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedRole("all");
                      setSelectedExpertise("all");
                      setSelectedVerification("all");
                      setSelectedLocation("all");
                    }}
                    className="flex-grow bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 py-2 rounded-xl text-xs font-bold"
                  >
                    साफ़ करें
                  </button>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="flex-grow bg-primary text-white py-2 rounded-xl text-xs font-bold"
                  >
                    लागू करें
                  </button>
                </div>
              </div>
            )}

            {/* Results Grid */}
            {filteredAuthors.length === 0 ? (
              <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center space-y-4">
                <Building className="w-12 h-12 text-slate-350 mx-auto" />
                <h3 className="font-serif font-bold text-lg text-slate-800 dark:text-white">कोई लेखक नहीं मिला</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto font-serif">आपकी खोज या चुने गए फ़िल्टर के साथ मेल खाने वाला कोई लेखक उपलब्ध नहीं है। कृपया फ़िल्टर बदलें।</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAuthors.map((author) => {
                  const leadership = isLeadership(author.role);
                  return (
                    <GlassCard 
                      key={author.id}
                      glow={leadership ? "gold" : "none"} 
                      className={`relative flex flex-col rounded-3xl overflow-hidden border transition-all duration-300 group hover:shadow-lg dark:hover:shadow-primary/5 hover:-translate-y-1 ${
                        leadership 
                          ? "border-amber-200 dark:border-amber-900/40 bg-gradient-to-b from-amber-50/10 to-white dark:from-[#1E1B15]/10 dark:to-[#0F172A]" 
                          : "border-slate-200 dark:border-slate-800/80"
                      }`}
                    >
                      {/* Leadership Banner Indicator */}
                      {leadership && (
                        <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-orange-500 text-white text-[8px] font-bold uppercase tracking-wider py-1 px-3.5 rounded-bl-xl z-20 flex items-center gap-1 shadow-sm font-serif">
                          <Award className="w-3 h-3" />
                          <span>नेतृत्व मंडल</span>
                        </div>
                      )}

                      {/* Header Cover Banner */}
                      <div className="relative h-20 w-full overflow-hidden bg-slate-105 dark:bg-slate-900/60 shrink-0">
                        {author.cover_banner ? (
                          <img 
                            src={author.cover_banner} 
                            alt={`${author.name} Banner`} 
                            className="w-full h-full object-cover filter brightness-95 group-hover:scale-105 transition-transform duration-500" 
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-[#111827] dark:to-[#1F2937]" />
                        )}
                        {/* Literary Identity Ribbon */}
                        <span className="absolute bottom-2 left-3 text-[9px] font-bold font-serif rounded-full px-2.5 py-0.5 shadow-sm select-none bg-slate-900/60 text-white backdrop-blur-xs border border-white/10">
                          {getLiteraryIdentities(author, []).slice(0, 2).join(" • ")}
                        </span>
                      </div>

                      {/* Card Profile Details */}
                      <div className="p-5 flex-grow flex flex-col relative pt-10">
                        {/* Avatar (overlapping the cover) */}
                        <div className="absolute -top-10 left-5 w-16 h-16 rounded-full border-4 border-white dark:border-[#0F172A] overflow-hidden bg-white dark:bg-slate-900 shadow-md">
                          {author.avatar_url ? (
                            <img src={author.avatar_url} alt={author.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400">
                              <span className="text-xl font-bold uppercase">{author.name[0]}</span>
                            </div>
                          )}
                        </div>

                        {/* Name & Credentials */}
                        <div className="space-y-1 mt-1">
                          <h3 className="font-serif font-bold text-slate-800 dark:text-white text-sm group-hover:text-primary transition-colors flex items-center gap-1.5 truncate">
                            <span>{author.name}</span>
                            {author.verification_badge && (
                              <CheckCircle2 className="w-4 h-4 text-blue-500 fill-blue-500/10 shrink-0" />
                            )}
                          </h3>

                          {/* Role Tag & Institution */}
                          <div className="flex flex-col gap-0.5 text-[10px]">
                            <span className={`font-serif font-bold ${leadership ? 'text-amber-600 dark:text-amber-400' : 'text-primary'}`}>
                              {translateRole(author.role)}
                            </span>
                            {author.designation && author.designation !== translateRole(author.role) && (
                              <span className="text-slate-400 dark:text-slate-500 truncate leading-tight font-serif">
                                {author.designation}
                              </span>
                            )}
                            {author.institution && (
                              <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1 font-serif">
                                <Building className="w-3.5 h-3.5 text-slate-400" />
                                <span className="truncate">{author.institution}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Short Bio */}
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-serif line-clamp-2 mt-3 leading-relaxed">
                          {author.bio || "युवाक्षर समुदाय के सक्रिय सदस्य एवं प्रबुद्ध लेखक। स्वतंत्र चिंतन और सामाजिक विमर्श में योगदान।"}
                        </p>

                        {/* Expertise Tags */}
                        {author.expertise_tags && author.expertise_tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-4">
                            {author.expertise_tags.slice(0, 3).map((tag, idx) => (
                              <span 
                                key={idx} 
                                className="bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 text-[9px] font-medium font-serif px-2 py-0.5 rounded-md"
                              >
                                {tag}
                              </span>
                            ))}
                            {author.expertise_tags.length > 3 && (
                              <span className="text-slate-400 text-[8px] font-serif self-center font-bold">
                                +{author.expertise_tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Spacer to push button down */}
                        <div className="flex-grow min-h-[16px]" />

                        {/* Footer details */}
                        <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-serif">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              <span>{author.followers?.length || 0} फॉलोवर्स</span>
                            </span>
                            {author.location && (
                              <span className="flex items-center gap-0.5 max-w-[100px]">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                <span className="truncate">{author.location.split(",")[0]}</span>
                              </span>
                            )}
                          </div>

                          <Link
                            href={`/authors/${author.slug}`}
                            className="text-primary hover:text-primary/80 font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform duration-200 font-serif text-[11px]"
                          >
                            <span>प्रोफ़ाइल</span>
                            <span>→</span>
                          </Link>
                        </div>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
