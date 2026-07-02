"use client";

// ShareModal component
import React, { useEffect, useRef } from "react";
import { X, Copy, Mail, Check } from "lucide-react";
import { toast } from "sonner";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
  title: string;
}

// Brand SVG Icons complying with official guidelines
const WhatsAppIcon = () => (
  <svg className="w-5 h-5 fill-current text-[#25D366]" viewBox="0 0 24 24">
    <path d="M12.012 2C6.485 2 2 6.485 2 12.012c0 1.764.46 3.483 1.332 5.002L2 22l5.132-1.346c1.47.8 3.11 1.222 4.88 1.222 5.527 0 10.012-4.485 10.012-10.012C22.024 6.485 17.537 2 12.012 2zm6.076 14.225c-.25.703-1.455 1.284-2.008 1.34-.497.05-1.147.087-1.83-.133-.427-.138-.97-.333-1.63-.6-2.766-1.12-4.553-3.922-4.693-4.108-.138-.184-1.12-1.488-1.12-2.836 0-1.348.704-2.012.955-2.28.25-.268.547-.333.73-.333h.52c.164 0 .385-.015.59.444.208.502.715 1.737.777 1.86.06.12.1.264.02.424-.08.163-.122.264-.243.407-.123.14-.256.315-.366.42-.12.115-.248.24-.107.48.14.24.624 1.026 1.336 1.66.918.816 1.69 1.07 1.93 1.19.244.12.388.1.53-.064.144-.164.624-.724.79-.97.168-.246.335-.205.564-.12.23.085 1.453.684 1.704.81.25.123.417.184.478.29.06.104.06.602-.19 1.305z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5 fill-current text-[#1877F2]" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const XIcon = () => (
  <svg className="w-5 h-5 fill-current text-black dark:text-white" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg className="w-5 h-5 fill-current text-[#229ED9]" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.02-1.96 1.25-5.54 3.66-.52.36-.99.53-1.41.52-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.89.03-.25.38-.51 1.07-.78 4.2-1.83 7-3.04 8.4-3.63 4-.16 4.83.12 4.83.12s.06.63.1 1.08z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-5 h-5 fill-current text-[#0A66C2]" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

export default function ShareModal({ isOpen, onClose, shareUrl, title }: ShareModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  // Analytics Event Dispatcher
  const dispatchAnalyticsEvent = (action: string, metadata: Record<string, any>) => {
    if (typeof window !== "undefined") {
      const customEvent = new CustomEvent("yuvakshar_analytics", {
        detail: { action, ...metadata }
      });
      window.dispatchEvent(customEvent);

      if ((window as any).gtag) {
        (window as any).gtag("event", action, metadata);
      }
    }
  };

  const handleShareClick = (platform: string) => {
    dispatchAnalyticsEvent("share_click", {
      title,
      platform
    });
  };

  // Close on ESC keypress
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleCopyLink = async () => {
    handleShareClick("Copy Link");
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("लिंक कॉपी हो गया");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast.error("लिंक कॉपी करने में विफल");
    }
  };

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: <WhatsAppIcon />,
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + shareUrl)}`,
    },
    {
      name: "Facebook",
      icon: <FacebookIcon />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(title)}`,
    },
    {
      name: "X (Twitter)",
      icon: <XIcon />,
      url: `https://x.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Telegram",
      icon: <TelegramIcon />,
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`,
    },
    {
      name: "LinkedIn",
      icon: <LinkedInIcon />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Email",
      icon: <Mail className="w-5 h-5 text-slate-600 dark:text-slate-355" />,
      url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(title + "\n\n" + shareUrl)}`,
    },
  ];

  return (
    <div 
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div 
        ref={modalRef}
        className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden font-sans p-6 relative animate-in slide-in-from-bottom-8 duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <h3 className="font-extrabold font-serif text-lg text-slate-900 dark:text-white">
            साझा करें (Share)
          </h3>
          <button
            onClick={onClose}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-all hover:scale-105 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-500"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Copy Link Section */}
        <div className="mt-5">
          <p className="text-xs text-slate-550 dark:text-slate-400 mb-2 font-medium">लेख का लिंक कॉपी करें</p>
          <div className="flex items-center gap-2 p-2.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800/60 rounded-2xl">
            <input 
              type="text" 
              readOnly 
              value={shareUrl}
              className="flex-1 bg-transparent text-xs text-slate-600 dark:text-slate-350 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded px-1 overflow-hidden text-ellipsis whitespace-nowrap pl-2"
            />
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white hover:bg-primary/95 text-xs font-semibold rounded-xl shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "कॉपी हुआ" : "कॉपी करें"}</span>
            </button>
          </div>
        </div>

        {/* Social Platforms Grid */}
        <div className="mt-6">
          <p className="text-xs text-slate-550 dark:text-slate-400 mb-3 font-medium">सोशल मीडिया पर साझा करें</p>
          <div className="grid grid-cols-2 gap-3">
            {shareOptions.map((opt) => (
              <a
                key={opt.name}
                href={opt.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  handleShareClick(opt.name);
                  onClose();
                }}
                aria-label={`${opt.name} पर साझा करें`}
                className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary group cursor-pointer"
              >
                <div className="p-1.5 rounded bg-white dark:bg-slate-800 shadow-sm shrink-0 transition-transform group-hover:scale-110">
                  {opt.icon}
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors group-hover:text-primary">
                  {opt.name}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
