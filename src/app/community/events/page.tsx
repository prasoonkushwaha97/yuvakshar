"use client";

import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Plus, 
  Check, 
  Users,
  Send,
  CalendarDays,
  History,
  CheckCheck
} from "lucide-react";
import { useCms } from "@/store/CmsContext";
import GlassCard from "@/components/yuvakshar/GlassCard";

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: "Workshop" | "Webinar" | "Competition" | "Live Session" | "Meetup";
  event_date: string;
  meeting_link?: string;
  attendeesCount: number;
  rsvp?: "going" | "interested" | "none";
}

function EventCountdown({ eventDate }: { eventDate: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const target = new Date(eventDate).getTime();
    
    const update = () => {
      const now = new Date().getTime();
      const diff = target - now;
      
      if (diff <= 0) {
        setTimeLeft("कार्यक्रम समाप्त / जारी है");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        setTimeLeft(`${days} दिन, ${hours} घंटे शेष`);
      } else {
        setTimeLeft(`${hours} घंटे, ${mins} मिनट शेष`);
      }
    };

    update();
    const timer = setInterval(update, 60000);
    return () => clearInterval(timer);
  }, [eventDate]);

  if (timeLeft.includes("समाप्त")) return null;

  return (
    <div className="text-[9px] bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded font-hindi w-fit border border-amber-250/20">
      ⏳ {timeLeft}
    </div>
  );
}

export default function EventsPage() {
  const { currentUser } = useCms();
  const [events, setEvents] = useState<CommunityEvent[]>([
    { 
      id: "evt-1", 
      title: "सृजनात्मक कहानी लेखन कार्यशाला", 
      description: "कहानी की रूपरेखा, पात्र चित्रण और कथोपकथन निर्माण की बारीकियों पर 2 घंटे का लाइव प्रशिक्षण।", 
      type: "Workshop", 
      event_date: "2026-06-28T15:00:00Z", // Future Date
      meeting_link: "https://zoom.us/j/yuvakshar-workshop1", 
      attendeesCount: 45, 
      rsvp: "none" 
    },
    { 
      id: "evt-2", 
      title: "आधुनिक हिंदी साहित्य: नई दिशाएं", 
      description: "वरिष्ठ आलोचकों के साथ वेबिनार जिसमें आज के दौर में हिंदी साहित्य के सम्मुख चुनौतियां और संभावनाओं पर चर्चा होगी।", 
      type: "Webinar", 
      event_date: "2026-06-30T17:00:00Z", // Future Date
      meeting_link: "https://meet.google.com/yuvakshar-webinar2", 
      attendeesCount: 82, 
      rsvp: "interested" 
    },
    {
      id: "evt-past-1",
      title: "छायावाद युग और महादेवी वर्मा काव्य संगोष्ठी",
      description: "महादेवी वर्मा की जयंती पर विशेष सत्र, छायावादी गीतों का पाठ एवं समालोचनात्मक व्याख्या।",
      type: "Meetup",
      event_date: "2026-05-15T11:00:00Z", // Past Date
      attendeesCount: 120,
      rsvp: "going"
    }
  ]);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
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
      if (saved) {
        setEvents(JSON.parse(saved));
      } else {
        localStorage.setItem("yuvakshar_c_events", JSON.stringify(events));
      }
    }
  }, []);

  const saveEvents = (items: CommunityEvent[]) => {
    setEvents(items);
    if (typeof window !== "undefined") {
      localStorage.setItem("yuvakshar_c_events", JSON.stringify(items));
    }
  };

  const handleRsvpChange = (id: string, nextRsvp: "going" | "interested" | "none") => {
    if (!currentUser) {
      alert("प्रतिक्रिया (RSVP) दर्ज करने के लिए कृपया लॉगिन करें।");
      return;
    }
    const updated = events.map(evt => {
      if (evt.id === id) {
        const prevRsvp = evt.rsvp || "none";
        let countDiff = 0;
        
        // Calculate attendeesCount adjustment
        if (prevRsvp === "going" && nextRsvp !== "going") countDiff = -1;
        else if (prevRsvp !== "going" && nextRsvp === "going") countDiff = 1;

        alert(
          nextRsvp === "going" 
            ? "प्रतिक्रिया दर्ज: 'मैं शामिल हो रहा हूँ'। इवेंट प्रारंभ होने से 15 मिनट पूर्व आपको रिमाइंडर भेजा जाएगा।" 
            : nextRsvp === "interested" 
            ? "प्रतिक्रिया दर्ज: 'रुचि है'। इस कार्यक्रम की आगामी सूचनाएं आपको मिलती रहेंगी।"
            : "आपकी प्रतिक्रिया हटा दी गई है।"
        );

        return {
          ...evt,
          rsvp: nextRsvp,
          attendeesCount: evt.attendeesCount + countDiff
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
      rsvp: "going"
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

  // Divide upcoming and past events
  const now = new Date();
  const upcomingEvents = events.filter(evt => new Date(evt.event_date) >= now);
  const pastEvents = events.filter(evt => new Date(evt.event_date) < now);

  const displayedEvents = activeTab === "upcoming" ? upcomingEvents : pastEvents;

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

      {/* Tabs */}
      <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-900/60 rounded-xl p-1 w-fit">
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer font-hindi flex items-center gap-1.5 ${
            activeTab === "upcoming"
              ? "bg-white dark:bg-slate-950 text-slate-800 dark:text-white shadow-sm"
              : "text-slate-400 hover:text-slate-500"
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>आगामी कार्यक्रम ({upcomingEvents.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer font-hindi flex items-center gap-1.5 ${
            activeTab === "past"
              ? "bg-white dark:bg-slate-950 text-slate-800 dark:text-white shadow-sm"
              : "text-slate-400 hover:text-slate-500"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>विगत कार्यक्रम ({pastEvents.length})</span>
        </button>
      </div>

      {/* Events Listing */}
      <div className="space-y-5">
        {displayedEvents.length > 0 ? (
          displayedEvents.map((evt) => {
            const dateObj = new Date(evt.event_date);
            const formattedDate = dateObj.toLocaleDateString("hi-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
            const formattedTime = dateObj.toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" });
            const isPast = dateObj < now;

            return (
              <GlassCard key={evt.id} className="p-5 border-slate-200/60 dark:border-slate-800/40 space-y-4">
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-850 pb-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center space-x-2">
                      <span className="text-[9px] bg-primary/10 text-primary border border-primary/20 px-2.5 py-0.5 rounded font-mono font-bold uppercase">
                        {evt.type}
                      </span>
                      {!isPast && <EventCountdown eventDate={evt.event_date} />}
                      {isPast && (
                        <span className="text-[9px] bg-slate-150 text-slate-500 dark:bg-slate-800 dark:text-slate-400 px-2.5 py-0.5 rounded font-hindi font-bold">
                          ✓ संपन्न (Ended)
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-sm font-bold text-slate-800 dark:text-white font-hindi leading-snug">
                      {evt.title}
                    </h3>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <span className="text-slate-400 font-mono text-[10px] flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      <span>{evt.attendeesCount} आ रहे हैं</span>
                    </span>
                    
                    {/* Participant initial bubbles */}
                    <div className="flex -space-x-1.5 overflow-hidden">
                      {["र", "प", "अ", "म"].slice(0, Math.min(4, evt.attendeesCount)).map((char, idx) => (
                        <div 
                          key={idx} 
                          className="inline-flex items-center justify-center w-5.5 h-5.5 rounded-full ring-2 ring-white dark:ring-[#0B1222] bg-slate-100 dark:bg-slate-800 text-[8px] font-bold text-slate-500 uppercase font-hindi shrink-0"
                        >
                          {char}
                        </div>
                      ))}
                      {evt.attendeesCount > 4 && (
                        <div className="inline-flex items-center justify-center w-5.5 h-5.5 rounded-full ring-2 ring-white dark:ring-[#0B1222] bg-primary text-white text-[8px] font-mono shrink-0">
                          +{evt.attendeesCount - 4}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-550 dark:text-slate-450 leading-relaxed font-hindi">
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

                {/* RSVP panel */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-850 mt-2">
                  {!isPast ? (
                    <>
                      {evt.meeting_link && evt.rsvp === "going" && (
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
                      
                      {/* Going / Interested Toggle Buttons */}
                      <div className="flex items-center space-x-2 ml-auto">
                        <button
                          onClick={() => handleRsvpChange(evt.id, evt.rsvp === "going" ? "none" : "going")}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer font-hindi flex items-center gap-1 ${
                            evt.rsvp === "going"
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350"
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>मैं आ रहा हूँ (Going)</span>
                        </button>
                        <button
                          onClick={() => handleRsvpChange(evt.id, evt.rsvp === "interested" ? "none" : "interested")}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer font-hindi ${
                            evt.rsvp === "interested"
                              ? "bg-primary text-white hover:bg-primary/95"
                              : "bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350"
                          }`}
                        >
                          <span>रुचि है (Interested)</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Past events indicators */}
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 font-hindi">
                        <CheckCheck className="w-4 h-4 text-green-500" />
                        <span>सफलतापूर्वक संपन्न। कुल {evt.attendeesCount} लेखकों ने सहभागिता की।</span>
                      </div>
                    </>
                  )}
                </div>

              </GlassCard>
            );
          })
        ) : (
          <div className="py-20 text-center text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl font-serif text-xs">
            {activeTab === "upcoming" ? "कोई आगामी कार्यक्रम नहीं मिला।" : "कोई विगत कार्यक्रम नहीं मिला।"}
          </div>
        )}
      </div>

    </div>
  );
}
