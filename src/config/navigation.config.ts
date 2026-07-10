import { 
  Home, 
  Newspaper, 
  BookOpen, 
  MessageSquare, 
  Info, 
  Mail, 
  PenTool,
  Bookmark,
  Bell,
  History,
  Settings,
  LogOut,
  User,
  Handshake
} from "lucide-react";

export interface NavigationLink {
  labelHi: string;
  labelEn: string;
  href: string;
  icon: any;
  subLinks?: {
    labelHi: string;
    labelEn: string;
    href: string;
  }[];
}

export const primaryLinks: NavigationLink[] = [
  { labelHi: "मुख्य पृष्ठ", labelEn: "Home", href: "/", icon: Home },
  { 
    labelHi: "समाचार", 
    labelEn: "News", 
    href: "/current-affairs", 
    icon: Newspaper,
    // Note: The categories from DB will be injected into this array in the layout
    subLinks: [
      { labelHi: "सभी समाचार", labelEn: "All News", href: "/current-affairs" }
    ]
  },
  { 
    labelHi: "पत्रिका", 
    labelEn: "Magazine", 
    href: "/magazine", 
    icon: BookOpen,
    subLinks: [
      { labelHi: "नवीनतम अंक", labelEn: "Latest Issue", href: "/magazine" },
      { labelHi: "सभी अंक", labelEn: "All Issues", href: "/magazine" },
      { labelHi: "विशेषांक", labelEn: "Special Editions", href: "/magazine/special" }
    ]
  },
  { 
    labelHi: "चौपाल", 
    labelEn: "Chaupal", 
    href: "/community", 
    icon: MessageSquare,
    subLinks: [
      { labelHi: "चर्चाएँ", labelEn: "Discussions", href: "/community/discussion" },
      { labelHi: "समूह", labelEn: "Groups", href: "/community/groups" },
      { labelHi: "प्रश्नोत्तर", labelEn: "Q&A", href: "/community/qna" },
      { labelHi: "कार्यक्रम", labelEn: "Events", href: "/community/events" }
    ]
  },
  { labelHi: "हमारे बारे में", labelEn: "About", href: "/about", icon: Info },
  { labelHi: "हमारे सहयोगी", labelEn: "Partners", href: "/partners", icon: Handshake },
  // { labelHi: "संपर्क करें", labelEn: "Contact", href: "/contact", icon: Mail } // Usually moved to footer
];

export const profileActions = [
  { labelHi: "मेरी प्रोफ़ाइल", labelEn: "Profile", href: "/u", icon: User },
  { labelHi: "बुकमार्क सूची", labelEn: "Bookmarks", href: "/bookmarks", icon: Bookmark },
  { labelHi: "सूचनाएं", labelEn: "Notifications", href: "/community/notifications", icon: Bell },
  { labelHi: "सेटिंग्स", labelEn: "Settings", href: "/settings", icon: Settings },
  { labelHi: "लॉगआउट करें", labelEn: "Logout", href: "#logout", icon: LogOut, isDanger: true }
];

export const bottomNavLinks = [
  { labelHi: "मुख्य", labelEn: "Home", href: "/", icon: Home },
  { labelHi: "समाचार", labelEn: "Samachar", href: "/current-affairs", icon: Newspaper },
  { labelHi: "पत्रिका", labelEn: "Magazine", href: "/magazine", icon: BookOpen },
  { labelHi: "चौपाल", labelEn: "Chaupaal", href: "/community", icon: MessageSquare }
];
