"use client";

import React, { useState, useEffect } from "react";
import { useCms } from "@/store/CmsContext";
import { hasPermission } from "@/domains/users/permissions";
import { 
  getContactMessages, 
  updateContactMessageStatus, 
  deleteContactMessage,
  ContactMessageRecord 
} from "@/lib/actions/contactActions";
import { 
  Search, 
  Mail, 
  Phone, 
  User, 
  Calendar, 
  Tag, 
  CheckCircle, 
  Clock, 
  Archive, 
  Trash2, 
  Eye, 
  Filter,
  ShieldAlert,
  RefreshCw
} from "lucide-react";
import { formatDisplayDate } from "@/utils/date";

export default function AdminContactMessagesPage() {
  const { currentUser, submissions } = useCms();
  const role = currentUser?.role || "Founder";

  // Check RBAC permission
  const isAuthorized = hasPermission(role, "manage_contact_messages");

  const [messages, setMessages] = useState<ContactMessageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageRecord | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [statusFilter]);

  const fetchMessages = async () => {
    setLoading(true);
    console.log("[AdminPage Audit] Executing getContactMessages with status:", statusFilter, "search:", searchQuery);
    
    const res = await getContactMessages({
      status: statusFilter,
      search: searchQuery,
    });

    console.log("[AdminPage Audit] getContactMessages Result:", res);

    if (res.success && res.data && res.data.length > 0) {
      console.log("[AdminPage Audit] Returned Messages Array Before Rendering (Count:", res.data.length, "):", res.data);
      setMessages(res.data);
    } else if (submissions && submissions.length > 0) {
      console.log("[AdminPage Audit] Using CmsContext Submissions Fallback (Count:", submissions.length, ")");
      const mapped: ContactMessageRecord[] = submissions.map(s => ({
        id: s.id,
        type: s.type || "contact",
        category: s.category || "General",
        name: s.name,
        email: s.email,
        mobile: s.mobile || null,
        subject: s.subject || s.title || "संपर्क संदेश",
        content: s.content,
        status: s.status || "New",
        created_at: s.created_at || new Date().toISOString(),
      }));
      setMessages(mapped);
    } else {
      console.log("[AdminPage Audit] Returned Empty Array [] - Rendering 'No messages found'");
      setMessages([]);
    }
    setLoading(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMessages();
  };

  const handleStatusChange = async (id: string, newStatus: "NEW" | "READ" | "ARCHIVED") => {
    setActionLoading(true);
    const formattedStatus = newStatus === "NEW" ? "New" : newStatus === "READ" ? "Read" : "Archived";
    
    // Optimistic UI update for immediate response
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status: formattedStatus } : m))
    );

    const res = await updateContactMessageStatus(id, newStatus);
    if (res.success && res.data) {
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? (res.data as ContactMessageRecord) : m))
      );
      if (selectedMessage?.id === id) {
        setSelectedMessage(res.data as ContactMessageRecord);
      }
    } else if (!res.success) {
      console.error("[AdminPage Audit] updateStatus failed:", res.error);
      alert(res.error || "स्थिति अद्यतन विफल रहा।");
      fetchMessages(); // Re-sync state from server
    }
    setActionLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("क्या आप निश्चित रूप से इस संदेश को हटाना चाहते हैं?")) return;
    setActionLoading(true);

    // Optimistic UI update
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selectedMessage?.id === id) {
      setSelectedMessage(null);
    }

    const res = await deleteContactMessage(id);
    if (!res.success) {
      console.error("[AdminPage Audit] deleteMessage failed:", res.error);
      alert(res.error || "संदेश हटाना विफल रहा।");
      fetchMessages(); // Re-sync state from server
    }
    setActionLoading(false);
  };

  // Unauthorized fallback for Editor / Readers
  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 space-y-4">
        <div className="p-4 bg-red-500/10 text-red-500 rounded-full">
          <ShieldAlert className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">अनुमति अस्वीकृत (Access Denied)</h2>
        <p className="text-sm text-slate-500 max-w-md">
          केवल Founder और Admin ही संपर्क संदेशों को देख और प्रबंधित कर सकते हैं। संपादकों के पास इस अनुभाग तक पहुँच नहीं है।
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Mail className="w-8 h-8 text-[#EA580C]" />
            <span>संपर्क संदेश प्रबंधन</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            युवाक्षर पोर्टल पर पाठकों और उपयोगकर्ताओं द्वारा भेजे गए संदेशों का प्रबंधन करें।
          </p>
        </div>
        <button
          onClick={fetchMessages}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-xl transition-all self-start md:self-auto cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span>रिफ्रेश</span>
        </button>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl w-full md:w-auto overflow-x-auto">
            {[
              { id: "ALL", label: "सभी संदेश" },
              { id: "NEW", label: "नए संदेश" },
              { id: "READ", label: "पढ़े गए" },
              { id: "ARCHIVED", label: "पुरालेख (Archived)" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-white dark:bg-slate-800 text-[#EA580C] shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="नाम, ईमेल या विषय से खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs focus:outline-none focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C]/20 text-slate-900 dark:text-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          </form>
        </div>
      </div>

      {/* MESSAGES LIST TABLE */}
      <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-sm">लोड हो रहा है...</div>
        ) : messages.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Mail className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700" />
            <p className="font-bold text-base text-slate-700 dark:text-slate-300">कोई संदेश नहीं मिला</p>
            <p className="text-xs text-slate-400">चयनित फ़िल्टर के लिए कोई रिकॉर्ड उपलब्ध नहीं है।</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">स्थिति</th>
                  <th className="py-3.5 px-4">नाम एवं संपर्क</th>
                  <th className="py-3.5 px-4">श्रेणी (Category)</th>
                  <th className="py-3.5 px-4">संदेश विवरण</th>
                  <th className="py-3.5 px-4">तिथि</th>
                  <th className="py-3.5 px-4 text-right">कार्रवाई</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {messages.map((msg) => {
                  const isNew = msg.status === "NEW" || msg.status === "New" || msg.status?.toUpperCase() === "NEW";
                  const isRead = msg.status === "READ" || msg.status === "Read" || msg.status?.toUpperCase() === "READ";
                  const isArchived = msg.status === "ARCHIVED" || msg.status === "Archived" || msg.status?.toUpperCase() === "ARCHIVED";

                  return (
                    <tr
                      key={msg.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isNew ? "bg-orange-500/5 font-semibold" : ""
                      }`}
                    >
                      {/* Status Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {isNew && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 border border-orange-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping"></span>
                            नया (New)
                          </span>
                        )}
                        {isRead && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle className="w-3 h-3" />
                            पढ़ा गया
                          </span>
                        )}
                        {isArchived && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-500 dark:bg-slate-500/20 dark:text-slate-400 border border-slate-500/20">
                            <Archive className="w-3 h-3" />
                            पुरालेख
                          </span>
                        )}
                        {!isNew && !isRead && !isArchived && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {msg.status}
                          </span>
                        )}
                      </td>

                    {/* Name & Contact */}
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{msg.name}</p>
                        <p className="text-slate-500 dark:text-slate-400 text-xs font-mono">{msg.email}</p>
                        {msg.mobile && (
                          <p className="text-slate-400 text-[11px] font-mono">📱 {msg.mobile}</p>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium">
                        {msg.category}
                      </span>
                    </td>

                    {/* Message Preview */}
                    <td className="py-4 px-4 max-w-xs">
                      <p className="text-slate-700 dark:text-slate-300 truncate">
                        {msg.content}
                      </p>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 text-xs">
                      {msg.created_at
                        ? new Date(msg.created_at).toLocaleDateString("hi-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedMessage(msg);
                            if (msg.status === "NEW") {
                              handleStatusChange(msg.id, "READ");
                            }
                          }}
                          className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-[#EA580C] hover:bg-orange-500/10 rounded-lg transition-colors cursor-pointer"
                          title="देखें"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(msg.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                          title="हटाएं"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MESSAGE DETAIL MODAL */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1">
                <span className="px-2.5 py-1 bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 rounded-md text-xs font-bold">
                  {selectedMessage.category}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white pt-2">
                  {selectedMessage.name} का संदेश
                </h3>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* User Meta Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl text-xs font-sans">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500 font-medium">नाम:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedMessage.name}</span>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500 font-medium">ईमेल:</span>
                <a href={`mailto:${selectedMessage.email}`} className="font-bold text-[#EA580C] hover:underline">
                  {selectedMessage.email}
                </a>
              </div>

              {selectedMessage.mobile && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-500 font-medium">मोबाइल:</span>
                  <a href={`tel:${selectedMessage.mobile}`} className="font-bold text-slate-800 dark:text-slate-200">
                    {selectedMessage.mobile}
                  </a>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500 font-medium">प्राप्ति तिथि:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedMessage.created_at
                    ? new Date(selectedMessage.created_at).toLocaleString("hi-IN")
                    : "-"}
                </span>
              </div>
            </div>

            {/* Full Message Text */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">संदेश विवरण (Full Message):</h4>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-serif">
                {selectedMessage.content}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 font-sans">
              <div className="flex items-center gap-2">
                <button
                  disabled={actionLoading}
                  onClick={() => handleStatusChange(selectedMessage.id, "READ")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    selectedMessage.status === "READ"
                      ? "bg-emerald-500/20 text-emerald-600 border-emerald-500/30"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-600"
                  }`}
                >
                  Mark as Read
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleStatusChange(selectedMessage.id, "NEW")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    selectedMessage.status === "NEW"
                      ? "bg-orange-500/20 text-orange-600 border-orange-500/30"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-orange-500/10 hover:text-orange-600"
                  }`}
                >
                  Mark as New
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleStatusChange(selectedMessage.id, "ARCHIVED")}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    selectedMessage.status === "ARCHIVED"
                      ? "bg-slate-500/20 text-slate-600 border-slate-500/30"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-500/10"
                  }`}
                >
                  Archive
                </button>
              </div>

              <button
                disabled={actionLoading}
                onClick={() => handleDelete(selectedMessage.id)}
                className="px-3.5 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Delete Message
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
