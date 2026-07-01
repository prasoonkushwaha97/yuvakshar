"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Pin, MessageSquare, Megaphone } from "lucide-react";
import { CH_CLASS, CH_ANIMATIONS, CH_COLORS } from "../shared/design";
import UserIdentity from "@/components/shared/UserIdentity";
import { getRooms } from "@/lib/actions/chaupalRoomActions";

interface Room {
  id: string;
  title: string;
  description: string | null;
  type: string;
  created_at: string;
}

export default function RoomListSidebar() {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadRooms() {
      setIsLoading(true);
      try {
        const fetchedRooms = await getRooms();
        if (isMounted) setRooms(fetchedRooms);
      } catch (err) {
        console.error("Failed to load rooms:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadRooms();
    return () => { isMounted = false; };
  }, []);

  const getRoomIcon = (type: string) => {
    switch (type) {
      case "announcement": return <Megaphone className="w-4 h-4 text-white" />;
      case "editorial": return <MessageSquare className="w-4 h-4 text-white" />;
      default: return <MessageSquare className="w-4 h-4 text-white" />;
    }
  };

  const filteredRooms = rooms.filter(room => 
    room.title.toLowerCase().includes(search.toLowerCase()) || 
    (room.description && room.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex flex-col w-full h-full bg-white dark:bg-[#0F172A] border-r border-slate-200 dark:border-slate-800">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <h2 className="font-serif font-bold text-xl text-slate-900 dark:text-white mb-4">चर्चा कक्ष</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="कक्ष खोजें..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-800/50 text-slate-900 dark:text-white pl-9 pr-4 py-2 rounded-xl text-sm outline-none focus:ring-1 focus:ring-[#F97316] transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-6 text-center text-sm text-slate-500">कक्ष लोड हो रहे हैं...</div>
        ) : filteredRooms.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-500">कोई कक्ष नहीं मिला।</div>
        ) : (
          filteredRooms.map(room => {
            const isActive = pathname === `/community/discussion/${room.id}`;
            return (
              <Link 
                href={`/community/discussion/${room.id}`} 
                key={room.id}
                className={`flex items-center gap-3 p-3 sm:px-4 cursor-pointer ${CH_ANIMATIONS.transition} ${
                  isActive ? "bg-orange-50 dark:bg-orange-950/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/30"
                }`}
              >
                <div className="relative shrink-0">
                  <UserIdentity user={{ name: room.title }} variant="inline" avatarSize={48} showUsername={false} clickable={false} />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center border-2 border-white dark:border-[#0F172A]">
                    {getRoomIcon(room.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className={`font-bold text-[15px] truncate ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                      {room.title}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p className={`text-sm truncate ${isActive ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                      {room.description || "चर्चा में शामिल हों"}
                    </p>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
