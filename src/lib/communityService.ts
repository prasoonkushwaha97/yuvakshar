import { isSupabaseConfigured, supabase } from "@/lib/supabaseClient";

// ─── TYPE INTERFACES ────────────────────────────────────────────────────────

export interface CommunityGroup {
  id: string;
  name: string;
  description: string;
  category: "Literature" | "Poetry" | "Journalism" | "Research" | "Exams" | "Reading Club";
  is_private: boolean;
  owner_id: string;
  current_book?: string;
  created_at: string;
  membersCount?: number;
}

export interface CommunityGroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: "Owner" | "Admin" | "Moderator" | "Mentor" | "Member";
  joined_at: string;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  user_rank?: string;
  group_id?: string;
  group_name?: string;
  title?: string;
  content: string;
  post_type: "text" | "image" | "pdf" | "poll" | "discussion" | "resource" | "link";
  media_url?: string;
  poll_question?: string;
  poll_options?: string[];
  poll_votes?: Record<string, number>; // userId -> optionIndex
  link_url?: string;
  forum_category?: "General" | "Writing Help" | "Criticism" | "Publishing" | "Magazine" | "Research" | "Support";
  is_pinned: boolean;
  is_locked: boolean;
  is_solved: boolean;
  best_answer_id?: string;
  created_at: string;
  likesCount: number;
  commentsCount: number;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  parent_id?: string | null;
  user_id: string;
  user_name: string;
  user_avatar?: string;
  content: string;
  is_accepted_answer: boolean;
  likesCount: number;
  created_at: string;
  replies?: CommunityComment[];
  reply_to_name?: string;
  reply_to_content?: string;
}

export interface CommunityReadingProgress {
  id: string;
  group_id: string;
  user_id: string;
  book_title: string;
  current_page: number;
  total_pages: number;
  notes?: string;
  updated_at: string;
}

export interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  type: "Poetry" | "Story" | "Essay" | "Research" | "Marathon" | "Debate";
  start_date: string;
  end_date: string;
  reward_points: number;
  created_at: string;
}

export interface CommunityChallengeSubmission {
  id: string;
  challenge_id: string;
  user_id: string;
  user_name: string;
  title: string;
  content: string;
  votes_count: number;
  is_winner: boolean;
  created_at: string;
}

export interface CommunityReputationHistory {
  id: string;
  user_id: string;
  points: number;
  source: "Post Creation" | "Comment" | "Article Publication" | "Like Received" | "Best Answer" | "Challenge Winner";
  related_id?: string;
  created_at: string;
}

export interface CommunityConversation {
  id: string;
  name?: string;
  is_group: boolean;
  created_at: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export interface CommunityMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  content?: string;
  file_url?: string;
  reactions?: Record<string, string[]>; // emoji -> userIds
  is_read: boolean;
  created_at: string;
}

export interface CommunityNotification {
  id: string;
  user_id: string;
  sender_id: string;
  sender_name: string;
  sender_avatar?: string;
  notification_type: "like" | "comment" | "reply" | "follow" | "collab_request" | "event_reminder" | "challenge_update" | "rank_up";
  content: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface CommunityBookmark {
  id: string;
  user_id: string;
  content_type: "article" | "post" | "group" | "event" | "reading_list";
  content_id: string;
  created_at: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  type: "Workshop" | "Webinar" | "Competition" | "Live Session" | "Meetup";
  event_date: string;
  meeting_link?: string;
  attendeesCount: number;
  isRegistered?: boolean;
}

// ─── PRESEEDED MOCK DATA ────────────────────────────────────────────────────

export const mockGroups: CommunityGroup[] = [
  { id: "poetry-circle", name: "काव्य रस - काव्य संगोष्ठी", description: "हिंदी कविताओं, छंदों और मुक्तकों पर चर्चा एवं साझा पठन।", category: "Poetry", is_private: false, owner_id: "usr-1", created_at: "2026-05-01T12:00:00Z", membersCount: 142 },
  { id: "story-hub", name: "कथा मंच - कहानी लेखन", description: "लघु कथाओं, संस्मरणों और रचनात्मक गद्य लेखन के लिए समूह।", category: "Story Writing" as any, is_private: false, owner_id: "usr-2", created_at: "2026-05-02T12:00:00Z", membersCount: 98 },
  { id: "read-club-1", name: "गोदान पठन क्लब", description: "मुंशी प्रेमचंद के अमर उपन्यास 'गोदान' का साप्ताहिक विश्लेषण एवं सामूहिक विमर्श।", category: "Reading Club", is_private: false, owner_id: "usr-3", current_book: "गोदान - प्रेमचंद", created_at: "2026-05-05T12:00:00Z", membersCount: 64 },
  { id: "journalism-desk", name: "सृजनात्मक पत्रकारिता", description: "सच्ची पत्रकारिता और सामाजिक मुद्दों पर बेबाक लेख लिखने वाले लेखकों का समूह।", category: "Journalism", is_private: false, owner_id: "usr-1", created_at: "2026-05-10T12:00:00Z", membersCount: 52 },
  { id: "exam-desk", name: "प्रतियोगी परीक्षा हिंदी", description: "UGC NET, सिविल सेवा परीक्षा हिंदी साहित्य पाठ्यक्रम अध्ययन चर्चा।", category: "Exams", is_private: false, owner_id: "usr-4", created_at: "2026-05-15T12:00:00Z", membersCount: 210 }
];

export const mockPosts: CommunityPost[] = [
  {
    id: "post-1",
    user_id: "usr-author-1",
    user_name: "डॉ. विकास शर्मा",
    user_avatar: "",
    user_rank: "Mentor",
    title: "कविता में बिंब विधान का महत्व",
    content: "नमस्कार साथियों, आज हम बात करेंगे कि कविता में बिंब (imagery) का क्या महत्व है। बिंब हमारी इंद्रियों को जाग्रत करते हैं और कविता को अधिक सघन बनाते हैं। निराला जी की 'राम की शक्ति पूजा' में बिंब योजना का सर्वश्रेष्ठ उदाहरण देखने को मिलता है। आपके इस विषय पर क्या विचार हैं?",
    post_type: "discussion",
    forum_category: "Criticism",
    is_pinned: true,
    is_locked: false,
    is_solved: false,
    created_at: "2026-06-11T10:00:00Z",
    likesCount: 28,
    commentsCount: 3
  },
  {
    id: "post-2",
    user_id: "usr-author-2",
    user_name: "अमित कुमार",
    user_avatar: "",
    user_rank: "Contributor",
    group_id: "poetry-circle",
    group_name: "काव्य रस",
    content: "मेरी नई रचना 'समय की रेत' पर आप सभी की प्रतिक्रिया सादर आमंत्रित है:\n\n*मुट्ठी से फिसलती रेत सी है ज़िन्दगी.*\n*हर लम्हा गुज़रता एक नया ख्वाब सी है ज़िन्दगी.*\n*कोशिश बहुत की रोक लें इस बहते दरिया को.*\n*पर साहिलों से टकराकर टूटती लहर सी है ज़िन्दगी।*",
    post_type: "text",
    is_pinned: false,
    is_locked: false,
    is_solved: false,
    created_at: "2026-06-12T08:30:00Z",
    likesCount: 15,
    commentsCount: 2
  },
  {
    id: "post-3",
    user_id: "usr-admin-1",
    user_name: "संपादक युवाक्षर",
    user_avatar: "",
    user_rank: "Community Leader",
    title: "साप्ताहिक मतदान: आपका पसंदीदा विधा कौन सी है?",
    content: "युवाक्षर समुदाय के प्रिय पाठकों, हम यह जानने के लिए उत्सुक हैं कि आपकी सबसे पसंदीदा साहित्यिक विधा कौन सी है जिसमें आप लिखना या पढ़ना पसंद करते हैं?",
    post_type: "poll",
    poll_question: "आपकी पसंदीदा साहित्यिक विधा कौन सी है?",
    poll_options: ["कविता (Poetry)", "कहानी (Story)", "निबंध/लेख (Essay)", "आलोचना/अनुसंधान (Criticism)"],
    poll_votes: { "usr-2": 0, "usr-3": 1, "usr-4": 1, "usr-5": 2 },
    is_pinned: false,
    is_locked: false,
    is_solved: false,
    created_at: "2026-06-12T05:00:00Z",
    likesCount: 19,
    commentsCount: 0
  }
];

export const mockComments: CommunityComment[] = [
  {
    id: "comm-1",
    post_id: "post-1",
    user_id: "usr-author-3",
    user_name: "सरिता वर्मा",
    content: "विकास जी, अत्यंत महत्वपूर्ण लेख। निराला जी की कविताओं में दृश्य बिंबों के साथ-साथ नादात्मक बिंब (sound imagery) भी बहुत प्रभावी होते हैं।",
    is_accepted_answer: false,
    likesCount: 5,
    created_at: "2026-06-11T11:30:00Z",
    replies: [
      {
        id: "comm-1-sub",
        post_id: "post-1",
        parent_id: "comm-1",
        user_id: "usr-author-1",
        user_name: "डॉ. विकास शर्मा",
        content: "बिल्कुल सरिता जी, 'ध्वनित हो रहा नाद शत-शत' जैसी पंक्तियाँ इसका साक्षात् प्रमाण हैं।",
        is_accepted_answer: false,
        likesCount: 2,
        created_at: "2026-06-11T12:00:00Z"
      }
    ]
  },
  {
    id: "comm-2",
    post_id: "post-2",
    user_id: "usr-author-1",
    user_name: "डॉ. विकास शर्मा",
    content: "अमित जी, कविता में लय बहुत सुंदर है। विशेषकर दूसरी पंक्ति में विरह का भाव उत्कृष्ट बन पड़ा है। बधाई!",
    is_accepted_answer: false,
    likesCount: 3,
    created_at: "2026-06-12T09:10:00Z"
  }
];

export const mockEvents: CommunityEvent[] = [
  { id: "evt-1", title: "सृजनात्मक कहानी लेखन कार्यशाला", description: "कहानी की रूपरेखा, पात्र चित्रण और कथोपकथन निर्माण की बारीकियों पर 2 घंटे का लाइव प्रशिक्षण।", type: "Workshop", event_date: "2026-06-18T15:00:00Z", meeting_link: "https://zoom.us/j/yuvakshar-workshop1", attendeesCount: 45 },
  { id: "evt-2", title: "आधुनिक हिंदी साहित्य: नई दिशाएं", description: "युवा लेखकों के साथ वेबिनार जिसमें आज के दौर में हिंदी साहित्य के सम्मुख चुनौतियां और संभावनाओं पर चर्चा होगी।", type: "Webinar", event_date: "2026-06-25T17:00:00Z", meeting_link: "https://meet.google.com/yuvakshar-webinar2", attendeesCount: 82 }
];

export const mockChallenges: CommunityChallenge[] = [
  { id: "chal-1", title: "वर्षा ऋतु - काव्य प्रतियोगिता", description: "वर्षा ऋतु पर अपनी मौलिक कविताएं साझा करें। श्रेष्ठ प्रविष्टियों को युवाक्षर पत्रिका में स्थान दिया जाएगा।", type: "Poetry", start_date: "2026-06-01T00:00:00Z", end_date: "2026-06-20T23:59:59Z", reward_points: 150, created_at: "2026-06-01T00:00:00Z" },
  { id: "chal-2", title: "लघु कथा लेखन मैराथन", description: "500 शब्दों के भीतर सामाजिक विसंगतियों पर केंद्रित एक सशक्त कहानी लिखें।", type: "Story", start_date: "2026-06-10T00:00:00Z", end_date: "2026-06-30T23:59:59Z", reward_points: 200, created_at: "2026-06-10T00:00:00Z" }
];

export const mockMessages: CommunityMessage[] = [
  { id: "msg-1", conversation_id: "conv-1", sender_id: "usr-author-2", sender_name: "अमित कुमार", content: "नमस्ते विकास जी, क्या आप मेरे नए लेख की समीक्षा कर सकते हैं?", is_read: true, created_at: "2026-06-12T10:00:00Z" },
  { id: "msg-2", conversation_id: "conv-1", sender_id: "usr-author-1", sender_name: "डॉ. विकास शर्मा", content: "बिल्कुल अमित जी, कृपया अपना ड्राफ्ट साझा करें। मुझे पढ़कर प्रसन्नता होगी।", is_read: true, created_at: "2026-06-12T10:15:00Z" }
];

export const mockConversations: CommunityConversation[] = [
  { id: "conv-1", name: "डॉ. विकास शर्मा", is_group: false, created_at: "2026-06-12T09:00:00Z", lastMessage: "कृपया अपना ड्राफ्ट साझा करें...", lastMessageTime: "10:15 AM", unreadCount: 0 }
];

export const mockNotifications: CommunityNotification[] = [
  { id: "not-1", user_id: "usr-author-2", sender_id: "usr-author-1", sender_name: "डॉ. विकास शर्मा", notification_type: "like", content: "डॉ. विकास शर्मा ने आपकी पोस्ट 'समय की रेत' को पसंद किया।", related_id: "post-2", is_read: false, created_at: "2026-06-12T09:12:00Z" },
  { id: "not-2", user_id: "usr-author-2", sender_id: "usr-author-1", sender_name: "डॉ. विकास शर्मा", notification_type: "comment", content: "डॉ. विकास शर्मा ने आपकी पोस्ट 'समय की रेत' पर टिप्पणी की।", related_id: "post-2", is_read: false, created_at: "2026-06-12T09:10:00Z" }
];

// ─── LOCAL STORAGE & PERSISTENCE ENGINE ─────────────────────────────────────

const getLocalStorageItem = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  const item = localStorage.getItem(key);
  return item ? JSON.parse(item) : fallback;
};

const setLocalStorageItem = <T>(key: string, value: T): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

// Initialize localStorage data on client
export const initializeCommunityData = () => {
  if (typeof window === "undefined") return;
  if (!localStorage.getItem("yuvakshar_c_groups")) setLocalStorageItem("yuvakshar_c_groups", mockGroups);
  if (!localStorage.getItem("yuvakshar_c_posts")) setLocalStorageItem("yuvakshar_c_posts", mockPosts);
  if (!localStorage.getItem("yuvakshar_c_comments")) setLocalStorageItem("yuvakshar_c_comments", mockComments);
  if (!localStorage.getItem("yuvakshar_c_events")) setLocalStorageItem("yuvakshar_c_events", mockEvents);
  if (!localStorage.getItem("yuvakshar_c_challenges")) setLocalStorageItem("yuvakshar_c_challenges", mockChallenges);
  if (!localStorage.getItem("yuvakshar_c_conversations")) setLocalStorageItem("yuvakshar_c_conversations", mockConversations);
  if (!localStorage.getItem("yuvakshar_c_messages")) setLocalStorageItem("yuvakshar_c_messages", mockMessages);
  if (!localStorage.getItem("yuvakshar_c_notifications")) setLocalStorageItem("yuvakshar_c_notifications", mockNotifications);
  
  if (!localStorage.getItem("yuvakshar_c_group_members")) {
    const defaultMembers: CommunityGroupMember[] = [
      { id: "mem-1", group_id: "poetry-circle", user_id: "usr-author-1", role: "Mentor", joined_at: "2026-05-01T12:00:00Z" },
      { id: "mem-2", group_id: "poetry-circle", user_id: "usr-author-2", role: "Member", joined_at: "2026-05-12T12:00:00Z" },
      { id: "mem-3", group_id: "story-hub", user_id: "usr-author-2", role: "Moderator", joined_at: "2026-05-02T12:00:00Z" },
      { id: "mem-4", group_id: "read-club-1", user_id: "usr-author-3", role: "Owner", joined_at: "2026-05-05T12:00:00Z" },
      { id: "mem-5", group_id: "read-club-1", user_id: "usr-author-2", role: "Member", joined_at: "2026-05-06T12:00:00Z" }
    ];
    setLocalStorageItem("yuvakshar_c_group_members", defaultMembers);
  }

  if (!localStorage.getItem("yuvakshar_c_reading_progress")) {
    const defaultProgress: CommunityReadingProgress[] = [
      { id: "log-1", group_id: "read-club-1", user_id: "usr-author-3", book_title: "गोदान - प्रेमचंद", current_page: 120, total_pages: 450, notes: "गोबर और झुनिया के संबंधों का विश्लेषण पढ़ रही हूँ। प्रेमचंद का ग्रामीण चित्रण अद्भुत है।", updated_at: new Date().toISOString() },
      { id: "log-2", group_id: "read-club-1", user_id: "usr-author-2", book_title: "गोदान - प्रेमचंद", current_page: 85, total_pages: 450, notes: "होरी की गाय खरीदने की लालसा पर पहला अध्याय समाप्त किया।", updated_at: new Date().toISOString() },
      { id: "log-3", group_id: "read-club-1", user_id: "usr-author-1", book_title: "गोदान - प्रेमचंद", current_page: 340, total_pages: 450, notes: "उपन्यास अपने अंतिम चरण में है। होरी की त्रासदी हृदयविदारक है।", updated_at: new Date().toISOString() }
    ];
    setLocalStorageItem("yuvakshar_c_reading_progress", defaultProgress);
  }
};

// ─── API & DATABASE INTERACTION METHODS ─────────────────────────────────────

/**
 * Fetch all groups/reading clubs
 */
export const fetchGroups = async (): Promise<CommunityGroup[]> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from("community_groups").select("*");
    if (!error && data) return data;
  }
  initializeCommunityData();
  return getLocalStorageItem("yuvakshar_c_groups", mockGroups);
};

/**
 * Fetch all members of a Group
 */
export const fetchGroupMembers = async (groupId: string): Promise<CommunityGroupMember[]> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("community_members")
      .select("*")
      .eq("community_id", groupId);
    if (!error && data) {
      return data.map(m => ({
        id: m.id,
        group_id: m.community_id,
        user_id: m.user_id,
        role: m.role as any,
        joined_at: m.joined_at
      }));
    }
  }
  initializeCommunityData();
  return getLocalStorageItem<CommunityGroupMember[]>("yuvakshar_c_group_members", []);
};

/**
 * Check if user is a member of a Group
 */
export const isUserGroupMember = async (groupId: string, userId: string): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("community_members")
      .select("id")
      .eq("community_id", groupId)
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle();
    if (!error) return !!data;
  }
  initializeCommunityData();
  const members = getLocalStorageItem<CommunityGroupMember[]>("yuvakshar_c_group_members", []);
  return members.some(m => m.group_id === groupId && m.user_id === userId);
};

/**
 * Join or leave a Group
 */
export const toggleGroupMembership = async (groupId: string, userId: string): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    const { data: existing, error: checkError } = await supabase
      .from("community_members")
      .select("*")
      .eq("community_id", groupId)
      .eq("user_id", userId)
      .maybeSingle();
      
    if (!checkError) {
      if (existing) {
        // Leave group
        const { error } = await supabase
          .from("community_members")
          .delete()
          .eq("community_id", groupId)
          .eq("user_id", userId);
        return error ? true : false; // return false for left
      } else {
        // Join group
        const { error } = await supabase
          .from("community_members")
          .insert({
            community_id: groupId,
            user_id: userId,
            role: "member",
            status: "active"
          });
        return error ? false : true; // return true for joined
      }
    }
  }
  initializeCommunityData();
  const members = getLocalStorageItem<CommunityGroupMember[]>("yuvakshar_c_group_members", []);
  const existingIdx = members.findIndex(m => m.group_id === groupId && m.user_id === userId);
  const isMember = existingIdx > -1;

  if (isMember) {
    // Leave group
    members.splice(existingIdx, 1);
  } else {
    // Join group
    members.push({
      id: `mem-${Date.now()}`,
      group_id: groupId,
      user_id: userId,
      role: "Member",
      joined_at: new Date().toISOString()
    });
  }
  setLocalStorageItem("yuvakshar_c_group_members", members);

  // Update membersCount on group
  const groups = getLocalStorageItem<CommunityGroup[]>("yuvakshar_c_groups", mockGroups);
  const updatedGroups = groups.map(g => {
    if (g.id === groupId) {
      const count = g.membersCount || 0;
      return {
        ...g,
        membersCount: Math.max(0, count + (isMember ? -1 : 1))
      };
    }
    return g;
  });
  setLocalStorageItem("yuvakshar_c_groups", updatedGroups);
  return !isMember; // returns true if joined, false if left
};

/**
 * Fetch reading progress logs for a group
 */
export const fetchReadingProgress = async (groupId: string): Promise<CommunityReadingProgress[]> => {
  initializeCommunityData();
  const logs = getLocalStorageItem<CommunityReadingProgress[]>("yuvakshar_c_reading_progress", []);
  return logs.filter(l => l.group_id === groupId);
};

/**
 * Save reading progress log
 */
export const saveReadingProgress = async (
  groupId: string,
  userId: string,
  bookTitle: string,
  currentPage: number,
  totalPages: number,
  notes?: string
): Promise<CommunityReadingProgress> => {
  initializeCommunityData();
  const logs = getLocalStorageItem<CommunityReadingProgress[]>("yuvakshar_c_reading_progress", []);
  
  // Find if user already has a log in this group
  const existingIdx = logs.findIndex(l => l.group_id === groupId && l.user_id === userId);
  
  const newLog: CommunityReadingProgress = {
    id: existingIdx > -1 ? logs[existingIdx].id : `progress-${Date.now()}`,
    group_id: groupId,
    user_id: userId,
    book_title: bookTitle,
    current_page: currentPage,
    total_pages: totalPages,
    notes,
    updated_at: new Date().toISOString()
  };

  if (existingIdx > -1) {
    logs[existingIdx] = newLog;
  } else {
    logs.push(newLog);
  }

  setLocalStorageItem("yuvakshar_c_reading_progress", logs);
  
  // Award +5 reputation for updating reading log
  await creditReputationPoints(userId, 5, "Comment"); // Engagement
  
  return newLog;
};

/**
 * Fetch feed posts (filters: Latest, Trending, Group, etc.)
 */
export const fetchPosts = async (groupId?: string): Promise<CommunityPost[]> => {
  if (isSupabaseConfigured()) {
    let query = supabase
      .from("community_posts")
      .select(`
        *,
        profiles:user_id (
          name,
          avatar_url,
          role
        ),
        likesCount:community_post_likes(user_id),
        commentsCount:community_comments(id)
      `)
      .order("created_at", { ascending: false });
      
    if (groupId) {
      query = query.eq("group_id", groupId);
    }
    
    const { data, error } = await query;
    if (!error && data) {
      return data.map((p: any) => ({
        id: p.id,
        user_id: p.user_id,
        user_name: p.profiles?.name || "अपरिचित यूज़र",
        user_avatar: p.profiles?.avatar_url || "",
        user_rank: p.profiles?.role || "Member",
        group_id: p.group_id,
        title: p.title,
        content: p.content,
        post_type: p.post_type,
        media_url: p.media_url,
        poll_question: p.poll_question,
        poll_options: p.poll_options,
        poll_votes: p.poll_votes,
        link_url: p.link_url,
        forum_category: p.forum_category,
        is_pinned: p.is_pinned,
        is_locked: p.is_locked,
        is_solved: p.is_solved,
        best_answer_id: p.best_answer_id,
        created_at: p.created_at,
        likesCount: p.likesCount ? p.likesCount.length : 0,
        commentsCount: p.commentsCount ? p.commentsCount.length : 0
      }));
    }
  }
  initializeCommunityData();
  const posts = getLocalStorageItem("yuvakshar_c_posts", mockPosts);
  if (groupId) {
    return posts.filter(p => p.group_id === groupId);
  }
  return posts;
};

/**
 * Create a new Post
 */
export const createPost = async (
  userId: string,
  userName: string,
  content: string,
  type: CommunityPost["post_type"] = "text",
  extraData?: Partial<CommunityPost>
): Promise<CommunityPost> => {
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from("community_posts").insert({
        user_id: userId,
        content,
        post_type: type,
        group_id: extraData?.group_id || null,
        title: extraData?.title || null,
        media_url: extraData?.media_url || null,
        poll_question: extraData?.poll_question || null,
        poll_options: extraData?.poll_options || null,
        poll_votes: extraData?.poll_votes || {},
        link_url: extraData?.link_url || null,
        forum_category: extraData?.forum_category || "General",
        is_pinned: extraData?.is_pinned || false,
        is_locked: extraData?.is_locked || false,
        is_solved: extraData?.is_solved || false
      }).select(`
        *,
        profiles:user_id (
          name,
          avatar_url,
          role
        )
      `).single();
      
      if (!error && data) {
        return {
          id: data.id,
          user_id: data.user_id,
          user_name: data.profiles?.name || userName,
          user_avatar: data.profiles?.avatar_url || "",
          user_rank: data.profiles?.role || "Member",
          group_id: data.group_id,
          title: data.title,
          content: data.content,
          post_type: data.post_type,
          media_url: data.media_url,
          poll_question: data.poll_question,
          poll_options: data.poll_options,
          poll_votes: data.poll_votes,
          link_url: data.link_url,
          forum_category: data.forum_category,
          is_pinned: data.is_pinned,
          is_locked: data.is_locked,
          is_solved: data.is_solved,
          created_at: data.created_at,
          likesCount: 0,
          commentsCount: 0
        };
      } else if (error) {
        console.error("Supabase post insert failed:", error);
      }
    } catch (e) {
      console.error("Supabase post insert failed, using local storage:", e);
    }
  }

  const newPost: CommunityPost = {
    id: `post-${Date.now()}`,
    user_id: userId,
    user_name: userName,
    user_avatar: "",
    user_rank: "Active Member",
    content,
    post_type: type,
    is_pinned: false,
    is_locked: false,
    is_solved: false,
    created_at: new Date().toISOString(),
    likesCount: 0,
    commentsCount: 0,
    ...extraData
  };

  initializeCommunityData();
  const posts = getLocalStorageItem("yuvakshar_c_posts", mockPosts);
  setLocalStorageItem("yuvakshar_c_posts", [newPost, ...posts]);
  
  // Award reputation points for posting
  await creditReputationPoints(userId, 5, "Post Creation");
  return newPost;
};

/**
 * Delete a Post
 */
export const deletePost = async (postId: string): Promise<boolean> => {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.from("community_posts").delete().eq("id", postId);
    if (!error) return true;
  }
  initializeCommunityData();
  const posts = getLocalStorageItem("yuvakshar_c_posts", mockPosts);
  setLocalStorageItem("yuvakshar_c_posts", posts.filter(p => p.id !== postId));
  return true;
};

/**
 * Like / Unlike a Post
 */
export const toggleLikePost = async (postId: string, userId: string): Promise<number> => {
  if (isSupabaseConfigured()) {
    const { data: existingLike, error: checkError } = await supabase
      .from("community_post_likes")
      .select("*")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .maybeSingle();
      
    if (!checkError) {
      if (existingLike) {
        await supabase.from("community_post_likes").delete().eq("post_id", postId).eq("user_id", userId);
      } else {
        await supabase.from("community_post_likes").insert({ post_id: postId, user_id: userId });
        
        // Notification
        try {
          const { data: postData } = await supabase.from("community_posts").select("user_id, content").eq("id", postId).single();
          if (postData && postData.user_id !== userId) {
            await supabase.from("notifications").insert({
              user_id: postData.user_id,
              event_type: "like",
              title: "आपकी पोस्ट को पसंद किया गया",
              message: `किसी ने आपकी पोस्ट '${postData.content.substring(0, 30)}...' को पसंद किया।`,
              sender_id: userId,
              related_id: postId
            });
          }
        } catch (e) {
          console.error("Failed to send like notification:", e);
        }
      }
      
      const { count, error: countError } = await supabase
        .from("community_post_likes")
        .select("*", { count: "exact", head: true })
        .eq("post_id", postId);
      if (!countError) return count || 0;
    }
  }

  initializeCommunityData();
  const posts = getLocalStorageItem("yuvakshar_c_posts", mockPosts);
  let updatedCount = 0;
  const updated = posts.map(p => {
    if (p.id === postId) {
      // Mock toggle
      const wasLiked = p.likesCount > 20; // mock liked condition
      updatedCount = p.likesCount + (wasLiked ? -1 : 1);
      return { ...p, likesCount: updatedCount };
    }
    return p;
  });
  setLocalStorageItem("yuvakshar_c_posts", updated);
  
  // Credit reputation point to post author
  const post = posts.find(p => p.id === postId);
  if (post && post.user_id !== userId) {
    await creditReputationPoints(post.user_id, 1, "Like Received");
  }

  return updatedCount;
};

/**
 * Fetch comments and replies for a Post
 */
export const fetchComments = async (postId: string): Promise<CommunityComment[]> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("community_comments")
      .select(`
        *,
        profiles:user_id (
          name,
          avatar_url
        ),
        likes:community_comment_likes(user_id)
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
      
    if (!error && data) {
      const commentMap: Record<string, CommunityComment> = {};
      const roots: CommunityComment[] = [];
      
      data.forEach((c: any) => {
        commentMap[c.id] = {
          id: c.id,
          post_id: c.post_id,
          parent_id: c.parent_id,
          user_id: c.user_id,
          user_name: c.profiles?.name || "अपरिचित यूज़र",
          user_avatar: c.profiles?.avatar_url || "",
          content: c.content,
          is_accepted_answer: c.is_accepted_answer,
          likesCount: c.likes ? c.likes.length : 0,
          created_at: c.created_at,
          replies: [],
          reply_to_name: c.reply_to_name || undefined,
          reply_to_content: c.reply_to_content || undefined
        };
      });
      
      data.forEach((c: any) => {
        const mapped = commentMap[c.id];
        if (c.parent_id && commentMap[c.parent_id]) {
          commentMap[c.parent_id].replies?.push(mapped);
        } else {
          roots.push(mapped);
        }
      });
      
      return roots;
    }
  }

  initializeCommunityData();
  const comments = getLocalStorageItem("yuvakshar_c_comments", mockComments);
  return comments.filter(c => c.post_id === postId);
};

/**
 * Add Comment
 */
export const addComment = async (
  postId: string,
  userId: string,
  userName: string,
  content: string,
  parentId?: string | null,
  replyToName?: string | null,
  replyToContent?: string | null
): Promise<CommunityComment> => {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from("community_comments")
      .insert({
        post_id: postId,
        parent_id: parentId || null,
        user_id: userId,
        content,
        reply_to_name: replyToName || null,
        reply_to_content: replyToContent || null
      })
      .select(`
        *,
        profiles:user_id (
          name,
          avatar_url
        )
      `)
      .single();
      
    if (!error && data) {
      try {
        const targetUserId = parentId 
          ? (await supabase.from("community_comments").select("user_id").eq("id", parentId).single()).data?.user_id
          : (await supabase.from("community_posts").select("user_id").eq("id", postId).single()).data?.user_id;
          
        if (targetUserId && targetUserId !== userId) {
          await supabase.from("notifications").insert({
            user_id: targetUserId,
            event_type: parentId ? "reply" : "comment",
            title: parentId ? "आपकी टिप्पणी का उत्तर मिला" : "आपकी पोस्ट पर टिप्पणी की गई",
            message: `${userName} ने कहा: "${content.substring(0, 30)}..."`,
            sender_id: userId,
            related_id: postId
          });
        }
      } catch (e) {
        console.error("Failed to send comment notification:", e);
      }
      
      return {
        id: data.id,
        post_id: data.post_id,
        parent_id: data.parent_id,
        user_id: data.user_id,
        user_name: data.profiles?.name || userName,
        user_avatar: data.profiles?.avatar_url || "",
        content: data.content,
        is_accepted_answer: data.is_accepted_answer,
        likesCount: 0,
        created_at: data.created_at,
        replies: [],
        reply_to_name: data.reply_to_name || undefined,
        reply_to_content: data.reply_to_content || undefined
      };
    } else {
      console.error("Supabase insert comment failed:", error);
    }
  }

  const newComment: CommunityComment = {
    id: `comm-${Date.now()}`,
    post_id: postId,
    parent_id: parentId || null,
    user_id: userId,
    user_name: userName,
    user_avatar: "",
    content,
    is_accepted_answer: false,
    likesCount: 0,
    created_at: new Date().toISOString(),
    reply_to_name: replyToName || undefined,
    reply_to_content: replyToContent || undefined
  };

  initializeCommunityData();
  const comments = getLocalStorageItem("yuvakshar_c_comments", mockComments);
  
  if (parentId) {
    const updated = comments.map(c => {
      if (c.id === parentId) {
        return { ...c, replies: [...(c.replies || []), newComment] };
      }
      return c;
    });
    setLocalStorageItem("yuvakshar_c_comments", updated);
  } else {
    setLocalStorageItem("yuvakshar_c_comments", [...comments, newComment]);
  }

  // Increment comments count on post
  const posts = getLocalStorageItem("yuvakshar_c_posts", mockPosts);
  setLocalStorageItem("yuvakshar_c_posts", posts.map(p => {
    if (p.id === postId) return { ...p, commentsCount: p.commentsCount + 1 };
    return p;
  }));

  // Award reputation points for commenting
  await creditReputationPoints(userId, 2, "Comment");

  return newComment;
};

/**
 * Like / Unlike a Comment
 */
export const toggleLikeComment = async (commentId: string, userId: string): Promise<number> => {
  if (isSupabaseConfigured()) {
    const { data: existingLike, error: checkError } = await supabase
      .from("community_comment_likes")
      .select("*")
      .eq("comment_id", commentId)
      .eq("user_id", userId)
      .maybeSingle();
      
    if (!checkError) {
      if (existingLike) {
        await supabase.from("community_comment_likes").delete().eq("comment_id", commentId).eq("user_id", userId);
      } else {
        await supabase.from("community_comment_likes").insert({ comment_id: commentId, user_id: userId });
      }
      
      const { count, error: countError } = await supabase
        .from("community_comment_likes")
        .select("*", { count: "exact", head: true })
        .eq("comment_id", commentId);
      if (!countError) return count || 0;
    }
  }

  initializeCommunityData();
  const comments = getLocalStorageItem<CommunityComment[]>("yuvakshar_c_comments", mockComments);
  let updatedCount = 0;
  let targetAuthorId = "";

  const toggleLikesHelper = (list: CommunityComment[]): CommunityComment[] => {
    return list.map(c => {
      if (c.id === commentId) {
        // Toggles count (simple toggle simulation)
        const wasLiked = c.likesCount > 0 && c.likesCount % 2 === 0; // simple condition
        updatedCount = c.likesCount + (wasLiked ? -1 : 1);
        targetAuthorId = c.user_id;
        return { ...c, likesCount: updatedCount };
      }
      if (c.replies && c.replies.length > 0) {
        return { ...c, replies: toggleLikesHelper(c.replies) };
      }
      return c;
    });
  };

  const updated = toggleLikesHelper(comments);
  setLocalStorageItem("yuvakshar_c_comments", updated);

  // Credit reputation point to comment author (+1 point)
  if (targetAuthorId && targetAuthorId !== userId) {
    await creditReputationPoints(targetAuthorId, 1, "Like Received");
  }

  return updatedCount;
};

/**
 * Credit reputation points and log in history
 */
export const creditReputationPoints = async (
  userId: string,
  points: number,
  source: CommunityReputationHistory["source"]
): Promise<void> => {
  if (typeof window === "undefined") return;
  const history = getLocalStorageItem<CommunityReputationHistory[]>("yuvakshar_c_reputation_hist", []);
  history.push({
    id: `rep-${Date.now()}-${Math.random()}`,
    user_id: userId,
    points,
    source,
    created_at: new Date().toISOString()
  });
  setLocalStorageItem("yuvakshar_c_reputation_hist", history);

  const getReputationTier = (score: number): "Bronze" | "Silver" | "Gold" | "Platinum" => {
    if (score >= 1200) return "Platinum";
    if (score >= 600) return "Gold";
    if (score >= 300) return "Silver";
    return "Bronze";
  };

  // Sync user profile local cache reputation
  const userStr = localStorage.getItem("yuvakshar_session_user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.id === userId) {
        const nextScore = (user.reputation_score || 0) + points;
        user.reputation_score = nextScore;
        user.reputation_tier = getReputationTier(nextScore);
        localStorage.setItem("yuvakshar_session_user", JSON.stringify(user));
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Sync target user in yuvakshar_users array
  const usersStr = localStorage.getItem("yuvakshar_users");
  if (usersStr) {
    try {
      const usersList = JSON.parse(usersStr);
      const updatedList = usersList.map((u: any) => {
        if (u.id === userId) {
          const nextScore = (u.reputation_score || 0) + points;
          return {
            ...u,
            reputation_score: nextScore,
            reputation_tier: getReputationTier(nextScore)
          };
        }
        return u;
      });
      localStorage.setItem("yuvakshar_users", JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }
  }

  // Dispatch custom sync event
  window.dispatchEvent(new CustomEvent("yuvakshar_reputation_updated", {
    detail: { userId, points }
  }));
};

/**
 * Register / Attend Event
 */
export const toggleEventRegistration = async (eventId: string, isRegistering: boolean): Promise<boolean> => {
  initializeCommunityData();
  const events = getLocalStorageItem("yuvakshar_c_events", mockEvents);
  setLocalStorageItem("yuvakshar_c_events", events.map(e => {
    if (e.id === eventId) {
      return {
        ...e,
        isRegistered: isRegistering,
        attendeesCount: e.attendeesCount + (isRegistering ? 1 : -1)
      };
    }
    return e;
  }));
  return true;
};

/**
 * Fetch Chat Conversations list
 */
export const fetchConversations = async (): Promise<CommunityConversation[]> => {
  initializeCommunityData();
  return getLocalStorageItem("yuvakshar_c_conversations", mockConversations);
};

/**
 * Fetch Chat messages for a conversation
 */
export const fetchMessages = async (convId: string): Promise<CommunityMessage[]> => {
  initializeCommunityData();
  const messages = getLocalStorageItem("yuvakshar_c_messages", mockMessages);
  return messages.filter(m => m.conversation_id === convId);
};

/**
 * Send Chat Message
 */
export const sendMessage = async (
  convId: string,
  senderId: string,
  senderName: string,
  content: string
): Promise<CommunityMessage> => {
  const newMsg: CommunityMessage = {
    id: `msg-${Date.now()}`,
    conversation_id: convId,
    sender_id: senderId,
    sender_name: senderName,
    content,
    is_read: false,
    created_at: new Date().toISOString()
  };

  initializeCommunityData();
  const messages = getLocalStorageItem("yuvakshar_c_messages", mockMessages);
  setLocalStorageItem("yuvakshar_c_messages", [...messages, newMsg]);

  // Update conversation last message preview
  const conversations = getLocalStorageItem("yuvakshar_c_conversations", mockConversations);
  setLocalStorageItem("yuvakshar_c_conversations", conversations.map(c => {
    if (c.id === convId) {
      return {
        ...c,
        lastMessage: content,
        lastMessageTime: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
      };
    }
    return c;
  }));

  return newMsg;
};

/**
 * Fetch alerts notifications
 */
export const fetchNotifications = async (): Promise<CommunityNotification[]> => {
  initializeCommunityData();
  return getLocalStorageItem("yuvakshar_c_notifications", mockNotifications);
};

/**
 * Mark notifications read
 */
export const markNotificationsRead = async (): Promise<void> => {
  initializeCommunityData();
  const nots = getLocalStorageItem("yuvakshar_c_notifications", mockNotifications);
  setLocalStorageItem("yuvakshar_c_notifications", nots.map(n => ({ ...n, is_read: true })));
};

/**
 * Fetch active Challenges
 */
export const fetchChallenges = async (): Promise<CommunityChallenge[]> => {
  initializeCommunityData();
  return getLocalStorageItem("yuvakshar_c_challenges", mockChallenges);
};

/**
 * Submit Challenge work
 */
export const submitChallengeWork = async (
  challengeId: string,
  userId: string,
  userName: string,
  title: string,
  content: string
): Promise<boolean> => {
  if (typeof window === "undefined") return false;
  const submissions = getLocalStorageItem<CommunityChallengeSubmission[]>("yuvakshar_c_challenge_subs", []);
  submissions.push({
    id: `sub-${Date.now()}`,
    challenge_id: challengeId,
    user_id: userId,
    user_name: userName,
    title,
    content,
    votes_count: 0,
    is_winner: false,
    created_at: new Date().toISOString()
  });
  setLocalStorageItem("yuvakshar_c_challenge_subs", submissions);
  
  // Award reputation points for challenge submission
  await creditReputationPoints(userId, 10, "Post Creation");
  return true;
};

/**
 * Fetch challenge submissions
 */
export const fetchChallengeSubmissions = async (challengeId: string): Promise<CommunityChallengeSubmission[]> => {
  if (typeof window === "undefined") return [];
  const submissions = getLocalStorageItem<CommunityChallengeSubmission[]>("yuvakshar_c_challenge_subs", []);
  return submissions.filter(s => s.challenge_id === challengeId);
};

/**
 * Universal Search across community ecosystem
 */
export const searchCommunity = async (
  query: string
): Promise<{
  posts: CommunityPost[];
  groups: CommunityGroup[];
  events: CommunityEvent[];
  challenges: CommunityChallenge[];
}> => {
  initializeCommunityData();
  const lowerQuery = query.toLowerCase();
  
  const posts = getLocalStorageItem<CommunityPost[]>("yuvakshar_c_posts", mockPosts)
    .filter(p => p.content.toLowerCase().includes(lowerQuery) || p.title?.toLowerCase().includes(lowerQuery));
    
  const groups = getLocalStorageItem<CommunityGroup[]>("yuvakshar_c_groups", mockGroups)
    .filter(g => g.name.toLowerCase().includes(lowerQuery) || g.description.toLowerCase().includes(lowerQuery));
    
  const events = getLocalStorageItem<CommunityEvent[]>("yuvakshar_c_events", mockEvents)
    .filter(e => e.title.toLowerCase().includes(lowerQuery) || e.description.toLowerCase().includes(lowerQuery));
    
  const challenges = getLocalStorageItem<CommunityChallenge[]>("yuvakshar_c_challenges", mockChallenges)
    .filter(c => c.title.toLowerCase().includes(lowerQuery) || c.description.toLowerCase().includes(lowerQuery));

  return { posts, groups, events, challenges };
};

// ─── SOCIAL GRAPH & ACTIVITY TIMELINE ───────────────────────────────────────

/**
 * Toggle Follow User
 */
export const toggleFollowUser = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
  // In a real app, this hits the DB. Here we just mock a success toggle
  // by utilizing a mock local storage map or just returning a simulated success
  if (typeof window === "undefined") return false;
  
  const followGraph = JSON.parse(localStorage.getItem("yuvakshar_social_graph") || "{}");
  if (!followGraph[currentUserId]) followGraph[currentUserId] = [];
  
  const isFollowing = followGraph[currentUserId].includes(targetUserId);
  if (isFollowing) {
    followGraph[currentUserId] = followGraph[currentUserId].filter((id: string) => id !== targetUserId);
  } else {
    followGraph[currentUserId].push(targetUserId);
  }
  
  localStorage.setItem("yuvakshar_social_graph", JSON.stringify(followGraph));
  return !isFollowing;
};

/**
 * Check if following
 */
export const isUserFollowing = (currentUserId: string, targetUserId: string): boolean => {
  if (typeof window === "undefined") return false;
  const followGraph = JSON.parse(localStorage.getItem("yuvakshar_social_graph") || "{}");
  return followGraph[currentUserId]?.includes(targetUserId) || false;
};

/**
 * Get unified Social Timeline (Posts, Replies, Activity)
 */
export const getUserSocialTimeline = async (userId: string): Promise<any[]> => {
  initializeCommunityData();
  const posts = getLocalStorageItem<CommunityPost[]>("yuvakshar_c_posts", mockPosts)
    .filter(p => p.user_id === userId);
    
  const comments = getLocalStorageItem<CommunityComment[]>("yuvakshar_c_comments", mockComments)
    .filter(c => c.user_id === userId);
    
  const timeline: any[] = [];
  
  posts.forEach(p => {
    timeline.push({
      ...p,
      activity_type: p.post_type === "poll" ? "Created Poll" : "Posted",
      timestamp: new Date(p.created_at).getTime()
    });
  });
  
  comments.forEach(c => {
    timeline.push({
      id: c.id,
      user_id: c.user_id,
      user_name: c.user_name,
      user_avatar: c.user_avatar,
      content: c.content,
      post_id: c.post_id,
      activity_type: "Replied",
      post_type: "reply",
      created_at: c.created_at,
      likesCount: c.likesCount,
      timestamp: new Date(c.created_at).getTime()
    });
  });
  
  // Sort descending
  return timeline.sort((a, b) => b.timestamp - a.timestamp);
};
