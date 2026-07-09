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
}

export const primaryLinks: NavigationLink[] = [
  { labelHi: "मुख्य पृष्ठ", labelEn: "Home", href: "/", icon: Home },
  { labelHi: "समाचार", labelEn: "News", href: "/current-affairs", icon: Newspaper },
  { labelHi: "पत्रिका", labelEn: "पत्रिका", href: "/magazine", icon: BookOpen },
  { labelHi: "चौपाल", labelEn: "Chaupal", href: "/community", icon: MessageSquare },
  { labelHi: "हमारे बारे में", labelEn: "About", href: "/about", icon: Info },
  { labelHi: "हमारे सहयोगी", labelEn: "Partners", href: "/partners", icon: Handshake },
  { labelHi: "संपर्क करें", labelEn: "Contact", href: "/contact", icon: Mail }
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
