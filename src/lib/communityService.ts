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
 * Join or leave a Group
 */
export const toggleGroupMembership = async (groupId: string, userId: string): Promise<boolean> => {
  initializeCommunityData();
  const groups = getLocalStorageItem("yuvakshar_c_groups", mockGroups);
  const updated = groups.map(g => {
    if (g.id === groupId) {
      const isMember = g.owner_id === userId || (g.membersCount && g.membersCount > 50); // mock logic
      return { ...g, membersCount: (g.membersCount || 0) + (isMember ? -1 : 1) };
    }
    return g;
  });
  setLocalStorageItem("yuvakshar_c_groups", updated);
  return true;
};

/**
 * Fetch feed posts (filters: Latest, Trending, Group, etc.)
 */
export const fetchPosts = async (groupId?: string): Promise<CommunityPost[]> => {
  if (isSupabaseConfigured()) {
    let query = supabase.from("community_posts").select("*").order("created_at", { ascending: false });
    if (groupId) query = query.eq("group_id", groupId);
    const { data, error } = await query;
    if (!error && data) {
      // Mock formatting usernames for DB fetches
      return data.map(p => ({
        ...p,
        user_name: p.title ? "डॉ. विकास शर्मा" : "अमित कुमार", // Fallback names
        likesCount: p.likes?.length || 0,
        commentsCount: 2
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

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from("community_posts").insert({
        user_id: userId,
        content,
        post_type: type,
        group_id: extraData?.group_id || null,
        title: extraData?.title || null,
        poll_question: extraData?.poll_question || null,
        poll_options: extraData?.poll_options || null,
        link_url: extraData?.link_url || null,
        forum_category: extraData?.forum_category || null
      }).select().single();
      if (!error && data) {
        return { ...newPost, id: data.id };
      }
    } catch (e) {
      console.error("Supabase post insert failed, using local storage:", e);
    }
  }

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
  parentId?: string | null
): Promise<CommunityComment> => {
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
    created_at: new Date().toISOString()
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

  // Sync user profile local cache reputation
  const userStr = localStorage.getItem("yuvakshar_session_user");
  if (userStr) {
    const user = JSON.parse(userStr);
    if (user.id === userId) {
      user.reputation_score = (user.reputation_score || 0) + points;
      // Recalculate rank tier
      if (user.reputation_score >= 500) user.reputation_tier = "Platinum";
      else if (user.reputation_score >= 200) user.reputation_tier = "Gold";
      else if (user.reputation_score >= 100) user.reputation_tier = "Silver";
      else user.reputation_tier = "Bronze";
      localStorage.setItem("yuvakshar_session_user", JSON.stringify(user));
    }
  }
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
