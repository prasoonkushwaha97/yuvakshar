"use client";

import { Toaster } from "sonner";
import { useEffect, useState } from "react";

export function ToastProvider() {
  const [mounted, setMounted] = useState(false);
  
  // Custom theme detection for Yuvakshar's implementation
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setMounted(true);
    
    // Check initial theme
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    };
    
    checkTheme();
    
    // Setup observer for class changes on html tag
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          checkTheme();
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => observer.disconnect();
  }, []);

  if (!mounted) return null;

  return (
    <Toaster 
      position="bottom-right" 
      theme={theme}
      toastOptions={{
        className: 'font-sans text-sm shadow-xl border-border',
        style: {
          background: theme === 'dark' ? '#1E293B' : '#ffffff',
          color: theme === 'dark' ? '#F8FAFC' : '#0F172A',
          border: theme === 'dark' ? '1px solid #334155' : '1px solid #E2E8F0',
        }
      }}
    />
  );
}
