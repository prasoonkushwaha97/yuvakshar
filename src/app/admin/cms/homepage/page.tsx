"use client";

import React, { useState, useEffect, useRef } from "react";
import { useCms } from "@/store/CmsContext";
import { useLanguage } from "@/store/LanguageContext";
import { 
  Layout, Save, Send, History, Heart, PlayCircle, Eye, ShieldAlert,
  ArrowRight, Search, PlusCircle, Trash2, Copy, EyeOff, Monitor, Tablet, Smartphone, Laptop,
  HelpCircle, Settings, Award, AlertTriangle, CheckCircle, BarChart3, Clock, Lock
} from "lucide-react";
import { toast } from "sonner";
import { 
  getEditions, 
  getLayoutsForEdition, 
  getSectionsForLayout, 
  createLayoutDraft, 
  publishLayoutVersion, 
  pinArticlesToSection, 
  refreshSectionLock,
  getHomepageAuditLogs
} from "@/lib/actions/homepageCmsActions";

// Reusable preset layouts
const PRESETS = {
  standard: [
    { section_type: "breakingticker", title: "ताज़ा खबरें", is_visible: true, category: "" },
    { section_type: "hero", title: "मुख्य समाचार", is_visible: true, category: "" },
    { section_type: "trending", title: "चर्चित विषय", is_visible: true, category: "" },
    { section_type: "categoryblock", title: "राजनीति", is_visible: true, category: "राजनीति" },
    { section_type: "opinion", title: "संपादकीय एवं विचार", is_visible: true, category: "विचार" },
    { section_type: "categoryblock", title: "शिक्षा", is_visible: true, category: "शिक्षा" },
    { section_type: "popular", title: "चर्चित रैंकिंग सूचियां", is_visible: true, category: "" },
    { section_type: "videos", title: "वीडियो डेस्क", is_visible: true, category: "" },
    { section_type: "magazine", title: "डिजिटल पत्रिका डेस्क", is_visible: true, category: "" },
    { section_type: "community", title: "युवाक्षर चौपाल", is_visible: true, category: "" }
  ],
  breaking: [
    { section_type: "breakingticker", title: "ताज़ा आपातकालीन अलर्ट", is_visible: true, category: "" },
    { section_type: "hero", title: "ब्रेकिंग न्यूज़ फोकस", is_visible: true, category: "" },
    { section_type: "videos", title: "लाइव वीडियो डेस्क रिपोर्ट", is_visible: true, category: "" },
    { section_type: "categoryblock", title: "ताजा घटनाक्रम", is_visible: true, category: "राजनीति" }
  ],
  election: [
    { section_type: "breakingticker", title: "चुनाव विशेष बुलेटिन", is_visible: true, category: "" },
    { section_type: "categoryblock", title: "चुनावी महा-कवरेज", is_visible: true, category: "राजनीति" },
    { section_type: "opinion", title: "राजनीतिक विश्लेषण", is_visible: true, category: "विचार" },
    { section_type: "popular", title: "ट्रेंडिंग चुनावी चर्चाएं", is_visible: true, category: "" },
    { section_type: "community", title: "चौपाल जनमत", is_visible: true, category: "" }
  ],
  festival: [
    { section_type: "hero", title: "सांस्कृतिक उत्सव विशेष", is_visible: true, category: "" },
    { section_type: "categoryblock", title: "संस्कृति और विरासत", is_visible: true, category: "संस्कृति" },
    { section_type: "categoryblock", title: "साहित्यिक परिचर्चा", is_visible: true, category: "साहित्य" },
    { section_type: "magazine", title: "उत्सव विशेषांक संस्करण", is_visible: true, category: "" }
  ],
  magazine_focus: [
    { section_type: "magazine", title: "डिजिटल मासिक पत्रिका विशेषांक", is_visible: true, category: "" },
    { section_type: "categoryblock", title: "साहित्यिक विमर्श", is_visible: true, category: "साहित्य" },
    { section_type: "opinion", title: "विशेष स्तंभकार विचार", is_visible: true, category: "विचार" },
    { section_type: "categoryblock", title: "इतिहास धरोहर", is_visible: true, category: "इतिहास" }
  ],
  weekend: [
    { section_type: "opinion", title: "साप्ताहिक विशेष स्तंभ", is_visible: true, category: "विचार" },
    { section_type: "categoryblock", title: "साहित्यिक धरोहर", is_visible: true, category: "साहित्य" },
    { section_type: "categoryblock", title: "इतिहास विमर्श", is_visible: true, category: "इतिहास" },
    { section_type: "community", title: "चौपाल साप्ताहिक संवाद", is_visible: true, category: "" },
    { section_type: "videos", title: "दस्तावेजी वीडियो सीरीज", is_visible: true, category: "" }
  ]
};

export default function HomepageBuilderPage() {
  const { locale } = useLanguage();
  const { articles, currentUser } = useCms();

  // Dynamic States
  const [editions, setEditions] = useState<any[]>([]);
  const [activeEdition, setActiveEdition] = useState<string>("");
  const [layouts, setLayouts] = useState<any[]>([]);
  const [activeLayout, setActiveLayout] = useState<any>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState<any>(null);
  
  // Controls
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "laptop" | "tablet" | "mobile">("desktop");
  const [workflowStatus, setWorkflowStatus] = useState<string>("Draft");
  
  // Article search & pin states
  const [articleSearchQuery, setArticleSearchQuery] = useState("");
  const [pinnedArticleIds, setPinnedArticleIds] = useState<string[]>([]);
  
  // Lock details
  const [sectionLockMsg, setSectionLockMsg] = useState<string | null>(null);

  // Overlay panels
  const [showHealth, setShowHealth] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showAuditLogs, setShowAuditLogs] = useState(false);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // Drag & drop index trackers
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    loadEditionsData();
  }, []);

  useEffect(() => {
    if (activeEdition) {
      loadLayoutsData(activeEdition);
    }
  }, [activeEdition]);

  useEffect(() => {
    if (activeLayout) {
      loadSectionsData(activeLayout.id);
      setWorkflowStatus(activeLayout.status || "Draft");
    }
  }, [activeLayout]);

  useEffect(() => {
    if (selectedSection) {
      // Load current locks & pings
      checkLockStatus(selectedSection.id);
      // Fetch pinned articles
      const linked = selectedSection.homepage_section_articles || [];
      setPinnedArticleIds(linked.map((p: any) => p.article_id));
    } else {
      setSectionLockMsg(null);
      setPinnedArticleIds([]);
    }
  }, [selectedSection]);

  const loadEditionsData = async () => {
    const data = await getEditions();
    setEditions(data);
    if (data.length > 0) {
      const defaultEd = data.find((e: any) => e.is_default) || data[0];
      setActiveEdition(defaultEd.id);
    }
    setLoading(false);
  };

  const loadLayoutsData = async (edId: string) => {
    setLoading(true);
    const data = await getLayoutsForEdition(edId);
    setLayouts(data);
    if (data.length > 0) {
      const activeL = data.find((l: any) => l.is_published) || data[0];
      setActiveLayout(activeL);
    } else {
      setActiveLayout(null);
      setSections([]);
    }
    setLoading(false);
  };

  const loadSectionsData = async (layoutId: string) => {
    const data = await getSectionsForLayout(layoutId);
    setSections(data);
    if (data.length > 0) {
      setSelectedSection(data[0]);
    } else {
      setSelectedSection(null);
    }
  };

  const checkLockStatus = async (secId: string) => {
    if (secId.startsWith("temp-")) return;
    const res = await refreshSectionLock(secId);
    if (res.success && res.locked) {
      setSectionLockMsg(`Locked by ${res.lockedBy}. Changes will be view-only.`);
    } else {
      setSectionLockMsg(null);
    }
  };

  // Reorder Handlers (HTML5 Native Drag and Drop)
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;

    const list = [...sections];
    const draggedItem = list[draggedIndex];
    list.splice(draggedIndex, 1);
    list.splice(targetIndex, 0, draggedItem);

    const reordered = list.map((item, idx) => ({ ...item, display_order: idx }));
    setSections(reordered);
    setDraggedIndex(null);
  };

  // Section CRUD & Attribute setters
  const updateSectionAttribute = (key: string, val: any) => {
    if (!selectedSection) return;
    const updated = { ...selectedSection, [key]: val };
    setSections(sections.map(s => s.id === selectedSection.id ? updated : s));
    setSelectedSection(updated);
  };

  const updateSectionConfig = (key: string, val: any) => {
    if (!selectedSection) return;
    const updatedConfig = { ...selectedSection.configuration_json, [key]: val };
    const updated = { ...selectedSection, configuration_json: updatedConfig };
    setSections(sections.map(s => s.id === selectedSection.id ? updated : s));
    setSelectedSection(updated);
  };

  const handleAddSection = () => {
    const newSec = {
      id: `temp-${Date.now()}`,
      section_type: "categoryblock",
      title: "नई केटेगरी ब्लॉक",
      subtitle: "विशेष लेख संग्रह",
      category: "साहित्य",
      layout_variant: "standard",
      article_limit: 4,
      is_visible: true,
      display_order: sections.length,
      configuration_json: {}
    };
    setSections([...sections, newSec]);
    setSelectedSection(newSec);
    toast.success("नया सेक्शन जोड़ा गया (ड्राफ्ट)");
  };

  const handleDuplicateSection = (sec: any) => {
    const dup = {
      ...sec,
      id: `temp-${Date.now()}`,
      title: `${sec.title} (प्रतिलिपि)`,
      display_order: sections.length
    };
    setSections([...sections, dup]);
    setSelectedSection(dup);
    toast.success("सेक्शन डुप्लिकेट किया गया");
  };

  const handleDeleteSection = (id: string) => {
    const filtered = sections.filter(s => s.id !== id);
    setSections(filtered.map((s, idx) => ({ ...s, display_order: idx })));
    if (selectedSection?.id === id) {
      setSelectedSection(filtered[0] || null);
    }
    toast.error("सेक्शन हटाया गया");
  };

  // Presets Application (Transactional backup fallback)
  const handleApplyPreset = async (presetKey: keyof typeof PRESETS) => {
    if (!activeEdition) return;
    setSaving(true);
    try {
      // 1. Create layout version
      const presetSections = PRESETS[presetKey];
      const res = await createLayoutDraft(activeEdition, `Preset: ${presetKey.toUpperCase()}`, presetSections);
      if (res.success && res.layoutId) {
        toast.success(`Preset Applied. Layout saved as draft.`);
        await loadLayoutsData(activeEdition);
      } else {
        toast.error(`Error: ${res.error}`);
      }
    } catch (err) {
      toast.error("Failed to apply preset layout");
    } finally {
      setSaving(false);
    }
  };

  // Pinned Article mappings
  const togglePinArticle = async (artId: string) => {
    if (!selectedSection) return;
    let nextPins = [...pinnedArticleIds];
    if (nextPins.includes(artId)) {
      nextPins = nextPins.filter(id => id !== artId);
    } else {
      nextPins.push(artId);
    }
    setPinnedArticleIds(nextPins);

    // If not provisional, write to DB directly
    if (!selectedSection.id.startsWith("temp-")) {
      const res = await pinArticlesToSection(activeLayout.id, selectedSection.id, nextPins);
      if (res.success) {
        toast.success("Pinned articles updated");
      }
    }
  };

  // Save layout version draft
  const handleSaveDraft = async () => {
    if (!activeEdition) return;
    setSaving(true);
    try {
      const res = await createLayoutDraft(activeEdition, activeLayout?.name.split(" (v")[0] || "मुख्य संपादकीय लेआउट", sections);
      if (res.success) {
        toast.success("Layout draft saved successfully as new version!");
        await loadLayoutsData(activeEdition);
      } else {
        toast.error(`Failed to save draft: ${res.error}`);
      }
    } catch (err) {
      toast.error("Error saving layout version");
    } finally {
      setSaving(false);
    }
  };

  // Publish Layout version (Immutable state change)
  const handlePublish = async () => {
    if (!activeLayout) return;
    
    // Run validation checks before publishing
    const validation = runHomepageValidation();
    if (!validation.passed) {
      toast.error(`Publish Blocked: ${validation.errors[0]}`);
      setShowHealth(true);
      return;
    }

    setSaving(true);
    try {
      const res = await publishLayoutVersion(activeLayout.id);
      if (res.success) {
        toast.success("Homepage Edition layout published live!");
        await loadLayoutsData(activeEdition);
      } else {
        toast.error(`Publish error: ${res.error}`);
      }
    } catch (err) {
      toast.error("Failed to publish version");
    } finally {
      setSaving(false);
    }
  };

  // Version history rollback
  const handleRollbackVersion = async (layout: any) => {
    setSaving(true);
    try {
      const res = await publishLayoutVersion(layout.id);
      if (res.success) {
        toast.success(`Restored homepage version ${layout.version} successfully!`);
        await loadLayoutsData(activeEdition);
        setShowVersionHistory(false);
      } else {
        toast.error(`Error: ${res.error}`);
      }
    } catch (err) {
      toast.error("Rollback failed");
    } finally {
      setSaving(false);
    }
  };

  // Validation Checks Engine
  const runHomepageValidation = () => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check Hero count
    const heroes = sections.filter(s => s.section_type === "hero" && s.is_visible);
    if (heroes.length === 0) {
      errors.push("Layout must contain exactly one visible Hero section.");
    } else if (heroes.length > 1) {
      errors.push("Multiple Hero sections detected. Only one is allowed.");
    }

    // Check empty sections
    sections.forEach(s => {
      if (s.is_visible) {
        if (s.section_type === "categoryblock" && !s.category) {
          errors.push(`Category Block "${s.title}" must have a valid category bind.`);
        }
      }
    });

    // Check duplicates in pins
    if (pinnedArticleIds.length !== new Set(pinnedArticleIds).size) {
      warnings.push("Duplicate pinned articles found in selection.");
    }

    return {
      passed: errors.length === 0,
      errors,
      warnings
    };
  };

  const validationResult = runHomepageValidation();

  // Search filter options
  const filteredArticles = articles.filter(art => {
    const query = articleSearchQuery.toLowerCase();
    return (
      art.title?.toLowerCase().includes(query) ||
      art.author?.toLowerCase().includes(query) ||
      art.category?.toLowerCase().includes(query)
    );
  });

  // Load audit logs
  const openAuditLogsModal = async () => {
    const logs = await getHomepageAuditLogs();
    setAuditLogs(logs);
    setShowAuditLogs(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#f97316] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-gray-500 font-sans uppercase font-bold tracking-widest">संपादकीय केंद्र लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans text-gray-800 dark:text-gray-200">
      
      {/* 1. TOP HEADER TOOLBAR */}
      <header className="sticky top-0 bg-white dark:bg-[#0B0F19] border-b border-gray-200 dark:border-gray-850 px-6 py-4 flex flex-wrap items-center justify-between gap-4 z-40 shadow-sm">
        
        {/* Logo and Edition selector */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Layout className="w-6 h-6 text-[#f97316]" />
            <h1 className="font-serif font-black text-lg md:text-xl uppercase tracking-tight">
              संपादकीय नियंत्रण कक्ष
            </h1>
          </div>
          <div className="h-5 w-px bg-gray-200 dark:bg-gray-850" />
          <select 
            value={activeEdition}
            onChange={(e) => setActiveEdition(e.target.value)}
            className="px-3 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded text-xs font-bold font-sans cursor-pointer focus:outline-none"
          >
            {editions.map((ed) => (
              <option key={ed.id} value={ed.id}>{ed.name}</option>
            ))}
          </select>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center flex-wrap gap-2">
          
          {/* Version status Badge */}
          <div className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-900 px-3 py-1.5 rounded text-xs font-bold">
            <Clock className="w-3.5 h-3.5 text-gray-400" />
            <span className="uppercase text-[9px] tracking-wider text-gray-500">दर्जा:</span>
            <span className={`text-[10px] ${workflowStatus === "Published" ? "text-emerald-500 font-extrabold" : "text-amber-500 font-bold"}`}>
              {workflowStatus}
            </span>
          </div>

          <button 
            onClick={handleSaveDraft}
            disabled={saving}
            className="bg-white hover:bg-gray-50 border border-gray-250 dark:bg-gray-900 dark:hover:bg-gray-850 dark:border-gray-800 px-3.5 py-1.5 rounded text-xs font-bold flex items-center space-x-1.5 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>ड्राफ्ट सहेजें</span>
          </button>

          <button 
            onClick={handlePublish}
            disabled={saving}
            className="bg-[#f97316] hover:bg-[#EA580C] text-white px-4 py-1.5 rounded text-xs font-extrabold flex items-center space-x-1.5 cursor-pointer shadow disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>लाइव पब्लिश</span>
          </button>

          <button 
            onClick={() => setShowVersionHistory(true)}
            className="bg-white hover:bg-gray-50 border border-gray-250 dark:bg-gray-900 dark:hover:bg-gray-850 dark:border-gray-800 p-2 rounded cursor-pointer shadow-sm"
            title="संस्करण इतिहास"
          >
            <History className="w-3.5 h-3.5" />
          </button>

          <button 
            onClick={() => setShowHealth(!showHealth)}
            className={`p-2 rounded cursor-pointer shadow-sm border ${validationResult.passed ? "bg-white hover:bg-gray-50 border-gray-250 dark:bg-gray-900 dark:hover:bg-gray-850 dark:border-gray-800" : "bg-red-50 border-red-200 text-red-500 dark:bg-red-950/20 dark:border-red-900/30"}`}
            title="होमपेज स्वास्थ्य स्वास्थ्य"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
          </button>

          <button 
            onClick={openAuditLogsModal}
            className="bg-white hover:bg-gray-50 border border-gray-250 dark:bg-gray-900 dark:hover:bg-gray-850 dark:border-gray-800 p-2 rounded cursor-pointer shadow-sm text-xs font-bold"
            title="संपादकीय गतिविधि लॉग"
          >
            ऑडिट लॉग
          </button>

          <button 
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="bg-white hover:bg-gray-50 border border-gray-250 dark:bg-gray-900 dark:hover:bg-gray-850 dark:border-gray-800 p-2 rounded cursor-pointer shadow-sm text-xs font-bold flex items-center space-x-1"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>विश्लेषण</span>
          </button>
        </div>
      </header>

      {/* Preset switch quickbar */}
      <div className="bg-amber-50/50 dark:bg-amber-950/10 border-b border-gray-200 dark:border-gray-900 px-6 py-2 flex items-center space-x-3 text-xs overflow-x-auto scrollbar-none">
        <span className="font-bold text-gray-500 text-[10px] uppercase tracking-wider whitespace-nowrap">लेआउट टेम्पलेट:</span>
        <button onClick={() => handleApplyPreset("standard")} className="bg-white hover:bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:hover:bg-gray-850 dark:border-gray-800 px-3 py-1 rounded cursor-pointer font-bold font-sans">सामान्य दिन</button>
        <button onClick={() => handleApplyPreset("breaking")} className="bg-white hover:bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:hover:bg-gray-850 dark:border-gray-800 px-3 py-1 rounded cursor-pointer font-bold font-sans text-red-500">आपातकालीन अलर्ट</button>
        <button onClick={() => handleApplyPreset("election")} className="bg-white hover:bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:hover:bg-gray-850 dark:border-gray-800 px-3 py-1 rounded cursor-pointer font-bold font-sans">चुनाव विशेष</button>
        <button onClick={() => handleApplyPreset("festival")} className="bg-white hover:bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:hover:bg-gray-850 dark:border-gray-800 px-3 py-1 rounded cursor-pointer font-bold font-sans">सांस्कृतिक उत्सव</button>
        <button onClick={() => handleApplyPreset("magazine_focus")} className="bg-white hover:bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:hover:bg-gray-850 dark:border-gray-800 px-3 py-1 rounded cursor-pointer font-bold font-sans">पत्रिका स्पॉटलाइट</button>
        <button onClick={() => handleApplyPreset("weekend")} className="bg-white hover:bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:hover:bg-gray-850 dark:border-gray-800 px-3 py-1 rounded cursor-pointer font-bold font-sans">साप्ताहिक अंक</button>
      </div>

      {/* MAIN 4-PANEL LAYOUT CONTAINER */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-0 min-h-[calc(100vh-125px)]">

        {/* PANEL 1: LEFT PANEL - HOMEPAGE STRUCTURE (3 cols) */}
        <div className="xl:col-span-3 border-r border-gray-200 dark:border-gray-850 bg-white dark:bg-[#0B0F19] p-4 flex flex-col h-full max-h-[calc(100vh-125px)] overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-850 mb-4">
            <h2 className="font-serif font-black text-sm uppercase tracking-wider text-gray-500">
              होमपेज लेआउट संरचना
            </h2>
            <button 
              onClick={handleAddSection}
              className="text-[#f97316] hover:text-[#EA580C] p-1 cursor-pointer flex items-center space-x-1 text-xs font-bold"
            >
              <PlusCircle className="w-4 h-4" />
              <span>जोड़ें</span>
            </button>
          </div>

          {/* Section rows timeline lists */}
          <div className="space-y-2 flex-grow">
            {sections.map((sec, idx) => {
              const isSelected = selectedSection?.id === sec.id;
              const type = sec.section_type || sec.type;
              return (
                <div
                  key={sec.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOver(e, idx)}
                  onDrop={(e) => handleDrop(e, idx)}
                  onClick={() => setSelectedSection(sec)}
                  className={`border p-3 rounded-lg cursor-grab active:cursor-grabbing group transition-all ${
                    isSelected 
                      ? "border-[#f97316] bg-[#f97316]/5 dark:bg-[#f97316]/10 shadow-sm"
                      : "border-gray-150 bg-gray-50/50 hover:bg-gray-100/30 dark:border-gray-850 dark:bg-gray-900/50 dark:hover:bg-gray-900/80"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      {/* Drag handle dots icon */}
                      <div className="flex flex-col space-y-0.5 text-gray-300 dark:text-gray-700 cursor-move">
                        <span className="w-3.5 h-0.5 bg-current rounded" />
                        <span className="w-3.5 h-0.5 bg-current rounded" />
                        <span className="w-3.5 h-0.5 bg-current rounded" />
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-xs uppercase text-gray-400 font-sans tracking-wide">
                            {type}
                          </span>
                          {!sec.is_visible && (
                            <EyeOff className="w-3 h-3 text-red-400" />
                          )}
                        </div>
                        <h4 className="font-serif font-bold text-sm text-gray-800 dark:text-gray-200 mt-0.5">
                          {sec.title || "अनाम सेक्शन"}
                        </h4>
                      </div>
                    </div>

                    {/* Section quick actions */}
                    <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDuplicateSection(sec); }}
                        className="p-1 text-gray-400 hover:text-[#f97316] rounded cursor-pointer"
                        title="डुप्लिकेट"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteSection(sec.id); }}
                        className="p-1 text-gray-400 hover:text-red-500 rounded cursor-pointer"
                        title="हटाएं"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-gray-100 dark:border-gray-850/80 text-[10px] text-gray-400 font-sans">
                    <span>{sec.category || "नो केटेगरी"}</span>
                    <span>लिमिट: {sec.article_limit || sec.limit || 4}</span>
                  </div>
                </div>
              );
            })}

            {sections.length === 0 && (
              <div className="text-center py-12 text-xs text-gray-400 font-serif border border-dashed border-gray-200 dark:border-gray-850 bg-gray-50/50 rounded-lg">
                कोई सेक्शन नहीं है।
              </div>
            )}
          </div>
        </div>

        {/* PANEL 2: CENTER PANEL - LIVE HOMEPAGE PREVIEW (5 cols) */}
        <div className="xl:col-span-5 bg-gray-100 dark:bg-gray-950 p-6 flex flex-col items-center justify-start border-r border-gray-200 dark:border-gray-850 max-h-[calc(100vh-125px)] overflow-y-auto">
          
          {/* Viewport responsive sizing toggles */}
          <div className="flex items-center space-x-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 px-3 py-1 rounded-full shadow-sm mb-6">
            <button 
              onClick={() => setPreviewMode("desktop")}
              className={`p-1.5 rounded-full cursor-pointer ${previewMode === "desktop" ? "bg-[#f97316] text-white" : "text-gray-400 hover:text-gray-650"}`}
              title="Desktop"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setPreviewMode("laptop")}
              className={`p-1.5 rounded-full cursor-pointer ${previewMode === "laptop" ? "bg-[#f97316] text-white" : "text-gray-400 hover:text-gray-650"}`}
              title="Laptop"
            >
              <Laptop className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setPreviewMode("tablet")}
              className={`p-1.5 rounded-full cursor-pointer ${previewMode === "tablet" ? "bg-[#f97316] text-white" : "text-gray-400 hover:text-gray-650"}`}
              title="Tablet"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setPreviewMode("mobile")}
              className={`p-1.5 rounded-full cursor-pointer ${previewMode === "mobile" ? "bg-[#f97316] text-white" : "text-gray-400 hover:text-gray-650"}`}
              title="Mobile"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          {/* Scaled Preview Frame */}
          <div 
            className={`bg-white dark:bg-[#0A0A0A] border border-gray-200 dark:border-gray-850 rounded-lg shadow-2xl transition-all duration-300 overflow-hidden w-full`}
            style={{
              maxWidth: 
                previewMode === "mobile" ? "375px" : 
                previewMode === "tablet" ? "768px" : 
                previewMode === "laptop" ? "1024px" : "100%"
            }}
          >
            {/* fallback Header banner */}
            <div className="bg-[#111] p-3 text-center border-b border-gray-850 text-white font-serif text-[10px] uppercase tracking-widest font-black">
              YUVAKSHAR PREVIEW FRAME
            </div>

            {/* Render Simulated blocks list */}
            <div className="p-4 space-y-4 min-h-[450px]">
              {sections.filter(s => s.is_visible).map((sec) => (
                <div 
                  key={sec.id}
                  className={`p-4 border rounded relative overflow-hidden transition-all ${
                    selectedSection?.id === sec.id 
                      ? "border-[#f97316] bg-[#f97316]/5" 
                      : "border-gray-200 bg-gray-50/50 dark:border-gray-850 dark:bg-gray-900/50"
                  }`}
                >
                  {/* Badge block info */}
                  <span className="absolute right-2 top-2 text-[8px] font-sans font-bold uppercase bg-gray-200 dark:bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded">
                    {sec.section_type || sec.type}
                  </span>

                  <h5 className="font-serif font-black text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                    {sec.category || "विविध श्रेणी"}
                  </h5>
                  <h3 className="font-serif font-bold text-sm text-gray-800 dark:text-white leading-tight">
                    {sec.title || "अनाम सेक्शन"}
                  </h3>
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 font-serif">
                    {sec.subtitle || "उपशीर्षक उपलब्ध नहीं है।"}
                  </p>

                  {/* fallback content grid layouts */}
                  <div className="grid grid-cols-4 gap-2 mt-3.5">
                    {Array.from({ length: Math.min(sec.article_limit || sec.limit || 4, 4) }).map((_, i) => (
                      <div key={i} className="h-10 bg-white dark:bg-gray-950 border border-gray-150 dark:border-gray-900 rounded flex items-center justify-center text-[9px] text-gray-400 font-sans shadow-sm">
                        Story #{i+1}
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {sections.filter(s => s.is_visible).length === 0 && (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-xs font-serif italic border border-dashed border-gray-200 rounded">
                  सभी सेक्शन छिपे हुए हैं। होमपेज खाली रहेगा।
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PANEL 3: RIGHT PANEL - SECTION INSPECTOR (4 cols) */}
        <div className="xl:col-span-4 bg-white dark:bg-[#0B0F19] p-5 flex flex-col max-h-[calc(100vh-125px)] overflow-y-auto">
          
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-850 mb-5">
            <h2 className="font-serif font-black text-sm uppercase tracking-wider text-gray-500">
              सेक्शन सेटिंग्स
            </h2>
            <Settings className="w-4 h-4 text-gray-400" />
          </div>

          {selectedSection ? (
            <div className="space-y-5 flex-grow">
              
              {/* Lock Warning Overlay */}
              {sectionLockMsg && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-600 flex items-start space-x-2">
                  <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{sectionLockMsg}</span>
                </div>
              )}

              {/* Title & Subtitle */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">सेक्शन मुख्य शीर्षक (Hindi/English)</label>
                  <input 
                    type="text"
                    value={selectedSection.title || ""}
                    onChange={(e) => updateSectionAttribute("title", e.target.value)}
                    disabled={!!sectionLockMsg}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#f97316] font-serif font-bold text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">सेक्शन उपशीर्षक</label>
                  <textarea 
                    value={selectedSection.subtitle || ""}
                    onChange={(e) => updateSectionAttribute("subtitle", e.target.value)}
                    disabled={!!sectionLockMsg}
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#f97316] font-serif"
                  />
                </div>
              </div>

              {/* Section Type & Category Bindings */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">सेक्शन प्रकार</label>
                  <select 
                    value={selectedSection.section_type || selectedSection.type || ""}
                    onChange={(e) => updateSectionAttribute("section_type", e.target.value)}
                    disabled={!!sectionLockMsg}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded text-xs cursor-pointer focus:outline-none"
                  >
                    <option value="hero">Hero Block</option>
                    <option value="breakingticker">Breaking Ticker</option>
                    <option value="trending">Trending Tags</option>
                    <option value="categoryblock">Category Block</option>
                    <option value="opinion">Opinions Desk</option>
                    <option value="videos">Video Desk</option>
                    <option value="magazine">Magazine Showcase</option>
                    <option value="popular">Popular Rankings</option>
                    <option value="community">Chaupal Community</option>
                    <option value="authors">Authors Showcase</option>
                    <option value="newsletter">Newsletter Banner</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">विषय श्रेणी सम्बद्धता</label>
                  <select 
                    value={selectedSection.category || ""}
                    onChange={(e) => updateSectionAttribute("category", e.target.value)}
                    disabled={!!sectionLockMsg}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded text-xs cursor-pointer focus:outline-none"
                  >
                    <option value="">कोई श्रेणी नहीं</option>
                    <option value="राजनीति">राजनीति (Politics)</option>
                    <option value="शिक्षा">शिक्षा (Education)</option>
                    <option value="साहित्य">साहित्य (Literature)</option>
                    <option value="इतिहास">इतिहास (History)</option>
                    <option value="पर्यावरण">पर्यावरण (Environment)</option>
                    <option value="विज्ञान">विज्ञान (Science)</option>
                    <option value="तकनीक">तकनीक (Technology)</option>
                    <option value="संस्कृति">संस्कृति (Culture)</option>
                    <option value="विचार">विचार / विश्लेषण</option>
                  </select>
                </div>
              </div>

              {/* Layout Variants & Background Options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">लेआउट डिजाइन</label>
                  <select 
                    value={selectedSection.layout_variant || "standard"}
                    onChange={(e) => updateSectionAttribute("layout_variant", e.target.value)}
                    disabled={!!sectionLockMsg}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded text-xs cursor-pointer focus:outline-none"
                  >
                    <option value="standard">Standard Grid</option>
                    <option value="timeline">Timeline Split</option>
                    <option value="list">Minimal List</option>
                    <option value="spotlight">Media Spotlight</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">पृष्ठभूमि रंग</label>
                  <select 
                    value={selectedSection.configuration_json?.bg || "cream"}
                    onChange={(e) => updateSectionConfig("bg", e.target.value)}
                    disabled={!!sectionLockMsg}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded text-xs cursor-pointer focus:outline-none"
                  >
                    <option value="cream">Warm Cream (#F8F5EE)</option>
                    <option value="white">Pure White (#FFFFFF)</option>
                    <option value="saffron">Saffron Tint</option>
                    <option value="dark">Charcoal Dark</option>
                  </select>
                </div>
              </div>

              {/* Limits and visibility toggles */}
              <div className="grid grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">लेख संख्या सीमा: {selectedSection.article_limit || selectedSection.limit || 4}</label>
                  <input 
                    type="range" 
                    min="1" 
                    max="10"
                    value={selectedSection.article_limit || selectedSection.limit || 4}
                    onChange={(e) => updateSectionAttribute("article_limit", parseInt(e.target.value))}
                    disabled={!!sectionLockMsg}
                    className="w-full accent-[#f97316] cursor-pointer"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-4">
                  <input 
                    type="checkbox"
                    id="visCheck"
                    checked={selectedSection.is_visible !== false}
                    onChange={(e) => updateSectionAttribute("is_visible", e.target.checked)}
                    disabled={!!sectionLockMsg}
                    className="accent-[#f97316] w-4 h-4 cursor-pointer"
                  />
                  <label htmlFor="visCheck" className="text-xs font-bold text-gray-500 cursor-pointer">सेक्शन को दिखाएं</label>
                </div>
              </div>

              {/* FEATURED / PINNED ARTICLES SEARCH SELECTOR */}
              <div className="border-t border-gray-100 dark:border-gray-850 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    मैन्युअल पिन किए गए लेख
                  </h4>
                  <span className="text-[10px] text-gray-400 bg-gray-100 dark:bg-gray-900 px-1.5 py-0.5 rounded font-bold font-sans">
                    {pinnedArticleIds.length} पिन
                  </span>
                </div>

                {/* Autocomplete Search input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-3" />
                  <input 
                    type="text" 
                    placeholder="शीर्षक, लेखक या श्रेणी खोजें..."
                    value={articleSearchQuery}
                    onChange={(e) => setArticleSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded text-xs focus:outline-none"
                  />
                </div>

                {/* Search result timelines lists */}
                {articleSearchQuery.trim() !== "" && (
                  <div className="bg-white dark:bg-gray-950 border border-gray-250 dark:border-gray-800 rounded max-h-[160px] overflow-y-auto divide-y divide-gray-100 dark:divide-gray-900 shadow-md">
                    {filteredArticles.slice(0, 5).map((art) => {
                      const isPinned = pinnedArticleIds.includes(art.id);
                      return (
                        <div 
                          key={art.id}
                          onClick={() => togglePinArticle(art.id)}
                          className="p-2.5 text-xs hover:bg-[#f97316]/5 dark:hover:bg-[#f97316]/10 flex items-center justify-between cursor-pointer"
                        >
                          <div className="min-w-0 pr-2">
                            <h5 className="font-bold text-gray-850 dark:text-gray-200 truncate leading-snug">{art.title}</h5>
                            <span className="text-[10px] text-gray-400 font-sans mt-0.5 block">{art.author} • {art.category}</span>
                          </div>
                          <span className={`text-[10px] font-sans font-bold shrink-0 ${isPinned ? "text-[#f97316]" : "text-gray-400"}`}>
                            {isPinned ? "पिन है" : "+ पिन करें"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Pinned list badges items */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {pinnedArticleIds.map((pinId) => {
                    const matched = articles.find(a => a.id === pinId);
                    if (!matched) return null;
                    return (
                      <div key={pinId} className="flex items-center space-x-1.5 bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20 px-2 py-1 rounded text-[10px] font-sans font-bold">
                        <span className="truncate max-w-[120px]">{matched.title}</span>
                        <button 
                          onClick={() => togglePinArticle(pinId)}
                          className="hover:text-red-500 font-bold shrink-0"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Private Notes */}
              <div className="border-t border-gray-100 dark:border-gray-850 pt-4">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">संपादकीय निजी नोट्स (Private)</label>
                <textarea 
                  value={selectedSection.private_notes || ""}
                  onChange={(e) => updateSectionAttribute("private_notes", e.target.value)}
                  disabled={!!sectionLockMsg}
                  placeholder="लेआउट सम्बन्धी निर्देश यहाँ दर्ज करें..."
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-250 dark:border-gray-800 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#f97316] font-serif"
                />
              </div>

            </div>
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center text-gray-400 text-xs font-serif italic border border-dashed border-gray-200 dark:border-gray-850 bg-gray-50/50 rounded-lg p-6 text-center">
              संपादकीय बदलावों के लिए बाईं सूची से किसी सेक्शन का चयन करें।
            </div>
          )}
        </div>

      </div>

      {/* OVERLAY DIALOG 1: HEALTH DASHBOARD */}
      {showHealth && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#0B0F19] rounded-xl border border-gray-250 dark:border-gray-800 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-850 flex items-center justify-between">
              <h3 className="font-serif font-black text-sm uppercase tracking-wider flex items-center">
                <ShieldAlert className="w-4 h-4 text-[#f97316] mr-2" />
                होमपेज स्वास्थ्य एवं निदान
              </h3>
              <button onClick={() => setShowHealth(false)} className="text-gray-400 hover:text-gray-650 cursor-pointer">×</button>
            </div>
            
            <div className="p-5 space-y-4 max-h-[380px] overflow-y-auto">
              
              {/* Validation errors */}
              {validationResult.errors.length > 0 ? (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider">त्रुटियां (पब्लिश अवरुद्ध)</h4>
                  {validationResult.errors.map((err, i) => (
                    <div key={i} className="p-3 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 rounded text-xs flex items-start space-x-2 border border-red-100 dark:border-red-950/50">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{err}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-400 rounded text-xs flex items-center space-x-2 border border-emerald-100 dark:border-emerald-950/50">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-bold">सत्यापन सफल: होमपेज पब्लिश के लिए तैयार है।</span>
                </div>
              )}

              {/* Warnings */}
              {validationResult.warnings.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider">चेतावनी</h4>
                  {validationResult.warnings.map((warn, i) => (
                    <div key={i} className="p-3 bg-amber-50 dark:bg-amber-950/10 text-amber-650 dark:text-amber-400 rounded text-xs flex items-start space-x-2 border border-amber-100 dark:border-amber-950/30">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{warn}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Basic health check checklist status */}
              <div className="border-t border-gray-100 dark:border-gray-850 pt-3 space-y-2 text-xs font-sans">
                <div className="flex justify-between">
                  <span className="text-gray-400">कुल सक्रिय सेक्शन</span>
                  <span className="font-bold">{sections.filter(s => s.is_visible).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">मैन्युअल पिन किए गए लेख</span>
                  <span className="font-bold">{pinnedArticleIds.length}</span>
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-850 text-right">
              <button 
                onClick={() => setShowHealth(false)}
                className="bg-[#f97316] text-white px-4 py-1.5 rounded text-xs font-bold cursor-pointer"
              >
                ठीक है
              </button>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY DIALOG 2: VERSION HISTORY */}
      {showVersionHistory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#0B0F19] rounded-xl border border-gray-250 dark:border-gray-800 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-850 flex items-center justify-between">
              <h3 className="font-serif font-black text-sm uppercase tracking-wider flex items-center">
                <History className="w-4 h-4 text-[#f97316] mr-2" />
                संस्करण इतिहास
              </h3>
              <button onClick={() => setShowVersionHistory(false)} className="text-gray-400 hover:text-gray-650 cursor-pointer">×</button>
            </div>
            
            <div className="p-5 space-y-3 max-h-[380px] overflow-y-auto">
              {layouts.map((lay) => (
                <div 
                  key={lay.id}
                  className={`p-3 border rounded-lg flex items-center justify-between text-xs transition-colors ${lay.is_published ? "border-[#f97316] bg-[#f97316]/5" : "border-gray-200 hover:bg-gray-55/30"}`}
                >
                  <div>
                    <h5 className="font-serif font-bold text-sm text-gray-800 dark:text-white flex items-center space-x-1.5">
                      <span>{lay.name}</span>
                      {lay.is_published && (
                        <span className="bg-[#f97316]/20 text-[#f97316] border border-[#f97316]/30 px-1.5 py-0.5 rounded text-[8px] font-sans font-bold">
                          सक्रिय
                        </span>
                      )}
                    </h5>
                    <span className="text-[10px] text-gray-400 font-sans mt-0.5 block">
                      वर्ज़न: {lay.version} • {lay.status} • {lay.created_at ? new Date(lay.created_at).toLocaleDateString() : ""}
                    </span>
                  </div>

                  {!lay.is_published && (
                    <button 
                      onClick={() => handleRollbackVersion(lay)}
                      className="bg-white hover:bg-gray-50 border border-gray-200 dark:bg-gray-900 dark:hover:bg-gray-850 dark:border-gray-800 text-gray-700 dark:text-gray-300 px-3 py-1 rounded text-[10px] font-bold font-sans cursor-pointer shadow-sm"
                    >
                      लागू करें
                    </button>
                  )}
                </div>
              ))}

              {layouts.length === 0 && (
                <div className="py-12 text-center text-xs text-gray-400 font-serif italic border border-dashed border-gray-200 rounded">
                  कोई पुराना संस्करण नहीं मिला।
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY DIALOG 3: ANALYTICS DASHBOARD */}
      {showAnalytics && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#0B0F19] rounded-xl border border-gray-250 dark:border-gray-800 shadow-2xl max-w-lg w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-850 flex items-center justify-between">
              <h3 className="font-serif font-black text-sm uppercase tracking-wider flex items-center">
                <BarChart3 className="w-4 h-4 text-[#f97316] mr-2" />
                लेआउट परफॉरमेंस विश्लेषण
              </h3>
              <button onClick={() => setShowAnalytics(false)} className="text-gray-400 hover:text-gray-650 cursor-pointer">×</button>
            </div>
            
            <div className="p-5 space-y-4 max-h-[380px] overflow-y-auto">
              
              {/* Aggregated charts fallbacks summary */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-850 p-3 rounded">
                  <span className="text-[9px] text-gray-400 font-bold block mb-1">कुल व्यूज</span>
                  <h4 className="text-lg font-bold font-sans">48.2k</h4>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-850 p-3 rounded">
                  <span className="text-[9px] text-gray-400 font-bold block mb-1">कुल क्लिक्स</span>
                  <h4 className="text-lg font-bold font-sans">3,912</h4>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-850 p-3 rounded">
                  <span className="text-[9px] text-gray-400 font-bold block mb-1">औसत CTR</span>
                  <h4 className="text-lg font-bold font-sans text-[#f97316]">8.12%</h4>
                </div>
              </div>

              {/* CTR breakdown per section */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-450 uppercase tracking-wider">सेक्शन क्लिक-थ्रू दर (CTR) रैंकिंग</h4>
                
                {sections.filter(s => s.is_visible).map((sec, idx) => {
                  const ctrPct = Math.max(12 - idx * 1.5, 1.5);
                  return (
                    <div key={sec.id} className="space-y-1 font-sans text-xs">
                      <div className="flex justify-between text-gray-500">
                        <span className="font-bold font-serif">{sec.title || "अनाम सेक्शन"}</span>
                        <span>{ctrPct.toFixed(1)}% CTR</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#f97316] to-amber-500 rounded" 
                          style={{ width: `${ctrPct * 8}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* OVERLAY DIALOG 4: AUDIT LOGS */}
      {showAuditLogs && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#0B0F19] rounded-xl border border-gray-250 dark:border-gray-800 shadow-2xl max-w-xl w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-850 flex items-center justify-between">
              <h3 className="font-serif font-black text-sm uppercase tracking-wider flex items-center">
                संपादकीय ऑडिट लॉग्स
              </h3>
              <button onClick={() => setShowAuditLogs(false)} className="text-gray-400 hover:text-gray-650 cursor-pointer">×</button>
            </div>
            
            <div className="p-5 space-y-3 max-h-[380px] overflow-y-auto text-xs font-sans">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-[#f97316] uppercase tracking-wide text-[10px]">{log.action_type}</span>
                    <span className="text-[9px] text-gray-400">{log.created_at ? new Date(log.created_at).toLocaleTimeString() : ""}</span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">{log.details}</p>
                  <span className="text-[9px] text-gray-400 block mt-1.5">— {log.profiles?.display_name || "सिस्टम संपादक"}</span>
                </div>
              ))}

              {auditLogs.length === 0 && (
                <div className="py-12 text-center text-xs text-gray-400 font-serif italic border border-dashed border-gray-200 rounded">
                  कोई ऑडिट रिकॉर्ड नहीं मिला।
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
