"use client";

import React, { useState } from "react";
import { useCms } from "@/store/CmsContext";
import type { Profile, OrgTask, OrgAuditLog } from "@/store/types";
import GlassCard from "./GlassCard";
import { Search } from "lucide-react";

// Helper to translate roles into Hindi
const translateRole = (role?: string | null) => {
  if (role === null || role === "Subscriber" || role === "subscriber" || role === "सदस्य") return "सदस्य";
  if (!role) return "अतिथि";
  switch (role) {
    case "संस्थापक": return "संस्थापक";
    case "प्रशासन": return "प्रधान प्रशासक";
    case "Editor-in-Chief": return "प्रधान संपादक";
    case "Managing Editor": return "कार्यकारी संपादक";
    case "Editor": return "संपादक";
    case "Fact Check Reviewer": return "भाषा समीक्षक";
    case "Author": return "लेखक";
    case "योगदानकर्ता": return "योगदानकर्ता";
    default: return role;
  }
};

// ─── 1. CANDIDATE MANAGEMENT ──────────────────────────────────────────────
export function CandidateManagement({ currentUser }: { currentUser: Profile }) {
  const { users, createCandidate, approveCandidate, rejectCandidate, hasRole } = useCms();
  
  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Profile["role"]>("स्वयंसेवक");
  const [dept, setDept] = useState("स्वयंसेवी");
  const [quals, setQuals] = useState("");
  const [exp, setExp] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");

  const isAuthorized = currentUser && (hasRole("Founder") || hasRole("संस्थापक") || hasRole("प्रशासन"));

  if (!isAuthorized) {
    return (
      <div className="p-4 text-center text-red-500 font-serif">
        उम्मीदवार प्रबंधन के लिए आवश्यक अधिकार केवल संस्थापक या प्रधान प्रशासक के पास हैं।
      </div>
    );
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password.trim()) {
      alert("नाम, ईमेल और पासवर्ड अनिवार्य हैं!");
      return;
    }
    await createCandidate({
      name,
      email,
      password,
      role,
      department: dept,
      qualification: quals,
      experience: exp,
      district,
      state
    });
    alert(`उम्मीदवार ${name} का पंजीकरण आवेदन लंबित सूची में जोड़ा गया।`);
    setName("");
    setEmail("");
    setPassword("");
    setQuals("");
    setExp("");
    setDistrict("");
    setState("");
  };

  const pendingList = users.filter(u => u.status === "Pending Approval");

  return (
    <div className="space-y-6">
      {/* Registration Form */}
      <GlassCard glow="saffron" className="p-5 space-y-4">
        <h3 className="font-serif font-bold text-sm text-primary">नए उम्मीदवार का पंजीकरण (Onboard Candidate)</h3>
        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-slate-500 font-medium block">पूरा नाम</label>
              <input
                type="text"
                placeholder="उम्मीदवार का नाम..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-500 font-medium block">ईमेल</label>
              <input
                type="email"
                placeholder="candidate@yuvakshar.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-500 font-medium block">अस्थायी पासवर्ड</label>
              <input
                type="password"
                placeholder="अस्थायी पासवर्ड..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-500 font-medium block">भूमिका (Role)</label>
              <select
                value={role || ""}
                onChange={(e) => setRole(e.target.value as Profile["role"])}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none text-slate-700 dark:text-slate-200"
              >
                <option value="संस्थापक">संस्थापक</option>
                <option value="सह-संस्थापक">सह-संस्थापक</option>
                <option value="प्रधान प्रशासक">प्रधान प्रशासक</option>
                <option value="प्रशासक">प्रशासक</option>
                <option value="प्रधान संपादक">प्रधान संपादक</option>
                <option value="कार्यकारी संपादक">कार्यकारी संपादक</option>
                <option value="वरिष्ठ संपादक">वरिष्ठ संपादक</option>
                <option value="संपादक">संपादक</option>
                <option value="सहायक संपादक">सहायक संपादक</option>
                <option value="समुदाय प्रबंधक">समुदाय प्रबंधक</option>
                <option value="समुदाय मॉडरेटर">समुदाय मॉडरेटर</option>
                <option value="समूह व्यवस्थापक">समूह व्यवस्थापक</option>
                <option value="समूह मॉडरेटर">समूह मॉडरेटर</option>
                <option value="प्रूफरीडर">प्रूफरीडर</option>
                <option value="भाषा समीक्षक">भाषा समीक्षक</option>
                <option value="कार्यक्रम समन्वयक">कार्यक्रम समन्वयक</option>
                <option value="चुनौती समन्वयक">चुनौती समन्वयक</option>
                <option value="प्रमाणपत्र प्रबंधक">प्रमाणपत्र प्रबंधक</option>
                <option value="स्वयंसेवक">स्वयंसेवक</option>
                <option value="प्रशिक्षु">प्रशिक्षु</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 font-medium block">विभाग (Department)</label>
              <select
                value={dept}
                onChange={(e) => setDept(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none text-slate-700 dark:text-slate-200"
              >
                <option value="संस्थापक">संस्थापक विभाग</option>
                <option value="प्रशासन">प्रशासनिक विभाग</option>
                <option value="संपादकीय">संपादकीय विभाग</option>
                <option value="समुदाय">समुदाय विभाग</option>
                <option value="गुणवत्ता">गुणवत्ता विभाग</option>
                <option value="कार्यक्रम">कार्यक्रम विभाग</option>
                <option value="स्वयंसेवी">स्वयंसेवी विभाग</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-500 font-medium block">शैक्षणिक योग्यता (Qualifications)</label>
              <input
                type="text"
                placeholder="उदा. एम.ए. हिंदी, पी.एच.डी..."
                value={quals}
                onChange={(e) => setQuals(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-500 font-medium block">कार्य अनुभव (Experience)</label>
              <input
                type="text"
                placeholder="उदा. 3 साल का संपादन कार्य..."
                value={exp}
                onChange={(e) => setExp(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-slate-500 font-medium block">ज़िला</label>
              <input
                type="text"
                placeholder="उदा. भोपाल..."
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200"
              />
            </div>
            <div className="space-y-1">
              <label className="text-slate-500 font-medium block">राज्य</label>
              <input
                type="text"
                placeholder="उदा. मध्य प्रदेश..."
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200"
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-primary hover:bg-primary/95 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md cursor-pointer text-xs"
          >
            पंजीकरण आवेदन दर्ज करें
          </button>
        </form>
      </GlassCard>

      {/* Pending List Queue */}
      <div className="bg-white dark:bg-[#0A0F1D] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="font-serif font-bold text-sm text-primary">लंबित उम्मीदवार कतार (Pending Candidates)</h3>
        {pendingList.length === 0 ? (
          <p className="text-slate-400 dark:text-slate-500 italic text-xs py-4 text-center">
            कतार में कोई लंबित उम्मीदवार नहीं है।
          </p>
        ) : (
          <div className="space-y-3">
            {pendingList?.map((cand) => (
              <div key={cand.id} className="p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-900/10 flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{cand.name}</span>
                    <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded text-[9px] font-bold">
                      लंबित
                    </span>
                  </div>
                  <p className="text-slate-400 font-mono text-[10px]">{cand.email}</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-500 mt-2">
                    <div><span className="font-bold text-slate-700 dark:text-slate-300">भूमिका:</span> {translateRole(cand.role)}</div>
                    <div><span className="font-bold text-slate-700 dark:text-slate-300">विभाग:</span> {cand.department}</div>
                    <div><span className="font-bold text-slate-700 dark:text-slate-300">योग्यता:</span> {cand.qualification || "—"}</div>
                    <div><span className="font-bold text-slate-700 dark:text-slate-300">अनुभव:</span> {cand.experience || "—"}</div>
                    {cand.district && (
                      <div className="col-span-2"><span className="font-bold text-slate-700 dark:text-slate-300">स्थान:</span> {cand.district}, {cand.state}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 md:self-center shrink-0">
                  <button
                    onClick={async () => {
                      if (confirm(`क्या आप ${cand.name} के आवेदन को स्वीकार कर संगठन में सक्रिय करना चाहते हैं?`)) {
                        await approveCandidate(cand.id, currentUser.id);
                        alert(`${cand.name} को स्वीकृत किया गया। क्रेडेंशियल ईमेल भेज दिया गया है।`);
                      }
                    }}
                    className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-xs shadow-sm cursor-pointer"
                  >
                    स्वीकार करें
                  </button>
                  <button
                    onClick={async () => {
                      if (confirm(`क्या आप ${cand.name} के आवेदन को अस्वीकार करना चाहते हैं?`)) {
                        await rejectCandidate(cand.id, currentUser.id);
                        alert(`${cand.name} का आवेदन अस्वीकार कर दिया गया।`);
                      }
                    }}
                    className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-xs shadow-sm cursor-pointer"
                  >
                    अस्वीकार करें
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 2. VERIFICATION QUEUE ────────────────────────────────────────────────
export function VerificationQueue({ currentUser }: { currentUser: Profile }) {
  const { verifications, processVerification, hasRole } = useCms();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const pendingList = verifications.filter(v => v.status === "Pending");

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#0A0F1D] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="font-serif font-bold text-sm text-primary">लेखक एवं साहित्यकार सत्यापन अनुरोध (Verification Requests)</h3>
        {pendingList.length === 0 ? (
          <p className="text-slate-400 dark:text-slate-500 italic text-xs py-4 text-center">
            कोई लंबित सत्यापन अनुरोध नहीं है।
          </p>
        ) : (
          <div className="space-y-4">
            {pendingList?.map((req) => {
              const isSelf = req.user_id === currentUser.id;
              const isSahityakar = req.badge_requested === "सत्यापित साहित्यकार";

              // Governance checks
              let hasPermission = false;
              if (isSahityakar) {
                hasPermission = hasRole("Founder") || hasRole("संस्थापक");
              } else {
                hasPermission = hasRole("Founder") || hasRole("संस्थापक") || hasRole("प्रशासन") || hasRole("Editor-in-Chief");
              }

              return (
                <div key={req.id} className="p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-900/10 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                    <div>
                      <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{req.user_name}</span>
                      <p className="text-[10px] text-slate-400 mt-0.5">अनुरोधित बैज: <span className="text-primary font-bold">{req.badge_requested}</span></p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      अनुरोध दिनांक: {new Date(req.created_at).toLocaleDateString("hi-IN")}
                    </span>
                  </div>

                  {req.supporting_docs && (
                    <div className="p-3 bg-white dark:bg-slate-950 rounded-lg text-slate-600 dark:text-slate-400 text-xs border border-slate-100 dark:border-slate-800/40">
                      <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">सहायक संदर्भ / लिंक:</span>
                      <p className="whitespace-pre-wrap">{req.supporting_docs}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-slate-500 font-medium text-[11px] block">समीक्षा टिप्पणी (Decision Notes):</label>
                    <textarea
                      placeholder="निर्णय का औचित्य या प्रतिक्रिया लिखें..."
                      value={notes[req.id] || ""}
                      onChange={(e) => setNotes({ ...notes, [req.id]: e.target.value })}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 text-xs h-16 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-1">
                    {isSelf ? (
                      <span className="text-red-500 font-bold text-[10px] bg-red-500/10 border border-red-500/20 px-2 py-1 rounded">
                        स्वयं का सत्यापन निषिद्ध है
                      </span>
                    ) : !hasPermission ? (
                      <span className="text-yellow-600 font-bold text-[10px] bg-yellow-500/10 border border-yellow-500/20 px-2 py-1 rounded">
                        {isSahityakar ? "संस्थापक/सह-संस्थापक अनुमोदन आवश्यक" : "सत्यापन अधिकार अनुपलब्ध"}
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            const note = notes[req.id] || "";
                            if (confirm(`क्या आप ${req.user_name} को ${req.badge_requested} बैज प्रदान करना चाहते हैं?`)) {
                              await processVerification(req.id, "Approved", note, currentUser.id);
                              alert("बैज सफलतापूर्वक प्रदान किया गया!");
                            }
                          }}
                          className="px-3 py-1.5 bg-primary hover:bg-primary/95 text-white rounded-lg font-bold text-xs shadow-sm cursor-pointer"
                        >
                          बैज प्रदान करें
                        </button>
                        <button
                          onClick={async () => {
                            const note = notes[req.id] || "";
                            if (!note.trim()) {
                              alert("अस्वीकार करने के लिए समीक्षा टिप्पणी में कारण लिखना अनिवार्य है!");
                              return;
                            }
                            if (confirm(`क्या आप ${req.user_name} का सत्यापन अनुरोध अस्वीकार करना चाहते हैं?`)) {
                              await processVerification(req.id, "Rejected", note, currentUser.id);
                              alert("अनुरोध अस्वीकार कर दिया गया।");
                            }
                          }}
                          className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold text-xs shadow-sm cursor-pointer"
                        >
                          अस्वीकार करें
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 3. TASK BOARD ────────────────────────────────────────────────────────
export function TaskBoard({ currentUser }: { currentUser: Profile }) {
  const { tasks, assignTask, updateTaskStatus, users, hasRole } = useCms();

  // Task form states
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [priority, setPriority] = useState<OrgTask["priority"]>("Medium");
  const [dueDate, setDueDate] = useState("");
  const [dept, setDept] = useState("संपादकीय");

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const teamMembers = users.filter(u => u.role !== null && u.role !== "\u0938\u0926\u0938\u094d\u092f" && u.role !== "Subscriber" as any && u.status === "active");

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !assignedTo) {
      alert("शीर्षक और सदस्य का चयन करना अनिवार्य है!");
      return;
    }
    const targetUser = users.find(u => u.id === assignedTo);
    if (!targetUser) return;

    await assignTask({
      title,
      description: desc,
      assigned_by: currentUser.id,
      assigned_by_name: currentUser.name,
      assigned_to: assignedTo,
      assigned_to_name: targetUser.name,
      department: dept,
      priority,
      due_date: dueDate,
      status: "Pending"
    });

    alert(`कार्य "${title}" को ${targetUser.name} को सफलतापूर्वक आवंटित कर दिया गया है।`);
    setTitle("");
    setDesc("");
    setAssignedTo("");
    setDueDate("");
  };

  const getAlertBadge = (dueDateStr: string, status: string) => {
    if (status === "Completed" || status === "Rejected") return null;
    const diffTime = new Date(dueDateStr).getTime() - Date.now();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      return (
        <span className="px-2 py-0.5 bg-red-500/10 border border-red-500/30 text-red-500 font-bold rounded text-[8px] animate-pulse">
          अति आवश्यक - आज ही देय
        </span>
      );
    }
    if (diffDays <= 3) {
      return (
        <span className="px-2 py-0.5 bg-orange-500/10 border border-orange-500/30 text-orange-500 font-bold rounded text-[8px]">
          देय सीमा निकट - 3 दिन में
        </span>
      );
    }
    if (diffDays <= 7) {
      return (
        <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 font-bold rounded text-[8px]">
          देय सीमा निकट - 7 दिन में
        </span>
      );
    }
    return null;
  };

  const filteredTasks = tasks.filter(task => {
    const isRelated = task.assigned_to === currentUser.id || task.assigned_by === currentUser.id;
    if (!isRelated) return false;
    if (statusFilter === "All") return true;
    return task.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Assign Task Section */}
      {currentUser && (hasRole("Founder") || hasRole("संस्थापक") || hasRole("प्रशासन") || hasRole("Editor-in-Chief") || hasRole("Managing Editor") || hasRole("Editor")) && (
        <GlassCard glow="saffron" className="p-5 space-y-4">
          <h3 className="font-serif font-bold text-sm text-primary">नए कार्य का आवंटन (Assign Task)</h3>
          <form onSubmit={handleAssign} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-slate-500 font-medium block">कार्य का शीर्षक</label>
                <input
                  type="text"
                  placeholder="उदा. नए विशेषांक की समीक्षा..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-medium block">किसे आवंटित करें (Assigned To)</label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none text-slate-700 dark:text-slate-200"
                  required
                >
                  <option value="">सदस्य चुनें...</option>
                  {teamMembers?.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({translateRole(m.role)})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-500 font-medium block">कार्य का विवरण (Description)</label>
              <textarea
                placeholder="कार्य की स्पष्ट रूपरेखा, आवश्यक निर्देश लिखें..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200 h-20 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-slate-500 font-medium block">प्राथमिकता (Priority)</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as OrgTask["priority"])}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none text-slate-700 dark:text-slate-200"
                >
                  <option value="Low">कम (Low)</option>
                  <option value="Medium">सामान्य (Medium)</option>
                  <option value="High">उच्च (High)</option>
                  <option value="Urgent">अति आवश्यक (Urgent)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-medium block">विभाग (Department)</label>
                <select
                  value={dept}
                  onChange={(e) => setDept(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none text-slate-700 dark:text-slate-200"
                >
                  <option value="प्रशासन">प्रशासन</option>
                  <option value="संपादकीय">संपादकीय</option>
                  <option value="समुदाय">समुदाय</option>
                  <option value="गुणवत्ता">गुणवत्ता</option>
                  <option value="कार्यक्रम">कार्यक्रम</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-medium block">देय तिथि (Due Date)</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none focus:border-primary text-slate-700 dark:text-slate-200"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-primary hover:bg-primary/95 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md cursor-pointer text-xs"
            >
              कार्य आवंटित करें
            </button>
          </form>
        </GlassCard>
      )}

      {/* Task List Section */}
      <div className="bg-white dark:bg-[#0A0F1D] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h3 className="font-serif font-bold text-sm text-primary">कार्य निर्देश पटल (Task Board)</h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">स्थिति फ़िल्टर:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-slate-600 dark:text-slate-300 focus:outline-none"
            >
              <option value="All">सभी कार्य</option>
              <option value="Pending">लंबित (Pending)</option>
              <option value="In Progress">प्रगति पर (In Progress)</option>
              <option value="Completed">पूर्ण (Completed)</option>
              <option value="Needs Revision">संशोधन आवश्यक (Needs Revision)</option>
              <option value="Rejected">अस्वीकारित (Rejected)</option>
            </select>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <p className="text-slate-400 dark:text-slate-500 italic text-xs py-4 text-center">
            यहाँ कोई कार्य सूचीबद्ध नहीं है।
          </p>
        ) : (
          <div className="space-y-4">
            {filteredTasks?.map((task) => {
              const isAssignedToMe = task.assigned_to === currentUser.id;
              
              // Colors for Priority
              const priorityColors: Record<OrgTask["priority"], string> = {
                Low: "bg-green-500/10 text-green-500 border-green-500/20",
                Medium: "bg-blue-500/10 text-blue-500 border-blue-500/20",
                High: "bg-orange-500/10 text-orange-500 border-orange-500/20",
                Urgent: "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse"
              };

              // Colors for Status
              const statusColors: Record<OrgTask["status"], string> = {
                Pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
                "In Progress": "bg-sky-500/10 text-sky-500 border-sky-500/20",
                Completed: "bg-green-500/10 text-green-500 border-green-500/20",
                "Needs Revision": "bg-orange-500/10 text-orange-600 border-orange-500/20",
                Rejected: "bg-red-500/10 text-red-500 border-red-500/20"
              };

              return (
                <div key={task.id} className="p-4 border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/50 dark:bg-slate-900/10 space-y-3 text-xs">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{task.title}</span>
                        <span className={`px-2 py-0.5 border text-[9px] font-bold rounded ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </span>
                        <span className={`px-2 py-0.5 border text-[9px] font-bold rounded ${statusColors[task.status]}`}>
                          {task.status}
                        </span>
                        {getAlertBadge(task.due_date, task.status)}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        आवंटक: <span className="font-bold text-slate-600 dark:text-slate-300">{task.assigned_by_name}</span> • कर्ता: <span className="font-bold text-slate-600 dark:text-slate-300">{task.assigned_to_name}</span>
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      देय तिथि: {new Date(task.due_date).toLocaleDateString("hi-IN")}
                    </span>
                  </div>

                  {task.description && (
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-white dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800/40">
                      {task.description}
                    </p>
                  )}

                  {/* Task Actions for Assignee */}
                  {isAssignedToMe && task.status !== "Completed" && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {task.status === "Pending" && (
                        <button
                          onClick={() => updateTaskStatus(task.id, "In Progress")}
                          className="px-2.5 py-1 bg-sky-500 hover:bg-sky-600 text-white rounded font-bold text-[10px] cursor-pointer shadow-sm"
                        >
                          प्रगति पर डालें
                        </button>
                      )}
                      {task.status === "In Progress" && (
                        <button
                          onClick={() => updateTaskStatus(task.id, "Completed")}
                          className="px-2.5 py-1 bg-green-500 hover:bg-green-600 text-white rounded font-bold text-[10px] cursor-pointer shadow-sm"
                        >
                          पूर्ण मार्क करें
                        </button>
                      )}
                      {task.status !== "Rejected" && (
                        <button
                          onClick={() => {
                            const reason = prompt("अस्वीकार करने का कारण लिखें:");
                            if (reason) {
                              updateTaskStatus(task.id, "Rejected");
                            }
                          }}
                          className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white rounded font-bold text-[10px] cursor-pointer shadow-sm"
                        >
                          अस्वीकार करें
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── 4. ORG AUDIT LOG VIEWER ──────────────────────────────────────────────
export function OrgAuditLogViewer() {
  const { orgAuditLogs } = useCms();
  const [query, setQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");

  const filteredLogs = orgAuditLogs.filter(log => {
    const matchesSeverity = severityFilter === "All" || log.severity === severityFilter;
    const matchesSearch = log.user_name.toLowerCase().includes(query.toLowerCase()) ||
                          log.action.toLowerCase().includes(query.toLowerCase()) ||
                          log.details.toLowerCase().includes(query.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  return (
    <div className="bg-slate-50/50 dark:bg-[#0F172A]/20 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="font-serif font-bold text-sm text-primary">गवर्नेंस एवं सुरक्षा ऑडिट ट्रेल (Security Audit Log)</h3>
        
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="खोजें (खिलाड़ी, क्रिया)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-primary text-slate-600 dark:text-slate-300 w-44"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-600 dark:text-slate-300 focus:outline-none"
          >
            <option value="All">सभी गंभीरता</option>
            <option value="Info">सामान्य (Info)</option>
            <option value="Warning">चेतावनी (Warning)</option>
            <option value="Critical">जोखिम (Critical)</option>
          </select>
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 text-xs leading-relaxed font-mono">
        {filteredLogs.length === 0 ? (
          <p className="text-slate-400 dark:text-slate-500 italic text-center py-6">
            कोई ऑडिट लॉग नहीं मिला।
          </p>
        ) : (
          filteredLogs?.map((log) => {
            const severityColors: Record<OrgAuditLog["severity"], string> = {
              Info: "text-blue-500 border-blue-500/20 bg-blue-500/5",
              Warning: "text-orange-500 border-orange-500/20 bg-orange-500/5",
              Critical: "text-red-500 border-red-500/20 bg-red-500/5 animate-pulse"
            };

            return (
              <div key={log.id} className="p-3 border-b border-slate-100 dark:border-slate-800/40 last:border-b-0 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{log.action}</span>
                    <span className={`px-1.5 py-0.5 border text-[9px] rounded font-bold uppercase tracking-wider ${severityColors[log.severity]}`}>
                      {log.severity}
                    </span>
                  </div>
                  <span className="text-slate-400 text-[10px]">
                    {new Date(log.timestamp).toLocaleString("hi-IN")}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                  {log.details}
                </p>
                <div className="text-[10px] text-slate-400">
                  सक्रियकर्ता: <span className="font-bold">{log.user_name}</span> (आईडी: {log.user_id})
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
