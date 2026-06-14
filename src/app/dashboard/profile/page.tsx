"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft,
  User,
  Image,
  BookOpen,
  Briefcase,
  GraduationCap,
  Award,
  Calendar,
  FileText,
  Lock,
  MapPin,
  Eye,
  Plus,
  Trash2,
  CheckCircle,
  Laptop,
  Smartphone,
  Sparkles,
  Save,
  Globe,
  Upload
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import GlassCard from "@/components/yuvakshar/GlassCard";

export default function ProfileDashboardEditor() {
  const router = useRouter();
  const { 
    currentUser, 
    updateUserProfile, 
    addTimelineEvent, 
    deleteTimelineEvent, 
    addPortfolioItem, 
    deletePortfolioItem, 
    addAchievement, 
    deleteAchievement,
    openAuthModal,
    users
  } = useCms();

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      openAuthModal(
        () => {},
        "प्रोफ़ाइल संपादित करने के लिए कृपया लॉग इन करें!"
      );
      router.push("/");
    }
  }, [currentUser, router]);

  // Form Fields State
  const [name, setName] = useState(currentUser?.name || "");
  const [slugInput, setSlugInput] = useState(currentUser?.slug || "");
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url || "");
  const [coverBanner, setCoverBanner] = useState(currentUser?.cover_banner || "");
  const [designation, setDesignation] = useState(currentUser?.designation || "");
  const [currentRole, setCurrentRole] = useState(currentUser?.current_role || "");
  const [institution, setInstitution] = useState(currentUser?.institution || "");
  const [location, setLocation] = useState(currentUser?.location || "");
  const [bio, setBio] = useState(currentUser?.bio || "");
  
  // Lists
  const [expertiseTags, setExpertiseTags] = useState(currentUser?.expertise_tags?.join(", ") || "");
  const [orcidId, setOrcidId] = useState(currentUser?.orcid_id || "");
  const [googleScholarUrl, setGoogleScholarUrl] = useState(currentUser?.google_scholar_url || "");
  const [academicCredentials, setAcademicCredentials] = useState(currentUser?.academic_credentials?.join(", ") || "");

  // Social Links
  const [twitter, setTwitter] = useState(currentUser?.social_links?.twitter || "");
  const [facebook, setFacebook] = useState(currentUser?.social_links?.facebook || "");
  const [linkedin, setLinkedin] = useState(currentUser?.social_links?.linkedin || "");
  const [youtube, setYoutube] = useState(currentUser?.social_links?.youtube || "");

  // Accordion active state
  const [activeAccordion, setActiveAccordion] = useState<"basic" | "academic" | "social" | "timeline" | "portfolio" | "achievements">("basic");
  
  // Preview Mode
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [isSaving, setIsSaving] = useState(false);

  // New Item states
  const [newMilestone, setNewMilestone] = useState({ title: "", description: "", date: "", type: "milestone" });
  const [newDocument, setNewDocument] = useState({ name: "", url: "#", type: "research_paper" as any, is_public: true });
  const [newAward, setNewAward] = useState({ title: "", description: "", year: "" });

  // Sync inputs if user changes
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || "");
      setSlugInput(currentUser.slug || "");
      setAvatarUrl(currentUser.avatar_url || "");
      setCoverBanner(currentUser.cover_banner || "");
      setDesignation(currentUser.designation || "");
      setCurrentRole(currentUser.current_role || "");
      setInstitution(currentUser.institution || "");
      setLocation(currentUser.location || "");
      setBio(currentUser.bio || "");
      setExpertiseTags(currentUser.expertise_tags?.join(", ") || "");
      setOrcidId(currentUser.orcid_id || "");
      setGoogleScholarUrl(currentUser.google_scholar_url || "");
      setAcademicCredentials(currentUser.academic_credentials?.join(", ") || "");
      setTwitter(currentUser.social_links?.twitter || "");
      setFacebook(currentUser.social_links?.facebook || "");
      setLinkedin(currentUser.social_links?.linkedin || "");
      setYoutube(currentUser.social_links?.youtube || "");
    }
  }, [currentUser]);

  if (!currentUser) return null;

  // Role permissions check
  // Only Owner, Admin, Editor-in-Chief can edit slugs
  const canEditSlug = ["Owner", "Admin", "Editor-in-Chief"].includes(currentUser.role || "");

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updatedData = {
      name,
      slug: canEditSlug ? slugInput : currentUser.slug,
      avatar_url: avatarUrl,
      cover_banner: coverBanner,
      designation,
      current_role: currentRole,
      institution,
      location,
      bio,
      orcid_id: orcidId,
      google_scholar_url: googleScholarUrl,
      expertise_tags: expertiseTags.split(",").map(t => t.trim()).filter(Boolean),
      academic_credentials: academicCredentials.split(",").map(c => c.trim()).filter(Boolean),
      social_links: {
        twitter,
        facebook,
        linkedin,
        youtube
      }
    };

    setTimeout(async () => {
      await updateUserProfile(updatedData);
      setIsSaving(false);
      alert("प्रोफ़ाइल विवरण सफलतापूर्वक सुरक्षित कर लिए गए हैं!");
    }, 800);
  };

  const handleAddTimeline = async () => {
    if (!newMilestone.title || !newMilestone.date) {
      alert("कृपया शीर्षक और तिथि भरें!");
      return;
    }
    await addTimelineEvent(currentUser.id, newMilestone);
    setNewMilestone({ title: "", description: "", date: "", type: "milestone" });
  };

  const handleAddDocument = async () => {
    if (!newDocument.name) {
      alert("कृपया दस्तावेज़ का नाम भरें!");
      return;
    }
    await addPortfolioItem(currentUser.id, newDocument);
    setNewDocument({ name: "", url: "#", type: "research_paper", is_public: true });
  };

  const handleAddAchievementItem = async () => {
    if (!newAward.title || !newAward.year) {
      alert("कृपया शीर्षक और वर्ष भरें!");
      return;
    }
    await addAchievement(currentUser.id, newAward);
    setNewAward({ title: "", description: "", year: "" });
  };

  // Mock Uploads Helper
  const triggerImageUploadSim = (type: "avatar" | "banner") => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = (e: any) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          if (type === "avatar") {
            setAvatarUrl(reader.result as string);
          } else {
            setCoverBanner(reader.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  };

  // Live profile preview calculations
  const previewProfile = {
    ...currentUser,
    name,
    slug: slugInput,
    avatar_url: avatarUrl,
    cover_banner: coverBanner,
    designation,
    current_role: currentRole,
    institution,
    location,
    bio,
    orcid_id: orcidId,
    google_scholar_url: googleScholarUrl,
    expertise_tags: expertiseTags.split(",").map(t => t.trim()).filter(Boolean),
    academic_credentials: academicCredentials.split(",").map(c => c.trim()).filter(Boolean),
    social_links: { twitter, facebook, linkedin, youtube }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0A0F1D] text-slate-800 dark:text-slate-200 transition-colors duration-300">
      
      {/* Header Bar */}
      <div className="bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 px-6 py-4 sticky top-0 z-30 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-serif">रचनाकार हब</span>
            <h1 className="text-sm font-bold font-serif text-slate-850 dark:text-white leading-none">प्रोफ़ाइल संपादक (Profile Identity Editor)</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href={`/authors/${currentUser.slug}`}
            className="text-xs font-serif font-bold text-slate-500 hover:text-primary transition-colors pr-2 border-r border-slate-200 dark:border-slate-800 hidden sm:inline"
          >
            पब्लिक प्रोफ़ाइल देखें
          </Link>
          <button
            onClick={handleProfileSave}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-xl text-xs font-bold font-serif flex items-center gap-1.5 cursor-pointer shadow-sm disabled:bg-slate-200 dark:disabled:bg-slate-800"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? "सुरक्षित किया जा रहा है..." : "सुरक्षित करें"}</span>
          </button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Input Forms Editor */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Editor form accordions */}
            <div className="space-y-4">
              
              {/* Accordion 1: Basic Profile Details */}
              <GlassCard glow="none" className="border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === "basic" ? "" as any : "basic")}
                  className="w-full px-5 py-4 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40 text-left border-b border-slate-100 dark:border-slate-850 font-serif"
                >
                  <span className="font-bold text-slate-800 dark:text-white text-xs flex items-center gap-2">
                    <User className="w-4.5 h-4.5 text-primary" />
                    <span>१. बुनियादी जानकारी (Basic Profile Details)</span>
                  </span>
                  <span className="text-xs text-slate-400 font-bold">{activeAccordion === "basic" ? "समेटें" : "खोलें"}</span>
                </button>

                {activeAccordion === "basic" && (
                  <div className="p-5 space-y-4 font-serif text-xs">
                    {/* Cover & Avatar Selector */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-slate-450 block font-medium">प्रोफ़ाइल चित्र (Avatar URL)</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            placeholder="https://image-url..."
                            className="flex-grow bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 text-[11px] focus:outline-none"
                          />
                          <button 
                            type="button"
                            onClick={() => triggerImageUploadSim("avatar")}
                            className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-750"
                          >
                            <Upload className="w-4 h-4 text-slate-500" />
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-slate-450 block font-medium">कवर बैनर (Cover URL)</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={coverBanner}
                            onChange={(e) => setCoverBanner(e.target.value)}
                            placeholder="https://image-url..."
                            className="flex-grow bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 rounded-xl p-2.5 text-[11px] focus:outline-none"
                          />
                          <button 
                            type="button"
                            onClick={() => triggerImageUploadSim("banner")}
                            className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-755"
                          >
                            <Upload className="w-4 h-4 text-slate-500" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-slate-450 block font-medium">नाम (Name)</label>
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 focus:outline-none"
                        />
                      </div>

                      {/* Slug Editor (Locked for standard Authors) */}
                      <div className="space-y-1.5 relative">
                        <label className="text-slate-450 block font-medium flex items-center gap-1.5">
                          <span>संबद्ध हैंडल (Slug Handle)</span>
                          {!canEditSlug && <span title="केवल एडमिन इसे संपादित कर सकते हैं"><Lock className="w-3 h-3 text-slate-400" /></span>}
                        </label>
                        <input 
                          type="text" 
                          value={slugInput}
                          onChange={(e) => canEditSlug && setSlugInput(e.target.value)}
                          disabled={!canEditSlug}
                          className={`w-full border rounded-xl p-2.5 focus:outline-none ${
                            canEditSlug 
                              ? "bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-855" 
                              : "bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-850 text-slate-400 cursor-not-allowed"
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-slate-450 block font-medium">पदनाम (Designation)</label>
                        <input 
                          type="text" 
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          placeholder="उदा. सह-संपादक एवं वैचारिक लेखक"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-slate-450 block font-medium">विभाग/भूमिका (Department Role)</label>
                        <input 
                          type="text" 
                          value={currentRole}
                          onChange={(e) => setCurrentRole(e.target.value)}
                          placeholder="उदा. संपादकीय बोर्ड सदस्य"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 rounded-xl p-2.5 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-slate-450 block font-medium">संबद्ध संस्था (Institution)</label>
                        <input 
                          type="text" 
                          value={institution}
                          onChange={(e) => setInstitution(e.target.value)}
                          placeholder="उदा. युवाक्षर मीडिया संस्थान"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-slate-455 block font-medium">स्थान (Location)</label>
                        <input 
                          type="text" 
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="उदा. नई दिल्ली, भारत"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 rounded-xl p-2.5 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-455 block font-medium">बायो (Biography)</label>
                      <textarea 
                        rows={3}
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="अपने परिचय और कार्यों का संक्षिप्त विवरण..."
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 focus:outline-none leading-relaxed"
                      />
                    </div>
                  </div>
                )}
              </GlassCard>

              {/* Accordion 2: Academic & Credentials */}
              <GlassCard glow="none" className="border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === "academic" ? "" as any : "academic")}
                  className="w-full px-5 py-4 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40 text-left border-b border-slate-100 dark:border-slate-850 font-serif"
                >
                  <span className="font-bold text-slate-800 dark:text-white text-xs flex items-center gap-2">
                    <GraduationCap className="w-4.5 h-4.5 text-primary" />
                    <span>२. शैक्षणिक एवं शोध परिचय (Academic & Identity)</span>
                  </span>
                  <span className="text-xs text-slate-400 font-bold">{activeAccordion === "academic" ? "समेटें" : "खोलें"}</span>
                </button>

                {activeAccordion === "academic" && (
                  <div className="p-5 space-y-4 font-serif text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-slate-450 block font-medium">ORCID ID (Academic Link)</label>
                        <input 
                          type="text" 
                          value={orcidId}
                          onChange={(e) => setOrcidId(e.target.value)}
                          placeholder="उदा. 0000-0002-1825-0097"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-slate-455 block font-medium">Google Scholar URL</label>
                        <input 
                          type="text" 
                          value={googleScholarUrl}
                          onChange={(e) => setGoogleScholarUrl(e.target.value)}
                          placeholder="विद्वान प्रोफ़ाइल का लिंक..."
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 rounded-xl p-2.5 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-455 block font-medium">विशेषज्ञता क्षेत्र (Expertise Tags) - कोमा से पृथक करें</label>
                      <input 
                        type="text" 
                        value={expertiseTags}
                        onChange={(e) => setExpertiseTags(e.target.value)}
                        placeholder="उदा. साहित्य, इतिहास, राजनीतिक विमर्श, पर्यावरण"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-slate-455 block font-medium">शैक्षणिक क्रेडेंशियल्स (Degrees) - कोमा से पृथक करें</label>
                      <input 
                        type="text" 
                        value={academicCredentials}
                        onChange={(e) => setAcademicCredentials(e.target.value)}
                        placeholder="उदा. पीएचडी हिंदी साहित्य (JNU), एम.ए. जनसंचार"
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 focus:outline-none"
                      />
                    </div>


                  </div>
                )}
              </GlassCard>

              {/* Accordion 3: Social Profile Links */}
              <GlassCard glow="none" className="border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === "social" ? "" as any : "social")}
                  className="w-full px-5 py-4 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40 text-left border-b border-slate-100 dark:border-slate-850 font-serif"
                >
                  <span className="font-bold text-slate-800 dark:text-white text-xs flex items-center gap-2">
                    <Globe className="w-4.5 h-4.5 text-primary" />
                    <span>३. सोशल प्रोफाइल लिंक्स (Social Links)</span>
                  </span>
                  <span className="text-xs text-slate-400 font-bold">{activeAccordion === "social" ? "समेटें" : "खोलें"}</span>
                </button>

                {activeAccordion === "social" && (
                  <div className="p-5 space-y-4 font-serif text-xs">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-slate-450 block font-medium">Twitter Handle</label>
                        <input 
                          type="text" 
                          value={twitter}
                          onChange={(e) => setTwitter(e.target.value)}
                          placeholder="उदा. https://twitter.com/username"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-slate-455 block font-medium">Linkedin Profile URL</label>
                        <input 
                          type="text" 
                          value={linkedin}
                          onChange={(e) => setLinkedin(e.target.value)}
                          placeholder="उदा. https://linkedin.com/in/username"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 rounded-xl p-2.5 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-slate-450 block font-medium">Facebook Profile URL</label>
                        <input 
                          type="text" 
                          value={facebook}
                          onChange={(e) => setFacebook(e.target.value)}
                          placeholder="उदा. https://facebook.com/username"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl p-2.5 focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-slate-455 block font-medium">YouTube Channel URL</label>
                        <input 
                          type="text" 
                          value={youtube}
                          onChange={(e) => setYoutube(e.target.value)}
                          placeholder="उदा. https://youtube.com/c/channelname"
                          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 rounded-xl p-2.5 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </GlassCard>

              {/* Accordion 4: Timeline Milestones (Interactive Ledger) */}
              <GlassCard glow="none" className="border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === "timeline" ? "" as any : "timeline")}
                  className="w-full px-5 py-4 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40 text-left border-b border-slate-100 dark:border-slate-850 font-serif"
                >
                  <span className="font-bold text-slate-800 dark:text-white text-xs flex items-center gap-2">
                    <Calendar className="w-4.5 h-4.5 text-primary" />
                    <span>४. विकास यात्रा मील के पत्थर (Timeline Ledger)</span>
                  </span>
                  <span className="text-xs text-slate-400 font-bold">{activeAccordion === "timeline" ? "समेटें" : "खोलें"}</span>
                </button>

                {activeAccordion === "timeline" && (
                  <div className="p-5 space-y-4 font-serif text-xs">
                    {/* Add Milestone Form */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-200/60 dark:border-slate-850 rounded-xl space-y-3">
                      <span className="font-bold text-[11px] text-primary block">नया मील का पत्थर जोड़ें (Add Milestone)</span>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1 col-span-2">
                          <label className="text-slate-400 text-[10px]">मील का पत्थर शीर्षक (Title)</label>
                          <input 
                            type="text" 
                            value={newMilestone.title}
                            onChange={(e) => setNewMilestone({...newMilestone, title: e.target.value})}
                            placeholder="उदा. युवाक्षर में शामिल हुए"
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-[11px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[10px]">वर्ष/तिथि (Date)</label>
                          <input 
                            type="text" 
                            value={newMilestone.date}
                            onChange={(e) => setNewMilestone({...newMilestone, date: e.target.value})}
                            placeholder="उदा. २०२४"
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-[11px]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px]">विवरण (Description)</label>
                        <input 
                          type="text" 
                          value={newMilestone.description}
                          onChange={(e) => setNewMilestone({...newMilestone, description: e.target.value})}
                          placeholder="संक्षिप्त विवरण दर्ज करें..."
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-[11px]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleAddTimeline}
                        className="bg-primary hover:bg-primary/95 text-white font-bold py-2 px-4 rounded-xl text-[10px] cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>मील का पत्थर जोड़ें</span>
                      </button>
                    </div>

                    {/* Exisiting list */}
                    <div className="space-y-2.5">
                      <span className="font-bold text-[10px] text-slate-450 uppercase tracking-wide block">वर्तमान यात्रा पड़ाव</span>
                      {!currentUser.timeline || currentUser.timeline.length === 0 ? (
                        <p className="text-slate-400 text-[10px]">कोई मील का पत्थर उपलब्ध नहीं है।</p>
                      ) : (
                        currentUser.timeline.map((event) => (
                          <div key={event.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-3 rounded-xl">
                            <div>
                              <span className="text-[10px] text-primary font-bold">{event.date} • </span>
                              <span className="font-bold text-slate-800 dark:text-white">{event.title}</span>
                              <p className="text-[10px] text-slate-450 mt-0.5 leading-snug">{event.description}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteTimelineEvent(currentUser.id, event.id)}
                              className="text-red-500 hover:text-red-650 cursor-pointer p-1.5 rounded-lg hover:bg-red-500/5 shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </GlassCard>

              {/* Accordion 5: Portfolio Documents */}
              <GlassCard glow="none" className="border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === "portfolio" ? "" as any : "portfolio")}
                  className="w-full px-5 py-4 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40 text-left border-b border-slate-100 dark:border-slate-850 font-serif"
                >
                  <span className="font-bold text-slate-800 dark:text-white text-xs flex items-center gap-2">
                    <FileText className="w-4.5 h-4.5 text-primary" />
                    <span>५. शोध पत्र एवं दस्तावेज़ (Portfolio Repository)</span>
                  </span>
                  <span className="text-xs text-slate-400 font-bold">{activeAccordion === "portfolio" ? "समेटें" : "खोलें"}</span>
                </button>

                {activeAccordion === "portfolio" && (
                  <div className="p-5 space-y-4 font-serif text-xs">
                    {/* Add document Form */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-200/60 dark:border-slate-850 rounded-xl space-y-3">
                      <span className="font-bold text-[11px] text-primary block">नया अकादमिक दस्तावेज़ जोड़ें (Add Document)</span>
                      
                      <div className="space-y-1.5">
                        <label className="text-slate-400 text-[10px]">दस्तावेज़ का नाम (Document Title)</label>
                        <input 
                          type="text" 
                          value={newDocument.name}
                          onChange={(e) => setNewDocument({...newDocument, name: e.target.value})}
                          placeholder="उदा. भारतीय स्वतंत्र पत्रकारिता पर शोध पत्र"
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-[11px]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[10px]">दस्तावेज़ प्रकार (Type)</label>
                          <select
                            value={newDocument.type}
                            onChange={(e) => setNewDocument({...newDocument, type: e.target.value as any})}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-[11px] cursor-pointer"
                          >
                            <option value="research_paper">शोध पत्र (Research Paper)</option>
                            <option value="book">पुस्तक (Book/Monograph)</option>
                            <option value="report">विशेष रिपोर्ट (Special Report)</option>
                            <option value="white_paper">श्वेत पत्र (White Paper)</option>
                            <option value="resume">जीवन वृत्त (Resume)</option>
                            <option value="other">अन्य दस्तावेज़ (Other)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-slate-400 text-[10px]">पब्लिक उपलब्धता</label>
                          <select
                            value={newDocument.is_public ? "true" : "false"}
                            onChange={(e) => setNewDocument({...newDocument, is_public: e.target.value === "true"})}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-[11px] cursor-pointer"
                          >
                            <option value="true">सार्वजनिक (Public)</option>
                            <option value="false">निजी (Private)</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddDocument}
                        className="bg-primary hover:bg-primary/95 text-white font-bold py-2 px-4 rounded-xl text-[10px] cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>पोर्टफोलियो में जोड़ें</span>
                      </button>
                    </div>

                    {/* Exisiting list */}
                    <div className="space-y-2.5">
                      <span className="font-bold text-[10px] text-slate-450 uppercase tracking-wide block">वर्तमान संलग्नक (Attachments Ledger)</span>
                      {!currentUser.portfolio || currentUser.portfolio.length === 0 ? (
                        <p className="text-slate-400 text-[10px]">कोई दस्तावेज़ संलग्न नहीं है।</p>
                      ) : (
                        currentUser.portfolio.map((item) => (
                          <div key={item.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-3 rounded-xl">
                            <div>
                              <span className="text-[8px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold px-1.5 py-0.5 rounded uppercase font-sans">
                                {item.type.replace("_", " ")}
                              </span>
                              <span className="font-bold text-slate-800 dark:text-white block mt-1 leading-snug">{item.name}</span>
                              <span className="text-[9px] text-slate-400 font-serif">स्थिति: {item.is_public ? "सार्वजनिक" : "गोपनीय"}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => deletePortfolioItem(currentUser.id, item.id)}
                              className="text-red-500 hover:text-red-650 cursor-pointer p-1.5 rounded-lg hover:bg-red-500/5 shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </GlassCard>

              {/* Accordion 6: Achievements */}
              <GlassCard glow="none" className="border border-slate-200 dark:border-slate-800/80 rounded-2xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setActiveAccordion(activeAccordion === "achievements" ? "" as any : "achievements")}
                  className="w-full px-5 py-4 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40 text-left border-b border-slate-100 dark:border-slate-850 font-serif"
                >
                  <span className="font-bold text-slate-800 dark:text-white text-xs flex items-center gap-2">
                    <Award className="w-4.5 h-4.5 text-primary" />
                    <span>६. पुरस्कार एवं मान-सम्मान (Achievements & Awards)</span>
                  </span>
                  <span className="text-xs text-slate-400 font-bold">{activeAccordion === "achievements" ? "समेटें" : "खोलें"}</span>
                </button>

                {activeAccordion === "achievements" && (
                  <div className="p-5 space-y-4 font-serif text-xs">
                    {/* Add Award Form */}
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-200/60 dark:border-slate-850 rounded-xl space-y-3">
                      <span className="font-bold text-[11px] text-primary block">नया पुरस्कार/सम्मान दर्ज करें (Add Achievement)</span>
                      
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1 col-span-2">
                          <label className="text-slate-400 text-[10px]">पुरस्कार का शीर्षक (Award Title)</label>
                          <input 
                            type="text" 
                            value={newAward.title}
                            onChange={(e) => setNewAward({...newAward, title: e.target.value})}
                            placeholder="उदा. भाषाई पत्रकारिता सम्मान"
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-[11px]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 text-[10px]">वर्ष (Year)</label>
                          <input 
                            type="text" 
                            value={newAward.year}
                            onChange={(e) => setNewAward({...newAward, year: e.target.value})}
                            placeholder="उदा. २०२४"
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-[11px]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 text-[10px]">विवरण (Description)</label>
                        <input 
                          type="text" 
                          value={newAward.description}
                          onChange={(e) => setNewAward({...newAward, description: e.target.value})}
                          placeholder="प्रदाता संस्था या संक्षिप्त विवरण..."
                          className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-[11px]"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleAddAchievementItem}
                        className="bg-primary hover:bg-primary/95 text-white font-bold py-2 px-4 rounded-xl text-[10px] cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>उपलब्धि जोड़ें</span>
                      </button>
                    </div>

                    {/* Exisiting list */}
                    <div className="space-y-2.5">
                      <span className="font-bold text-[10px] text-slate-450 uppercase tracking-wide block">वर्तमान उपलब्धियां</span>
                      {!currentUser.achievements || currentUser.achievements.length === 0 ? (
                        <p className="text-slate-400 text-[10px]">कोई सम्मान दर्ज नहीं है।</p>
                      ) : (
                        currentUser.achievements.map((ach) => (
                          <div key={ach.id} className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-3 rounded-xl">
                            <div>
                              <span className="text-[10px] text-primary font-bold">{ach.year} • </span>
                              <span className="font-bold text-slate-800 dark:text-white">{ach.title}</span>
                              {ach.description && <p className="text-[10px] text-slate-455 mt-0.5 leading-snug">{ach.description}</p>}
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteAchievement(currentUser.id, ach.id)}
                              className="text-red-500 hover:text-red-655 cursor-pointer p-1.5 rounded-lg hover:bg-red-500/5 shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </GlassCard>

            </div>
          </div>

          {/* RIGHT COLUMN: Live Split-Screen Previews */}
          <div className="lg:col-span-6 space-y-4 sticky top-24">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-850 pb-2.5">
              <span className="font-bold font-serif text-xs text-slate-800 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>लाइव प्रीव्यू पैनल (Live Identity Preview)</span>
              </span>

              {/* Device Selector Buttons */}
              <div className="bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-xl p-0.5 flex gap-0.5">
                <button
                  onClick={() => setPreviewDevice("desktop")}
                  className={`p-2 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold ${
                    previewDevice === "desktop"
                      ? "bg-primary text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">डेस्कटॉप</span>
                </button>
                <button
                  onClick={() => setPreviewDevice("mobile")}
                  className={`p-2 rounded-lg transition-all cursor-pointer flex items-center gap-1 text-[10px] font-bold ${
                    previewDevice === "mobile"
                      ? "bg-primary text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">मोबाइल</span>
                </button>
              </div>
            </div>

            {/* PREVIEW CONTAINER */}
            {previewDevice === "desktop" ? (
              /* Desktop Preview Structure */
              <div className="border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-950 p-4 h-[600px] overflow-y-auto shadow-inner scrollbar-thin">
                <div className="bg-white dark:bg-[#0A0F1D] border border-slate-200 dark:border-slate-900 rounded-2xl overflow-hidden min-h-full flex flex-col">
                  {/* Cover */}
                  <div className="h-28 w-full relative bg-slate-105 dark:bg-slate-900">
                    {coverBanner ? (
                      <img src={coverBanner} alt="Cover Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-tr from-[#EA580C]/20 to-[#0F172A]" />
                    )}
                  </div>
                  {/* Details block */}
                  <div className="p-4 relative -mt-10 pt-12 font-serif text-[10px] space-y-4">
                    {/* Avatar */}
                    <div className="absolute -top-10 left-4 w-16 h-16 rounded-full border-2 border-white dark:border-[#0A0F1D] overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                      {avatarUrl ? (
                        <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold bg-slate-50 text-sm">{name ? name[0] : "U"}</div>
                      )}
                    </div>

                    <div className="space-y-1 mt-1">
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-slate-800 dark:text-white text-xs leading-none">{name || "लेखक नाम"}</span>
                        {previewProfile.verification_badge && <CheckCircle className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10" />}
                      </div>
                      <p className="text-primary font-bold">{designation || "लेखक पदनाम"} | <span className="text-slate-400 font-normal">{currentRole || "भूमिका"}</span></p>
                      <p className="text-slate-400 flex items-center gap-0.5"><MapPin className="w-3 h-3 text-slate-400" />{location || "स्थान"}</p>
                    </div>

                    {/* Bio */}
                    <div className="space-y-1">
                      <span className="font-bold text-[8px] text-slate-400 uppercase tracking-wide">जीवनी / परिचय</span>
                      <p className="text-slate-600 dark:text-slate-350 leading-relaxed line-clamp-3">{bio || "लेखक का संक्षिप्त जीवन परिचय यहाँ प्रदर्शित होगा..."}</p>
                    </div>

                    {/* Expertise */}
                    {previewProfile.expertise_tags.length > 0 && (
                      <div className="space-y-1">
                        <span className="font-bold text-[8px] text-slate-400 uppercase tracking-wide">विशेषज्ञता क्षेत्र</span>
                        <div className="flex flex-wrap gap-1">
                          {previewProfile.expertise_tags.map((tag, idx) => (
                            <span key={idx} className="bg-slate-100 dark:bg-slate-850 px-2 py-0.5 rounded text-[8px] font-bold text-slate-500">{tag}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Academic Credentials / Identifiers */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-900">
                      {previewProfile.academic_credentials.length > 0 && (
                        <div className="space-y-1">
                          <span className="font-bold text-[8px] text-slate-400 uppercase tracking-wide">शैक्षणिक योग्यता</span>
                          <div className="space-y-0.5">
                            {previewProfile.academic_credentials.map((cred, idx) => (
                              <div key={idx} className="text-[9px] text-slate-500">• {cred}</div>
                            ))}
                          </div>
                        </div>
                      )}
                      {(orcidId || googleScholarUrl) && (
                        <div className="space-y-1">
                          <span className="font-bold text-[8px] text-slate-400 uppercase tracking-wide">अकादमिक लिंक्स</span>
                          <div className="space-y-1">
                            {orcidId && <div className="text-emerald-500 font-bold flex items-center gap-0.5">ORCID: {orcidId}</div>}
                            {googleScholarUrl && <div className="text-blue-500 font-bold flex items-center gap-0.5">Google Scholar</div>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Mobile Preview Chassis Frame structure */
              <div className="flex justify-center bg-slate-100 dark:bg-slate-950/40 p-4 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-inner h-[600px] overflow-hidden">
                {/* Phone chassis */}
                <div className="w-[300px] h-[550px] border-8 border-slate-800 dark:border-slate-900 rounded-[36px] overflow-hidden bg-white dark:bg-[#0A0F1D] flex flex-col relative shadow-2xl">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-800 dark:bg-slate-900 rounded-b-xl z-30" />
                  
                  {/* Screen Content */}
                  <div className="flex-grow overflow-y-auto scrollbar-none pt-4 flex flex-col">
                    {/* Mobile Cover Banner */}
                    <div className="h-20 w-full relative bg-slate-105 shrink-0">
                      {coverBanner ? (
                        <img src={coverBanner} alt="Banner Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-tr from-[#EA580C]/20 to-[#0F172A]" />
                      )}
                    </div>

                    {/* Profile details */}
                    <div className="p-3 relative -mt-8 pt-9 font-serif text-[9px] space-y-3 flex-grow">
                      {/* Avatar */}
                      <div className="absolute -top-7 left-3 w-12 h-12 rounded-full border-2 border-white dark:border-[#0A0F1D] overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold bg-slate-50 text-[10px]">{name ? name[0] : "U"}</div>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-slate-800 dark:text-white text-xs leading-none">{name || "लेखक नाम"}</span>
                          {previewProfile.verification_badge && <CheckCircle className="w-3 h-3 text-blue-500 fill-blue-500/10" />}
                        </div>
                        <p className="text-primary font-bold">{designation || "लेखक पदनाम"}</p>
                        <p className="text-slate-400 leading-tight">{currentRole || "विभाग भूमिका"}</p>
                        <p className="text-slate-400 flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{location || "स्थान"}</p>
                      </div>

                      <p className="text-slate-500 dark:text-slate-400 leading-normal line-clamp-3 text-[10px]">{bio || "लेखक परिचय..."}</p>

                      {/* Expertise */}
                      {previewProfile.expertise_tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {previewProfile.expertise_tags.map((tag, idx) => (
                            <span key={idx} className="bg-slate-100 dark:bg-slate-850 px-1.5 py-0.5 rounded text-[8px] text-slate-500 font-bold">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
