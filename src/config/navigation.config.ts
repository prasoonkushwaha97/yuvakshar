import { 
  Home, 
  Newspaper, 
  BookOpen, 
  Video, 
  MessageSquare, 
  Info, 
  Mail, 
  PenTool,
  Bookmark,
  Bell,
  History,
  Settings,
  LogOut,
  User
} from "lucide-react";

export interface NavigationLink {
  labelHi: string;
  labelEn: string;
  href: string;
  icon: any;
}

export const primaryLinks: NavigationLink[] = [
  { labelHi: "मुख्य पृष्ठ", labelEn: "Home", href: "/", icon: Home },
  { labelHi: "समाचार", labelEn: "News", href: "/current-affairs", icon: Newspaper },
  { labelHi: "पत्रिका", labelEn: "पत्रिका", href: "/magazine", icon: BookOpen },
  { labelHi: "वीडियो", labelEn: "Videos", href: "/admin/videos", icon: Video },
  { labelHi: "युवाक्षर चौपाल", labelEn: "Community", href: "/community", icon: MessageSquare },
  { labelHi: "हमारे बारे में", labelEn: "About", href: "/about", icon: Info },
  { labelHi: "संपर्क करें", labelEn: "Contact", href: "/contact", icon: Mail },
  { labelHi: "लेख सबमिट करें", labelEn: "Submit Article", href: "/contribute", icon: PenTool }
];

export const profileActions = [
  { labelHi: "मेरी प्रोफ़ाइल", labelEn: "Profile", href: "/u", icon: User },
  { labelHi: "बुकमार्क सूची", labelEn: "Bookmarks", href: "/bookmarks", icon: Bookmark },
  { labelHi: "सूचनाएं", labelEn: "Notifications", href: "/community/notifications", icon: Bell },
  { labelHi: "पठन इतिहास", labelEn: "Reading History", href: "/community/discussion", icon: History },
  { labelHi: "सेटिंग्स", labelEn: "Settings", href: "/settings", icon: Settings },
  { labelHi: "लॉगआउट करें", labelEn: "Logout", href: "#logout", icon: LogOut, isDanger: true }
];

export const bottomNavLinks = [
  { labelHi: "मुख्य", labelEn: "Home", href: "/", icon: Home },
  { labelHi: "समाचार", labelEn: "News", href: "/current-affairs", icon: Newspaper },
  { labelHi: "पत्रिका", labelEn: "पत्रिका", href: "/magazine", icon: BookOpen },
  { labelHi: "चौपाल", labelEn: "Community", href: "/community", icon: MessageSquare },
  { labelHi: "प्रोफ़ाइल", labelEn: "Profile", href: "#profile", icon: User }
];
