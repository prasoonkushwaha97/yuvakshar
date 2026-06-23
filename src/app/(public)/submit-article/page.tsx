"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  PenTool, 
  Upload, 
  FileText, 
  Image as ImageIcon,
  CheckCircle2,
  Phone,
  Mail,
  User,
  Plus,
  ArrowLeft,
  Sparkles,
  RotateCw,
  Trash2,
  Layers,
  Monitor,
  Tablet,
  Smartphone,
  CheckSquare,
  AlertTriangle,
  History,
  FileCheck,
  ChevronDown,
  ChevronUp,
  Camera,
  Scissors,
  Check,
  Send,
  UserCheck,
  Lock,
  X,
  ArrowUp,
  ArrowDown,
  Settings,
  BookOpen,
  Award,
  Flame,
  Target,
  HelpCircle,
  Link as LinkIcon,
  Calendar,
  Hash,
  Play,
  Table as TableIcon,
  List,
  ListOrdered,
  Type,
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Paintbrush
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

import GlassCard from "@/components/yuvakshar/GlassCard";
import { useCms } from "@/store/CmsContext";
import { ContentRenderer } from "@/components/content/ContentRenderer";
import { parseMarkdownToHtmlBlocks } from "@/lib/markdown";
import { 
  serializeBlocksToMarkdown, 
  deserializeMarkdownToBlocks,
  BlockItem,
  ListBlockItem,
  ImageItem
} from "@/lib/editorSerializer";

interface UploadedImage {
  id: string;
  name: string;
  size: number;
  dataUrl: string;
  isFeatured: boolean;
}

interface DraftVersion {
  id: string;
  timestamp: string;
  title: string;
  content: string;
  wordCount: number;
}

interface SubmittedArticle {
  id: string;
  date: string;
  title: string;
  category: string;
  status: "समीक्षा के अधीन" | "संपादित" | "स्वीकृत" | "प्रकाशित";
  timelineStep: number; // 1 to 4
}

// Custom ContentEditable to prevent cursor jump issues
interface ContentEditableProps {
  html: string;
  onChange: (html: string) => void;
  className?: string;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  id?: string;
}

const ContentEditable = ({ html, onChange, className, placeholder, onFocus, onBlur, id }: ContentEditableProps) => {
  const elementRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (elementRef.current && elementRef.current.innerHTML !== html) {
      elementRef.current.innerHTML = html;
    }
  }, [html]);
  
  const handleInput = () => {
    if (elementRef.current) {
      onChange(elementRef.current.innerHTML);
    }
  };

  return (
    <div
      id={id}
      ref={elementRef}
      contentEditable
      onInput={handleInput}
      onFocus={onFocus}
      onBlur={onBlur}
      className={`${className} outline-none relative empty:before:content-[attr(data-placeholder)] empty:before:text-slate-400 empty:before:absolute empty:before:pointer-events-none`}
      data-placeholder={placeholder}
    />
  );
};

export default function SubmitArticlePage() {
  const { currentUser, submitPublicArticle, openAuthModal, becomeAuthor, generateAiContent, hasRole } = useCms();

  // Active Workspace Tab: 'compose' | 'preview' | 'track'
  const [activeTab, setActiveTab] = useState<"compose" | "preview" | "track">("compose");

  // Article State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("विचार");
  
  // Author Profile States (Pre-filled from currentUser)
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [authorMobile, setAuthorMobile] = useState("");
  const [authorBio, setAuthorBio] = useState("");
  const [authorExpertise, setAuthorExpertise] = useState("");

  // Block Editor State
  const [blocks, setBlocks] = useState<BlockItem[]>([
    {
      id: "block-1",
      type: "paragraph",
      text: "युवाक्षर रचनाकार डेस्क पर आपका स्वागत है। यहाँ लिखना शुरू करें..."
    }
  ]);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  // statistics calculation
  const calculateStats = () => {
    // Total characters
    const charCount = blocks.reduce((acc, b) => acc + (b.text || "").replace(/<[^>]*>/g, "").length, 0);
    
    // Total words
    const cleanText = blocks.reduce((acc, b) => acc + " " + (b.text || "").replace(/<[^>]*>/g, "").trim(), "");
    const wordList = cleanText.trim() ? cleanText.trim().split(/\s+/) : [];
    const wordCount = wordList.length;

    // Hindi reading speed ~130wpm
    const readTime = Math.max(1, Math.ceil(wordCount / 130));

    // Paras and headings
    const paraCount = blocks.filter(b => b.type === "paragraph").length;
    const headerCount = blocks.filter(b => b.type === "heading").length;

    // Images count
    const imageCount = blocks.reduce((acc, b) => acc + (b.images?.length || 0), 0);

    // Links count inside blocks HTML
    const linkCount = blocks.reduce((acc, b) => {
      const match = (b.text || "").match(/href=/g);
      return acc + (match ? match.length : 0);
    }, 0);

    return {
      words: wordCount,
      chars: charCount,
      time: readTime,
      paragraphs: paraCount,
      headers: headerCount,
      images: imageCount,
      links: linkCount
    };
  };

  // Sync Content Markdown State whenever blocks list changes
  useEffect(() => {
    const md = serializeBlocksToMarkdown(blocks);
    setContent(md);
  }, [blocks]);

  // Sync user profile once logged in
  useEffect(() => {
    if (currentUser) {
      setAuthorName(currentUser.name || "");
      setAuthorEmail(currentUser.email || "");
      setAuthorMobile(currentUser.mobile || "");
      setAuthorBio(currentUser.bio || "");
      setAuthorExpertise(currentUser.badges?.find(b => b !== "Author" && b !== "Primary Owner" && b !== "Verified User") || "अध्येता");
    }
  }, [currentUser]);

  // Image Management States
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [featuredImageId, setFeaturedImageId] = useState<string | null>(null);
  
  // Crop States
  const [croppingBlockId, setCroppingBlockId] = useState<string | null>(null);
  const [croppingImageIdx, setCroppingImageIdx] = useState<number | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropYOffset, setCropYOffset] = useState(0);

  // Compression States
  const [compressingBlockId, setCompressingBlockId] = useState<string | null>(null);
  const [compressingImageIdx, setCompressingImageIdx] = useState<number | null>(null);
  const [compressionQuality, setCompressionQuality] = useState(0.7);
  const [compressedSize, setCompressedSize] = useState(0);
  const [compressedDataUrl, setCompressedDataUrl] = useState("");

  // Camera States
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraTargetBlockId, setCameraTargetBlockId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto Save & History States
  const [autosaveMessage, setAutosaveMessage] = useState("");
  const [draftHistory, setDraftHistory] = useState<DraftVersion[]>([]);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [pendingRestore, setPendingRestore] = useState<DraftVersion | null>(null);

  // Table State Selectors
  const [selectedCell, setSelectCell] = useState<{ r: number; c: number; blockId: string } | null>(null);
  const [mergeStartCell, setMergeStartCell] = useState<{ r: number; c: number; blockId: string } | null>(null);

  // Cloud Import states
  const [showCloudModal, setShowCloudModal] = useState(false);
  const [cloudImportBlockId, setCloudImportBlockId] = useState<string | null>(null);
  const [cloudImportUrl, setCloudImportUrl] = useState("");
  const [cloudImportType, setCloudImportType] = useState<"drive" | "onedrive" | "dropbox">("drive");

  // Streak and Goals
  const [streakDays, setStreakDays] = useState(0);
  const [monthlyWordGoal, setMonthlyWordGoal] = useState(5000);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [tempGoal, setTempGoal] = useState("5000");

  // Quality Assessment Checkbox states
  const [checklist, setChecklist] = useState({
    original: false,
    copyright: false,
    styleGuide: false,
    citations: false
  });

  // Accordion active keys
  const [accordionOpen, setAccordionOpen] = useState<Record<string, boolean>>({
    original: true,
    copyright: false,
    styleGuide: false,
    citations: false
  });

  // Viewport Preview state: 'desktop' | 'tablet' | 'mobile' | 'magazine'
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "tablet" | "mobile" | "magazine">("desktop");

  // AI Assistant States
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [activeAiTool, setActiveAiTool] = useState<string | null>(null);

  // Submissions list (Track tab)
  const [submittedList, setSubmittedList] = useState<SubmittedArticle[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Reader to Author converter popup
  const [showAuthorConversionModal, setShowAuthorConversionModal] = useState(false);
  const [conversionBio, setConversionBio] = useState("");
  const [conversionExpertise, setConversionExpertise] = useState("साहित्य");
  const [conversionAvatarUrl, setConversionAvatarUrl] = useState("");

  // Load drafts and history
  useEffect(() => {
    // Load draft history list
    const history = localStorage.getItem("yuvakshar_draft_history");
    if (history) setDraftHistory(JSON.parse(history));

    // Load dynamic submissions tracking list
    const subs = localStorage.getItem("yuvakshar_submitted_articles");
    if (subs) {
      setSubmittedList(JSON.parse(subs));
    } else {
      const demoSubs: SubmittedArticle[] = [
        { id: "YVK-SUB-782190", date: "2026-06-05", title: "डिजिटल भारत: भविष्य की नई राहें", category: "विशेष लेख", status: "प्रकाशित", timelineStep: 4 },
        { id: "YVK-SUB-108253", date: "2026-06-09", title: "पर्यावरण संकट और युवा पीढ़ी का दायित्व", category: "पर्यावरण", status: "समीक्षा के अधीन", timelineStep: 2 }
      ];
      setSubmittedList(demoSubs);
      localStorage.setItem("yuvakshar_submitted_articles", JSON.stringify(demoSubs));
    }

    // Check for auto-saved draft
    const autosaved = localStorage.getItem("yuvakshar_autosave_draft");
    if (autosaved) {
      try {
        const parsed = JSON.parse(autosaved);
        if (parsed.title || parsed.content) {
          setPendingRestore(parsed);
          setShowRestorePrompt(true);
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Load goals and streaks
    const storedGoal = localStorage.getItem("yuvakshar_word_goal");
    if (storedGoal) {
      setMonthlyWordGoal(parseInt(storedGoal, 10));
      setTempGoal(storedGoal);
    }
    
    // Streaks logic
    const lastWriteStr = localStorage.getItem("yuvakshar_last_write_date");
    const streakStr = localStorage.getItem("yuvakshar_writing_streak");
    let streakVal = streakStr ? parseInt(streakStr, 10) : 0;
    
    const todayStr = new Date().toDateString();
    if (lastWriteStr) {
      if (lastWriteStr === todayStr) {
        // Today already recorded
      } else {
        const lastWriteDate = new Date(lastWriteStr);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        if (lastWriteDate.toDateString() === yesterday.toDateString()) {
          streakVal += 1;
        } else {
          streakVal = 1;
        }
      }
    } else {
      streakVal = 1;
    }
    setStreakDays(streakVal);
    localStorage.setItem("yuvakshar_writing_streak", streakVal.toString());
  }, []);

  // Update last write date when user types something substantial
  useEffect(() => {
    if (title.trim().length > 5 || content.trim().length > 10) {
      const todayStr = new Date().toDateString();
      localStorage.setItem("yuvakshar_last_write_date", todayStr);
    }
  }, [title, content]);

  // 30 seconds Auto-save timer
  useEffect(() => {
    const timer = setInterval(() => {
      if (!title.trim() && !content.trim()) return;
      const draftData = {
        title,
        content,
        category,
        timestamp: new Date().toLocaleTimeString("hi-IN"),
        wordCount: calculateStats().words
      };
      
      // Save current draft
      localStorage.setItem("yuvakshar_autosave_draft", JSON.stringify(draftData));

      // Append to history list (max 10)
      const newVersion: DraftVersion = {
        id: `draft-${Date.now()}`,
        timestamp: new Date().toLocaleString("hi-IN"),
        title,
        content,
        wordCount: draftData.wordCount
      };
      const updatedHistory = [newVersion, ...draftHistory.slice(0, 9)];
      setDraftHistory(updatedHistory);
      localStorage.setItem("yuvakshar_draft_history", JSON.stringify(updatedHistory));

      setAutosaveMessage(`ड्राफ्ट स्वतः सहेजा गया: ${draftData.timestamp}`);
      setTimeout(() => setAutosaveMessage(""), 3000);

    }, 30000);

    return () => clearInterval(timer);
  }, [title, content, category, draftHistory]);

  // Clipboard Paste Intercept inside Editor to capture pasted images
  const handleEditorPaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = () => {
            const newBlock: BlockItem = {
              id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              type: "media",
              mediaType: "image",
              images: [{
                url: reader.result as string,
                caption: file.name,
                credit: "क्लिपबोर्ड पेस्ट",
                width: 100,
                rotation: 0
              }]
            };
            setBlocks(prev => [...prev, newBlock]);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  // Block Controls Actions
  const moveBlockUp = (idx: number) => {
    if (idx === 0) return;
    setBlocks(prev => {
      const list = [...prev];
      const temp = list[idx];
      list[idx] = list[idx - 1];
      list[idx - 1] = temp;
      return list;
    });
  };

  const moveBlockDown = (idx: number) => {
    if (idx === blocks.length - 1) return;
    setBlocks(prev => {
      const list = [...prev];
      const temp = list[idx];
      list[idx] = list[idx + 1];
      list[idx + 1] = temp;
      return list;
    });
  };

  const deleteBlock = (id: string) => {
    if (blocks.length === 1) {
      alert("कम से कम एक ब्लॉक होना अनिवार्य है!");
      return;
    }
    setBlocks(prev => prev.filter(b => b.id !== id));
  };

  const insertBlockBelow = (idx: number, type: BlockItem["type"] = "paragraph") => {
    const newBlock: BlockItem = {
      id: `block-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type,
      text: "",
      level: type === "heading" ? 2 : undefined,
      style: type === "quote" ? "normal" : undefined,
      specialType: type === "special" ? "fact" : undefined,
      listItems: type === "list" || type === "checklist" ? [{ text: "", checked: false, depth: 0 }] : undefined,
      images: type === "media" ? [] : undefined,
      tableData: type === "table" ? [["पंक्ति १ सेल १", "पंक्ति १ सेल २"], ["पंक्ति २ सेल १", "पंक्ति २ सेल २"]] : undefined
    };
    setBlocks(prev => {
      const list = [...prev];
      list.splice(idx + 1, 0, newBlock);
      return list;
    });
  };

  const changeBlockType = (id: string, type: BlockItem["type"], extraAttrs: Partial<BlockItem> = {}) => {
    setBlocks(prev => prev?.map(b => {
      if (b.id !== id) return b;
      return {
        ...b,
        type,
        level: type === "heading" ? 2 : undefined,
        style: type === "quote" ? "normal" : undefined,
        specialType: type === "special" ? "fact" : undefined,
        listItems: (type === "list" || type === "checklist") ? [{ text: b.text || "", checked: false, depth: 0 }] : undefined,
        tableData: type === "table" ? [["", ""], ["", ""]] : undefined,
        ...extraAttrs
      };
    }));
  };

  // Block Rich Text formatting
  const applyToolbarStyle = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    if (activeBlockId) {
      const activeEl = document.getElementById(`editor-editable-${activeBlockId}`);
      if (activeEl) {
        handleBlockChange(activeBlockId, activeEl.innerHTML);
      }
    }
  };

  const applyLink = (url: string, isExternal: boolean = true) => {
    if (!url) return;
    let finalHtml = `<a href="${url}"`;
    if (isExternal) {
      finalHtml += ' target="_blank" rel="noopener noreferrer" class="text-primary underline"';
    } else {
      finalHtml += ' class="text-primary underline"';
    }
    finalHtml += `>${window.getSelection()?.toString() || url}</a>`;
    document.execCommand("insertHTML", false, finalHtml);
    if (activeBlockId) {
      const activeEl = document.getElementById(`editor-editable-${activeBlockId}`);
      if (activeEl) {
        handleBlockChange(activeBlockId, activeEl.innerHTML);
      }
    }
  };

  // Block values syncing
  const handleBlockChange = (blockId: string, text: string) => {
    setBlocks(prev => prev?.map(b => b.id === blockId ? { ...b, text } : b));
  };

  // Lists Item handlers
  const handleListKeyDown = (e: React.KeyboardEvent, blockId: string, itemIdx: number) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block || !block.listItems) return;
    
    if (e.key === "Tab") {
      e.preventDefault();
      const items = [...block.listItems];
      if (e.shiftKey) {
        items[itemIdx].depth = Math.max(0, items[itemIdx].depth - 1);
      } else {
        items[itemIdx].depth = Math.min(3, items[itemIdx].depth + 1);
      }
      setBlocks(prev => prev?.map(b => b.id === blockId ? { ...b, listItems: items } : b));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const items = [...block.listItems];
      items.splice(itemIdx + 1, 0, { text: "", checked: false, depth: items[itemIdx].depth });
      setBlocks(prev => prev?.map(b => b.id === blockId ? { ...b, listItems: items } : b));
      setTimeout(() => {
        document.getElementById(`list-input-${blockId}-${itemIdx + 1}`)?.focus();
      }, 50);
    } else if (e.key === "Backspace" && block.listItems[itemIdx].text === "") {
      e.preventDefault();
      const items = [...block.listItems];
      if (items.length === 1) {
        changeBlockType(blockId, "paragraph", { text: "" });
      } else {
        items.splice(itemIdx, 1);
        setBlocks(prev => prev?.map(b => b.id === blockId ? { ...b, listItems: items } : b));
        const prevIdx = Math.max(0, itemIdx - 1);
        setTimeout(() => {
          document.getElementById(`list-input-${blockId}-${prevIdx}`)?.focus();
        }, 50);
      }
    }
  };

  const handleListItemChange = (blockId: string, itemIdx: number, val: string) => {
    setBlocks(prev => prev?.map(b => {
      if (b.id !== blockId || !b.listItems) return b;
      const updated = b.listItems?.map((item, idx) => idx === itemIdx ? { ...item, text: val } : item);
      return { ...b, listItems: updated };
    }));
  };

  const toggleListItemCheck = (blockId: string, itemIdx: number) => {
    setBlocks(prev => prev?.map(b => {
      if (b.id !== blockId || !b.listItems) return b;
      const updated = b.listItems?.map((item, idx) => idx === itemIdx ? { ...item, checked: !item.checked } : item);
      return { ...b, listItems: updated };
    }));
  };

  // Table Handlers
  const handleAddTableRow = (blockId: string) => {
    setBlocks(prev => prev?.map(b => {
      if (b.id !== blockId || !b.tableData) return b;
      const cols = b.tableData[0]?.length || 2;
      return { ...b, tableData: [...b.tableData, Array(cols).fill("")] };
    }));
  };

  const handleAddTableCol = (blockId: string) => {
    setBlocks(prev => prev?.map(b => {
      if (b.id !== blockId || !b.tableData) return b;
      return { ...b, tableData: b.tableData?.map(r => [...r, ""]) };
    }));
  };

  const handleTableCellChange = (blockId: string, r: number, c: number, val: string) => {
    setBlocks(prev => prev?.map(b => {
      if (b.id !== blockId || !b.tableData) return b;
      const updated = b.tableData?.map((row, rIdx) => 
        row?.map((cell, cIdx) => (rIdx === r && cIdx === c) ? val : cell)
      );
      return { ...b, tableData: updated };
    }));
  };

  const handleMergeCells = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block || !block.tableData) return;
    
    if (!mergeStartCell || mergeStartCell.blockId !== blockId || !selectedCell || selectedCell.blockId !== blockId) {
      if (selectedCell) {
        setMergeStartCell(selectedCell);
        alert("मर्ज करने का आरंभिक सेल सेट हुआ। अब अंतिम सेल पर क्लिक करें और पुनः 'सेल मर्ज' दबाएं।");
      } else {
        alert("कृपया पहले एक सेल चुनें।");
      }
      return;
    }
    
    const r1 = Math.min(mergeStartCell.r, selectedCell.r);
    const r2 = Math.max(mergeStartCell.r, selectedCell.r);
    const c1 = Math.min(mergeStartCell.c, selectedCell.c);
    const c2 = Math.max(mergeStartCell.c, selectedCell.c);
    
    if (r1 === r2 && c1 === c2) {
      alert("मर्ज करने के लिए २ अलग-अलग सेल्स होने चाहिए।");
      return;
    }

    const newMerge = { r1, c1, r2, c2 };
    const mergedList = block.mergedCells ? [...block.mergedCells, newMerge] : [newMerge];
    
    let combinedText = "";
    const updatedData = block.tableData?.map((row, rIdx) => 
      row?.map((cell, cIdx) => {
        if (rIdx >= r1 && rIdx <= r2 && cIdx >= c1 && cIdx <= c2) {
          if (cell.replace(/<[^>]*>/g, "").trim()) {
            combinedText += (combinedText ? " " : "") + cell.replace(/<[^>]*>/g, "").trim();
          }
          return "";
        }
        return cell;
      })
    );
    updatedData[r1][c1] = combinedText;

    setBlocks(prev => prev?.map(b => b.id === blockId ? { ...b, tableData: updatedData, mergedCells: mergedList } : b));
    setMergeStartCell(null);
    alert("सेल्स सफलतापूर्वक मर्ज किए गए!");
  };

  // Image Block Management
  const triggerLocalImageBlockUpload = (blockId: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = "image/*";
    input.onchange = (e: any) => {
      const files = e.target.files;
      if (files) handleImageBlockFiles(blockId, files);
    };
    input.click();
  };

  const handleImageBlockFiles = (blockId: string, files: FileList) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const newImg: ImageItem = {
          url: reader.result as string,
          caption: file.name,
          credit: "रचनाकार",
          width: 100,
          rotation: 0
        };
        setBlocks(prev => prev?.map(b => {
          if (b.id !== blockId) return b;
          const current = b.images || [];
          return {
            ...b,
            images: [...current, newImg],
            mediaType: current.length > 0 ? "gallery" : "image"
          };
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOverBlock = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnBlock = (e: React.DragEvent, blockId: string) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageBlockFiles(blockId, files);
    }
  };

  // Image Adjustments
  const rotateBlockImage = (blockId: string, imgIdx: number) => {
    setBlocks(prev => prev?.map(b => {
      if (b.id !== blockId || !b.images) return b;
      const updated = b.images?.map((img, idx) => 
        idx === imgIdx ? { ...img, rotation: ((img.rotation || 0) + 90) % 360 } : img
      );
      return { ...b, images: updated };
    }));
  };

  const resizeBlockImage = (blockId: string, imgIdx: number, width: number) => {
    setBlocks(prev => prev?.map(b => {
      if (b.id !== blockId || !b.images) return b;
      const updated = b.images?.map((img, idx) => 
        idx === imgIdx ? { ...img, width } : img
      );
      return { ...b, images: updated };
    }));
  };

  // Media Block Crop Modals
  const triggerBlockImageCrop = (blockId: string, imgIdx: number) => {
    setCroppingBlockId(blockId);
    setCroppingImageIdx(imgIdx);
    setCropZoom(1);
    setCropYOffset(0);
  };

  const applyBlockCrop = () => {
    if (croppingBlockId === null || croppingImageIdx === null) return;
    const block = blocks.find(b => b.id === croppingBlockId);
    if (!block || !block.images) return;
    const imgObj = block.images[croppingImageIdx];
    
    const canvas = document.createElement("canvas");
    const img = new Image();
    img.src = imgObj.url;
    img.onload = () => {
      canvas.width = 800;
      canvas.height = 450; // 16:9
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const scale = cropZoom;
        const width = img.width * scale;
        const height = img.height * scale;
        const x = (800 - width) / 2;
        const y = ((450 - height) / 2) + cropYOffset;
        
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, 800, 450);
        ctx.drawImage(img, x, y, width, height);
        
        const croppedUrl = canvas.toDataURL("image/jpeg", 0.95);
        setBlocks(prev => prev?.map(b => {
          if (b.id !== croppingBlockId || !b.images) return b;
          const updated = b.images?.map((im, idx) => 
            idx === croppingImageIdx ? { ...im, url: croppedUrl } : im
          );
          return { ...b, images: updated };
        }));
        setCroppingBlockId(null);
        setCroppingImageIdx(null);
        alert("चित्र कतरन (Crop) लागू हुआ!");
      }
    };
  };

  // Media Block Compressions
  const triggerBlockImageCompress = (blockId: string, imgIdx: number) => {
    setCompressingBlockId(blockId);
    setCompressingImageIdx(imgIdx);
    setCompressionQuality(0.7);
    const block = blocks.find(b => b.id === blockId);
    const imgObj = block?.images?.[imgIdx];
    if (imgObj) {
      setCompressedSize(Math.round(imgObj.url.length * 0.75));
      setCompressedDataUrl(imgObj.url);
    }
  };

  const applyBlockCompression = () => {
    if (compressingBlockId === null || compressingImageIdx === null) return;
    const block = blocks.find(b => b.id === compressingBlockId);
    if (!block || !block.images) return;
    const imgObj = block.images[compressingImageIdx];

    const canvas = document.createElement("canvas");
    const img = new Image();
    img.src = imgObj.url;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const compressedUrl = canvas.toDataURL("image/jpeg", compressionQuality);
        const newSize = Math.round(compressedUrl.length * 0.75);
        
        setBlocks(prev => prev?.map(b => {
          if (b.id !== compressingBlockId || !b.images) return b;
          const updated = b.images?.map((im, idx) => 
            idx === compressingImageIdx ? { ...im, url: compressedUrl } : im
          );
          return { ...b, images: updated };
        }));
        setCompressingBlockId(null);
        setCompressingImageIdx(null);
        alert("संपीड़न (Compression) पूर्ण!");
      }
    };
  };

  const previewCompressionRate = () => {
    if (compressingBlockId === null || compressingImageIdx === null) return;
    const block = blocks.find(b => b.id === compressingBlockId);
    const imgObj = block?.images?.[compressingImageIdx];
    if (!imgObj) return;

    const img = new Image();
    img.src = imgObj.url;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const compressedUrl = canvas.toDataURL("image/jpeg", compressionQuality);
        setCompressedSize(Math.round(compressedUrl.length * 0.75));
        setCompressedDataUrl(compressedUrl);
      }
    };
  };

  // Cloud Import Triggers
  const openCloudImport = (blockId: string, type: "drive" | "onedrive" | "dropbox") => {
    setCloudImportBlockId(blockId);
    setCloudImportType(type);
    setCloudImportUrl("");
    setShowCloudModal(true);
  };

  const handleCloudImportSubmit = () => {
    if (!cloudImportUrl.trim() || !cloudImportBlockId) return;
    
    // Process sharing links to direct asset links
    let finalUrl = cloudImportUrl;
    if (cloudImportType === "drive") {
      const match = cloudImportUrl.match(/\/file\/d\/([^\/]+)/) || cloudImportUrl.match(/id=([^\&]+)/);
      if (match) finalUrl = `https://drive.google.com/uc?export=download&id=${match[1]}`;
    } else if (cloudImportType === "dropbox") {
      finalUrl = cloudImportUrl.replace("www.dropbox.com", "dl.dropboxusercontent.com").replace("?dl=0", "?dl=1");
    }

    const newImg: ImageItem = {
      url: finalUrl,
      caption: `क्लाउड लिंक (${cloudImportType})`,
      credit: "रचनाकार",
      width: 100,
      rotation: 0
    };

    setBlocks(prev => prev?.map(b => {
      if (b.id !== cloudImportBlockId) return b;
      const current = b.images || [];
      return {
        ...b,
        images: [...current, newImg],
        mediaType: current.length > 0 ? "gallery" : "image"
      };
    }));

    setShowCloudModal(false);
    setCloudImportBlockId(null);
  };

  // Block Camera Snapshots
  const startBlockCamera = async (blockId: string) => {
    try {
      setCameraTargetBlockId(blockId);
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setCameraStream(stream);
      setTimeout(() => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      }, 100);
    } catch (err) {
      console.error(err);
      alert("कैमरा चालू करने में असमर्थ।");
      setCameraActive(false);
    }
  };

  const captureBlockPhoto = () => {
    if (videoRef.current && cameraTargetBlockId) {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 640, 480);
        const dataUrl = canvas.toDataURL("image/jpeg");
        
        const newImg: ImageItem = {
          url: dataUrl,
          caption: `कैमरा स्नैपशॉट_${Date.now()}.jpg`,
          credit: "सेल्फी",
          width: 100,
          rotation: 0
        };

        setBlocks(prev => prev?.map(b => {
          if (b.id !== cameraTargetBlockId) return b;
          const current = b.images || [];
          return {
            ...b,
            images: [...current, newImg],
            mediaType: current.length > 0 ? "gallery" : "image"
          };
        }));

        stopBlockCamera();
      }
    }
  };

  const stopBlockCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    setCameraStream(null);
    setCameraActive(false);
    setCameraTargetBlockId(null);
  };

  // Video block processor
  const handleVideoUrlChange = (blockId: string, url: string) => {
    let embedUrl = url;
    let type: BlockItem["videoType"] = "embed";
    
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      type = "youtube";
      const match = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
      if (match) embedUrl = `https://www.youtube.com/embed/${match[1]}`;
    } else if (url.includes("vimeo.com")) {
      type = "vimeo";
      const match = url.match(/(?:vimeo\.com\/)\s*(\d+)/);
      if (match) embedUrl = `https://player.vimeo.com/video/${match[1]}`;
    } else if (url.includes("youtube.com/shorts/")) {
      type = "short";
      const match = url.match(/shorts\/([^\/\s\?]+)/);
      if (match) embedUrl = `https://www.youtube.com/embed/${match[1]}`;
    }

    setBlocks(prev => prev?.map(b => b.id === blockId ? { ...b, videoUrl: embedUrl, videoType: type } : b));
  };

  const stats = calculateStats();

  // Score Assessment Scorecard breakdown
  const calculateQualityDetails = () => {
    let readability = 50;
    let structure = 20;
    let headingUsage = 10;
    let paragraphBalance = 10;
    let researchDepth = 0;
    let sourceQuality = 0;
    let formattingQuality = 20;

    if (stats.words > 100) {
      readability = Math.min(100, 50 + Math.floor(stats.words / 20));
    }
    
    if (stats.headers >= 3 && stats.paragraphs >= 5) {
      structure = 100;
    } else if (stats.headers >= 1 && stats.paragraphs >= 2) {
      structure = 70;
    } else {
      structure = 40;
    }
    
    headingUsage = Math.min(100, stats.headers * 25);
    
    if (stats.paragraphs > 0) {
      const avgWordsPerPara = stats.words / stats.paragraphs;
      if (avgWordsPerPara >= 30 && avgWordsPerPara <= 90) {
        paragraphBalance = 100;
      } else {
        paragraphBalance = 60;
      }
    } else {
      paragraphBalance = 0;
    }
    
    const hasReferences = blocks.some(b => b.type === "special" && b.specialType === "reference");
    researchDepth = (stats.links > 0 ? 50 : 0) + (hasReferences ? 50 : 0);
    
    sourceQuality = stats.links > 1 ? 100 : stats.links > 0 ? 60 : 0;
    
    const hasQuotes = blocks.some(b => b.type === "quote");
    const hasLists = blocks.some(b => b.type === "list" || b.type === "checklist");
    const hasTables = blocks.some(b => b.type === "table");
    formattingQuality = 30 + (hasQuotes ? 25 : 0) + (hasLists ? 25 : 0) + (hasTables ? 20 : 0);
    
    const checklistScore = 
      (checklist.original ? 25 : 0) +
      (checklist.copyright ? 25 : 0) +
      (checklist.styleGuide ? 25 : 0) +
      (checklist.citations ? 25 : 0);
      
    const totalScore = Math.round(
      (readability * 0.15) + 
      (structure * 0.15) + 
      (headingUsage * 0.1) + 
      (paragraphBalance * 0.1) + 
      (researchDepth * 0.15) + 
      (sourceQuality * 0.15) + 
      (formattingQuality * 0.1) + 
      (checklistScore * 0.1)
    );
    
    return {
      totalScore: Math.min(100, Math.max(0, totalScore)),
      readability,
      structure,
      headingUsage,
      paragraphBalance,
      researchDepth,
      sourceQuality,
      formattingQuality
    };
  };

  const qualityDetails = calculateQualityDetails();
  const qualityScore = qualityDetails.totalScore;

  // AI Suggestions
  const triggerAiTool = async (tool: string, label: string) => {
    if (!content.trim()) {
      alert("कृपया एआई सहायक के लिए पहले कुछ सामग्री लिखें!");
      return;
    }
    setAiLoading(true);
    setActiveAiTool(tool);
    setAiResult("");

    try {
      const prompt = `लेख शीर्षक: "${title}"\nश्रेणी: ${category}\nसामग्री: ${content}\n\nकृपया लेख के आधार पर निम्नलिखित कार्य करें: ${label}`;
      const responseText = await generateAiContent(prompt, tool);
      setAiResult(responseText);
    } catch (err: any) {
      setAiResult(`त्रुटि: ${err.message || "एआई विश्लेषण विफल हुआ।"}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Restore Draft Action
  const restoreDraft = (version: DraftVersion | { title: string; content: string }) => {
    setTitle(version.title);
    setContent(version.content);
    setBlocks(deserializeMarkdownToBlocks(version.content));
    setShowRestorePrompt(false);
    setPendingRestore(null);
    alert("पिछला ड्राफ्ट पुनर्स्थापित कर दिया गया है!");
  };

  // Article Submit Action
  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      openAuthModal(() => {
        alert("सफलतापूर्वक लॉगिन हुआ! अब आप लेख सबमिट कर सकते हैं।");
      });
      return;
    }

    if (!title.trim() || !content.trim()) {
      alert("कृपया शीर्षक और लेख सामग्री भरें!");
      return;
    }

    setIsSubmitting(true);

    try {
      // Find cover image automatically
      let coverUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80";
      const coverImgObj = images.find(img => img.id === featuredImageId) || images[0];
      if (coverImgObj) {
        coverUrl = coverImgObj.dataUrl;
      } else {
        const mediaBlock = blocks.find(b => b.type === "media" && b.images && b.images.length > 0);
        if (mediaBlock?.images?.[0]) {
          coverUrl = mediaBlock.images[0].url;
        }
      }

      await submitPublicArticle({
        type: "article",
        name: authorName,
        email: authorEmail,
        mobile: authorMobile,
        category,
        title,
        content,
        image_url: coverUrl
      });

      const newSubmission: SubmittedArticle = {
        id: `YVK-SUB-${Math.floor(100000 + Math.random() * 900000)}`,
        date: new Date().toISOString().split("T")[0],
        title,
        category,
        status: "समीक्षा के अधीन",
        timelineStep: 1
      };
      
      const updatedList = [newSubmission, ...submittedList];
      setSubmittedList(updatedList);
      localStorage.setItem("yuvakshar_submitted_articles", JSON.stringify(updatedList));

      // Reset
      setTitle("");
      setBlocks([{ id: "block-1", type: "paragraph", text: "" }]);
      setImages([]);
      setFeaturedImageId(null);
      localStorage.removeItem("yuvakshar_autosave_draft");

      setSubmittedSuccess(true);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error(err);
      alert("लेख सबमिट करने में कोई त्रुटि हुई।");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBecomeAuthorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conversionBio.trim()) {
      alert("कृपया लेखक परिचय दर्ज करें!");
      return;
    }
    await becomeAuthor(conversionBio, conversionAvatarUrl, conversionExpertise);
    setShowAuthorConversionModal(false);
    setConversionBio("");
    setConversionAvatarUrl("");
  };

  const handleSaveGoal = () => {
    const parsed = parseInt(tempGoal, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setMonthlyWordGoal(parsed);
      localStorage.setItem("yuvakshar_word_goal", parsed.toString());
      setShowGoalModal(false);
    }
  };

  // Automatic Checklists
  const isTitlePresent = title.trim().length > 3;
  const isContentLongEnough = stats.words >= 200;
  const isCoverPresent = images.length > 0 || blocks.some(b => b.type === "media" && b.images && b.images.length > 0);
  const isAuthorInfoPresent = authorName.trim().length > 2 && authorBio.trim().length > 5;
  const isFormattingGood = stats.headers >= 2 && stats.paragraphs >= 3;

  // Badge unlock metrics
  const achievementsList = [
    { title: "शब्द साधक", desc: "१००+ शब्द लिखे", icon: "🥇", unlocked: stats.words >= 100 },
    { title: "शताब्दी लेखक", desc: "१०००+ शब्द लिखे", icon: "👑", unlocked: stats.words >= 1000 },
    { title: "नियमित कलम", desc: "३+ लगातार लेखन दिवस", icon: "🔥", unlocked: streakDays >= 3 },
    { title: "दृश्य कथाकार", desc: "लेख में चित्र शामिल किए", icon: "📷", unlocked: isCoverPresent },
    { title: "तथ्य विश्लेषक", desc: "तालिका (Table) का प्रयोग किया", icon: "📊", unlocked: blocks.some(b => b.type === "table") },
    { title: "शोध विशेषज्ञ", desc: "संदर्भ बॉक्स का प्रयोग किया", icon: "🎓", unlocked: blocks.some(b => b.type === "special" && b.specialType === "reference") }
  ];

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 min-h-screen space-y-8 text-[#0F172A] dark:text-slate-200">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h1 className="font-serif text-3xl md:text-4xl text-primary font-bold">
              लेखक सबमिशन एवं रचनाकार डेस्क
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-sans mt-1.5 font-bold">
              Editorial Submission Portal
            </p>
          </div>
        </div>

        <div className="max-w-xl mx-auto text-center space-y-6 bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl py-12">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto">
            <Lock className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-bold text-slate-800 dark:text-white font-hindi">
              कृपया पहले लॉगिन करें
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-serif px-4">
              लेख सबमिट करने, ड्राफ्ट सहेजने और अपनी रचनाओं को ट्रैक करने के लिए लेखक सबमिशन डेस्क पर लॉगिन करना अनिवार्य है।
            </p>
          </div>
          <div className="flex justify-center pt-2">
            <button
              onClick={() => openAuthModal(undefined, "लेख सबमिट करने के लिए कृपया पहले लॉगिन करें।")}
              className="bg-primary hover:bg-primary/95 text-white px-8 py-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              लॉगिन करें
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 min-h-screen space-y-8 text-[#0F172A] dark:text-slate-200">
      
      {/* Header Banner */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <h1 className="font-serif text-3xl md:text-4xl text-primary font-bold">
            लेखक सबमिशन एवं रचनाकार डेस्क
          </h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-sans mt-1.5 font-bold">
            Editorial Submission Portal
          </p>
        </div>

        {currentUser && hasRole("Member") && !hasRole("Author") && !hasRole("Editor") && !hasRole("Admin") && !hasRole("Founder") && !hasRole("Owner") && (
          <button
            onClick={() => setShowAuthorConversionModal(true)}
            className="bg-gradient-to-r from-amber-500 to-primary text-white font-bold py-2.5 px-6 rounded-full text-xs transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center space-x-1.5 animate-pulse"
          >
            <UserCheck className="w-4 h-4" />
            <span>लेखक बनें (Become Author)</span>
          </button>
        )}
      </div>

      {/* Auto Save toast alert */}
      {autosaveMessage && (
        <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))] right-4 lg:bottom-6 lg:right-6 bg-[#0F172A] text-green-400 border border-green-500/30 py-2.5 px-5 rounded-2xl text-xs font-sans shadow-2xl flex items-center space-x-2 z-[45] animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>{autosaveMessage}</span>
        </div>
      )}

      {/* Restore Draft Banner */}
      {showRestorePrompt && pendingRestore && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <p className="font-serif">
              <strong>अपूर्ण ड्राफ्ट मिला:</strong> आपने हाल ही में <strong>"{pendingRestore.title || "बिना शीर्षक का लेख"}"</strong> लिखना शुरू किया था।
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => restoreDraft(pendingRestore)}
              className="bg-primary text-white font-bold px-4 py-2 rounded-xl cursor-pointer"
            >
              हाँ, ड्राफ्ट भरें
            </button>
            <button
              onClick={() => {
                setShowRestorePrompt(false);
                setPendingRestore(null);
                localStorage.removeItem("yuvakshar_autosave_draft");
              }}
              className="border border-slate-200 dark:border-slate-800 text-slate-400 py-2 px-3 rounded-xl hover:text-red-500 cursor-pointer"
            >
              रद्द करें
            </button>
          </div>
        </div>
      )}

      {submittedSuccess ? (
        <div className="max-w-xl mx-auto text-center space-y-6 bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl py-12">
          <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center text-green-500 mx-auto">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <h3 className="font-serif text-2xl font-bold text-slate-800 dark:text-white">
              रचना सफलतापूर्वक सबमिट हो गई है!
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed font-serif px-4">
              आपकी साहित्यिक/वैचारिक रचना समीक्षा के लिए मुख्य संपादक मंडल को सुरक्षित रूप से भेज दी गई है। आप 'ट्रैक करें' टैब में जाकर अपनी सबमिशन की वर्तमान स्थिति जांच सकते हैं।
            </p>
          </div>
          <div className="flex space-x-3 justify-center pt-2">
            <button
              onClick={() => setSubmittedSuccess(false)}
              className="bg-primary hover:bg-primary/95 text-white px-6 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md"
            >
              एक और लेख लिखें
            </button>
            <button
              onClick={() => {
                setSubmittedSuccess(false);
                setActiveTab("track");
              }}
              className="border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-primary px-6 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              स्थिति ट्रैक करें
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* Main Dashboard Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 justify-start space-x-2 pb-px text-xs font-bold font-serif">
            <button
              onClick={() => setActiveTab("compose")}
              className={`pb-3 px-4 transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 ${
                activeTab === "compose"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <PenTool className="w-4 h-4" />
              <span>१. लेख लिखें (Compose)</span>
            </button>
            <button
              onClick={() => setActiveTab("preview")}
              className={`pb-3 px-4 transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 ${
                activeTab === "preview"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>२. लाइव प्रीव्यू (Preview)</span>
            </button>
            <button
              onClick={() => setActiveTab("track")}
              className={`pb-3 px-4 transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 ${
                activeTab === "track"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>३. सबमिशन ट्रैक करें (Track)</span>
            </button>
          </div>

          {/* TAB 1: COMPOSE WORKSPACE */}
          {activeTab === "compose" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Write Form (Col 8 / Left Side 70%) */}
              <div className="lg:col-span-8 space-y-6">
                
                <GlassCard glow="gold" className="space-y-4">
                  <h3 className="font-serif text-sm font-bold text-primary border-b border-slate-200 dark:border-slate-800 pb-2">
                    लेख शीर्षक एवं श्रेणी
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-slate-500 font-medium text-[10px]">लेख का शीर्षक (Title)</label>
                      <input
                        type="text"
                        placeholder="अपने लेख का आकर्षक शीर्षक लिखें..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 text-xs font-serif font-bold"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500 font-medium text-[10px]">श्रेणी चुनें (Category)</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 text-xs font-serif"
                      >
                        <option value="समाचार">समाचार</option>
                        <option value="विशेष लेख">विशेष लेख</option>
                        <option value="विचार">विचार</option>
                        <option value="साहित्य">साहित्य</option>
                        <option value="साक्षात्कार">साक्षात्कार</option>
                        <option value="शिक्षा">शिक्षा</option>
                        <option value="पर्यावरण">पर्यावरण</option>
                        <option value="इतिहास">इतिहास</option>
                      </select>
                    </div>
                  </div>
                </GlassCard>

                {/* WRITING EDITOR WORKSPACE */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-950/40 p-4 shadow-xl space-y-4">
                  
                  {/* Rich Text Editor Formatting Toolbar */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 sticky top-0 z-30">
                    
                    {/* Inline formats */}
                    <button
                      type="button" onClick={() => applyToolbarStyle("bold")}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                      title="Bold"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button" onClick={() => applyToolbarStyle("italic")}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                      title="Italic"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button" onClick={() => applyToolbarStyle("underline")}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                      title="Underline"
                    >
                      <Underline className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button" onClick={() => applyToolbarStyle("strikeThrough")}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                      title="Strikethrough"
                    >
                      <Strikethrough className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-px h-5 bg-slate-200 dark:bg-slate-850 mx-1" />

                    {/* Colors & Highlights */}
                    <button
                      type="button" onClick={() => {
                        const col = prompt("टेक्स्ट का रंग (Color Hex, e.g., #EA580C) दर्ज करें:", "#EA580C");
                        if (col) applyToolbarStyle("foreColor", col);
                      }}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer flex items-center space-x-1"
                      title="Text Color"
                    >
                      <Paintbrush className="w-3.5 h-3.5 text-primary" />
                      <span className="text-[8px] font-bold">रंग</span>
                    </button>
                    
                    <button
                      type="button" onClick={() => {
                        const col = prompt("बैकग्राउंड का रंग (Color Hex, e.g., #FEF08A) दर्ज करें:", "#FEF08A");
                        if (col) applyToolbarStyle("backColor", col);
                      }}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer flex items-center space-x-1"
                      title="Background Color"
                    >
                      <Paintbrush className="w-3.5 h-3.5 text-yellow-500" />
                      <span className="text-[8px] font-bold">पृष्ठभूमि</span>
                    </button>

                    <button
                      type="button" onClick={() => applyToolbarStyle("removeFormat")}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-red-500 transition-all cursor-pointer"
                      title="Clear Formatting"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-px h-5 bg-slate-200 dark:bg-slate-850 mx-1" />

                    {/* Alignments */}
                    <button
                      type="button" onClick={() => {
                        if (activeBlockId) {
                          setBlocks(prev => prev?.map(b => b.id === activeBlockId ? { ...b, align: "left" } : b));
                        }
                      }}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button" onClick={() => {
                        if (activeBlockId) {
                          setBlocks(prev => prev?.map(b => b.id === activeBlockId ? { ...b, align: "center" } : b));
                        }
                      }}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button" onClick={() => {
                        if (activeBlockId) {
                          setBlocks(prev => prev?.map(b => b.id === activeBlockId ? { ...b, align: "right" } : b));
                        }
                      }}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                    >
                      <AlignRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button" onClick={() => {
                        if (activeBlockId) {
                          setBlocks(prev => prev?.map(b => b.id === activeBlockId ? { ...b, align: "justify" } : b));
                        }
                      }}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer"
                    >
                      <AlignJustify className="w-3.5 h-3.5" />
                    </button>

                    <div className="w-px h-5 bg-slate-200 dark:bg-slate-850 mx-1" />

                    {/* Links */}
                    <button
                      type="button" onClick={() => {
                        const url = prompt("लिंक का URL दर्ज करें:", "https://");
                        if (url) {
                          const ext = confirm("क्या इस लिंक को नए टैब में खोलना चाहते हैं?");
                          applyLink(url, ext);
                        }
                      }}
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300 transition-all cursor-pointer flex items-center space-x-1"
                      title="Insert Link"
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span className="text-[8px] font-bold">लिंक</span>
                    </button>
                  </div>

                  {/* Block Editor Canvas */}
                  <div 
                    onPaste={handleEditorPaste}
                    className="min-h-[400px] border border-slate-100 dark:border-slate-900 rounded-2xl p-4 bg-slate-50/30 dark:bg-[#070b14]/30 space-y-4"
                  >
                    {blocks?.map((block, idx) => {
                      const blockAlignClass = 
                        block.align === "center" ? "text-center" : 
                        block.align === "right" ? "text-right" : 
                        block.align === "justify" ? "text-justify" : "text-left";
                        
                      const isActive = activeBlockId === block.id;

                      return (
                        <div 
                          key={block.id} 
                          className={`relative group border border-transparent rounded-2xl transition-all ${
                            isActive ? "border-primary/20 bg-primary/5 dark:bg-primary/5 p-2" : "hover:border-slate-200 dark:hover:border-slate-800/80 p-2"
                          }`}
                        >
                          
                          {/* Block Action Controls Drawer */}
                          <div className="absolute -left-3 top-2.5 flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-all bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 py-0.5 px-1 rounded-full shadow-lg z-20">
                            <button
                              type="button" onClick={() => moveBlockUp(idx)}
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all cursor-pointer"
                              title="ऊपर ले जाएँ"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button" onClick={() => moveBlockDown(idx)}
                              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-all cursor-pointer"
                              title="नीचे ले जाएँ"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                            <button
                              type="button" onClick={() => deleteBlock(block.id)}
                              className="p-1 text-slate-400 hover:text-red-500 transition-all cursor-pointer"
                              title="हटाएं"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                            
                            {/* Block Type Transform Dropdown */}
                            <select
                              value={block.type}
                              onChange={(e) => changeBlockType(block.id, e.target.value as any)}
                              className="text-[9px] bg-slate-50 dark:bg-slate-900 border-none rounded p-0.5 font-bold cursor-pointer text-primary"
                            >
                              <option value="paragraph">पैराग्राफ</option>
                              <option value="heading">शीर्षक H2</option>
                              <option value="list">सूचि (Bullet)</option>
                              <option value="checklist">चेकलिस्ट</option>
                              <option value="quote">उद्धरण (Quote)</option>
                              <option value="media">चित्र / गैलरी</option>
                              <option value="video">वीडियो</option>
                              <option value="table">तालिका (Table)</option>
                              <option value="special">विशेष बॉक्स</option>
                            </select>

                            <button
                              type="button" onClick={() => insertBlockBelow(idx)}
                              className="p-1 text-slate-400 hover:text-primary transition-all cursor-pointer"
                              title="नया ब्लॉक नीचे जोड़ें"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          {/* RENDERING SPECIFIC BLOCK EDITORS */}
                          {block.type === "paragraph" && (
                            <ContentEditable
                              id={`editor-editable-${block.id}`}
                              html={block.text || ""}
                              onChange={(html) => handleBlockChange(block.id, html)}
                              onFocus={() => setActiveBlockId(block.id)}
                              className={`w-full text-slate-700 dark:text-slate-350 text-xs font-serif leading-relaxed min-h-[20px] ${blockAlignClass}`}
                              placeholder="यहाँ महत्वपूर्ण वैचारिक विचार लिखना शुरू करें..."
                            />
                          )}

                          {block.type === "heading" && (
                            <div className="flex items-center space-x-2">
                              <select
                                value={block.level || 2}
                                onChange={(e) => setBlocks(prev => prev?.map(b => b.id === block.id ? { ...b, level: parseInt(e.target.value, 10) as any } : b))}
                                className="text-[9px] bg-slate-100 dark:bg-slate-900 text-slate-500 rounded p-1 cursor-pointer font-bold shrink-0 border border-slate-200 dark:border-slate-800"
                              >
                                <option value="1">H1</option>
                                <option value="2">H2</option>
                                <option value="3">H3</option>
                                <option value="4">H4</option>
                                <option value="5">H5</option>
                              </select>
                              <ContentEditable
                                id={`editor-editable-${block.id}`}
                                html={block.text || ""}
                                onChange={(html) => handleBlockChange(block.id, html)}
                                onFocus={() => setActiveBlockId(block.id)}
                                className={`w-full font-serif font-bold text-primary min-h-[24px] ${blockAlignClass} ${
                                  block.level === 1 ? "text-xl" : block.level === 2 ? "text-lg" : block.level === 3 ? "text-base" : block.level === 4 ? "text-sm" : "text-xs"
                                }`}
                                placeholder="शीर्षक लिखें..."
                              />
                            </div>
                          )}

                          {block.type === "quote" && (
                            <div className="space-y-2 w-full">
                              <div className="flex space-x-2 text-[8px] font-bold">
                                <button
                                  type="button" onClick={() => setBlocks(prev => prev?.map(b => b.id === block.id ? { ...b, style: "normal" } : b))}
                                  className={`px-1.5 py-0.5 rounded ${block.style === 'normal' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}
                                >
                                  सामान्य कोट
                                </button>
                                <button
                                  type="button" onClick={() => setBlocks(prev => prev?.map(b => b.id === block.id ? { ...b, style: "pull" } : b))}
                                  className={`px-1.5 py-0.5 rounded ${block.style === 'pull' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}
                                >
                                  पुल कोट
                                </button>
                                <button
                                  type="button" onClick={() => setBlocks(prev => prev?.map(b => b.id === block.id ? { ...b, style: "editorial" } : b))}
                                  className={`px-1.5 py-0.5 rounded ${block.style === 'editorial' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}
                                >
                                  संपादकीय कोट
                                </button>
                                <button
                                  type="button" onClick={() => setBlocks(prev => prev?.map(b => b.id === block.id ? { ...b, style: "highlight" } : b))}
                                  className={`px-1.5 py-0.5 rounded ${block.style === 'highlight' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}
                                >
                                  हाइलाइट कोट
                                </button>
                              </div>
                              <div className={`w-full pl-4 border-l-4 py-2 ${
                                block.style === 'pull' ? 'italic font-bold text-base text-primary border-primary bg-primary/5 rounded-r-xl' :
                                block.style === 'editorial' ? 'font-serif border-slate-400 text-slate-700 dark:text-slate-350 bg-slate-100/50 dark:bg-slate-900/30' :
                                block.style === 'highlight' ? 'font-sans border-amber-500 text-slate-800 dark:text-white bg-amber-500/10 rounded-r-xl' :
                                'border-slate-300 text-slate-500 dark:text-slate-400 italic'
                              }`}>
                                <ContentEditable
                                  id={`editor-editable-${block.id}`}
                                  html={block.text || ""}
                                  onChange={(html) => handleBlockChange(block.id, html)}
                                  onFocus={() => setActiveBlockId(block.id)}
                                  className={`w-full ${blockAlignClass}`}
                                  placeholder="उद्धरण/कोटेशन लिखें..."
                                />
                              </div>
                            </div>
                          )}

                          {(block.type === "list" || block.type === "checklist") && (
                            <div className="space-y-1.5 w-full">
                              <div className="flex space-x-2 text-[8px] font-bold">
                                <button
                                  type="button" onClick={() => setBlocks(prev => prev?.map(b => b.id === block.id ? { ...b, listType: "bullet", type: "list" } : b))}
                                  className={`px-1.5 py-0.5 rounded ${block.type === 'list' && block.listType !== 'ordered' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}
                                >
                                  बुलेट सूचि
                                </button>
                                <button
                                  type="button" onClick={() => setBlocks(prev => prev?.map(b => b.id === block.id ? { ...b, listType: "ordered", type: "list" } : b))}
                                  className={`px-1.5 py-0.5 rounded ${block.type === 'list' && block.listType === 'ordered' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}
                                >
                                  क्रमबद्ध सूचि
                                </button>
                                <button
                                  type="button" onClick={() => setBlocks(prev => prev?.map(b => b.id === block.id ? { ...b, type: "checklist" } : b))}
                                  className={`px-1.5 py-0.5 rounded ${block.type === 'checklist' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}
                                >
                                  चेकलिस्ट
                                </button>
                              </div>
                              <div className="space-y-1 pl-4">
                                {block.listItems?.map((item, itemIdx) => {
                                  const indentStyle = { paddingLeft: `${item.depth * 16}px` };
                                  return (
                                    <div 
                                      key={itemIdx} 
                                      style={indentStyle} 
                                      className="flex items-center space-x-2 text-xs font-serif text-slate-700 dark:text-slate-300"
                                    >
                                      {block.type === "checklist" ? (
                                        <input
                                          type="checkbox"
                                          checked={item.checked || false}
                                          onChange={() => toggleListItemCheck(block.id, itemIdx)}
                                          className="w-3.5 h-3.5 text-primary rounded border-slate-350 focus:ring-primary"
                                        />
                                      ) : block.listType === "ordered" ? (
                                        <span className="font-sans font-bold text-slate-400 shrink-0 w-3">{itemIdx + 1}.</span>
                                      ) : (
                                        <span className="text-primary font-sans font-bold shrink-0 w-2">•</span>
                                      )}
                                      
                                      <input
                                        id={`list-input-${block.id}-${itemIdx}`}
                                        type="text"
                                        value={item.text}
                                        onChange={(e) => handleListItemChange(block.id, itemIdx, e.target.value)}
                                        onKeyDown={(e) => handleListKeyDown(e, block.id, itemIdx)}
                                        className="w-full bg-transparent border-none focus:outline-none py-0.5"
                                        placeholder="सूचि का अंश (Tab से इंडेंट करें, Enter से नया जोड़ें)..."
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {block.type === "media" && (
                            <div className="space-y-3 w-full">
                              <div className="flex justify-between items-center text-[10px] font-bold border-b border-slate-100 dark:border-slate-800 pb-2">
                                <span className="text-primary font-serif">चित्र प्रबंधन ब्लॉक</span>
                                <div className="flex space-x-2">
                                  <button
                                    type="button" onClick={() => triggerLocalImageBlockUpload(block.id)}
                                    className="text-slate-500 hover:text-primary transition-all flex items-center space-x-1 cursor-pointer"
                                  >
                                    <Upload className="w-3 h-3" />
                                    <span>अपलोड</span>
                                  </button>
                                  <button
                                    type="button" onClick={() => startBlockCamera(block.id)}
                                    className="text-slate-500 hover:text-primary transition-all flex items-center space-x-1 cursor-pointer"
                                  >
                                    <Camera className="w-3 h-3" />
                                    <span>कैमरा</span>
                                  </button>
                                  <button
                                    type="button" onClick={() => {
                                      const u = prompt("इमेज का डायरेक्ट URL दर्ज करें:");
                                      if (u) {
                                        const newImg: ImageItem = { url: u, caption: "वेब चित्र", credit: "इंटरनेट", width: 100, rotation: 0 };
                                        setBlocks(prev => prev?.map(b => b.id === block.id ? { ...b, images: [...(b.images || []), newImg], mediaType: (b.images || []).length > 0 ? "gallery" : "image" } : b));
                                      }
                                    }}
                                    className="text-slate-500 hover:text-primary transition-all flex items-center space-x-1 cursor-pointer"
                                  >
                                    <LinkIcon className="w-3 h-3" />
                                    <span>URL लिंक</span>
                                  </button>
                                  <button
                                    type="button" onClick={() => openCloudImport(block.id, "drive")}
                                    className="text-[#34A853] hover:underline transition-all cursor-pointer text-[9px]"
                                  >
                                    Google Drive
                                  </button>
                                  <button
                                    type="button" onClick={() => openCloudImport(block.id, "dropbox")}
                                    className="text-[#0061FE] hover:underline transition-all cursor-pointer text-[9px]"
                                  >
                                    Dropbox
                                  </button>
                                </div>
                              </div>

                              {/* Block Dropzone */}
                              <div
                                onDragOver={handleDragOverBlock}
                                onDrop={(e) => handleDropOnBlock(e, block.id)}
                                className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center hover:bg-slate-50/20 dark:hover:bg-slate-900/10 transition-all cursor-pointer"
                                onClick={() => {
                                  if (!block.images || block.images.length === 0) {
                                    triggerLocalImageBlockUpload(block.id);
                                  }
                                }}
                              >
                                {(!block.images || block.images.length === 0) ? (
                                  <div className="space-y-1 text-slate-400">
                                    <ImageIcon className="w-6 h-6 mx-auto" />
                                    <p className="text-[10px]">यहाँ इमेज ड्रैग करें या क्लिक करके अपलोड करें</p>
                                  </div>
                                ) : (
                                  <div className={block.mediaType === "gallery" ? "grid grid-cols-2 sm:grid-cols-3 gap-4" : "flex justify-center"}>
                                    {block.images?.map((img, imgIdx) => (
                                      <div 
                                        key={imgIdx} 
                                        className="relative group/img border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden p-1 bg-white dark:bg-slate-900"
                                        style={{ width: block.mediaType === "image" ? `${img.width || 100}%` : "100%" }}
                                      >
                                        <img 
                                          src={img.url} 
                                          alt={img.caption} 
                                          className="w-full h-40 object-cover rounded-lg transition-transform"
                                          style={{ transform: `rotate(${img.rotation || 0}deg)` }}
                                        />
                                        
                                        {/* Image Management Actions Bar */}
                                        <div className="absolute inset-x-0 bottom-0 bg-slate-950/90 py-1.5 px-2 flex justify-between items-center text-[9px] opacity-0 group-hover/img:opacity-100 transition-opacity">
                                          <button
                                            type="button" onClick={() => triggerBlockImageCrop(block.id, imgIdx)}
                                            className="text-white hover:text-primary transition-all flex items-center space-x-0.5 cursor-pointer"
                                          >
                                            <Scissors className="w-3 h-3" />
                                            <span>क्रॉप</span>
                                          </button>
                                          
                                          <button
                                            type="button" onClick={() => triggerBlockImageCompress(block.id, imgIdx)}
                                            className="text-white hover:text-primary transition-all flex items-center space-x-0.5 cursor-pointer"
                                          >
                                            <RotateCw className="w-3 h-3" />
                                            <span>संपीड़न</span>
                                          </button>

                                          <button
                                            type="button" onClick={() => rotateBlockImage(block.id, imgIdx)}
                                            className="text-white hover:text-primary transition-all flex items-center space-x-0.5 cursor-pointer"
                                          >
                                            <RotateCw className="w-3 h-3" />
                                            <span>घुमाएँ</span>
                                          </button>

                                          <button
                                            type="button" onClick={() => {
                                              const w = prompt("इमेज चौड़ाई % दर्ज करें (25 से 100):", String(img.width || 100));
                                              if (w) resizeBlockImage(block.id, imgIdx, parseInt(w, 10));
                                            }}
                                            className="text-white hover:text-primary transition-all flex items-center space-x-0.5 cursor-pointer"
                                          >
                                            <span>आकार</span>
                                          </button>
                                          
                                          <button
                                            type="button" onClick={() => {
                                              setBlocks(prev => prev?.map(b => {
                                                if (b.id !== block.id || !b.images) return b;
                                                const filtered = b.images.filter((_, idx) => idx !== imgIdx);
                                                return { ...b, images: filtered, mediaType: filtered.length > 1 ? "gallery" : "image" };
                                              }));
                                            }}
                                            className="text-red-500 hover:text-red-650 transition-all cursor-pointer"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        </div>

                                        {/* Image Caption & Credit Inputs */}
                                        <div className="p-2 space-y-1">
                                          <input
                                            type="text"
                                            value={img.caption || ""}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              setBlocks(prev => prev?.map(b => {
                                                if (b.id !== block.id || !b.images) return b;
                                                const updated = b.images?.map((im, idx) => idx === imgIdx ? { ...im, caption: val } : im);
                                                return { ...b, images: updated };
                                              }));
                                            }}
                                            className="w-full bg-transparent border-b border-transparent focus:border-slate-350 text-[10px] text-slate-700 dark:text-slate-200 text-center focus:outline-none"
                                            placeholder="चित्र का शीर्षक (Caption) दर्ज करें..."
                                          />
                                          <input
                                            type="text"
                                            value={img.credit || ""}
                                            onChange={(e) => {
                                              const val = e.target.value;
                                              setBlocks(prev => prev?.map(b => {
                                                if (b.id !== block.id || !b.images) return b;
                                                const updated = b.images?.map((im, idx) => idx === imgIdx ? { ...im, credit: val } : im);
                                                return { ...b, images: updated };
                                              }));
                                            }}
                                            className="w-full bg-transparent border-b border-transparent focus:border-slate-350 text-[8px] text-slate-400 text-center focus:outline-none"
                                            placeholder="चित्र सौजन्य (Credit) दर्ज करें..."
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {block.type === "video" && (
                            <div className="space-y-3 w-full">
                              <div className="flex justify-between items-center text-[10px] font-bold border-b border-slate-100 dark:border-slate-800 pb-2">
                                <span className="text-primary font-serif">वीडियो ब्लॉक (Video Link Embed)</span>
                              </div>
                              <input
                                type="text"
                                placeholder="YouTube, Vimeo या डायरेक्ट एम्बेड लिंक डालें..."
                                value={block.videoUrl || ""}
                                onChange={(e) => handleVideoUrlChange(block.id, e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 focus:outline-none text-[10px] font-sans"
                              />
                              {block.videoUrl && (
                                <div className="relative overflow-hidden w-full aspect-video rounded-xl border border-slate-200 dark:border-slate-800 bg-black">
                                  <iframe
                                    src={block.videoUrl}
                                    className="absolute inset-0 w-full h-full"
                                    allowFullScreen
                                    frameBorder="0"
                                  />
                                </div>
                              )}
                            </div>
                          )}

                          {block.type === "table" && (
                            <div className="space-y-3 w-full">
                              <div className="flex justify-between items-center text-[10px] font-bold border-b border-slate-100 dark:border-slate-800 pb-2">
                                <span className="text-primary font-serif">इंटरैक्टिव तालिका (Table Block)</span>
                                <div className="flex space-x-2">
                                  <button
                                    type="button" onClick={() => handleAddTableRow(block.id)}
                                    className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded border border-slate-300 dark:border-slate-800 transition-all cursor-pointer"
                                  >
                                    + पंक्ति (Row)
                                  </button>
                                  <button
                                    type="button" onClick={() => handleAddTableCol(block.id)}
                                    className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 rounded border border-slate-300 dark:border-slate-800 transition-all cursor-pointer"
                                  >
                                    + स्तंभ (Column)
                                  </button>
                                  <button
                                    type="button" onClick={() => handleMergeCells(block.id)}
                                    className="px-2 py-0.5 bg-[#EA580C]/10 text-primary border border-primary/20 hover:bg-primary/20 rounded transition-all cursor-pointer"
                                  >
                                    सेल्स मर्ज करें (Merge)
                                  </button>
                                </div>
                              </div>
                              <div className="overflow-x-auto p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                                <table className="min-w-full border-collapse border border-slate-200 dark:border-slate-800">
                                  <tbody>
                                    {block.tableData?.map((row, rIdx) => (
                                      <tr key={rIdx}>
                                        {row?.map((cellText, cIdx) => {
                                          const merge = block.mergedCells?.find(
                                            m => rIdx >= m.r1 && rIdx <= m.r2 && cIdx >= m.c1 && cIdx <= m.c2
                                          );
                                          
                                          if (merge) {
                                            if (rIdx === merge.r1 && cIdx === merge.c1) {
                                              const rowSpan = merge.r2 - merge.r1 + 1;
                                              const colSpan = merge.c2 - merge.c1 + 1;
                                              return (
                                                <td
                                                  key={cIdx}
                                                  rowSpan={rowSpan}
                                                  colSpan={colSpan}
                                                  className="border border-slate-250 dark:border-slate-850 p-2 min-w-[90px] bg-primary/5 text-xs text-slate-700 dark:text-slate-300"
                                                >
                                                  <ContentEditable
                                                    html={cellText}
                                                    onChange={(val) => handleTableCellChange(block.id, rIdx, cIdx, val)}
                                                    onFocus={() => {
                                                      setActiveBlockId(block.id);
                                                      setSelectCell({ r: rIdx, c: cIdx, blockId: block.id });
                                                    }}
                                                    className="w-full min-h-[16px] focus:outline-none"
                                                  />
                                                </td>
                                              );
                                            }
                                            return null;
                                          }
                                          
                                          const isSelected = selectedCell && selectedCell.r === rIdx && selectedCell.c === cIdx && selectedCell.blockId === block.id;
                                          return (
                                            <td
                                              key={cIdx}
                                              className={`border border-slate-250 dark:border-slate-850 p-2 min-w-[90px] text-xs text-slate-700 dark:text-slate-300 ${
                                                isSelected ? "bg-primary/10 border-primary" : ""
                                              }`}
                                            >
                                              <ContentEditable
                                                html={cellText}
                                                onChange={(val) => handleTableCellChange(block.id, rIdx, cIdx, val)}
                                                onFocus={() => {
                                                  setActiveBlockId(block.id);
                                                  setSelectCell({ r: rIdx, c: cIdx, blockId: block.id });
                                                }}
                                                className="w-full min-h-[16px] focus:outline-none"
                                              />
                                            </td>
                                          );
                                        })}
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {block.type === "special" && (
                            <div className="space-y-3 w-full">
                              <div className="flex space-x-2 text-[8px] font-bold">
                                {["fact", "didyouknow", "editorial_note", "author_note", "warning", "reference"]?.map((spec) => {
                                  const labelMap: Record<string, string> = {
                                    fact: "तथ्य", didyouknow: "क्या जानते हैं?", editorial_note: "संपादकीय",
                                    author_note: "लेखक टिप्पणी", warning: "चेतावनी", reference: "संदर्भ"
                                  };
                                  return (
                                    <button
                                      key={spec} type="button" 
                                      onClick={() => setBlocks(prev => prev?.map(b => b.id === block.id ? { ...b, specialType: spec as any } : b))}
                                      className={`px-1.5 py-0.5 rounded ${block.specialType === spec ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-400'}`}
                                    >
                                      {labelMap[spec]}
                                    </button>
                                  );
                                })}
                              </div>
                              <div className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-2 ${
                                block.specialType === 'fact' ? 'bg-amber-550/5 border-amber-500/20 text-slate-850 dark:text-slate-200' :
                                block.specialType === 'didyouknow' ? 'bg-emerald-550/5 border-emerald-500/20 text-slate-850 dark:text-slate-200' :
                                block.specialType === 'editorial_note' ? 'bg-violet-555/5 border-violet-500/20 text-slate-850 dark:text-slate-200' :
                                block.specialType === 'author_note' ? 'bg-blue-555/5 border-blue-500/20 text-slate-850 dark:text-slate-200' :
                                block.specialType === 'warning' ? 'bg-rose-555/5 border-rose-500/20 text-red-800 dark:text-red-200' :
                                'bg-slate-500/5 border-slate-500/20 text-slate-800 dark:text-slate-250'
                              }`}>
                                <div className="font-bold flex items-center space-x-1.5 uppercase tracking-wider text-[10px] text-primary">
                                  {block.specialType === 'warning' && <AlertTriangle className="w-3.5 h-3.5" />}
                                  {block.specialType === 'didyouknow' && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                                  <span>
                                    {block.specialType === 'fact' ? "महत्वपूर्ण तथ्य" :
                                     block.specialType === 'didyouknow' ? "क्या आप जानते हैं?" :
                                     block.specialType === 'editorial_note' ? "संपादकीय टिप्पणी" :
                                     block.specialType === 'author_note' ? "लेखक टिप्पणी" :
                                     block.specialType === 'warning' ? "चेतावनी बॉक्स" : "संदर्भ बॉक्स"}
                                  </span>
                                </div>
                                <ContentEditable
                                  id={`editor-editable-${block.id}`}
                                  html={block.text || ""}
                                  onChange={(html) => handleBlockChange(block.id, html)}
                                  onFocus={() => setActiveBlockId(block.id)}
                                  className="w-full text-slate-700 dark:text-slate-300 font-serif leading-relaxed"
                                  placeholder="विषयवस्तु यहाँ दर्ज करें..."
                                />
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Submissions form triggers */}
                <button
                  type="button"
                  onClick={handlePublishSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/95 text-white py-3.5 rounded-xl text-xs font-bold transition-all shadow-[0_4px_12px_rgba(234,88,12,0.3)] flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "सबमिट किया जा रहा है..." : "रचना संपादकीय समीक्षा के लिए भेजें"}</span>
                </button>
              </div>

              {/* Sidebar Info/AI (Col 4 / Right Side 30%) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Writing Statistics widget */}
                <GlassCard glow="none" className="space-y-4">
                  <h3 className="font-serif text-sm font-bold text-primary border-b border-slate-200 dark:border-slate-800 pb-2">
                    लेखन सांख्यिकी (Statistics)
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-center font-sans text-xs">
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <span className="block text-[9px] text-slate-450">कुल शब्द</span>
                      <strong className="text-sm font-bold font-mono text-primary">{stats.words}</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <span className="block text-[9px] text-slate-450">कुल अक्षर</span>
                      <strong className="text-sm font-bold font-mono text-slate-700 dark:text-slate-200">{stats.chars}</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <span className="block text-[9px] text-slate-450">पढ़ने का समय</span>
                      <strong className="text-sm font-bold font-mono text-slate-700 dark:text-slate-200">{stats.time} मि.</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <span className="block text-[9px] text-slate-450">पैराग्राफ</span>
                      <strong className="text-sm font-bold font-mono text-slate-700 dark:text-slate-200">{stats.paragraphs}</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <span className="block text-[9px] text-slate-450">हेडिंग्स</span>
                      <strong className="text-sm font-bold font-mono text-slate-700 dark:text-slate-200">{stats.headers}</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <span className="block text-[9px] text-slate-450">चित्र / दीर्घाएँ</span>
                      <strong className="text-sm font-bold font-mono text-slate-700 dark:text-slate-200">{stats.images}</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 col-span-2">
                      <span className="block text-[9px] text-slate-450">संदर्भित लिंक्स (Links)</span>
                      <strong className="text-sm font-bold font-mono text-slate-700 dark:text-slate-200">{stats.links}</strong>
                    </div>
                  </div>
                </GlassCard>

                {/* Quality Score Visual Meter */}
                <GlassCard glow="gold" className="space-y-4">
                  <h3 className="font-serif text-sm font-bold text-primary border-b border-slate-200 dark:border-slate-800 pb-2 flex justify-between items-center">
                    <span>गुणवत्ता मीटर (Quality Index)</span>
                    <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary font-bold px-1.5 py-0.5 rounded">
                      {qualityScore}/100 Score
                    </span>
                  </h3>
                  
                  <div className="flex flex-col items-center py-2 space-y-4">
                    <div className="relative w-24 h-24">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="48" cy="48" r="40" strokeWidth="6" stroke="rgba(234, 88, 12, 0.1)" fill="transparent" />
                        <circle
                          cx="48" cy="48" r="40" strokeWidth="6" stroke="#EA580C" fill="transparent"
                          strokeDasharray="251.2"
                          strokeDashoffset={251.2 * (1 - qualityScore / 100)}
                          className="transition-all duration-500 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center font-sans">
                        <span className="text-xl font-black text-slate-850 dark:text-white">{qualityScore}</span>
                        <span className="text-[7px] text-slate-400 font-bold uppercase tracking-wider">Index</span>
                      </div>
                    </div>

                    {/* Breakdown metrics */}
                    <div className="w-full space-y-1.5 text-[10px] font-serif">
                      <div className="flex justify-between">
                        <span className="text-slate-500">पठनीयता (Readability):</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{qualityDetails.readability}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">संरचना (Structure):</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{qualityDetails.structure}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">शीर्षक उपयोग (Heading Density):</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{qualityDetails.headingUsage}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">पैराग्राफ संतुलन (Paragraph Balance):</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{qualityDetails.paragraphBalance}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">अनुसंधान गहराई (Research Depth):</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{qualityDetails.researchDepth}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">स्रोत गुणवत्ता (Source Quality):</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{qualityDetails.sourceQuality}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">फ़ॉर्मेटिंग गुणवत्ता (Formatting):</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{qualityDetails.formattingQuality}%</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* Creative features (Badges & Goals) */}
                <GlassCard glow="gold" className="space-y-4">
                  <h3 className="font-serif text-sm font-bold text-primary border-b border-slate-200 dark:border-slate-800 pb-2 flex justify-between items-center">
                    <span>🏆 लेखन उपलब्धियाँ एवं लक्ष्य</span>
                    <button 
                      type="button" onClick={() => setShowGoalModal(true)}
                      className="text-[9px] text-primary hover:underline cursor-pointer"
                    >
                      लक्ष्य बदलें
                    </button>
                  </h3>
                  
                  {/* Streak & Goal progress bar */}
                  <div className="space-y-3 font-serif text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center space-x-1">
                        <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
                        <span>लगातार लेखन दिवस:</span>
                      </span>
                      <strong className="font-sans font-bold text-sm text-orange-500">{streakDays} दिन</strong>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>मासिक शब्द लक्ष्य प्रगति:</span>
                        <span>{stats.words} / {monthlyWordGoal} शब्द</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-200/50 dark:border-slate-850">
                        <div 
                          className="bg-gradient-to-r from-orange-500 to-amber-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (stats.words / monthlyWordGoal) * 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Locked/Unlocked badge list */}
                    <div className="border-t border-slate-100 dark:border-slate-850 pt-2.5">
                      <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-2">अनलॉक किए गए मेडल</p>
                      <div className="grid grid-cols-3 gap-2 text-center text-[9px] font-sans">
                        {achievementsList?.map((badge, bIdx) => (
                          <div 
                            key={bIdx} 
                            className={`p-1.5 rounded-xl border flex flex-col items-center justify-center space-y-1 ${
                              badge.unlocked 
                                ? "bg-amber-500/10 border-amber-500/20 text-slate-800 dark:text-white" 
                                : "bg-slate-100/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 opacity-40"
                            }`}
                            title={badge.desc}
                          >
                            <span className="text-lg">{badge.unlocked ? badge.icon : "🔒"}</span>
                            <span className="font-bold font-serif leading-none truncate max-w-full">{badge.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between text-[10px] border-t border-slate-100 dark:border-slate-850 pt-2.5">
                      <span className="text-slate-400">प्रकाशन कुल गणना:</span>
                      <strong className="text-primary">{submittedList.filter(s => s.status === "प्रकाशित").length} लेख</strong>
                    </div>
                  </div>
                </GlassCard>

                {/* AI WRITING ASSISTANT */}
                <GlassCard glow="blue" className="space-y-4">
                  <h3 className="font-serif text-sm font-bold text-primary border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>एआई लेखन सहायक (AI Assistant)</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-2 text-[9px] font-bold">
                    <button
                      type="button"
                      onClick={() => triggerAiTool("suggest_titles", "शीर्षक प्रयोगशाला के १० सबसे आकर्षक शीर्षक सुझाएँ।")}
                      className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/40 rounded-xl transition-all cursor-pointer text-left"
                    >
                      💡 शीर्षक सुझाएँ
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerAiTool("summary", "इस लेख का १ पैराग्राफ में सारांश तैयार करें।")}
                      className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/40 rounded-xl transition-all cursor-pointer text-left"
                    >
                      📝 सारांश बनाएँ
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerAiTool("grammar", "व्याकरण, वर्तनी और वाक्य रचना संबंधी त्रुटियाँ जांचें।")}
                      className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/40 rounded-xl transition-all cursor-pointer text-left"
                    >
                      ✓ व्याकरण जाँचें
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerAiTool("seo_title", "SEO की दृष्टि से अनुकूल शीर्षक तैयार करें।")}
                      className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/40 rounded-xl transition-all cursor-pointer text-left"
                    >
                      🎯 SEO शीर्षक
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerAiTool("seo_desc", "SEO विवरण और १२० अक्षरों का मेटा-डिस्क्रिप्शन बनाएं।")}
                      className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/40 rounded-xl transition-all cursor-pointer text-left"
                    >
                      🚀 SEO विवरण
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerAiTool("extract_points", "इस लेख के महत्वपूर्ण ३ निष्कर्ष बिंदु निकालें।")}
                      className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/40 rounded-xl transition-all cursor-pointer text-left"
                    >
                      📌 मुख्य बिंदु निकालें
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerAiTool("improve", "लेख को संपादकीय गुणवत्ता और साहित्यिक गरिमा प्रदान कर बेहतर बनाएं।")}
                      className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/40 rounded-xl transition-all cursor-pointer text-left"
                    >
                      ✨ लेख को बेहतर बनाएं
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerAiTool("simplify", "भाषा को सरल, लोक-प्रिय और समझने योग्य हिंदी में बदलें।")}
                      className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/40 rounded-xl transition-all cursor-pointer text-left"
                    >
                      📖 सरल भाषा में बदलें
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerAiTool("formalize", "लेख की भाषा को आधिकारिक, अकादमिक और औपचारिक भाषा में बदलें।")}
                      className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-primary/40 rounded-xl transition-all cursor-pointer text-left col-span-2"
                    >
                      👔 औपचारिक भाषा में बदलें
                    </button>
                  </div>

                  {/* AI Results rendering box */}
                  {(aiLoading || aiResult) && (
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] leading-relaxed font-serif space-y-2">
                      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-1.5">
                        <span className="font-bold text-primary">एआई परिणाम</span>
                        {aiLoading && <RotateCw className="w-3.5 h-3.5 text-primary animate-spin" />}
                      </div>
                      
                      {activeAiTool === "suggest_titles" && typeof aiResult === "string" ? (
                        <div className="space-y-1">
                          {aiResult.split("\n")?.map((t, idx) => {
                            const cleanT = t.replace(/^[*-\s\d.]+\s*/, "").trim();
                            if (!cleanT) return null;
                            return (
                              <p 
                                key={idx} 
                                className="hover:text-primary cursor-pointer transition-colors" 
                                onClick={() => setTitle(cleanT)}
                              >
                                {t}
                              </p>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <ContentRenderer content={aiResult} className="text-[10px]" />
                          {aiResult && (
                            <button
                              type="button"
                              onClick={() => {
                                // Insert into currently active block
                                if (activeBlockId) {
                                  setBlocks(prev => prev?.map(b => b.id === activeBlockId ? { ...b, text: (b.text || "") + " " + aiResult } : b));
                                } else {
                                  // Append new block
                                  setBlocks(prev => [...prev, { id: `block-${Date.now()}`, type: "paragraph", text: aiResult }]);
                                }
                              }}
                              className="px-2 py-0.5 bg-primary text-white text-[8px] font-bold rounded cursor-pointer mt-1"
                            >
                              संपादक में जोड़ें
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </GlassCard>

                {/* EDITORIAL SUBMISSION CHECKLIST */}
                <GlassCard glow="none" className="space-y-4">
                  <h3 className="font-serif text-sm font-bold text-primary border-b border-slate-200 dark:border-slate-800 pb-2">
                    संपादकीय मार्गदर्शिका और चेकलिस्ट
                  </h3>

                  <div className="space-y-3 font-serif text-[10px]">
                    <div className="flex items-center justify-between">
                      <span>✓ शीर्षक उपस्थित है (Title Present):</span>
                      <strong className={isTitlePresent ? "text-green-500" : "text-red-500"}>{isTitlePresent ? "हाँ" : "नहीं"}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>✓ श्रेणी का चयन हुआ (Category Selected):</span>
                      <strong className="text-green-500">हाँ ({category})</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>✓ पर्याप्त लम्बाई (Min 200 Words):</span>
                      <strong className={isContentLongEnough ? "text-green-500" : "text-red-500"}>{stats.words} शब्द ({isContentLongEnough ? "हाँ" : "नहीं"})</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>✓ मुख्य चित्र संलग्न है (Cover Image):</span>
                      <strong className={isCoverPresent ? "text-green-500" : "text-red-500"}>{isCoverPresent ? "हाँ" : "नहीं"}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>✓ लेखक विवरण (Author Information):</span>
                      <strong className={isAuthorInfoPresent ? "text-green-500" : "text-red-500"}>{isAuthorInfoPresent ? "हाँ" : "नहीं"}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>✓ फ़ॉर्मेटिंग गुणवत्ता (Formatting Quality):</span>
                      <strong className={isFormattingGood ? "text-green-500" : "text-red-500"}>{isFormattingGood ? "उत्कृष्ट" : "सामान्य"}</strong>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-850 pt-2.5 space-y-2">
                      <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">मैन्युअल मार्गदर्शिका चेक</p>
                      
                      {/* Accordion compliance checks */}
                      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                        <button
                          type="button" onClick={() => setAccordionOpen({ ...accordionOpen, original: !accordionOpen.original })}
                          className="w-full flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-900 cursor-pointer font-bold text-slate-700 dark:text-slate-200"
                        >
                          <span>१. मौलिकता (Originality)</span>
                          {accordionOpen.original ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        {accordionOpen.original && (
                          <div className="p-2.5 bg-white dark:bg-slate-950 space-y-2 border-t border-slate-200 dark:border-slate-800 text-[9px] text-slate-500">
                            <p>सभी रचनाएं लेखक की मौलिक सोच होनी चाहिए। किसी अन्य मंच से कॉपी की गई सामग्री पूर्णतः प्रतिबंधित है।</p>
                            <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-800 dark:text-slate-200">
                              <input
                                type="checkbox"
                                checked={checklist.original}
                                onChange={(e) => setChecklist({ ...checklist, original: e.target.checked })}
                                className="w-3.5 h-3.5 rounded text-primary focus:ring-primary border-slate-300"
                              />
                              <span>मैंने प्रमाणित किया कि यह मौलिक रचना है।</span>
                            </label>
                          </div>
                        )}
                      </div>

                      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                        <button
                          type="button" onClick={() => setAccordionOpen({ ...accordionOpen, copyright: !accordionOpen.copyright })}
                          className="w-full flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-900 cursor-pointer font-bold text-slate-700 dark:text-slate-200"
                        >
                          <span>२. कॉपीराइट नियम (Copyrights)</span>
                          {accordionOpen.copyright ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        {accordionOpen.copyright && (
                          <div className="p-2.5 bg-white dark:bg-slate-950 space-y-2 border-t border-slate-200 dark:border-slate-800 text-[9px] text-slate-500">
                            <p>उपयोग किए गए चित्रों और तथ्यों पर किसी अन्य संस्थान के कॉपीराइट का उल्लंघन न हो।</p>
                            <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-800 dark:text-slate-200">
                              <input
                                type="checkbox"
                                checked={checklist.copyright}
                                onChange={(e) => setChecklist({ ...checklist, copyright: e.target.checked })}
                                className="w-3.5 h-3.5 rounded text-primary focus:ring-primary border-slate-300"
                              />
                              <span>सभी चित्र रॉयल्टी-मुक्त अथवा मेरी संपत्ति हैं।</span>
                            </label>
                          </div>
                        )}
                      </div>

                      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                        <button
                          type="button" onClick={() => setAccordionOpen({ ...accordionOpen, styleGuide: !accordionOpen.styleGuide })}
                          className="w-full flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-900 cursor-pointer font-bold text-slate-700 dark:text-slate-200"
                        >
                          <span>३. लेखन शैली (Writing Style)</span>
                          {accordionOpen.styleGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        {accordionOpen.styleGuide && (
                          <div className="p-2.5 bg-white dark:bg-slate-950 space-y-2 border-t border-slate-200 dark:border-slate-800 text-[9px] text-slate-500">
                            <p>युवाक्षर की भाषा मर्यादित, सारगर्भित और वैचारिक होनी चाहिए। वर्ग विशेष के विरुद्ध अपशब्द वर्जित हैं।</p>
                            <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-800 dark:text-slate-200">
                              <input
                                type="checkbox"
                                checked={checklist.styleGuide}
                                onChange={(e) => setChecklist({ ...checklist, styleGuide: e.target.checked })}
                                className="w-3.5 h-3.5 rounded text-primary focus:ring-primary border-slate-300"
                              />
                              <span>मैंने शैली मार्गदर्शिका का अनुपालन किया है।</span>
                            </label>
                          </div>
                        )}
                      </div>

                      <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                        <button
                          type="button" onClick={() => setAccordionOpen({ ...accordionOpen, citations: !accordionOpen.citations })}
                          className="w-full flex justify-between items-center p-2.5 bg-slate-50 dark:bg-slate-900 cursor-pointer font-bold text-slate-700 dark:text-slate-200"
                        >
                          <span>४. संदर्भ और प्रमाण (Citations)</span>
                          {accordionOpen.citations ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>
                        {accordionOpen.citations && (
                          <div className="p-2.5 bg-white dark:bg-slate-950 space-y-2 border-t border-slate-200 dark:border-slate-800 text-[9px] text-slate-500">
                            <p>वैज्ञानिक तथ्यों अथवा सांख्यिकी के संदर्भ में मूल स्रोतों (स्रोतों/रिपोर्टों) का विवरण दें।</p>
                            <label className="flex items-center space-x-2 cursor-pointer font-bold text-slate-800 dark:text-slate-200">
                              <input
                                type="checkbox"
                                checked={checklist.citations}
                                onChange={(e) => setChecklist({ ...checklist, citations: e.target.checked })}
                                className="w-3.5 h-3.5 rounded text-primary focus:ring-primary border-slate-300"
                              />
                              <span>मैंने सभी स्रोतों का संदर्भ दिया है।</span>
                            </label>
                          </div>
                        )}
                      </div>

                    </div>
                  </div>
                </GlassCard>

                {/* Draft versions restore history */}
                {draftHistory.length > 0 && (
                  <GlassCard glow="none" className="space-y-4">
                    <h3 className="font-serif text-sm font-bold text-primary border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center space-x-2">
                      <History className="w-4 h-4" />
                      <span>ड्राफ्ट इतिहास (Draft Versions)</span>
                    </h3>
                    <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                      {draftHistory?.map(ver => (
                        <div key={ver.id} className="p-2.5 rounded-xl border border-slate-250 dark:border-slate-850 text-[9px] font-sans flex justify-between items-center bg-white dark:bg-slate-950">
                          <div className="truncate max-w-[70%]">
                            <p className="font-bold text-slate-800 dark:text-slate-200 font-serif truncate">{ver.title || "शीर्षकहीन ड्राफ्ट"}</p>
                            <span className="text-slate-400 block text-[8px] mt-0.5">{ver.timestamp} | शब्द: {ver.wordCount}</span>
                          </div>
                          <button
                            onClick={() => restoreDraft(ver)}
                            className="bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-all"
                          >
                            रिस्टोर
                          </button>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}

              </div>
            </div>
          )}

          {/* TAB 2: LIVE MULTI-VIEWPORT PREVIEW */}
          {activeTab === "preview" && (
            <div className="space-y-6">
              
              {/* Viewport Toggles bar */}
              <div className="flex justify-center space-x-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-2xl border border-slate-250 dark:border-slate-850 text-[10px] font-bold font-serif max-w-md mx-auto">
                <button
                  onClick={() => setPreviewViewport("desktop")}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                    previewViewport === "desktop" ? "bg-white dark:bg-slate-800 text-primary shadow" : "text-slate-400"
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>डेस्कटॉप</span>
                </button>
                <button
                  onClick={() => setPreviewViewport("tablet")}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                    previewViewport === "tablet" ? "bg-white dark:bg-slate-800 text-primary shadow" : "text-slate-400"
                  }`}
                >
                  <Tablet className="w-3.5 h-3.5" />
                  <span>टैबलेट</span>
                </button>
                <button
                  onClick={() => setPreviewViewport("mobile")}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                    previewViewport === "mobile" ? "bg-white dark:bg-slate-800 text-primary shadow" : "text-slate-400"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>मोबाइल</span>
                </button>
                <button
                  onClick={() => setPreviewViewport("magazine")}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                    previewViewport === "magazine" ? "bg-white dark:bg-slate-800 text-primary shadow" : "text-slate-400"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>पत्रिका लेआउट</span>
                </button>
              </div>

              {/* Viewport Frame */}
              <div className="flex justify-center bg-slate-100 dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-x-auto min-h-[600px]">
                <div
                  className={`bg-white dark:bg-[#0A0F1D] shadow-2xl transition-all duration-300 rounded-2xl border border-slate-200 dark:border-slate-850 overflow-y-auto ${
                    previewViewport === "magazine" ? "max-w-[850px] p-8 border-t-8 border-t-primary" : ""
                  }`}
                  style={{
                    width: previewViewport === "mobile" ? "375px" : previewViewport === "tablet" ? "768px" : "100%",
                    maxWidth: previewViewport === "desktop" ? "1000px" : undefined,
                    height: "800px"
                  }}
                >
                  {/* Article Magazine Render inside viewport */}
                  <div className="space-y-6">
                    {/* Cover Hero section */}
                    <div className="relative w-full h-[320px] bg-slate-900 overflow-hidden flex flex-col justify-end p-6 text-white">
                      {images.find(img => img.id === featuredImageId) ? (
                        <img 
                          src={images.find(img => img.id === featuredImageId)?.dataUrl} 
                          alt="Cover" 
                          className="absolute inset-0 w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 to-primary/45" />
                      )}
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px]" />
                      
                      <div className="relative z-10 space-y-2 max-w-2xl">
                        <span className="bg-primary px-2.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold inline-block">
                          {category}
                        </span>
                        <h2 className="font-serif text-xl md:text-3xl font-extrabold leading-tight">
                          {title || "शीर्षक रहित रचना"}
                        </h2>
                        <p className="text-[10px] text-slate-300 font-serif leading-relaxed">
                          लेखक: {authorName || "अनाम लेखक"} • {new Date().toLocaleDateString("hi-IN")} • {stats.time} मिनट पठन
                        </p>
                      </div>
                    </div>

                    {/* Metadata Card bar */}
                    <div className="px-6 md:px-8">
                      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl flex justify-between items-center text-[9px] text-slate-400 font-serif leading-none">
                        <span>लेखक: <strong>{authorName}</strong></span>
                        <span>श्रेणी: <strong>{category}</strong></span>
                        <span>शब्द: <strong>{stats.words}</strong></span>
                        <span>पढ़ने का समय: <strong>{stats.time} मिनट</strong></span>
                      </div>
                    </div>

                    {/* Article Content Render body */}
                    <div className="px-6 md:px-8 pb-12 space-y-6 font-serif text-[14px] leading-relaxed max-w-[800px] mx-auto text-slate-800 dark:text-slate-200">
                      
                      {blocks.length > 0 ? (
                        <div className="space-y-6">
                          {blocks?.map((block, bIdx) => {
                            const blockAlign = 
                              block.align === "center" ? "text-center" : 
                              block.align === "right" ? "text-right" : 
                              block.align === "justify" ? "text-justify" : "text-left";

                            if (block.type === "paragraph") {
                              const text = block.text || "";
                              if (bIdx === 0 && text.trim().length > 0) {
                                // Dropcap
                                const strippedText = text.replace(/<[^>]*>/g, "").trim();
                                const firstChar = strippedText[0];
                                const restText = text.substring(text.indexOf(firstChar) + 1);
                                return (
                                  <p key={block.id} className={`first-letter:float-left first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-2.5 first-letter:mt-1 text-[14px] leading-relaxed font-serif ${blockAlign}`}>
                                    <span className="first-letter:text-primary">{firstChar}</span>
                                    <span dangerouslySetInnerHTML={{ __html: restText }} />
                                  </p>
                                );
                              }
                              return (
                                <p key={block.id} className={`${blockAlign} text-[14px] leading-relaxed`} dangerouslySetInnerHTML={{ __html: text }} />
                              );
                            }

                            if (block.type === "heading") {
                              const HType = `h${block.level || 2}` as any;
                              const classNames = 
                                block.level === 1 ? "text-xl font-extrabold" : 
                                block.level === 2 ? "text-lg font-bold border-b border-slate-100 dark:border-slate-900 pb-1 mt-6" : 
                                block.level === 3 ? "text-base font-bold mt-4" : "text-sm font-semibold mt-3";
                              return (
                                <HType key={block.id} className={`${classNames} ${blockAlign} text-primary font-serif`} dangerouslySetInnerHTML={{ __html: block.text || "" }} />
                              );
                            }

                            if (block.type === "quote") {
                              const quoteClass = 
                                block.style === "pull" ? "italic font-serif text-lg text-primary text-center border-y border-y-primary/20 py-4 my-6" :
                                block.style === "editorial" ? "font-serif border-l-4 border-slate-500 pl-4 py-2 bg-slate-550/5 text-slate-700 dark:text-slate-300" :
                                block.style === "highlight" ? "font-sans border-l-4 border-amber-500 pl-4 py-2 bg-amber-500/5 text-slate-800 dark:text-slate-200" :
                                "border-l-4 border-primary pl-4 py-1.5 italic text-slate-650 dark:text-slate-350";
                              return (
                                <blockquote key={block.id} className={`${quoteClass} rounded-r-xl`} dangerouslySetInnerHTML={{ __html: block.text || "" }} />
                              );
                            }

                            if (block.type === "list" || block.type === "checklist") {
                              return (
                                <div key={block.id} className="space-y-1 pl-4 my-2">
                                  {block.listItems?.map((item, itemIdx) => {
                                    const indentStyle = { paddingLeft: `${item.depth * 16}px` };
                                    return (
                                      <div key={itemIdx} style={indentStyle} className="flex items-center space-x-2 text-xs font-serif text-slate-700 dark:text-slate-300">
                                        {block.type === "checklist" ? (
                                          <input
                                            type="checkbox"
                                            checked={item.checked || false}
                                            readOnly
                                            className="w-3.5 h-3.5 text-primary rounded border-slate-350 focus:ring-primary cursor-default"
                                          />
                                        ) : block.listType === "ordered" ? (
                                          <span className="font-sans font-bold text-slate-400 shrink-0 w-3">{itemIdx + 1}.</span>
                                        ) : (
                                          <span className="text-primary font-sans font-bold shrink-0 w-2">•</span>
                                        )}
                                        <span>{item.text}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            }

                            if (block.type === "media" && block.images && block.images.length > 0) {
                              if (block.mediaType === "gallery") {
                                return (
                                  <div key={block.id} className="grid grid-cols-2 gap-4 my-4">
                                    {block.images?.map((img, imgIdx) => (
                                      <div key={imgIdx} className="space-y-1 text-center">
                                        <img src={img.url} alt={img.caption} className="w-full h-40 object-cover rounded-xl" style={{ transform: `rotate(${img.rotation || 0}deg)` }} />
                                        {img.caption && <span className="block text-[10px] text-slate-400 italic leading-none">{img.caption}</span>}
                                        {img.credit && <span className="block text-[8px] text-slate-500 font-sans leading-none">सौजन्य: {img.credit}</span>}
                                      </div>
                                    ))}
                                  </div>
                                );
                              } else {
                                const img = block.images[0];
                                return (
                                  <div key={block.id} className="flex flex-col items-center space-y-1 my-4" style={{ width: "100%" }}>
                                    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800" style={{ width: `${img.width || 100}%` }}>
                                      <img src={img.url} alt={img.caption} className="w-full h-auto" style={{ transform: `rotate(${img.rotation || 0}deg)` }} />
                                    </div>
                                    {img.caption && <span className="block text-[10px] text-slate-400 italic text-center">{img.caption}</span>}
                                    {img.credit && <span className="block text-[8px] text-slate-500 font-sans text-center">सौजन्य: {img.credit}</span>}
                                  </div>
                                );
                              }
                            }

                            if (block.type === "video" && block.videoUrl) {
                              return (
                                <div key={block.id} className="relative overflow-hidden w-full aspect-video rounded-xl border border-slate-200 dark:border-slate-800 bg-black my-4">
                                  <iframe src={block.videoUrl} className="absolute inset-0 w-full h-full" allowFullScreen frameBorder="0" />
                                </div>
                              );
                            }

                            if (block.type === "table" && block.tableData) {
                              return (
                                <div key={block.id} className="overflow-x-auto border border-slate-250 dark:border-slate-800 rounded-xl my-4">
                                  <table className="min-w-full border-collapse border border-slate-200 dark:border-slate-800">
                                    <tbody>
                                      {block.tableData?.map((row, rIdx) => (
                                        <tr key={rIdx}>
                                          {row?.map((cellText, cIdx) => {
                                            const merge = block.mergedCells?.find(
                                              m => rIdx >= m.r1 && rIdx <= m.r2 && cIdx >= m.c1 && cIdx <= m.c2
                                            );
                                            
                                            if (merge) {
                                              if (rIdx === merge.r1 && cIdx === merge.c1) {
                                                const rowSpan = merge.r2 - merge.r1 + 1;
                                                const colSpan = merge.c2 - merge.c1 + 1;
                                                return (
                                                  <td
                                                    key={cIdx}
                                                    rowSpan={rowSpan}
                                                    colSpan={colSpan}
                                                    className="border border-slate-200 dark:border-slate-800 p-2 min-w-[80px] bg-primary/5 text-xs text-slate-700 dark:text-slate-300"
                                                    dangerouslySetInnerHTML={{ __html: cellText }}
                                                  />
                                                );
                                              }
                                              return null;
                                            }
                                            return (
                                              <td
                                                key={cIdx}
                                                className="border border-slate-200 dark:border-slate-800 p-2 min-w-[80px] text-xs text-slate-750 dark:text-slate-350"
                                                dangerouslySetInnerHTML={{ __html: cellText }}
                                              />
                                            );
                                          })}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              );
                            }

                            if (block.type === "special") {
                              return (
                                <div key={block.id} className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1.5 my-4 ${
                                  block.specialType === 'fact' ? 'bg-amber-500/5 border-amber-500/20 text-slate-850 dark:text-slate-200' :
                                  block.specialType === 'didyouknow' ? 'bg-emerald-500/5 border-emerald-500/20 text-slate-850 dark:text-slate-200' :
                                  block.specialType === 'editorial_note' ? 'bg-violet-500/5 border-violet-500/20 text-slate-850 dark:text-slate-200' :
                                  block.specialType === 'author_note' ? 'bg-blue-500/5 border-blue-500/20 text-slate-850 dark:text-slate-200' :
                                  block.specialType === 'warning' ? 'bg-rose-500/5 border-rose-500/20 text-red-800 dark:text-red-200 animate-pulse' :
                                  'bg-slate-500/5 border-slate-500/20 text-slate-800 dark:text-slate-250'
                                }`}>
                                  <div className="font-bold flex items-center space-x-1.5 uppercase tracking-wider text-[9px] text-primary">
                                    {block.specialType === 'warning' && <AlertTriangle className="w-3.5 h-3.5" />}
                                    {block.specialType === 'didyouknow' && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                                    <span>
                                      {block.specialType === 'fact' ? "महत्वपूर्ण तथ्य" :
                                       block.specialType === 'didyouknow' ? "क्या आप जानते हैं?" :
                                       block.specialType === 'editorial_note' ? "संपादकीय टिप्पणी" :
                                       block.specialType === 'author_note' ? "लेखक टिप्पणी" :
                                       block.specialType === 'warning' ? "चेतावनी बॉक्स" : "संदर्भ बॉक्स"}
                                    </span>
                                  </div>
                                  <div dangerouslySetInnerHTML={{ __html: block.text || "" }} />
                                </div>
                              );
                            }

                            return null;
                          })}
                        </div>
                      ) : (
                        <p className="text-slate-400 text-center py-12 italic">यहाँ लेख का लाइव प्रीव्यू दिखाई देगा।</p>
                      )}

                      {/* Display author card at the end */}
                      <div className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-8 flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-lg uppercase font-bold shrink-0">
                          {authorName ? authorName[0] : "A"}
                        </div>
                        <div>
                          <h4 className="font-serif font-bold text-xs text-slate-800 dark:text-white">{authorName || "लेखक का नाम"}</h4>
                          <p className="text-[10px] text-slate-400 font-serif leading-relaxed mt-0.5">{authorBio || "लेखक का संक्षिप्त परिचय..."}</p>
                          {authorExpertise && (
                            <span className="inline-block bg-slate-100 dark:bg-slate-900 border border-slate-200 text-[8px] text-slate-500 font-mono px-2 py-0.5 rounded mt-1.5 font-bold">
                              विशेषज्ञता: {authorExpertise}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: TRACK SUBMISSIONS & TIMELINE */}
          {activeTab === "track" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              
              <GlassCard glow="none" className="space-y-6">
                <h3 className="font-serif text-sm font-bold text-primary border-b border-slate-200 dark:border-slate-800 pb-3 flex justify-between items-center">
                  <span>आपके द्वारा प्रेषित रचनाएं (Submission History)</span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded font-mono">
                    Total: {submittedList.length} Articles
                  </span>
                </h3>

                {submittedList.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 font-serif">
                    आपने अभी तक कोई भी रचना संपादकीय डेस्क को सबमिट नहीं की है।
                  </div>
                ) : (
                  <div className="space-y-6">
                    {submittedList?.map(sub => (
                      <div
                        key={sub.id}
                        className="bg-slate-50/50 dark:bg-[#0F172A]/10 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-200/60 dark:border-slate-800/40 pb-2">
                          <div>
                            <span className="text-[9px] font-mono text-slate-400 block">{sub.id} | दिनांक: {sub.date}</span>
                            <h4 className="font-serif font-bold text-sm text-slate-800 dark:text-white mt-0.5">
                              {sub.title}
                            </h4>
                          </div>
                          <div className="flex space-x-2 shrink-0">
                            <span className="bg-primary/10 border border-primary/20 text-primary text-[8px] font-bold px-2 py-0.5 rounded-lg">
                              {sub.category}
                            </span>
                            <span className={`text-[8px] font-bold px-2 py-0.5 rounded-lg ${
                              sub.status === "प्रकाशित"
                                ? "bg-green-500/10 text-green-500 border border-green-500/20"
                                : sub.status === "स्वीकृत"
                                ? "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                                : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            }`}>
                              {sub.status}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Timeline Stepper */}
                        <div className="pt-2">
                          <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-4">रचना समीक्षा यात्रा (Timeline)</p>
                          <div className="grid grid-cols-4 gap-1 relative text-center">
                            
                            <div className="absolute top-2.5 left-[12%] right-[12%] h-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />
                            <div 
                              className="absolute top-2.5 left-[12%] h-0.5 bg-primary -z-0 transition-all duration-500" 
                              style={{ width: `${(sub.timelineStep - 1) * 25.33}%` }}
                            />

                            <div className="flex flex-col items-center z-10">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center border font-sans text-[10px] font-bold ${
                                sub.timelineStep >= 1 ? "bg-primary text-white border-primary" : "bg-white dark:bg-slate-900 border-slate-300 text-slate-400"
                              }`}>
                                1
                              </div>
                              <span className="text-[9px] font-serif font-bold mt-1.5 text-slate-700 dark:text-slate-350">सबमिट की गई</span>
                            </div>

                            <div className="flex flex-col items-center z-10">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center border font-sans text-[10px] font-bold ${
                                sub.timelineStep >= 2 ? "bg-primary text-white border-primary" : "bg-white dark:bg-slate-900 border-slate-300 text-slate-400"
                              }`}>
                                2
                              </div>
                              <span className="text-[9px] font-serif font-bold mt-1.5 text-slate-700 dark:text-slate-350">संपादकीय समीक्षा</span>
                            </div>

                            <div className="flex flex-col items-center z-10">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center border font-sans text-[10px] font-bold ${
                                sub.timelineStep >= 3 ? "bg-primary text-white border-primary" : "bg-white dark:bg-slate-900 border-slate-300 text-slate-400"
                              }`}>
                                3
                              </div>
                              <span className="text-[9px] font-serif font-bold mt-1.5 text-slate-700 dark:text-slate-350">प्रूफरीडिंग</span>
                            </div>

                            <div className="flex flex-col items-center z-10">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center border font-sans text-[10px] font-bold ${
                                sub.timelineStep >= 4 ? "bg-primary text-white border-primary" : "bg-white dark:bg-slate-900 border-slate-300 text-slate-400"
                              }`}>
                                4
                              </div>
                              <span className="text-[9px] font-serif font-bold mt-1.5 text-slate-700 dark:text-slate-350">प्रकाशित लाइव</span>
                            </div>

                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>
            </div>
          )}
        </div>
      )}

      {/* Reader to Author conversion modal */}
      {showAuthorConversionModal && (
        <div className="fixed inset-0 bg-[#0A0F1D]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="font-serif text-lg font-bold text-primary">लेखक प्रोफ़ाइल सक्रिय करें</h3>
              <button
                onClick={() => setShowAuthorConversionModal(false)}
                className="text-slate-400 hover:text-slate-650 dark:hover:text-white p-1 rounded border border-slate-200 dark:border-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBecomeAuthorSubmit} className="space-y-4 text-xs font-serif">
              <div className="space-y-1">
                <label className="text-slate-500 font-medium">लेखक परिचय (Author Bio)</label>
                <textarea
                  rows={4}
                  placeholder="अपना संक्षिप्त परिचय लिखें, उदा. 'स्वतंत्र पत्रकार और राजनीतिक विश्लेषक।'"
                  value={conversionBio}
                  onChange={(e) => setConversionBio(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-medium">प्रोफ़ाइल फोटो (Profile Photo URL)</label>
                <input
                  type="text"
                  placeholder="फोटो लिंक..."
                  value={conversionAvatarUrl}
                  onChange={(e) => setConversionAvatarUrl(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-medium">रुचि / विशेषज्ञता का क्षेत्र</label>
                <select
                  value={conversionExpertise}
                  onChange={(e) => setConversionExpertise(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none"
                >
                  <option value="साहित्य">साहित्य विमर्श</option>
                  <option value="पर्यावरण">पर्यावरण और जैव विविधता</option>
                  <option value="इतिहास">ऐतिहासिक शोध</option>
                  <option value="विज्ञान">विज्ञान एवं प्रौद्योगिकी</option>
                  <option value="सामयिक">सामयिक मुद्दे</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/95 text-white py-3 rounded-xl font-bold transition-all shadow-md cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <UserCheck className="w-4 h-4" />
                <span>लेखक खाता सक्रिय करें</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Cloud Import Links Modal */}
      {showCloudModal && (
        <div className="fixed inset-0 bg-[#0A0F1D]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-2">
              <h4 className="font-serif text-sm font-bold text-primary uppercase">
                {cloudImportType === "drive" ? "Google Drive" : cloudImportType === "dropbox" ? "Dropbox" : "OneDrive"} लिंक आयात करें
              </h4>
              <button 
                onClick={() => setShowCloudModal(false)}
                className="text-slate-450 hover:text-slate-700 dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3 text-xs">
              <p className="text-slate-500 font-serif leading-relaxed">
                कृपया अपनी फ़ाइल का वैध शेयरिंग लिंक यहाँ पेस्ट करें। हम इसे आपके ब्लॉग चित्र में तब्दील कर देंगे:
              </p>
              <input
                type="text"
                placeholder="शेयरिंग लिंक यहाँ पेस्ट करें (https://...)"
                value={cloudImportUrl}
                onChange={(e) => setCloudImportUrl(e.target.value)}
                className="w-full bg-slate-550/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-xs"
              />
              <button
                onClick={handleCloudImportSubmit}
                className="w-full bg-primary text-white py-2.5 rounded-xl font-bold transition-all shadow-md cursor-pointer"
              >
                आयात करें (Import)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Goals Modals */}
      {showGoalModal && (
        <div className="fixed inset-0 bg-[#0A0F1D]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-2">
              <h4 className="font-serif text-sm font-bold text-primary">मासिक शब्द लेखन लक्ष्य सेट करें</h4>
              <button 
                onClick={() => setShowGoalModal(false)}
                className="text-slate-450 hover:text-slate-700 dark:hover:text-white p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3 text-xs">
              <p className="text-slate-550 font-serif">अपना मासिक लक्ष्य (शब्दों में) दर्ज करें:</p>
              <input
                type="number"
                value={tempGoal}
                onChange={(e) => setTempGoal(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none text-xs font-mono font-bold"
              />
              <button
                onClick={handleSaveGoal}
                className="w-full bg-primary text-white py-2.5 rounded-xl font-bold transition-all shadow-md cursor-pointer"
              >
                लक्ष्य सहेजें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Camera Capture Modal popup */}
      {cameraActive && (
        <div className="fixed inset-0 bg-[#0A0F1D]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl text-center">
            <h4 className="font-serif font-bold text-sm text-primary">कैमरा स्नैपशॉट</h4>
            <video ref={videoRef} autoPlay playsInline className="w-full max-h-[300px] rounded-2xl bg-black border border-slate-200 dark:border-slate-800" />
            <div className="flex space-x-3 justify-center">
              <button
                onClick={captureBlockPhoto}
                className="bg-primary text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>फोटो लें</span>
              </button>
              <button
                onClick={stopBlockCamera}
                className="border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 px-5 py-2.5 rounded-xl text-xs transition-all cursor-pointer"
              >
                रद्द करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Cropping Module Modal */}
      {croppingBlockId !== null && croppingImageIdx !== null && (
        <div className="fixed inset-0 bg-[#0A0F1D]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h4 className="font-serif font-bold text-sm text-primary flex items-center space-x-1.5">
              <Scissors className="w-4 h-4" />
              <span>चित्र कतरें (Aspect Ratio 16:9)</span>
            </h4>
            
            <div className="relative overflow-hidden border border-slate-200 dark:border-slate-850 rounded-xl h-[240px] flex items-center justify-center bg-black">
              <img
                src={blocks.find(b => b.id === croppingBlockId)?.images?.[croppingImageIdx]?.url}
                alt="Crop preview"
                className="max-h-full transition-transform"
                style={{
                  transform: `scale(${cropZoom}) translateY(${cropYOffset}px)`
                }}
              />
              <div className="absolute inset-0 border-4 border-dashed border-primary/50 pointer-events-none" />
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>ज़ूम (Zoom)</span>
                <span className="font-mono">{cropZoom.toFixed(1)}x</span>
              </div>
              <input
                type="range" min="0.5" max="3" step="0.1" value={cropZoom}
                onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />

              <div className="flex justify-between items-center text-slate-400">
                <span>लंबवत स्थिति (Vertical Adjust)</span>
                <span className="font-mono">{cropYOffset}px</span>
              </div>
              <input
                type="range" min="-100" max="100" step="5" value={cropYOffset}
                onChange={(e) => setCropYOffset(parseInt(e.target.value, 10))}
                className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="flex space-x-2 justify-end">
              <button
                type="button" onClick={applyBlockCrop}
                className="bg-primary text-white font-bold py-1.5 px-4 rounded-xl cursor-pointer text-xs"
              >
                क्रॉप करें
              </button>
              <button
                type="button" onClick={() => { setCroppingBlockId(null); setCroppingImageIdx(null); }}
                className="border border-slate-300 dark:border-slate-800 py-1.5 px-3 rounded-xl text-slate-500 cursor-pointer text-xs"
              >
                रद्द करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Compression Settings Modal */}
      {compressingBlockId !== null && compressingImageIdx !== null && (
        <div className="fixed inset-0 bg-[#0A0F1D]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h4 className="font-serif font-bold text-sm text-primary flex items-center space-x-1.5">
              <RotateCw className="w-4 h-4 animate-spin" />
              <span>गुणवत्ता और आकार संपीडन</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-4 text-center text-[10px] font-sans">
              <div className="bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="block text-slate-400">अनुमानित वर्तमान आकार:</span>
                <strong className="text-slate-800 dark:text-white font-mono text-xs">{(compressedSize / 1024).toFixed(1)} KB</strong>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-400">
                <span>गुणवत्ता (Quality)</span>
                <span className="font-mono">{Math.round(compressionQuality * 100)}%</span>
              </div>
              <input
                type="range" min="0.1" max="1.0" step="0.05" value={compressionQuality}
                onChange={(e) => setCompressionQuality(parseFloat(e.target.value))}
                onMouseUp={previewCompressionRate}
                onTouchEnd={previewCompressionRate}
                className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="flex space-x-2 justify-end">
              <button
                type="button" onClick={applyBlockCompression}
                className="bg-primary text-white font-bold py-1.5 px-4 rounded-xl cursor-pointer text-xs"
              >
                संपीड़ित आकार लागू करें
              </button>
              <button
                type="button" onClick={() => { setCompressingBlockId(null); setCompressingImageIdx(null); }}
                className="border border-slate-300 dark:border-slate-800 py-1.5 px-3 rounded-xl text-slate-500 cursor-pointer text-xs"
              >
                रद्द करें
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
