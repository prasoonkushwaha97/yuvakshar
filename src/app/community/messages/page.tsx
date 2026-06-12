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
  Phone,
  Video
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { 
  fetchConversations, 
  fetchMessages, 
  sendMessage, 
  CommunityConversation, 
  CommunityMessage 
} from "@/lib/communityService";
import GlassCard from "@/components/yuvakshar/GlassCard";

export default function MessagesPage() {
  const { currentUser } = useCms();
  const [conversations, setConversations] = useState<CommunityConversation[]>([]);
  const [activeConv, setActiveConv] = useState<CommunityConversation | null>(null);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadConversations = async () => {
    setLoadingConv(true);
    try {
      const data = await fetchConversations();
      setConversations(data);
      if (data.length > 0) {
        setActiveConv(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConv(false);
    }
  };

  const loadMessages = async (convId: string) => {
    setLoadingMsg(true);
    try {
      const data = await fetchMessages(convId);
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMsg(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (activeConv) {
      loadMessages(activeConv.id);
    }
  }, [activeConv]);

  // Scroll chat messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !activeConv || !messageText.trim()) return;

    try {
      const newMsg = await sendMessage(
        activeConv.id,
        currentUser.id,
        currentUser.name || "लेखक",
        messageText
      );
      setMessages([...messages, newMsg]);
      setMessageText("");
      
      // Update conversations sidebar state
      setConversations(conversations.map(c => {
        if (c.id === activeConv.id) {
          return {
            ...c,
            lastMessage: messageText,
            lastMessageTime: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
          };
        }
        return c;
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleReaction = (msgId: string, emoji: string) => {
    if (!currentUser) return;
    setMessages(messages.map(m => {
      if (m.id === msgId) {
        const reactions = { ...(m.reactions || {}) };
        if (!reactions[emoji]) {
          reactions[emoji] = [currentUser.id];
        } else if (reactions[emoji].includes(currentUser.id)) {
          reactions[emoji] = reactions[emoji].filter(id => id !== currentUser.id);
        } else {
          reactions[emoji] = [...reactions[emoji], currentUser.id];
        }
        return { ...m, reactions };
      }
      return m;
    }));
  };

  return (
    <div className="h-[calc(100vh-220px)] min-h-[450px] flex rounded-2xl bg-white dark:bg-[#0F172A]/35 border border-slate-200/60 dark:border-slate-800/40 overflow-hidden text-[#0F172A] dark:text-slate-200">
      
      {/* ─── LEFT PANEL: Conversations List ─── */}
      <div className="w-1/3 border-r border-slate-200/60 dark:border-slate-800/40 flex flex-col bg-slate-50/50 dark:bg-slate-900/10">
        
        {/* Search Header */}
        <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/40">
          <div className="relative">
            <input 
              type="text" 
              placeholder="चैट या सहकर्मी खोजें..." 
              className="w-full bg-background border border-slate-200 dark:border-slate-850 rounded-xl px-3.5 py-1.8 pl-8 text-xs focus:outline-none focus:border-primary font-hindi"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Conversations Scrollbar */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850">
          {loadingConv ? (
            <div className="p-4 text-center text-xs text-slate-400 animate-pulse font-serif">चैट सूची लोड हो रही है...</div>
          ) : conversations.length > 0 ? (
            conversations.map((c) => {
              const isActive = activeConv?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveConv(c)}
                  className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                    isActive ? "bg-primary/5 dark:bg-slate-850/50 border-l-3 border-primary" : "hover:bg-slate-100/40 dark:hover:bg-slate-850/10"
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-500 uppercase shrink-0">
                    {c.name ? c.name[0] : "C"}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <span className="text-xs font-bold font-hindi text-slate-800 dark:text-white truncate">{c.name || "चर्चा रूम"}</span>
                      <span className="text-[8px] text-slate-400 font-mono shrink-0">{c.lastMessageTime}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 truncate font-hindi">{c.lastMessage || "कोई संदेश नहीं है"}</p>
                  </div>

                  {c.unreadCount ? (
                    <span className="w-4 h-4 rounded-full bg-primary text-white text-[8px] font-bold flex items-center justify-center shrink-0">
                      {c.unreadCount}
                    </span>
                  ) : null}
                </button>
              );
            })
          ) : (
            <div className="p-4 text-center text-xs text-slate-400 font-serif">कोई बातचीत उपलब्ध नहीं है।</div>
          )}
        </div>

      </div>

      {/* ─── RIGHT PANEL: Active Messages chat ─── */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-950">
        {activeConv ? (
          <>
            {/* Active Header */}
            <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/40 flex items-center justify-between">
              <div className="flex items-center space-x-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-500 uppercase shrink-0">
                  {activeConv.name ? activeConv.name[0] : "C"}
                </div>
                <div className="min-w-0">
                  <h3 className="text-xs font-bold text-slate-800 dark:text-white font-hindi truncate">{activeConv.name}</h3>
                  <span className="block text-[9px] text-green-500 font-serif font-bold">ऑनलाइन</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 text-slate-400">
                <Phone className="w-4 h-4 cursor-pointer hover:text-primary transition-colors" />
                <Video className="w-4.5 h-4.5 cursor-pointer hover:text-primary transition-colors" />
                <MoreVertical className="w-4 h-4 cursor-pointer hover:text-primary transition-colors" />
              </div>
            </div>

            {/* Messages body scrolling */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50/20 dark:bg-slate-900/10">
              {loadingMsg ? (
                <div className="text-center text-xs text-slate-400 animate-pulse font-serif py-10">संदेश लोड हो रहे हैं...</div>
              ) : messages.length > 0 ? (
                messages.map((m) => {
                  const isOwn = m.sender_id === currentUser?.id;
                  
                  return (
                    <div 
                      key={m.id} 
                      className={`flex flex-col max-w-[75%] ${isOwn ? "ml-auto items-end" : "mr-auto items-start"}`}
                    >
                      <div className={`p-3 rounded-2xl text-xs font-hindi relative group ${
                        isOwn 
                          ? "bg-primary text-white rounded-tr-none" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none"
                      }`}>
                        <p className="leading-relaxed">{m.content}</p>
                        
                        {/* Message Reactions Toolbar (hover state) */}
                        <div className={`absolute top-0 -translate-y-6 flex items-center space-x-1.5 p-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full shadow-md transition-opacity duration-200 opacity-0 group-hover:opacity-100 z-20 ${
                          isOwn ? "right-0" : "left-0"
                        }`}>
                          {["👍", "❤️", "⭐"].map(emoji => (
                            <button
                              key={emoji}
                              onClick={() => toggleReaction(m.id, emoji)}
                              className="text-[10px] hover:scale-125 transition-transform cursor-pointer"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Display active reactions */}
                      {m.reactions && Object.keys(m.reactions).some(k => m.reactions![k].length > 0) && (
                        <div className="flex items-center space-x-1 mt-1 z-10">
                          {Object.keys(m.reactions).map(emoji => {
                            const count = m.reactions![emoji].length;
                            if (count === 0) return null;
                            return (
                              <span 
                                key={emoji} 
                                className="px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[8px] font-mono flex items-center gap-1 cursor-pointer"
                                onClick={() => toggleReaction(m.id, emoji)}
                              >
                                <span>{emoji}</span>
                                <span>{count}</span>
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Timestamp & read status info */}
                      <div className="flex items-center space-x-1 text-[8px] text-slate-400 mt-1 font-mono">
                        <span>{new Date(m.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                        {isOwn && <CheckCheck className="w-3 h-3 text-primary shrink-0" />}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-20 text-center text-xs text-slate-450 font-serif">कोई संदेश नहीं है। संवाद शुरू करें!</div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Composer row */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-200/60 dark:border-slate-800/40 flex items-center gap-3">
              <button 
                type="button" 
                onClick={() => setMessageText(prev => prev + " 👍")}
                className="text-slate-400 hover:text-primary transition-colors cursor-pointer shrink-0"
              >
                <Smile className="w-5 h-5" />
              </button>
              
              <input 
                type="text" 
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="अपना संदेश यहाँ लिखें..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-primary font-hindi"
                required
              />

              <button 
                type="submit"
                className="bg-primary hover:bg-primary/95 text-white p-2.5 rounded-xl transition-all shadow-md shrink-0 flex items-center justify-center cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-grow flex flex-col items-center justify-center p-6 text-center text-slate-400 space-y-3 font-serif">
            <MessageCircle className="w-12 h-12 text-slate-300 animate-bounce" />
            <h4 className="text-sm font-bold font-hindi">आपकी बातचीत (Conversations)</h4>
            <p className="text-xs leading-relaxed max-w-sm">
              एक सक्रिय बातचीत शुरू करने के लिए बाईं ओर सूची से किसी चर्चा रूम का चयन करें।
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
