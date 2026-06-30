"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Locale = "hi" | "en";

interface LanguageContextProps {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const translations: Record<Locale, Record<string, string>> = {
  hi: {
    // Nav Links
    "nav.home": "मुख्य पृष्ठ",
    "nav.news": "समाचार",
    "nav.magazine": "पत्रिका",
    "nav.expression": "लेख व विचार",
    "nav.workspace": "ज्ञान केंद्र",
    "nav.dashboard": "डैशबोर्ड",
    "nav.admin": "एडमिन console",
    "nav.submit": "लेख भेजें",
    "nav.search": "खोजें",
    "nav.about": "हमारे बारे में",
    "nav.contact": "संपर्क",

    // Hero Section
    "hero.title": "युवाक्षर",
    "hero.tagline": "युवा शक्ति, ज्ञान और राष्ट्र निर्माण",
    "hero.headline": "विचारों को आवाज़ दीजिए",
    "hero.subheading": "युवाओं, लेखकों और विचारकों का हिन्दी डिजिटल मंच",
    "hero.btnReadNews": "समाचार पढ़ें",
    "hero.btnAi": "युवाक्षर AI",
    "hero.btnStartLearning": "सीखना शुरू करें",

    // Ticker Header
    "ticker.label": "भारत बोल रहा है",

    // Section Titles
    "title.featured": "विशेष लेख व समाचार",
    "title.magazine": "मासिक पत्रिका अंक",
    "title.trending": "चर्चित विचार",
    "title.career": "करियर और स्कॉलरशिप हब",
    "title.bento": "ज्ञान संग्रह",

    // Career Hub Sections
    "career.gov": "सरकारी नौकरियां",
    "career.pvt": "प्राइवेट सेक्टर",
    "career.intern": "इंटर्नशिप",
    "career.scholar": "छात्रवृत्ति",
    "career.guidance": "करियर गाइडेंस",

    // Magazine controls
    "mag.latest": "ताज़ा संस्करण",
    "mag.read": "पत्रिका पढ़ें",
    "mag.download": "PDF डाउनलोड",
    "mag.share": "साझा करें",
    "mag.archived": "पुराने संस्करण",

    // AI Panel
    "ai.assistant": "युवाक्षर AI सहायक",
    "ai.chat": "पत्रिका से सवाल पूछें",
    "ai.summary": "पत्रिका सारांश",
    "ai.audio": "पत्रिका ऑडियो सुनें",
    "ai.quiz": "प्रश्नोत्तरी",
    "ai.translate": "अनुवाद",

    // Submit Article Form
    "submit.title": "नया लेख प्रस्तुत करें",
    "submit.subtitle": "हिन्दी में अपने विचारों, कहानियों या कविताओं को मंच प्रदान करें",
    "submit.labelTitle": "शीर्षक",
    "submit.labelType": "प्रस्तुति प्रकार",
    "submit.labelAuthor": "लेखक का नाम",
    "submit.labelContent": "लेख सामग्री",
    "submit.placeholderTitle": "अपने लेख का शीर्षक लिखें...",
    "submit.placeholderContent": "यहाँ लिखना शुरू करें (मार्कडाउन समर्थित)...",
    "submit.btnSubmit": "समीक्षा के लिए भेजें",
    "submit.statusDraft": "ड्राफ्ट",
    "submit.statusReview": "समीक्षा के अधीन",
    "submit.statusPublished": "प्रकाशित",

    // Contact form
    "contact.title": "संपादकीय डेस्क से संपर्क करें",
    "contact.name": "आपका नाम",
    "contact.email": "ईमेल पता",
    "contact.mobile": "मोबाइल नंबर",
    "contact.category": "संपर्क श्रेणी",
    "contact.message": "आपका संदेश",
    "contact.btnSend": "संदेश भेजें"
  },
  en: {
    // Nav Links
    "nav.home": "Home",
    "nav.news": "News",
    "nav.magazine": "Magazine",
    "nav.expression": "Articles & Expression",
    "nav.workspace": "Workspace",
    "nav.dashboard": "कार्यक्षेत्र",
    "nav.admin": "Admin Panel",
    "nav.submit": "Submit Article",
    "nav.search": "Search",
    "nav.about": "About Us",
    "nav.contact": "Contact",

    // Hero Section
    "hero.title": "Yuvakshar",
    "hero.tagline": "Youth Power, Knowledge and Nation Building",
    "hero.headline": "Give Voice to Your Thoughts",
    "hero.subheading": "The Hindi digital platform for youth, writers and thinkers",
    "hero.btnReadNews": "Read News",
    "hero.btnAi": "Yuvakshar AI",
    "hero.btnStartLearning": "Start Learning",

    // Ticker Header
    "ticker.label": "Bharat is Speaking",

    // Section Titles
    "title.featured": "Featured News & Articles",
    "title.magazine": "Monthly Magazine Issues",
    "title.trending": "Trending Expressions",
    "title.career": "Career & Scholarship Hub",
    "title.bento": "Knowledge Bento Grid",

    // Career Hub Sections
    "career.gov": "Government Jobs",
    "career.pvt": "Private Sector",
    "career.intern": "Internships",
    "career.scholar": "Scholarships",
    "career.guidance": "Career Guidance",

    // Magazine controls
    "mag.latest": "Latest Edition",
    "mag.read": "Read Magazine",
    "mag.download": "Download PDF",
    "mag.share": "Share Issue",
    "mag.archived": "Archived Editions",

    // AI Panel
    "ai.assistant": "Yuvakshar AI Assistant",
    "ai.chat": "Ask AI about Issue",
    "ai.summary": "Issue AI Summary",
    "ai.audio": "Play Issue Audio",
    "ai.quiz": "Generate Issue Quiz",
    "ai.translate": "Translate hi ↔ en",

    // Submit Article Form
    "submit.title": "Submit New Article",
    "submit.subtitle": "Platform your thoughts, stories, or poetry in Hindi",
    "submit.labelTitle": "Article Title",
    "submit.labelType": "Submission Type",
    "submit.labelAuthor": "Author Name",
    "submit.labelContent": "Content Body",
    "submit.placeholderTitle": "लेख का शीर्षक दर्ज करें...",
    "submit.placeholderContent": "यहाँ लिखना प्रारंभ करें (मार्कडाउन समर्थित)...",
    "submit.btnSubmit": "Send for Review",
    "submit.statusDraft": "Draft",
    "submit.statusReview": "Under Review",
    "submit.statusPublished": "Published",

    // Contact form
    "contact.title": "Contact Editorial Desk",
    "contact.name": "Full Name",
    "contact.email": "Email Address",
    "contact.mobile": "Mobile Number",
    "contact.category": "Contact Category",
    "contact.message": "Your Message",
    "contact.btnSend": "Transmit Message"
  }
};

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("hi");

  useEffect(() => {
    const savedLocale = "hi" as Locale;
    if (savedLocale === "hi" || savedLocale === "en") {
      setLocale(savedLocale);
    }
  }, []);

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);

  };

  const translate = (key: string): string => {
    const value = translations[locale][key];
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale: changeLocale, t: translate }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
