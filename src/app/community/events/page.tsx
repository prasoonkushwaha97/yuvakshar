"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Plus, 
  Check, 
  Bell, 
  Users,
  Send,
  CalendarDays
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import { fetchGroups } from "@/lib/communityService";
import GlassCard from "@/components/yuvakshar/GlassCard";

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: "Workshop" | "Webinar" | "Competition" | "Live Session" | "Meetup";
  event_date: string;
  meeting_link?: string;
  attendeesCount: number;
  isRegistered?: boolean;
}

export default function EventsPage() {
  const { currentUser } = useCms();
  const [events, setEvents] = useState<CommunityEvent[]>([
    { id: "evt-1", title: "सृजनात्मक कहानी लेखन कार्यशाला", description: "कहानी की रूपरेखा, पात्र चित्रण और कथोपकथन निर्माण की बारीकियों पर 2 घंटे का लाइव प्रशिक्षण।", type: "Workshop", event_date: "2026-06-18T15:00:00Z", meeting_link: "https://zoom.us/j/yuvakshar-workshop1", attendeesCount: 45, isRegistered: false },
    { id: "evt-2", title: "आधुनिक हिंदी साहित्य: नई दिशाएं", description: "वरिष्ठ आलोचकों के साथ वेबिनार जिसमें आज के दौर में हिंदी साहित्य के सम्मुख चुनौतियां और संभावनाओं पर चर्चा होगी।", type: "Webinar", event_date: "2026-06-25T17:00:00Z", meeting_link: "https://meet.google.com/yuvakshar-webinar2", attendeesCount: 82, isRegistered: true }
  ]);
  const [showEventForm, setShowEventForm] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<CommunityEvent["type"]>("Workshop");
  const [date, setDate] = useState("");
  const [link, setLink] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("yuvakshar_c_events");
      if (saved) setEvents(JSON.parse(saved));
    }
  }, []);

  const saveEvents = (items: CommunityEvent[]) => {
    setEvents(items);
    if (typeof window !== "undefined") {
      localStorage.setItem("yuvakshar_c_events", JSON.stringify(items));
    }
  };

  const handleRegister = (id: string) => {
    if (!currentUser) {
      alert("कार्यक्रम पंजीकरण के लिए कृपया पहले लॉगिन करें।");
      return;
    }
    const updated = events.map(evt => {
      if (evt.id === id) {
        const nextState = !evt.isRegistered;
        alert(nextState ? "पंजीकरण सफल! इवेंट प्रारंभ होने से 15 मिनट पूर्व आपको रिमाइंडर भेजा जाएगा।" : "आपका पंजीकरण रद्द कर दिया गया है।");
        return {
          ...evt,
          isRegistered: nextState,
          attendeesCount: evt.attendeesCount + (nextState ? 1 : -1)
        };
      }
      return evt;
    });
    saveEvents(updated);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!title.trim() || !date.trim()) return;

    const newEvent: CommunityEvent = {
      id: `evt-${Date.now()}`,
      title,
      description,
      type,
      event_date: new Date(date).toISOString(),
      meeting_link: link || undefined,
      attendeesCount: 1,
      isRegistered: true
    };

    const updated = [newEvent, ...events];
    saveEvents(updated);
    setTitle("");
    setDescription("");
    setDate("");
    setLink("");
    setShowEventForm(false);
    alert("नया साहित्यिक कार्यक्रम सफलतापूर्वक सूचीबद्ध कर दिया गया है!");
  };

  return (
    <div className="space-y-6 text-[#0F172A] dark:text-slate-200">
      
      {/* Header bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-[#0F172A]/35 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800/40">
        <div className="flex items-center space-x-2 text-primary font-bold text-xs font-serif font-hindi">
          <CalendarDays className="w-5 h-5" />
          <span>साहित्यिक एवं शैक्षणिक कार्यक्रम (Events)</span>
        </div>
        
        {currentUser && ["Admin", "Owner", "Editor", "Author"].includes(currentUser.role || "") && (
          <button
            onClick={() => setShowEventForm(!showEventForm)}
            className="bg-primary hover:bg-primary/95 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer font-hindi"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>नया कार्यक्रम आयोजित करें</span>
          </button>
        )}
      </div>

      {/* Propose/Create Form */}
      {showEventForm && currentUser && (
        <GlassCard className="p-5 border-slate-200/60 dark:border-slate-800/40">
          <form onSubmit={handleCreateEvent} className="space-y-4 text-xs font-hindi">
            <h3 className="text-sm font-bold font-serif text-slate-800 dark:text-white flex items-center gap-1.5">
              <Plus className="w-4.5 h-4.5 text-primary" />
              <span>नया इवेंट शेड्यूल करें</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block font-serif">विषय/शीर्षक (Event Title)</label>
                <input 
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="जैसे: सुमित्रानंदन पंत काव्य संध्या"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block font-serif">प्रकार (Event Type)</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 focus:outline-none"
                >
                  <option value="Workshop">कार्यशाला (Workshop)</option>
                  <option value="Webinar">वेबिनार (Webinar)</option>
                  <option value="Live Session">लाइव सत्र (Live Session)</option>
                  <option value="Meetup">संगोष्ठी (Meetup)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-400 block font-serif">विवरण</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="इस कार्यक्रम के उद्देश्यों और वक्ताओं के बारे में बताएं..."
                rows={2}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3 focus:outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block font-serif">दिनांक एवं समय (Date & Time)</label>
                <input 
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 focus:outline-none font-mono"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 block font-serif">लाइव मीटिंग लिंक (Zoom / Google Meet URL)</label>
                <input 
                  type="url"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://zoom.us/j/meeting-id"
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 focus:outline-none font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>शेड्यूल करें (Schedule Event)</span>
            </button>
          </form>
        </GlassCard>
      )}

      {/* Events Listing */}
      <div className="space-y-5">
        {events.map((evt) => {
          const dateObj = new Date(evt.event_date);
          const formattedDate = dateObj.toLocaleDateString("hi-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
          const formattedTime = dateObj.toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" });

          return (
            <GlassCard key={evt.id} className="p-5 border-slate-200/60 dark:border-slate-800/40 space-y-4">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-850 pb-3">
                <div className="space-y-1.5">
                  <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded font-mono font-bold uppercase">
                    {evt.type}
                  </span>
                  <h3 className="font-serif text-sm font-bold text-slate-800 dark:text-white font-hindi leading-snug">
                    {evt.title}
                  </h3>
                </div>

                <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono">
                  <Users className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{evt.attendeesCount} प्रतिभागी</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-hindi">
                {evt.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-serif text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-hindi">{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <span>समय: {formattedTime} IST</span>
                </div>
              </div>

              {/* Action and link panel */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-850 mt-2">
                {evt.meeting_link && evt.isRegistered && (
                  <a
                    href={evt.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary font-bold hover:underline flex items-center gap-1.5 font-hindi"
                  >
                    <Video className="w-4 h-4 shrink-0" />
                    <span>लाइव ज्वाइन करें (Join Live)</span>
                  </a>
                )}
                {!evt.meeting_link && (
                  <div className="text-[10px] text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-hindi">स्थान: ऑनलाइन चौपाल</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-2 ml-auto">
                  <button
                    onClick={() => handleRegister(evt.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer font-hindi flex items-center gap-1.5 ${
                      evt.isRegistered
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-primary/10 hover:bg-primary/20 text-primary"
                    }`}
                  >
                    {evt.isRegistered ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span>रजिस्टर्ड</span>
                      </>
                    ) : (
                      <span>पंजीकरण करें</span>
                    )}
                  </button>
                </div>
              </div>

            </GlassCard>
          );
        })}
      </div>

    </div>
  );
}
