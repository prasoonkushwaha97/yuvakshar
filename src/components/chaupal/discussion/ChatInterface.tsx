"use client";

import React, { useState, useRef, useEffect } from "react";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import ChatInputArea from "./ChatInputArea";
import { useCms } from "@/store/CmsContext";
import { getRoom, getRoomMessages, sendMessage } from "@/lib/actions/chaupalRoomActions";
import { useChaupalRealtime } from "@/hooks/useChaupalRealtime";

export default function ChatInterface({ roomId }: { roomId: string }) {
  const { currentUser } = useCms();
  const [room, setRoom] = useState<any>(null);
  const [initialMessages, setInitialMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hook for realtime sync
  const { messages, setMessages } = useChaupalRealtime(roomId, initialMessages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial data
  useEffect(() => {
    let isMounted = true;
    async function loadRoomData() {
      setIsLoading(true);
      try {
        const [roomData, msgs] = await Promise.all([
          getRoom(roomId),
          getRoomMessages(roomId, 1, 50)
        ]);
        if (isMounted) {
          setRoom(roomData);
          setInitialMessages(msgs);
        }
      } catch (err) {
        console.error("Failed to load room:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadRoomData();
    return () => { isMounted = false; };
  }, [roomId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!currentUser) {
      alert("संदेश भेजने के लिए लॉगिन करें।");
      return;
    }
    try {
      // Optimistic insert could go here, but since realtime is fast, 
      // sending to server is safer to get the correct DB ID immediately.
      // (For production with optimistic UI we would insert a local message and replace it)
      await sendMessage(roomId, content);
      // The realtime subscription will pick up the insertion and append it.
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("संदेश भेजने में त्रुटि हुई।");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-[#090D16]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex items-center justify-center h-full text-slate-500 bg-slate-50 dark:bg-[#090D16]">
        यह कक्ष उपलब्ध नहीं है।
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-[#090D16]">
      <ChatHeader 
        room={{
          id: room.id,
          title: room.title,
          type: room.type,
          participantsCount: 0, // Would need aggregate query
        }} 
      />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto pt-4 pb-4 px-2 sm:px-4 no-scrollbar">
        <div className="flex flex-col gap-2">
          <div className="bg-orange-50 dark:bg-orange-900/20 text-[#F97316] text-xs font-bold px-4 py-2 rounded-xl mb-4 max-w-2xl mx-auto flex items-center justify-center gap-2">
            📌 नियम: यह एक सार्वजनिक मंच है। कृपया मर्यादित भाषा का प्रयोग करें।
          </div>

          {messages.map(msg => (
            <MessageBubble 
              key={msg.id} 
              message={{
                ...msg,
                isOwnMessage: msg.author.id === currentUser?.id,
                sender: msg.author,
                timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }} 
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInputArea onSendMessage={handleSendMessage} />
    </div>
  );
}
