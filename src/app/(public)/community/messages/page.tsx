"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  MessageCircle, 
  Image as ImageIcon, 
  FileText, 
  Smile, 
  Search, 
  CheckCheck,
  MoreVertical,
  Pin,
  Archive,
  CornerUpLeft,
  X,
  UserX,
  AlertTriangle,
  Paperclip,
  Trash2,
  Lock,
  Flag,
  ArrowLeft
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import GlassCard from "@/components/yuvakshar/GlassCard";

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
  reply_to_id?: string;
  reply_to_content?: string;
  reactions?: Record<string, string[]>; // emoji -> userIds
}

interface ChatThread {
  id: string;
  name: string;
  avatar_url?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isPinned: boolean;
  isArchived: boolean;
  isBlocked: boolean;
  isRequest?: boolean;
  messages: Message[];
}

export default function MessagesPage() {
  const { currentUser } = useCms();
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMsgQuery, setSearchMsgQuery] = useState("");
  const [showSearchMsg, setShowSearchMsg] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [filterTab, setFilterTab] = useState<"all" | "archived" | "requests">("all");
  const [isTyping, setIsTyping] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Initialize chats from localStorage or fallback mock
  useEffect(() => {
    const saved = localStorage.getItem("yuvakshar_chat_threads");
    if (saved) {
      setThreads(JSON.parse(saved));
    } else {
      const mockThreads: ChatThread[] = [
        {
          id: "t_1",
          name: "आचार्य रामचंद्र (वरिष्ठ संपादक)",
          avatar_url: "",
          lastMessage: "आलेख का संशोधन हो गया है, कृपया एक बार पढ़ लें।",
          lastMessageTime: "11:42 AM",
          unreadCount: 2,
          isPinned: true,
          isArchived: false,
          isBlocked: false,
          messages: [
            {
              id: "m_1_1",
              sender_id: "u_ram",
              sender_name: "आचार्य रामचंद्र",
              content: "प्रणाम, आपके नए निबंध की रूपरेखा बहुत अच्छी है।",
              created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
              reactions: { "👍": ["current_user"] }
            },
            {
              id: "m_1_2",
              sender_id: "current_user",
              sender_name: currentUser?.name || "आप",
              content: "धन्यवाद सर! मैंने इसमें लोक-संस्कृति के कुछ नए तत्वों को भी जोड़ा है।",
              created_at: new Date(Date.now() - 3600000).toISOString()
            },
            {
              id: "m_1_3",
              sender_id: "u_ram",
              sender_name: "आचार्य रामचंद्र",
              content: "आलेख का संशोधन हो गया है, कृपया एक बार पढ़ लें।",
              created_at: new Date().toISOString()
            }
          ]
        },
        {
          id: "t_2",
          name: "कविता राय (कवयित्री)",
          avatar_url: "",
          lastMessage: "कल के काव्य-पाठ सत्र में आप आ रहे हैं?",
          lastMessageTime: "Yesterday",
          unreadCount: 0,
          isPinned: false,
          isArchived: false,
          isBlocked: false,
          messages: [
            {
              id: "m_2_1",
              sender_id: "u_kavita",
              sender_name: "कविता राय",
              content: "कल के काव्य-पाठ सत्र में आप आ रहे हैं?",
              created_at: new Date(Date.now() - 86400000).toISOString()
            }
          ]
        },
        {
          id: "t_3",
          name: "युवा लेखक विमर्श समूह",
          avatar_url: "",
          lastMessage: "राकेश: अगला सत्र कब आयोजित होगा?",
          lastMessageTime: "2 Days Ago",
          unreadCount: 0,
          isPinned: false,
          isArchived: false,
          isBlocked: false,
          messages: [
            {
              id: "m_3_1",
              sender_id: "u_rakesh",
              sender_name: "राकेश",
              content: "अगला सत्र कब आयोजित होगा?",
              created_at: new Date(Date.now() - 86400000 * 2).toISOString()
            }
          ]
        },
        {
          id: "t_4",
          name: "प्रमोद कुमार (प्रूफरीडर)",
          avatar_url: "",
          lastMessage: "नमस्ते, मैंने वर्तनी सुधार फाइल आर्काइव में डाल दी है।",
          lastMessageTime: "5 Days Ago",
          unreadCount: 0,
          isPinned: false,
          isArchived: true,
          isBlocked: false,
          messages: [
            {
              id: "m_4_1",
              sender_id: "u_pramod",
              sender_name: "प्रमोद कुमार",
              content: "नमस्ते, मैंने वर्तनी सुधार फाइल आर्काइव में डाल दी है।",
              created_at: new Date(Date.now() - 86400000 * 5).toISOString()
            }
          ]
        },
        {
          id: "req_1",
          name: "सुमित जैन (अपरिचित लेखक)",
          avatar_url: "",
          lastMessage: "नमस्कार जी, क्या आप मेरी कहानी संकलन की समीक्षा करेंगे?",
          lastMessageTime: "Yesterday",
          unreadCount: 1,
          isPinned: false,
          isArchived: false,
          isBlocked: false,
          isRequest: true,
          messages: [
            {
              id: "mr_1",
              sender_id: "u_sumit",
              sender_name: "सुमित जैन",
              content: "नमस्कार जी, क्या आप मेरी कहानी संकलन की समीक्षा करेंगे?",
              created_at: new Date(Date.now() - 86400000).toISOString()
            }
          ]
        }
      ];
      setThreads(mockThreads);
      setActiveThreadId(mockThreads[0].id);
      localStorage.setItem("yuvakshar_chat_threads", JSON.stringify(mockThreads));
    }
  }, [currentUser]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Save threads to localStorage helper
  const saveThreads = (updated: ChatThread[]) => {
    setThreads(updated);
    localStorage.setItem("yuvakshar_chat_threads", JSON.stringify(updated));
  };

  const activeThread = threads.find(t => t.id === activeThreadId) || null;

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages, isTyping]);

  // Send message handler
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !activeThreadId || !messageText.trim() || activeThread?.isBlocked) return;

    const newMsg: Message = {
      id: "msg_" + Date.now(),
      sender_id: currentUser.id || "current_user",
      sender_name: currentUser.name || "आप",
      content: messageText,
      created_at: new Date().toISOString(),
      ...(replyingTo ? { reply_to_id: replyingTo.id, reply_to_content: replyingTo.content } : {})
    };

    const updatedThreads = threads.map(t => {
      if (t.id === activeThreadId) {
        return {
          ...t,
          lastMessage: messageText,
          lastMessageTime: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
          messages: [...t.messages, newMsg]
        };
      }
      return t;
    });

    saveThreads(updatedThreads);
    setMessageText("");
    setReplyingTo(null);

    // Simulate real-time response from typing to message delivery after 1.5 seconds
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        "जी बिल्कुल, मैं समझ गया। इस पर कार्य शुरू करता हूँ।",
        "अति उत्तम! इस विषय में हमारी कल सुबह की बैठक में चर्चा होगी।",
        "कृपया फाइल का लिंक या दस्तावेज़ साझा करें, मैं तुरंत वर्तनी की जाँच कर दूँगा।",
        "नया अंक तैयार हो रहा है, आपकी रचना उसमें शामिल करने के लिए स्वीकृत कर ली गई है।",
        "धन्यवाद, प्रतिक्रिया देने के लिए।"
      ];
      const randomReply = responses[Math.floor(Math.random() * responses.length)];
      
      const partnerMsg: Message = {
        id: "msg_" + (Date.now() + 1),
        sender_id: activeThread?.id || "partner",
        sender_name: activeThread?.name || "सहयोगी",
        content: randomReply,
        created_at: new Date().toISOString()
      };

      const finalThreads = updatedThreads.map(t => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            lastMessage: randomReply,
            lastMessageTime: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
            messages: [...t.messages, partnerMsg]
          };
        }
        return t;
      });
      saveThreads(finalThreads);
    }, 1800);
  };

  // Toggle Message Reaction
  const toggleReaction = (msgId: string, emoji: string) => {
    if (!currentUser || !activeThreadId) return;
    const userId = currentUser.id || "current_user";

    const updated = threads.map(t => {
      if (t.id === activeThreadId) {
        const msgs = t.messages.map(m => {
          if (m.id === msgId) {
            const reacts = { ...(m.reactions || {}) };
            const list = reacts[emoji] || [];
            if (list.includes(userId)) {
              reacts[emoji] = list.filter(id => id !== userId);
            } else {
              reacts[emoji] = [...list, userId];
            }
            return { ...m, reactions: reacts };
          }
          return m;
        });
        return { ...t, messages: msgs };
      }
      return t;
    });
    saveThreads(updated);
  };

  // Pin / Unpin chat thread
  const togglePinThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = threads.map(t => {
      if (t.id === threadId) {
        return { ...t, isPinned: !t.isPinned };
      }
      return t;
    });
    saveThreads(updated);
  };

  // Archive / Unarchive thread
  const toggleArchiveThread = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = threads.map(t => {
      if (t.id === threadId) {
        return { ...t, isArchived: !t.isArchived };
      }
      return t;
    });
    saveThreads(updated);
  };

  // Toggle Block / Unblock user
  const toggleBlockUser = () => {
    if (!activeThreadId) return;
    const updated = threads.map(t => {
      if (t.id === activeThreadId) {
        const nextState = !t.isBlocked;
        alert(nextState ? `${t.name} को ब्लॉक कर दिया गया है।` : `${t.name} को अनब्लॉक कर दिया गया है।`);
        return { ...t, isBlocked: nextState };
      }
      return t;
    });
    saveThreads(updated);
    setShowDropdown(false);
  };

  // Report user dialog
  const handleReportUser = () => {
    if (!activeThread) return;
    const reason = prompt("रिपोर्ट करने का कारण लिखें:");
    if (reason) {
      alert(`${activeThread.name} के खिलाफ आपकी शिकायत दर्ज कर ली गई है। प्रशासनिक टीम इसकी जांच करेगी।`);
    }
    setShowDropdown(false);
  };

  // Delete message
  const handleDeleteMessage = (msgId: string) => {
    if (!activeThreadId) return;
    if (confirm("क्या आप इस संदेश को हटाना चाहते हैं?")) {
      const updated = threads.map(t => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            messages: t.messages.filter(m => m.id !== msgId)
          };
        }
        return t;
      });
      saveThreads(updated);
    }
  };

  // Conversations list search & pin sorting
  const filteredThreads = threads
    .filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
      if (filterTab === "archived") {
        return matchesSearch && t.isArchived;
      }
      if (filterTab === "requests") {
        return matchesSearch && !!t.isRequest && !t.isArchived;
      }
      return matchesSearch && !t.isArchived && !t.isRequest;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return 0;
    });

  // Filter messages in active thread
  const filteredMessages = activeThread
    ? activeThread.messages.filter(m => 
        m.content.toLowerCase().includes(searchMsgQuery.toLowerCase())
      )
    : [];

  return (
    <div className="h-[calc(100vh-190px)] min-h-[500px] flex rounded-2xl bg-white dark:bg-[#0A0F1D]/60 border border-slate-200/60 dark:border-slate-800/40 overflow-hidden text-slate-800 dark:text-slate-200 font-sans shadow-lg">
      
      {/* ─── LEFT PANEL: Conversations Sidebar ─── */}
      <div className={`w-full md:w-80 border-r border-slate-200/60 dark:border-slate-800/40 flex flex-col bg-slate-50/40 dark:bg-slate-900/10 ${activeThreadId ? "hidden md:flex" : "flex"}`}>
        
        {/* Sidebar Header & Tabs */}
        <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/40 space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold font-serif text-primary font-hindi flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-primary" />
              <span>निजी संदेश</span>
            </h2>
            <div className="flex gap-1">
              <button 
                onClick={() => setFilterTab("all")}
                className={`px-2 py-1 text-[9px] rounded-lg font-bold transition-all cursor-pointer font-hindi ${
                  filterTab === "all" ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-450"
                }`}
              >
                सभी चैट
              </button>
              <button 
                onClick={() => setFilterTab("archived")}
                className={`px-2 py-1 text-[9px] rounded-lg font-bold transition-all cursor-pointer font-hindi flex items-center gap-0.5 ${
                  filterTab === "archived" ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-450"
                }`}
              >
                <Archive className="w-2.5 h-2.5" />
                <span>आर्काइव</span>
              </button>
              <button 
                onClick={() => setFilterTab("requests")}
                className={`px-2 py-1 text-[9px] rounded-lg font-bold transition-all cursor-pointer font-hindi flex items-center gap-0.5 ${
                  filterTab === "requests" ? "bg-primary text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-450"
                }`}
              >
                <span className="relative">
                  अनुरोध
                  {threads.some(t => t.isRequest && t.unreadCount > 0) && (
                    <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-red-500 rounded-full" />
                  )}
                </span>
              </button>
            </div>
          </div>

          <div className="relative">
            <input 
              type="text" 
              placeholder="चैट या संदेश खोजें..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-1.8 pl-8 text-xs focus:outline-none focus:border-primary font-hindi text-slate-700 dark:text-slate-200"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Conversations Scrollbar List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/40">
          {filteredThreads.length > 0 ? (
            filteredThreads.map((t) => {
              const isActive = activeThreadId === t.id;
              return (
                <div
                  key={t.id}
                  onClick={() => {
                    setActiveThreadId(t.id);
                    // Clear unread
                    if (t.unreadCount > 0) {
                      saveThreads(threads.map(x => x.id === t.id ? { ...x, unreadCount: 0 } : x));
                    }
                  }}
                  className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors cursor-pointer relative group ${
                    isActive ? "bg-primary/5 dark:bg-slate-800/20 border-l-3 border-primary" : "hover:bg-slate-100/30 dark:hover:bg-slate-800/5"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-amber-500 p-0.5 flex items-center justify-center shrink-0">
                    <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center font-bold text-xs text-primary uppercase">
                      {t.name ? t.name[0] : "C"}
                    </div>
                  </div>
                  
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold font-hindi text-slate-800 dark:text-white truncate">{t.name}</span>
                      <span className="text-[8px] text-slate-400 font-mono shrink-0">{t.lastMessageTime}</span>
                    </div>
                    <p className="text-[10px] text-slate-450 truncate font-hindi leading-relaxed">{t.lastMessage || "कोई संदेश नहीं है"}</p>
                  </div>

                  {/* Badges/Indicators */}
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <div className="flex items-center gap-1">
                      {t.isPinned && <Pin className="w-3 h-3 text-primary rotate-45" />}
                      {t.isArchived && <Archive className="w-3 h-3 text-slate-400" />}
                    </div>
                    {t.unreadCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-primary text-white text-[8px] font-bold flex items-center justify-center">
                        {t.unreadCount}
                      </span>
                    )}
                  </div>

                  {/* Context actions shown on hover */}
                  <div className="absolute right-2 bottom-2 hidden group-hover:flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm z-20">
                    <button 
                      onClick={(e) => togglePinThread(t.id, e)} 
                      title={t.isPinned ? "Unpin Chat" : "Pin Chat"}
                      className="text-slate-400 hover:text-primary transition-all cursor-pointer"
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => toggleArchiveThread(t.id, e)} 
                      title={t.isArchived ? "Unarchive" : "Archive"}
                      className="text-slate-400 hover:text-primary transition-all cursor-pointer"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs text-slate-400 font-serif leading-relaxed">
              कोई चैट नहीं मिली।
            </div>
          )}
        </div>
      </div>

      {/* ─── RIGHT PANEL: Active Message Conversation ─── */}
      <div className={`flex-1 flex flex-col bg-white dark:bg-[#070B14] ${!activeThreadId ? "hidden md:flex" : "flex"}`}>
        {activeThread ? (
          <>
            {/* Active Header */}
            <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/40 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/10">
              <div className="flex items-center space-x-3 min-w-0">
                <button 
                  onClick={() => setActiveThreadId(null)}
                  className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-450 shrink-0"
                >
                  <ArrowLeft className="w-4.5 h-4.5" />
                </button>
                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-500 uppercase shrink-0">
                  {activeThread.name ? activeThread.name[0] : "C"}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-white font-hindi truncate">{activeThread.name}</h3>
                  <span className={`block text-[9.5px] font-bold ${activeThread.isBlocked ? "text-red-500" : isTyping ? "text-primary animate-pulse" : "text-green-500"}`}>
                    {activeThread.isBlocked ? "ब्लॉक किया गया" : isTyping ? "टाइप कर रहे हैं..." : "ऑनलाइन"}
                  </span>
                </div>
              </div>
              
              {/* Header Actions (Replaces calls with block/report and search) */}
              <div className="flex items-center space-x-3 text-slate-400 relative">
                <button 
                  onClick={() => setShowSearchMsg(!showSearchMsg)}
                  title="Search Messages"
                  className="p-1.5 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                </button>
                
                {/* Block/Report options menu */}
                <div ref={dropdownRef} className="relative">
                  <button 
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="p-1.5 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  >
                    <MoreVertical className="w-4.5 h-4.5" />
                  </button>
                  
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 text-xs font-serif text-slate-700 dark:text-slate-300 py-1.5 font-bold">
                      <button 
                        onClick={() => {
                          saveThreads(threads.map(x => x.id === activeThread.id ? { ...x, isPinned: !x.isPinned } : x));
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-2 cursor-pointer"
                      >
                        <Pin className="w-3.5 h-3.5" />
                        <span>{activeThread.isPinned ? "अनपिन करें" : "पिन करें"}</span>
                      </button>
                      <button 
                        onClick={() => {
                          saveThreads(threads.map(x => x.id === activeThread.id ? { ...x, isArchived: !x.isArchived } : x));
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center gap-2 cursor-pointer"
                      >
                        <Archive className="w-3.5 h-3.5" />
                        <span>{activeThread.isArchived ? "चैट निकालें (Unarchive)" : "आर्काइव करें"}</span>
                      </button>
                      <button 
                        onClick={toggleBlockUser}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-red-500 font-bold flex items-center gap-2 cursor-pointer"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>{activeThread.isBlocked ? "अनब्लॉक करें" : "ब्लॉक करें (Block)"}</span>
                      </button>
                      <button 
                        onClick={handleReportUser}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-orange-500 flex items-center gap-2 cursor-pointer"
                      >
                        <Flag className="w-3.5 h-3.5" />
                        <span>शिकायत दर्ज करें (Report)</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Message search overlay bar (if active) */}
            {showSearchMsg && (
              <div className="bg-slate-100/50 dark:bg-slate-900/50 p-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 px-4">
                <div className="relative flex-1">
                  <input 
                    type="text" 
                    placeholder="इस चैट के भीतर संदेश खोजें..." 
                    value={searchMsgQuery}
                    onChange={(e) => setSearchMsgQuery(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-1.5 pl-8 text-xs focus:outline-none focus:border-primary font-hindi text-slate-700 dark:text-slate-200"
                  />
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                </div>
                <button 
                  onClick={() => {
                    setShowSearchMsg(false);
                    setSearchMsgQuery("");
                  }} 
                  className="p-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-350 dark:hover:bg-slate-700 rounded-lg text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Messages body scrolling */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/10 dark:bg-[#060910] relative">
              
              {/* WhatsApp-inspired background grid */}
              <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#ea580c_1px,transparent_1px)] [background-size:16px_16px]" />

              {activeThread.isBlocked && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-2xl text-xs text-center font-bold flex items-center justify-center gap-2 z-10 relative">
                  <AlertTriangle className="w-4.5 h-4.5" />
                  <span>आपने इस उपयोगकर्ता को ब्लॉक किया है। संदेश भेजने के लिए उन्हें अनब्लॉक करें।</span>
                </div>
              )}

              {(searchMsgQuery ? filteredMessages : activeThread.messages).map((m) => {
                const isOwn = m.sender_id === (currentUser?.id || "current_user");
                
                return (
                  <div 
                    key={m.id} 
                    className={`flex flex-col max-w-[80%] relative z-10 ${isOwn ? "ml-auto items-end" : "mr-auto items-start"}`}
                  >
                    {/* Reply Context Bubble Header */}
                    {m.reply_to_content && (
                      <div className="bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-500 p-2 rounded-t-xl border-l-3 border-primary/50 translate-y-1.5 opacity-90 max-w-full truncate font-hindi">
                        <span>उत्तर: </span>
                        <span className="italic">"{m.reply_to_content}"</span>
                      </div>
                    )}

                    <div className={`p-3 rounded-2xl text-xs font-hindi relative group ${
                      isOwn 
                        ? "bg-primary text-white rounded-tr-none shadow" 
                        : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none shadow"
                    }`}>
                      {m.content.includes("📂 [संलग्न दस्तावेज़:") ? (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2.5 p-2 bg-red-500/10 text-red-500 rounded-xl border border-red-200/20 max-w-xs cursor-pointer">
                            <FileText className="w-5 h-5 text-red-500 shrink-0" />
                            <div className="min-w-0">
                              <span className="block text-xs font-bold font-mono truncate">
                                {m.content.match(/\[संलग्न दस्तावेज़:\s*(.*?)\]/)?.[1] || "दस्तावेज़.pdf"}
                              </span>
                              <span className="block text-[8px] uppercase font-bold tracking-wider text-red-400">PDF दस्तावेज़ पठन</span>
                            </div>
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{m.content.replace(/📂\s*\[संलग्न दस्तावेज़:\s*.*?\]/, "").trim()}</p>
                        </div>
                      ) : m.content.includes("🖼️ [संलग्न चित्र:") ? (
                        <div className="space-y-2">
                          <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-105 dark:bg-slate-900 h-28 w-48 overflow-hidden flex items-center justify-center text-[10px] text-slate-500 font-mono">
                            <ImageIcon className="w-5 h-5 text-slate-400 dark:text-slate-600 absolute opacity-25" />
                            <span className="relative z-10 font-hindi">
                              {m.content.match(/\[संलग्न चित्र:\s*(.*?)\]/)?.[1] || "चित्र.jpg"}
                            </span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap">{m.content.replace(/🖼️\s*\[संलग्न चित्र:\s*.*?\]/, "").trim()}</p>
                        </div>
                      ) : (
                        <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                      )}
                      
                      {/* Message Reactions tray & options (hover menu) */}
                      <div className={`absolute top-0 -translate-y-6 flex items-center space-x-1.5 p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-md transition-opacity duration-200 opacity-0 group-hover:opacity-100 z-30 ${
                        isOwn ? "right-0" : "left-0"
                      }`}>
                        {["👍", "❤️", "😂", "😮", "😢", "🙏"].map(emoji => (
                          <button
                            key={emoji}
                            onClick={() => toggleReaction(m.id, emoji)}
                            className="text-[10px] hover:scale-125 transition-transform cursor-pointer"
                          >
                            {emoji}
                          </button>
                        ))}
                        <span className="w-px h-3 bg-slate-200 dark:bg-slate-700 mx-0.5" />
                        <button
                          type="button"
                          onClick={() => setReplyingTo(m)}
                          className="text-[10px] text-slate-400 hover:text-primary p-0.5 cursor-pointer"
                          title="Reply"
                        >
                          <CornerUpLeft className="w-3.5 h-3.5" />
                        </button>
                        {isOwn && (
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(m.id)}
                            className="text-[10px] text-slate-400 hover:text-red-500 p-0.5 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Reactions display box */}
                    {m.reactions && Object.keys(m.reactions).some(k => m.reactions![k].length > 0) && (
                      <div className="flex items-center space-x-1 mt-1 z-15 relative">
                        {Object.keys(m.reactions).map(emoji => {
                          const count = m.reactions![emoji].length;
                          if (count === 0) return null;
                          return (
                            <span 
                              key={emoji} 
                              onClick={() => toggleReaction(m.id, emoji)}
                              className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[8px] font-mono flex items-center gap-1 cursor-pointer hover:bg-slate-200 transition-colors"
                            >
                              <span>{emoji}</span>
                              <span className="font-bold text-slate-500">{count}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Timestamp & read status info */}
                    <div className="flex items-center space-x-1 text-[8px] text-slate-400 mt-1 font-mono">
                      <span>{new Date(m.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                      {isOwn && (
                        <CheckCheck className={`w-3.5 h-3.5 shrink-0 ${activeThread.isBlocked ? "text-slate-400" : "text-sky-500"}`} />
                      )}
                    </div>
                  </div>
                );
              })}

              {isTyping && (
                <div className="flex items-center space-x-2 mr-auto bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none max-w-[120px] shadow relative z-10">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Preview Bar */}
            {replyingTo && (
              <div className="bg-slate-50 dark:bg-slate-900 p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 px-4 text-xs font-hindi border-l-4 border-primary">
                <div className="min-w-0">
                  <span className="block font-bold text-primary">उत्तर दे रहे हैं: {replyingTo.sender_name}</span>
                  <span className="block text-slate-500 truncate italic">"{replyingTo.content}"</span>
                </div>
                <button 
                  onClick={() => setReplyingTo(null)}
                  className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-400 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Input Composer row */}
            {activeThread.isRequest ? (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col items-center gap-3 text-center">
                <p className="text-xs text-slate-550 dark:text-slate-400 font-hindi">
                  <strong>अपरिचित संदेश अनुरोध:</strong> {activeThread.name} आपके संपर्क में नहीं हैं। क्या आप इस संदेश अनुरोध को स्वीकार करना चाहते हैं?
                </p>
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => {
                      const updated = threads.map(t => t.id === activeThread.id ? { ...t, isRequest: false } : t);
                      saveThreads(updated);
                      alert("संदेश अनुरोध स्वीकार कर लिया गया है। अब आप चैट कर सकते हैं!");
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs font-hindi cursor-pointer transition-colors"
                  >
                    स्वीकार करें (Accept)
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      const updated = threads.filter(t => t.id !== activeThread.id);
                      saveThreads(updated);
                      setActiveThreadId(null);
                      alert("संदेश अनुरोध हटा दिया गया है।");
                    }}
                    className="bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold px-4 py-1.5 rounded-xl text-xs font-hindi cursor-pointer transition-colors"
                  >
                    नकारें (Ignore)
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      const updated = threads.map(t => t.id === activeThread.id ? { ...t, isRequest: false, isBlocked: true } : t);
                      saveThreads(updated);
                      alert("उपयोगकर्ता को ब्लॉक कर दिया गया है।");
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs font-hindi cursor-pointer transition-colors"
                  >
                    ब्लॉक करें (Block)
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSend} className="p-4 border-t border-slate-200/60 dark:border-slate-800/40 flex items-center gap-3 bg-white dark:bg-[#070B14]">
                <div className="flex items-center gap-1.5 shrink-0">
                  <button 
                    type="button" 
                    disabled={activeThread.isBlocked}
                    onClick={() => {
                      if (confirm("दस्तावेज़ अटैच करें (Simulate attachment)?")) {
                        setMessageText(prev => prev + " 📂 [संलग्न दस्तावेज़: रचना.pdf]");
                      }
                    }}
                    title="Attach File"
                    className="text-slate-400 hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button 
                    type="button" 
                    disabled={activeThread.isBlocked}
                    onClick={() => {
                      if (confirm("छवि अटैच करें (Simulate image attachment)?")) {
                        setMessageText(prev => prev + " 🖼️ [संलग्न चित्र: पांडुलिपि.jpg]");
                      }
                    }}
                    title="Attach Image"
                    className="text-slate-400 hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <ImageIcon className="w-5 h-5" />
                  </button>
                  <button 
                    type="button" 
                    disabled={activeThread.isBlocked}
                    onClick={() => setMessageText(prev => prev + " 😊")}
                    className="text-slate-400 hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                
                <input 
                  type="text" 
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  disabled={activeThread.isBlocked}
                  placeholder={activeThread.isBlocked ? "इस उपयोगकर्ता को संदेश नहीं भेजा जा सकता" : "अपना संदेश यहाँ लिखें..."}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-primary font-hindi text-slate-700 dark:text-slate-200 disabled:opacity-50"
                  required
                />

                <button 
                  type="submit"
                  disabled={activeThread.isBlocked || !messageText.trim()}
                  className="bg-primary hover:bg-primary/95 text-white p-2.5 rounded-xl transition-all shadow-md shrink-0 flex items-center justify-center cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-3 font-serif bg-slate-50/10 dark:bg-[#070B14]">
            <MessageCircle className="w-16 h-16 text-primary/30 animate-pulse" />
            <h4 className="text-sm font-bold font-hindi">आपकी बातचीत (Conversations)</h4>
            <p className="text-xs leading-relaxed max-w-sm">
              एक सुरक्षित चैट सत्र शुरू करने के लिए बाईं ओर सूची से किसी चर्चा रूम का चयन करें।
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
