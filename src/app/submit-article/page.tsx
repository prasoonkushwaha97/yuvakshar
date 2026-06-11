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
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

import GlassCard from "@/components/yuvakshar/GlassCard";
import { useCms } from "@/store/CmsContext";
import { parseMarkdownToHtmlBlocks } from "@/lib/markdown";

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

export default function SubmitArticlePage() {
  const { currentUser, submitPublicArticle, openAuthModal, becomeAuthor, generateAiContent } = useCms();

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
  const [croppingImage, setCroppingImage] = useState<UploadedImage | null>(null);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropYOffset, setCropYOffset] = useState(0);

  // Compression States
  const [compressingImage, setCompressingImage] = useState<UploadedImage | null>(null);
  const [compressionQuality, setCompressionQuality] = useState(0.7);
  const [compressedSize, setCompressedSize] = useState(0);
  const [compressedDataUrl, setCompressedDataUrl] = useState("");

  // Camera States
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto Save & History States
  const [autosaveMessage, setAutosaveMessage] = useState("");
  const [draftHistory, setDraftHistory] = useState<DraftVersion[]>([]);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [pendingRestore, setPendingRestore] = useState<DraftVersion | null>(null);

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

  // Viewport Preview state: 'desktop' | 'tablet' | 'mobile'
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "tablet" | "mobile">("desktop");

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
  }, []);

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

  // Statistics calculation
  const calculateStats = () => {
    const charCount = content.length;
    const cleanText = content.trim();
    const wordList = cleanText ? cleanText.split(/\s+/) : [];
    const wordCount = wordList.length;
    
    // Hindi reading speed average: ~130 words per minute
    const readTime = Math.max(1, Math.ceil(wordCount / 130));
    
    // Paragraph count
    const paraCount = cleanText ? cleanText.split(/\n\s*\n/).filter(Boolean).length : 0;
    
    // Header count (#, ##, ###)
    const headerCount = cleanText ? (cleanText.match(/^#{1,6} /gm) || []).length : 0;
    
    // Quote count (>)
    const quoteCount = cleanText ? (cleanText.match(/^> /gm) || []).length : 0;

    return {
      words: wordCount,
      chars: charCount,
      time: readTime,
      paragraphs: paraCount,
      headers: headerCount,
      quotes: quoteCount
    };
  };

  const stats = calculateStats();

  // Quality Assessment score calculator (0 to 100)
  const calculateQualityScore = () => {
    let score = 0;
    
    // 1. Content length (Max 25 pts)
    if (stats.words >= 400) score += 25;
    else if (stats.words >= 200) score += 15;
    else if (stats.words >= 50) score += 5;

    // 2. Heading structure (Max 15 pts)
    if (stats.headers >= 2) score += 15;
    else if (stats.headers >= 1) score += 8;

    // 3. Media attachments (Max 15 pts)
    if (images.length >= 2) score += 15;
    else if (images.length >= 1) score += 10;

    // 4. Checklist compliance (Max 30 pts)
    if (checklist.original) score += 10;
    if (checklist.copyright) score += 5;
    if (checklist.styleGuide) score += 5;
    if (checklist.citations) score += 10;

    // 5. Keyword Density (Max 15 pts)
    // Check if title keywords appear in body content
    if (title.trim().length > 5 && content.trim().length > 20) {
      const keywords = title.toLowerCase().split(/\s+/).filter(w => w.length > 2);
      let matchCount = 0;
      keywords.forEach(kw => {
        if (content.toLowerCase().includes(kw)) matchCount++;
      });
      if (matchCount >= 2) score += 15;
      else if (matchCount >= 1) score += 10;
    }

    return Math.min(100, score);
  };

  const qualityScore = calculateQualityScore();

  // AI Suggestions triggering real generateAiContent
  const triggerAiTool = async (tool: string, label: string) => {
    if (!content.trim()) {
      alert("कृपया एआई सुझावों के लिए पहले लेख सामग्री लिखें!");
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

  // Image Upload Processing
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImage: UploadedImage = {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: file.name,
          size: file.size,
          dataUrl: reader.result as string,
          isFeatured: images.length === 0 // Default first image as featured
        };
        const updated = [...images, newImage];
        setImages(updated);
        if (images.length === 0) {
          setFeaturedImageId(newImage.id);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const newImage: UploadedImage = {
            id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: file.name,
            size: file.size,
            dataUrl: reader.result as string,
            isFeatured: images.length === 0
          };
          setImages(prev => {
            const next = [...prev, newImage];
            if (next.length === 1) setFeaturedImageId(newImage.id);
            return next;
          });
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // Delete image
  const deleteImage = (id: string) => {
    const filtered = images.filter(img => img.id !== id);
    setImages(filtered);
    if (featuredImageId === id && filtered.length > 0) {
      setFeaturedImageId(filtered[0].id);
      // Update featured state
      setImages(filtered.map((img, idx) => idx === 0 ? { ...img, isFeatured: true } : img));
    } else if (filtered.length === 0) {
      setFeaturedImageId(null);
    }
  };

  // Set Featured Cover Image
  const toggleFeatured = (id: string) => {
    setFeaturedImageId(id);
    setImages(images.map(img => img.id === id ? { ...img, isFeatured: true } : { ...img, isFeatured: false }));
  };

  // Mock Crop Trigger
  const applyCrop = () => {
    if (!croppingImage) return;
    // Simulate crop modifications by applying CSS filters or drawing on Canvas.
    // In our case, we will slice/zoom and re-render in canvas.
    const canvas = document.createElement("canvas");
    const img = new Image();
    img.src = croppingImage.dataUrl;
    img.onload = () => {
      canvas.width = 800;
      canvas.height = 450; // 16:9 Aspect Ratio
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Draw centered and cropped image
        const scale = cropZoom;
        const width = img.width * scale;
        const height = img.height * scale;
        const x = (800 - width) / 2;
        const y = ((450 - height) / 2) + cropYOffset;
        
        ctx.fillStyle = "#FAF8F3";
        ctx.fillRect(0, 0, 800, 450);
        ctx.drawImage(img, x, y, width, height);
        
        const croppedUrl = canvas.toDataURL("image/jpeg", 0.95);
        setImages(images.map(image => image.id === croppingImage.id ? { ...image, dataUrl: croppedUrl } : image));
        setCroppingImage(null);
        alert("चित्र कतरन (Cropping) पूर्ण!");
      }
    };
  };

  // Mock Compression Trigger
  const applyCompression = () => {
    if (!compressingImage) return;
    const canvas = document.createElement("canvas");
    const img = new Image();
    img.src = compressingImage.dataUrl;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const compressedUrl = canvas.toDataURL("image/jpeg", compressionQuality);
        
        // Calculate simulated size
        const ratio = compressionQuality;
        const newSize = Math.round(compressingImage.size * ratio);
        setCompressedSize(newSize);
        setCompressedDataUrl(compressedUrl);
      }
    };
  };

  const saveCompressed = () => {
    if (!compressingImage || !compressedDataUrl) return;
    setImages(images.map(image => image.id === compressingImage.id ? { ...image, dataUrl: compressedDataUrl, size: compressedSize } : image));
    setCompressingImage(null);
    setCompressedDataUrl("");
    alert("चित्र संपीडन (Compression) सहेज लिया गया!");
  };

  // Camera Snapshot Actions
  const startCamera = async () => {
    try {
      setCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error(err);
      alert("कैमरा चालू करने में असमर्थ। कृपया अनुमति जांचें।");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
    }
    setCameraStream(null);
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 640, 480);
        const dataUrl = canvas.toDataURL("image/jpeg");
        
        const newImage: UploadedImage = {
          id: `img-${Date.now()}`,
          name: `camera_capture_${Date.now()}.jpg`,
          size: Math.round(dataUrl.length * 0.75), // rough estimate of bytes
          dataUrl,
          isFeatured: images.length === 0
        };
        
        setImages([...images, newImage]);
        if (images.length === 0) setFeaturedImageId(newImage.id);
        
        stopCamera();
        alert("कैमरा फोटो सफलतापूर्वक ली गई!");
      }
    }
  };

  // Restore Draft Action
  const restoreDraft = (version: DraftVersion) => {
    setTitle(version.title);
    setContent(version.content);
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
      // Find featured cover image
      const coverImgObj = images.find(img => img.id === featuredImageId) || images[0];
      const coverUrl = coverImgObj ? coverImgObj.dataUrl : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80";

      // Call context submit
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

      // Add to tracking list
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

      // Reset editor
      setTitle("");
      setContent("");
      setImages([]);
      setFeaturedImageId(null);
      localStorage.removeItem("yuvakshar_autosave_draft");

      // Success
      setSubmittedSuccess(true);
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error(err);
      alert("लेख सबमिट करने में कोई त्रुटि हुई। कृपया पुनः प्रयास करें।");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert Reader to Author Action
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

  if (!currentUser) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 min-h-screen space-y-8 text-[#0F172A] dark:text-slate-200">
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <h1 className="font-serif text-3xl md:text-4xl text-primary font-bold">
              लेखक सबमिशन एवं रचनाकार डेस्क
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-sans mt-1.5 font-bold">
              Premium Editorial Submission Portal
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
            Premium Editorial Submission Portal
          </p>
        </div>

        {/* Reader to Author Trigger */}
        {currentUser && currentUser.role === null && (
          <button
            onClick={() => setShowAuthorConversionModal(true)}
            className="bg-gradient-to-r from-amber-500 to-primary text-white font-bold py-2.5 px-6 rounded-full text-xs transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center space-x-1.5 animate-pulse"
          >
            <UserCheck className="w-4 h-4" />
            <span>लेखक बनें (Become Author)</span>
          </button>
        )}
      </div>

      {/* Auto Save Alert Toast */}
      {autosaveMessage && (
        <div className="fixed bottom-6 right-6 bg-[#0F172A] text-green-400 border border-green-500/30 py-2.5 px-5 rounded-2xl text-xs font-sans shadow-2xl flex items-center space-x-2 z-50 animate-bounce">
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
              <strong>अपूर्ण ड्राफ्ट मिला:</strong> आपने हाल ही में <strong>"{pendingRestore.title || "बिना शीर्षक का लेख"}"</strong> लिखना शुरू किया था। क्या आप इसे पुनः प्राप्त करना चाहते हैं?
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

      {/* Submitted Success Screen overlay */}
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
              
              {/* Write Form (Col 8) */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Auth Warning if anonymous */}
                {!currentUser && (
                  <div className="bg-primary/5 border border-primary/20 p-5 rounded-2xl text-xs space-y-3 font-serif">
                    <p className="text-slate-700 dark:text-slate-300">
                      <strong>चेतावनी:</strong> आप अभी लॉगिन नहीं हैं। रचना प्रकाशन और ड्राफ्ट प्रबंधन के लिए लॉगिन करना अनिवार्य है।
                    </p>
                    <button
                      onClick={() => openAuthModal()}
                      className="bg-primary text-white px-4 py-2 rounded-xl font-bold cursor-pointer"
                    >
                      लॉगिन / पंजीकरण करें
                    </button>
                  </div>
                )}

                <GlassCard glow="gold" className="space-y-4">
                  <h3 className="font-serif text-sm font-bold text-primary border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center justify-between">
                    <span>रचना विवरण</span>
                    <span className="text-[10px] text-slate-400 font-sans">Markdown Supported</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-slate-500 font-medium">लेख का शीर्षक</label>
                      <input
                        type="text"
                        placeholder="अपने लेख का आकर्षक शीर्षक लिखें..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 text-xs font-serif"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-slate-500 font-medium">श्रेणी चुनें</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200"
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

                  <div className="space-y-1">
                    <label className="text-slate-500 font-medium">लेख सामग्री (लिखना शुरू करें)</label>
                    <textarea
                      rows={14}
                      placeholder="अपनी महत्वपूर्ण संपादकीय रचना यहाँ लिखें। शीर्षकों के लिए ##, मुख्य कोट के लिए >, और सामान्य टेक्स्ट के पैराग्राफ का उपयोग करें..."
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 text-xs leading-relaxed font-serif"
                      required
                    />
                  </div>
                </GlassCard>

                {/* Cover Image Upload Card */}
                <GlassCard glow="none" className="space-y-4">
                  <h3 className="font-serif text-sm font-bold text-primary border-b border-slate-200 dark:border-slate-800 pb-2 flex justify-between items-center">
                    <span>चित्र प्रबंधन (Upload Images)</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (cameraActive) stopCamera();
                        else startCamera();
                      }}
                      className="text-[10px] text-primary hover:underline flex items-center space-x-1 cursor-pointer"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{cameraActive ? "कैमरा बंद करें" : "कैमरे से फोटो लें"}</span>
                    </button>
                  </h3>

                  {/* Camera Section */}
                  {cameraActive && (
                    <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col items-center space-y-3">
                      <video ref={videoRef} autoPlay playsInline className="max-w-full rounded-xl max-h-[240px] bg-black" />
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="bg-primary text-white px-4 py-2 rounded-xl font-bold flex items-center space-x-1"
                        >
                          <Camera className="w-4 h-4" />
                          <span>स्नैपशॉट लें</span>
                        </button>
                        <button
                          type="button"
                          onClick={stopCamera}
                          className="border border-slate-300 dark:border-slate-700 px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300"
                        >
                          बंद करें
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Drag drop area */}
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-primary/50 rounded-2xl p-6 text-center space-y-2 hover:bg-slate-50/50 dark:hover:bg-[#0F172A]/10 transition-all cursor-pointer relative"
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      चित्रों को यहाँ <strong>Drag & Drop</strong> करें अथवा क्लिक करके अपलोड करें
                    </p>
                    <p className="text-[9px] text-slate-400">JPEG, PNG या WEBP फ़ाइलें (अधिकतम 5MB)</p>
                  </div>

                  {/* Uploaded Images List */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                      {images.map(img => (
                        <div
                          key={img.id}
                          className={`relative border rounded-xl overflow-hidden group transition-all p-1 bg-white dark:bg-slate-900 ${
                            featuredImageId === img.id
                              ? "border-primary shadow-md"
                              : "border-slate-200 dark:border-slate-800"
                          }`}
                        >
                          <img src={img.dataUrl} alt={img.name} className="w-full h-24 object-cover rounded-lg" />
                          
                          {/* Image Toolbar actions */}
                          <div className="absolute inset-x-0 bottom-0 bg-slate-900/90 py-1 px-1.5 flex justify-between items-center text-[9px] opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => toggleFeatured(img.id)}
                              className={`font-bold transition-all ${img.isFeatured ? 'text-primary' : 'text-slate-400 hover:text-white'}`}
                            >
                              {img.isFeatured ? "कवर चित्र ✓" : "कवर बनाएं"}
                            </button>
                            <div className="flex space-x-1.5">
                              <button
                                type="button"
                                onClick={() => setCroppingImage(img)}
                                className="text-slate-400 hover:text-primary transition-all"
                              >
                                <Scissors className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setCompressingImage(img);
                                  setCompressedSize(img.size);
                                }}
                                className="text-slate-400 hover:text-primary transition-all"
                              >
                                <RotateCw className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteImage(img.id)}
                                className="text-red-400 hover:text-red-500 transition-all"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* Featured cover badge indicator */}
                          {featuredImageId === img.id && (
                            <span className="absolute top-2 left-2 bg-primary text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md">
                              कवर चित्र
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Interactive Crop Module Modal */}
                  {croppingImage && (
                    <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                      <h4 className="font-serif font-bold text-xs text-primary flex items-center space-x-1.5">
                        <Scissors className="w-4 h-4" />
                        <span>चित्र कतरें (Aspect Ratio 16:9)</span>
                      </h4>
                      <div className="relative overflow-hidden border border-slate-200 rounded-xl max-h-[300px] flex items-center justify-center bg-black">
                        <img
                          src={croppingImage.dataUrl}
                          alt="Crop preview"
                          className="max-h-full transition-transform"
                          style={{
                            transform: `scale(${cropZoom}) translateY(${cropYOffset}px)`
                          }}
                        />
                        <div className="absolute inset-0 border-4 border-dashed border-primary/50 pointer-events-none" />
                      </div>
                      
                      {/* Controls */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-sans">
                          <span>ज़ूम (Zoom)</span>
                          <span className="font-mono">{cropZoom.toFixed(1)}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="3"
                          step="0.1"
                          value={cropZoom}
                          onChange={(e) => setCropZoom(parseFloat(e.target.value))}
                          className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        />

                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-sans">
                          <span>लंबवत स्थिति (Vertical Adjust)</span>
                          <span className="font-mono">{cropYOffset}px</span>
                        </div>
                        <input
                          type="range"
                          min="-100"
                          max="100"
                          step="5"
                          value={cropYOffset}
                          onChange={(e) => setCropYOffset(parseInt(e.target.value, 10))}
                          className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="flex space-x-2 justify-end">
                        <button
                          type="button"
                          onClick={applyCrop}
                          className="bg-primary text-white font-bold py-1.5 px-4 rounded-xl cursor-pointer"
                        >
                          क्रॉप लागू करें
                        </button>
                        <button
                          type="button"
                          onClick={() => setCroppingImage(null)}
                          className="border border-slate-300 dark:border-slate-800 py-1.5 px-3 rounded-xl text-slate-500 cursor-pointer"
                        >
                          रद्द करें
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Interactive Compression Module Modal */}
                  {compressingImage && (
                    <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                      <h4 className="font-serif font-bold text-xs text-primary flex items-center space-x-1.5">
                        <RotateCw className="w-4 h-4" />
                        <span>चित्र गुणवत्ता और आकार संपीडन</span>
                      </h4>
                      
                      <div className="grid grid-cols-2 gap-4 text-center text-[10px] font-sans">
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200">
                          <span className="block text-slate-400">मूल आकार:</span>
                          <strong className="text-slate-800 dark:text-white font-mono">{(compressingImage.size / 1024).toFixed(1)} KB</strong>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-primary/20">
                          <span className="block text-primary">अनुमानित नया आकार:</span>
                          <strong className="text-primary font-mono">{(compressedSize / 1024).toFixed(1)} KB</strong>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-sans">
                          <span>गुणवत्ता सेटिंग (JPEG Quality)</span>
                          <span className="font-mono">{Math.round(compressionQuality * 100)}%</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="1.0"
                          step="0.05"
                          value={compressionQuality}
                          onChange={(e) => setCompressionQuality(parseFloat(e.target.value))}
                          onMouseUp={applyCompression}
                          onTouchEnd={applyCompression}
                          className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      <div className="flex space-x-2 justify-end">
                        <button
                          type="button"
                          onClick={saveCompressed}
                          className="bg-primary text-white font-bold py-1.5 px-4 rounded-xl cursor-pointer"
                        >
                          संपीड़ित आकार सहेजें
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setCompressingImage(null);
                            setCompressedDataUrl("");
                          }}
                          className="border border-slate-300 dark:border-slate-800 py-1.5 px-3 rounded-xl text-slate-500 cursor-pointer"
                        >
                          रद्द करें
                        </button>
                      </div>
                    </div>
                  )}
                </GlassCard>

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

              {/* Sidebar Info/AI (Col 4) */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Live Stats widget */}
                <GlassCard glow="none" className="space-y-4">
                  <h3 className="font-serif text-sm font-bold text-primary border-b border-slate-200 dark:border-slate-800 pb-2">
                    लेखन सांख्यिकी
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-center font-sans text-xs">
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <span className="block text-[10px] text-slate-400">कुल शब्द</span>
                      <strong className="text-sm font-bold font-mono">{stats.words}</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <span className="block text-[10px] text-slate-400">कुल अक्षर</span>
                      <strong className="text-sm font-bold font-mono">{stats.chars}</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <span className="block text-[10px] text-slate-400">पढ़ने का समय</span>
                      <strong className="text-sm font-bold font-mono">{stats.time} मि.</strong>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                      <span className="block text-[10px] text-slate-400">पैराग्राफ</span>
                      <strong className="text-sm font-bold font-mono">{stats.paragraphs}</strong>
                    </div>
                  </div>
                </GlassCard>

                {/* Quality Score Radial */}
                <GlassCard glow="gold" className="space-y-4">
                  <h3 className="font-serif text-sm font-bold text-primary border-b border-slate-200 dark:border-slate-800 pb-2 flex justify-between items-center">
                    <span>गुणवत्ता मीटर (Quality Index)</span>
                    <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary font-bold px-1.5 py-0.5 rounded">
                      {qualityScore}/100 Score
                    </span>
                  </h3>
                  <div className="flex flex-col items-center py-2 space-y-3">
                    <div className="relative w-28 h-28">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="56" cy="56" r="48" strokeWidth="6" stroke="rgba(234, 88, 12, 0.1)" fill="transparent" />
                        <circle
                          cx="56" cy="56" r="48" strokeWidth="6" stroke="#EA580C" fill="transparent"
                          strokeDasharray="301.59"
                          strokeDashoffset={301.59 * (1 - qualityScore / 100)}
                          className="transition-all duration-500 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center font-sans">
                        <span className="text-2xl font-black text-slate-800 dark:text-white">{qualityScore}</span>
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Index Score</span>
                      </div>
                    </div>
                    
                    <p className="text-[10px] text-slate-400 text-center leading-normal">
                      जैसे-जैसे आप सामग्री की लंबाई बढ़ाएंगे, चित्र जोड़ेंगे और संपादक चेकलिस्ट की सभी शर्तों को पूरा करेंगे, आपका गुणवत्ता सूचकांक स्कोर सुधरेगा।
                    </p>
                  </div>
                </GlassCard>

                {/* AI Writing assistant */}
                <GlassCard glow="blue" className="space-y-4">
                  <h3 className="font-serif text-sm font-bold text-primary border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>एआई लेखन सहायक (AI Assistant)</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => triggerAiTool("title_lab", "शीर्षक प्रयोगशाला के १० सर्वश्रेष्ठ शीर्षक सुझाव दें।")}
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-primary/40 rounded-xl transition-all cursor-pointer text-left flex items-center space-x-1"
                    >
                      <span>💡 शीर्षक प्रयोगशाला</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerAiTool("writing_guru", "लेखन गुरु विश्लेषण कर भाषा, पठनीयता और सुधार सुझाव प्रदान करें।")}
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-primary/40 rounded-xl transition-all cursor-pointer text-left flex items-center space-x-1"
                    >
                      <span>✍️ लेखन गुरु</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerAiTool("grammar", "व्याकरण सहायक के रूप में वर्तनी और वाक्य संरचना की त्रुटियां बताएं।")}
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-primary/40 rounded-xl transition-all cursor-pointer text-left flex items-center space-x-1"
                    >
                      <span>✓ व्याकरण सहायक</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerAiTool("fact_check", "सत्यता जाँच करके तथ्यों और दावों का सारणीबद्ध विवरण दें।")}
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-primary/40 rounded-xl transition-all cursor-pointer text-left flex items-center space-x-1"
                    >
                      <span>🔬 सत्यता जाँच</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerAiTool("research", "अनुसंधान संदर्भ और प्रमुख संबंधित रिपोर्टें बताएं।")}
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-primary/40 rounded-xl transition-all cursor-pointer text-left flex items-center space-x-1"
                    >
                      <span>📚 अनुसंधान संदर्भ</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerAiTool("interview", "विशेषज्ञों से पूछे जाने योग्य ५ महत्वपूर्ण साक्षात्कार प्रश्न बताएं।")}
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-primary/40 rounded-xl transition-all cursor-pointer text-left flex items-center space-x-1"
                    >
                      <span>🎙️ साक्षात्कार प्रश्न</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerAiTool("detailed_summary", "लेख का विस्तृत सारांश जनरेट करें।")}
                      className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-primary/40 rounded-xl transition-all cursor-pointer text-left flex items-center space-x-1 col-span-2"
                    >
                      <span>📝 सारांश जनरेटर</span>
                    </button>
                  </div>

                  {/* AI Results rendering box */}
                  {(aiLoading || aiResult) && (
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800 rounded-xl text-[10.5px] leading-relaxed font-serif space-y-2">
                      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-1.5">
                        <span className="font-bold text-primary">एआई परिणाम</span>
                        {aiLoading && <RotateCw className="w-3.5 h-3.5 text-primary animate-spin" />}
                      </div>
                      
                      {activeAiTool === "title_lab" && typeof aiResult === "string" ? (
                        <div className="space-y-1">
                          {aiResult.split("\n").map((t, idx) => {
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
                        <p className="whitespace-pre-line">{aiResult}</p>
                      )}
                    </div>
                  )}
                </GlassCard>

                {/* Editorial Guidelines checklist accordion */}
                <GlassCard glow="none" className="space-y-4">
                  <h3 className="font-serif text-sm font-bold text-primary border-b border-slate-200 dark:border-slate-800 pb-2">
                    संपादकीय मार्गदर्शिका सूची (Checklist)
                  </h3>

                  <div className="space-y-3 font-serif">
                    {/* Item 1 */}
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-[11px]">
                      <button
                        type="button"
                        onClick={() => setAccordionOpen({ ...accordionOpen, original: !accordionOpen.original })}
                        className="w-full flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 cursor-pointer font-bold"
                      >
                        <span>१. मौलिकता (Originality)</span>
                        {accordionOpen.original ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      
                      {accordionOpen.original && (
                        <div className="p-3 bg-white dark:bg-slate-950 space-y-2 border-t border-slate-200 dark:border-slate-800 text-[10.5px]">
                          <p className="text-slate-400">सभी रचनाएं लेखक की मौलिक सोच होनी चाहिए। किसी अन्य मंच से कॉपी की गई सामग्री प्रतिबंधित है।</p>
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

                    {/* Item 2 */}
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-[11px]">
                      <button
                        type="button"
                        onClick={() => setAccordionOpen({ ...accordionOpen, copyright: !accordionOpen.copyright })}
                        className="w-full flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 cursor-pointer font-bold"
                      >
                        <span>२. कॉपीराइट नियम (Copyrights)</span>
                        {accordionOpen.copyright ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      
                      {accordionOpen.copyright && (
                        <div className="p-3 bg-white dark:bg-slate-950 space-y-2 border-t border-slate-200 dark:border-slate-800 text-[10.5px]">
                          <p className="text-slate-400">उपयोग किए गए चित्रों और तथ्यों पर किसी अन्य संस्थान के कॉपीराइट का उल्लंघन न हो।</p>
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

                    {/* Item 3 */}
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-[11px]">
                      <button
                        type="button"
                        onClick={() => setAccordionOpen({ ...accordionOpen, styleGuide: !accordionOpen.styleGuide })}
                        className="w-full flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 cursor-pointer font-bold"
                      >
                        <span>३. लेखन शैली (Writing Style)</span>
                        {accordionOpen.styleGuide ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      
                      {accordionOpen.styleGuide && (
                        <div className="p-3 bg-white dark:bg-slate-950 space-y-2 border-t border-slate-200 dark:border-slate-800 text-[10.5px]">
                          <p className="text-slate-400">युवाक्षर की भाषा मर्यादित, सारगर्भित और वैचारिक होनी चाहिए। संप्रदाय या वर्ग विशेष के विरुद्ध अपशब्द वर्जित हैं।</p>
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

                    {/* Item 4 */}
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-[11px]">
                      <button
                        type="button"
                        onClick={() => setAccordionOpen({ ...accordionOpen, citations: !accordionOpen.citations })}
                        className="w-full flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900 cursor-pointer font-bold"
                      >
                        <span>४. संदर्भ और प्रमाण (Citations)</span>
                        {accordionOpen.citations ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      
                      {accordionOpen.citations && (
                        <div className="p-3 bg-white dark:bg-slate-950 space-y-2 border-t border-slate-200 dark:border-slate-800 text-[10.5px]">
                          <p className="text-slate-400">वैज्ञानिक तथ्यों अथवा सांख्यिकी के संदर्भ में मूल स्रोतों (स्रोतों/रिपोर्टों) का विवरण दें।</p>
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
                </GlassCard>

                {/* Draft versions restore history */}
                {draftHistory.length > 0 && (
                  <GlassCard glow="none" className="space-y-4">
                    <h3 className="font-serif text-sm font-bold text-primary border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center space-x-2">
                      <History className="w-4 h-4" />
                      <span>ड्राफ्ट इतिहास (Versions)</span>
                    </h3>
                    <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
                      {draftHistory.map(ver => (
                        <div key={ver.id} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-[10px] font-sans flex justify-between items-center bg-white dark:bg-slate-950">
                          <div>
                            <p className="font-bold text-slate-800 dark:text-slate-200 font-serif truncate max-w-[150px]">{ver.title || "बिना शीर्षक का ड्राफ्ट"}</p>
                            <span className="text-slate-400 block mt-0.5">{ver.timestamp} | शब्द: {ver.wordCount}</span>
                          </div>
                          <button
                            onClick={() => restoreDraft(ver)}
                            className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 rounded-lg font-bold cursor-pointer"
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

          {/* TAB 2: MULTI-VIEWPORT PREVIEW */}
          {activeTab === "preview" && (
            <div className="space-y-6">
              
              {/* Viewport Toggles bar */}
              <div className="flex justify-center space-x-4 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-[10px] font-bold font-serif max-w-sm mx-auto">
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
              </div>

              {/* Viewport Frame */}
              <div className="flex justify-center bg-slate-100 dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-x-auto min-h-[600px]">
                <div
                  className="bg-white dark:bg-[#0A0F1D] shadow-2xl transition-all duration-300 rounded-2xl border border-slate-200 overflow-y-auto"
                  style={{
                    width: previewViewport === "mobile" ? "375px" : previewViewport === "tablet" ? "768px" : "100%",
                    maxWidth: "1000px",
                    height: "800px"
                  }}
                >
                  {/* Article Premium Magazine Render inside viewport */}
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
                        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 to-primary/40" />
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
                      <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 p-3 rounded-2xl flex justify-between items-center text-[10px] text-slate-400 font-serif leading-none">
                        <span>लेखक: <strong>{authorName}</strong></span>
                        <span>श्रेणी: <strong>{category}</strong></span>
                        <span>शब्द: <strong>{stats.words}</strong></span>
                        <span>पढ़ने का समय: <strong>{stats.time} मिनट</strong></span>
                      </div>
                    </div>

                    {/* Article Content Render body */}
                    <div className="px-6 md:px-8 pb-12 space-y-4 font-serif text-sm leading-relaxed max-w-[800px] mx-auto text-slate-800 dark:text-slate-200">
                      
                      {/* Decorative Drop Cap for first paragraph */}
                      {content.trim() ? (
                        <div className="space-y-4 font-serif text-slate-800 dark:text-slate-200">
                          {/* Split text into paragraphs */}
                          {content.split(/\n\n+/).map((pText, pIdx) => {
                            if (pIdx === 0 && pText.trim().length > 0) {
                              const firstChar = pText.trim()[0];
                              const restText = pText.trim().slice(1);
                              return (
                                <p key={pIdx} className="first-letter:float-left first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:mr-2.5 first-letter:mt-1 font-serif text-[15px] leading-relaxed">
                                  {firstChar}{restText}
                                </p>
                              );
                            }
                            
                            // Render Pull quotes
                            if (pText.trim().startsWith(">")) {
                              return (
                                <blockquote key={pIdx} className="border-l-4 border-primary pl-4 py-2 italic bg-primary/5 text-slate-700 dark:text-slate-300 rounded-r-xl my-4 text-[14px]">
                                  {pText.trim().replace(/^>\s*/, "")}
                                </blockquote>
                              );
                            }
                            
                            // Render headers
                            if (pText.trim().startsWith("##")) {
                              return (
                                <h3 key={pIdx} className="text-lg font-bold text-primary border-b border-slate-100 dark:border-slate-800 pb-1 mt-6 font-serif">
                                  {pText.trim().replace(/^##\s*/, "")}
                                </h3>
                              );
                            }

                            return (
                              <p key={pIdx} className="text-[15px] leading-relaxed font-serif">
                                {pText}
                              </p>
                            );
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
                            <span className="inline-block bg-slate-100 dark:bg-slate-900 border border-slate-200 text-[8px] text-slate-500 font-mono px-2 py-0.5 rounded mt-1.5">
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
                    {submittedList.map(sub => (
                      <div
                        key={sub.id}
                        className="bg-slate-50 dark:bg-[#0F172A]/10 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4 transition-all"
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

                        {/* Interactive Visual Stepper Timeline */}
                        <div className="pt-2">
                          <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mb-4">रचना समीक्षा यात्रा (Submission Stepper Timeline)</p>
                          <div className="grid grid-cols-4 gap-1 relative text-center">
                            
                            {/* Horizontal Line background */}
                            <div className="absolute top-2.5 left-[12%] right-[12%] h-0.5 bg-slate-200 dark:bg-slate-800 -z-0" />
                            <div 
                              className="absolute top-2.5 left-[12%] h-0.5 bg-primary -z-0 transition-all duration-500" 
                              style={{ width: `${(sub.timelineStep - 1) * 25.33}%` }}
                            />

                            {/* Step 1 */}
                            <div className="flex flex-col items-center z-10">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center border font-sans text-[10px] font-bold ${
                                sub.timelineStep >= 1
                                  ? "bg-primary text-white border-primary"
                                  : "bg-white dark:bg-slate-900 border-slate-300 text-slate-400"
                              }`}>
                                1
                              </div>
                              <span className="text-[9px] font-serif font-bold mt-1.5 text-slate-700 dark:text-slate-300">सबमिट की गई</span>
                            </div>

                            {/* Step 2 */}
                            <div className="flex flex-col items-center z-10">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center border font-sans text-[10px] font-bold ${
                                sub.timelineStep >= 2
                                  ? "bg-primary text-white border-primary"
                                  : "bg-white dark:bg-slate-900 border-slate-300 text-slate-400"
                              }`}>
                                2
                              </div>
                              <span className="text-[9px] font-serif font-bold mt-1.5 text-slate-700 dark:text-slate-300">संपादकीय समीक्षा</span>
                            </div>

                            {/* Step 3 */}
                            <div className="flex flex-col items-center z-10">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center border font-sans text-[10px] font-bold ${
                                sub.timelineStep >= 3
                                  ? "bg-primary text-white border-primary"
                                  : "bg-white dark:bg-slate-900 border-slate-300 text-slate-400"
                              }`}>
                                3
                              </div>
                              <span className="text-[9px] font-serif font-bold mt-1.5 text-slate-700 dark:text-slate-300">प्रूफरीडिंग</span>
                            </div>

                            {/* Step 4 */}
                            <div className="flex flex-col items-center z-10">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center border font-sans text-[10px] font-bold ${
                                sub.timelineStep >= 4
                                  ? "bg-primary text-white border-primary"
                                  : "bg-white dark:bg-slate-900 border-slate-300 text-slate-400"
                              }`}>
                                4
                              </div>
                              <span className="text-[9px] font-serif font-bold mt-1.5 text-slate-700 dark:text-slate-300">प्रकाशित लाइव</span>
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
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded border border-slate-200 dark:border-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleBecomeAuthorSubmit} className="space-y-4 text-xs font-serif">
              <div className="space-y-1">
                <label className="text-slate-500 font-medium">लेखक परिचय (Author Bio)</label>
                <textarea
                  rows={4}
                  placeholder="अपना संक्षिप्त परिचय लिखें, उदा. 'स्वतंत्र पत्रकार और राजनीतिक विश्लेषक। इलाहाबाद विश्वविद्यालय से स्नातक।'"
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
                  placeholder="उदा. https://images.unsplash.com/photo-..."
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
                  <option value="सामयिक">राष्ट्रीय एवं सामयिक मुद्दे</option>
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

    </div>
  );
}
