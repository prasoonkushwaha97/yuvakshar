export interface QnaAnswer {
  id: string;
  question_id: string;
  author_id: string;
  author_name: string;
  author_username?: string;
  author_avatar?: string;
  content: string;
  created_at: string;
  upvotes: number;
  is_accepted: boolean;
  user_voted?: 'up' | null;
}

export interface QnaQuestion {
  id: string;
  slug: string;
  title: string;
  description: string;
  author_id: string;
  author_name: string;
  author_username?: string;
  author_avatar?: string;
  created_at: string;
  category: string;
  tags: string[];
  answers_count: number;
  views: number;
  upvotes: number;
  is_solved: boolean;
  accepted_answer_id?: string;
  is_pinned?: boolean;
  is_locked?: boolean;
  user_voted?: 'up' | null;
  is_bookmarked?: boolean;
  answers?: QnaAnswer[];
}

export const QNA_CATEGORIES = [
  "सभी",
  "पत्रकारिता",
  "साहित्य",
  "शिक्षा",
  "करियर",
  "तकनीक",
  "समाज",
  "संस्कृति",
  "इतिहास",
  "दर्शन",
  "सामान्य",
] as const;

export const QNA_FILTERS = [
  { id: "all", label: "सभी" },
  { id: "unsolved", label: "अनसुलझे" },
  { id: "solved", label: "हल किए गए" },
  { id: "popular", label: "लोकप्रिय" },
  { id: "latest", label: "नवीनतम" },
  { id: "my_questions", label: "मेरी पूछी गई" },
  { id: "my_answers", label: "मेरे उत्तर" },
] as const;

const INITIAL_QUESTIONS: QnaQuestion[] = [
  {
    id: "q-1",
    slug: "how-to-start-investigative-journalism-in-hindi",
    title: "हिंदी में खोजपूर्ण पत्रकारिता (Investigative Journalism) की शुरुआत कैसे करें?",
    description: "मैं एक युवा पत्रकार हूँ और हिंदी माध्यम में जमीनी स्तर की खोजपूर्ण रिपोर्टिंग करना चाहता हूँ। इसके लिए प्राथमिक स्रोतों का सत्यापन कैसे करें और कानूनी पहलुओं का ध्यान कैसे रखें?",
    author_id: "user-101",
    author_name: "अमित शर्मा",
    author_username: "amit_sharma",
    author_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit",
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    category: "पत्रकारिता",
    tags: ["पत्रकारिता", "रिपोर्टिंग", "अनुसंधान", "मीडिया"],
    answers_count: 3,
    views: 342,
    upvotes: 28,
    is_solved: true,
    accepted_answer_id: "a-101",
    is_pinned: true,
    answers: [
      {
        id: "a-101",
        question_id: "q-1",
        author_id: "user-201",
        author_name: "डॉ. प्रखर श्रीवास्तव",
        author_username: "prakhar_news",
        author_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Prakhar",
        content: "खोजपूर्ण पत्रकारिता के लिए सबसे महत्वपूर्ण है दस्तावेज़ी साक्ष्य और 'Right to Information' (RTI) का प्रभावी उपयोग। किसी भी दावे का समर्थन कम से कम दो स्वतंत्र प्राथमिक स्रोतों से होना आवश्यक है। साथ ही मानहानि (Defamation Laws) के नियमों को अच्छी तरह समझ लें।",
        created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
        upvotes: 19,
        is_accepted: true,
      },
      {
        id: "a-102",
        question_id: "q-1",
        author_id: "user-202",
        author_name: "नेहा सिंह",
        author_username: "neha_writes",
        author_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Neha",
        content: "डिजिटल टूल्स जैसे OSINT (Open Source Intelligence) और पब्लिक रिकॉर्ड्स डेटाबेस का इस्तेमाल सीखें। जमीनी साक्षात्कार लेते समय डिजिटल सुरक्षा (Encrypted messaging) का प्रयोग करें।",
        created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
        upvotes: 9,
        is_accepted: false,
      }
    ]
  },
  {
    id: "q-2",
    slug: "modern-hindi-poetry-structure-and-meter-guidance",
    title: "आधुनिक हिंदी कविता में छन्द और मुक्तक का सही संतुलन कैसे बनाएं?",
    description: "समकालीन कविताओं में लय और भाव को बनाए रखते हुए मुक्त छंद का प्रयोग करने के क्या नियम हैं?",
    author_id: "user-102",
    author_name: "कविता वर्मा",
    author_username: "kavita_v",
    author_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kavita",
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    category: "साहित्य",
    tags: ["साहित्य", "कविता", "लेखन", "हिंदी"],
    answers_count: 2,
    views: 215,
    upvotes: 14,
    is_solved: false,
    answers: [
      {
        id: "a-201",
        question_id: "q-2",
        author_id: "user-203",
        author_name: "राजेश त्रिपाठी",
        author_username: "rajesh_tripathi",
        author_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh",
        content: "मुक्त छंद का अर्थ अराजकता नहीं है। आंतरिक संगीत (Internal Rhythm) और यति-गति का ध्यान रखना उतना ही ज़रूरी है जितना पारंपारिक छंदों में। निराला जी की राम की शक्ति पूजा इसका उत्कृष्ट उदाहरण है।",
        created_at: new Date(Date.now() - 3600000 * 20).toISOString(),
        upvotes: 11,
        is_accepted: false,
      }
    ]
  },
  {
    id: "q-3",
    slug: "higher-education-and-research-fellowships-in-india",
    title: "उच्च शिक्षा एवं अनुसंधान में शोध प्रस्ताव (Research Proposal) तैयार करने के सर्वोत्तम तरीके?",
    description: "Ph.D नामांकन और राष्ट्रीय शोध अध्येतावृत्ति (Fellowships) के लिए शोध प्रस्ताव लिखते समय किन बातों का ध्यान रखना चाहिए?",
    author_id: "user-103",
    author_name: "विकास चौधरी",
    author_username: "vikas_c",
    author_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vikas",
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
    category: "शिक्षा",
    tags: ["शिक्षा", "शोध", "PHD", "अकादमिक"],
    answers_count: 1,
    views: 180,
    upvotes: 21,
    is_solved: false,
    answers: [
      {
        id: "a-301",
        question_id: "q-3",
        author_id: "user-204",
        author_name: "प्रो. सतीश चंद्र",
        author_username: "prof_satish",
        author_avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Satish",
        content: "शोध प्रस्ताव में समस्या कथन (Problem Statement), शोध उद्देश्य (Objectives), साहित्य समीक्षा (Literature Review), और कार्यप्रणाली (Methodology) स्पष्ट होनी चाहिए।",
        created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
        upvotes: 15,
        is_accepted: false,
      }
    ]
  }
];

const STORAGE_KEY = "yuvakshar_qna_questions_v1";

export function getQnaQuestions(): QnaQuestion[] {
  if (typeof window === "undefined") return INITIAL_QUESTIONS;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_QUESTIONS));
      return INITIAL_QUESTIONS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_QUESTIONS;
  }
}

export function saveQnaQuestions(questions: QnaQuestion[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
  } catch (err) {
    console.error("Failed to save Q&A data to localStorage:", err);
  }
}

export function getQuestionBySlug(slug: string): QnaQuestion | null {
  const questions = getQnaQuestions();
  const found = questions.find((q) => q.slug === slug || q.id === slug);
  if (found) {
    // Increment view count in memory/storage
    found.views = (found.views || 0) + 1;
    saveQnaQuestions(questions);
  }
  return found || null;
}

export function addQnaQuestion(newQ: Omit<QnaQuestion, "id" | "slug" | "created_at" | "answers_count" | "views" | "upvotes" | "is_solved" | "answers">): QnaQuestion {
  const questions = getQnaQuestions();
  const slug = newQ.title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0900-\u097F\s-]/g, "")
    .replace(/\s+/g, "-") + "-" + Date.now().toString().slice(-4);

  const question: QnaQuestion = {
    ...newQ,
    id: `q-${Date.now()}`,
    slug,
    created_at: new Date().toISOString(),
    answers_count: 0,
    views: 1,
    upvotes: 1,
    is_solved: false,
    answers: [],
  };

  questions.unshift(question);
  saveQnaQuestions(questions);
  return question;
}

export function addQnaAnswer(questionId: string, answerData: Omit<QnaAnswer, "id" | "question_id" | "created_at" | "upvotes" | "is_accepted">): QnaAnswer {
  const questions = getQnaQuestions();
  const questionIndex = questions.findIndex((q) => q.id === questionId);
  if (questionIndex === -1) throw new Error("Question not found");

  const newAnswer: QnaAnswer = {
    ...answerData,
    id: `a-${Date.now()}`,
    question_id: questionId,
    created_at: new Date().toISOString(),
    upvotes: 0,
    is_accepted: false,
  };

  const q = questions[questionIndex];
  q.answers = q.answers || [];
  q.answers.push(newAnswer);
  q.answers_count = q.answers.length;

  saveQnaQuestions(questions);
  return newAnswer;
}

export function voteQuestion(questionId: string, currentUserId: string): QnaQuestion | null {
  const questions = getQnaQuestions();
  const q = questions.find((item) => item.id === questionId);
  if (!q) return null;

  if (q.user_voted === "up") {
    q.upvotes = Math.max(0, q.upvotes - 1);
    q.user_voted = null;
  } else {
    q.upvotes += 1;
    q.user_voted = "up";
  }

  saveQnaQuestions(questions);
  return q;
}

export function voteAnswer(questionId: string, answerId: string): QnaAnswer | null {
  const questions = getQnaQuestions();
  const q = questions.find((item) => item.id === questionId);
  if (!q || !q.answers) return null;

  const ans = q.answers.find((a) => a.id === answerId);
  if (!ans) return null;

  if (ans.user_voted === "up") {
    ans.upvotes = Math.max(0, ans.upvotes - 1);
    ans.user_voted = null;
  } else {
    ans.upvotes += 1;
    ans.user_voted = "up";
  }

  saveQnaQuestions(questions);
  return ans;
}

export function acceptAnswer(questionId: string, answerId: string): boolean {
  const questions = getQnaQuestions();
  const q = questions.find((item) => item.id === questionId);
  if (!q || !q.answers) return false;

  q.answers.forEach((ans) => {
    ans.is_accepted = ans.id === answerId;
  });

  q.is_solved = true;
  q.accepted_answer_id = answerId;

  saveQnaQuestions(questions);
  return true;
}
