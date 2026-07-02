"use client";

import React, { useState } from "react";
import { X, Mail, Link2, Check } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  summary?: string;
}

// Custom brand SVG icons for brand safety
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.59 1.978 14.12 1.01 11.69 1.01c-5.439 0-9.865 4.37-9.869 9.803-.001 1.77.475 3.5 1.378 5.027l-.95 3.471 3.808-.947zm11.758-7.794c-.32-.16-1.89-.937-2.185-1.042-.294-.105-.508-.16-.723.16-.213.32-.828 1.042-1.014 1.252-.187.21-.374.237-.694.077-1.256-.627-2.187-1.364-2.927-2.63-.194-.333-.033-.513.127-.674.144-.145.32-.373.48-.56.16-.186.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.723-1.747-.99-2.387-.26-.627-.524-.542-.722-.552-.187-.01-.401-.01-.614-.01-.213 0-.56.08-.854.4-.294.32-1.123 1.093-1.123 2.666 0 1.573 1.147 3.093 1.307 3.306.16.213 2.257 3.447 5.467 4.834.763.33 1.36.527 1.824.674.767.244 1.467.21 2.02.128.617-.092 1.89-.773 2.157-1.48.267-.707.267-1.307.187-1.427-.08-.12-.294-.227-.614-.387z" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.944 0C5.344 0 0 5.344 0 11.944c0 5.28 3.424 9.76 8.192 11.36.608.112.832-.256.832-.576v-2.208c-3.328.72-4.032-1.424-4.032-1.424-.544-1.376-1.328-1.744-1.328-1.744-1.088-.744.08-.728.08-.728 1.2.08 1.832 1.232 1.832 1.232 1.072 1.832 2.808 1.304 3.496.992.112-.776.424-1.304.768-1.6-2.656-.304-5.456-1.328-5.456-5.92 0-1.312.472-2.384 1.24-3.216-.128-.304-.536-1.528.12-3.168 0 0 1.008-.32 3.304 1.232.96-.264 1.984-.4 3.008-.408 1.024.008 2.048.144 3.008.408 2.296-1.552 3.304-1.232 3.304-1.232.656 1.64.24 2.864.12 3.168.768.832 1.24 1.904 1.24 3.216 0 4.608-2.808 5.616-5.488 5.912.432.376.816 1.112.816 2.24v3.312c0 .32.224.696.832.576C20.576 21.696 24 17.224 24 11.944 24 5.344 18.656 0 11.944 0z" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

export default function ShareModal({
  isOpen,
  onClose,
  title,
  url,
  summary = "",
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedText = encodeURIComponent(`${title}\n${summary}`);

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: WhatsAppIcon,
      color: "bg-[#25D366] hover:bg-[#20ba5a]",
      textColor: "text-white",
      href: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
    },
    {
      name: "X (Twitter)",
      icon: TwitterIcon,
      color: "bg-black hover:bg-stone-900 border border-slate-800 dark:border-slate-700",
      textColor: "text-white",
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    },
    {
      name: "Telegram",
      icon: TelegramIcon,
      color: "bg-[#0088cc] hover:bg-[#0077b5]",
      textColor: "text-white",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      name: "Facebook",
      icon: FacebookIcon,
      color: "bg-[#1877F2] hover:bg-[#166FE5]",
      textColor: "text-white",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      name: "LinkedIn",
      icon: LinkedInIcon,
      color: "bg-[#0A66C2] hover:bg-[#0958a8]",
      textColor: "text-white",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: "Email",
      icon: Mail,
      color: "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700",
      textColor: "text-slate-800 dark:text-slate-200",
      href: `mailto:?subject=${encodedTitle}&body=${encodedText}%20${encodedUrl}`,
    },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#0F172A] rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden font-sans">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold font-serif text-lg text-slate-900 dark:text-white">
              साझा करें (Share)
            </h3>
            <p className="text-[11px] text-slate-450 dark:text-slate-500 mt-0.5">
              इस सामग्री को अपने मित्रों एवं सोशल नेटवर्क पर साझा करें।
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Share Grid */}
          <div className="grid grid-cols-3 gap-3">
            {shareOptions.map((opt) => {
              const Icon = opt.icon;
              return (
                <a
                  key={opt.name}
                  href={opt.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all hover:scale-[1.03] active:scale-95 text-center gap-2 group ${opt.color} ${opt.textColor}`}
                >
                  <Icon className="w-5 h-5 transition-transform group-hover:rotate-6" />
                  <span className="text-[10px] font-bold tracking-wide font-sans">
                    {opt.name}
                  </span>
                </a>
              );
            })}
          </div>

          {/* Copy Link Section */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
              सामग्री लिंक (Content Link)
            </label>
            <div className="flex gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-2 items-center">
              <input
                type="text"
                readOnly
                value={url}
                className="flex-1 bg-transparent text-xs text-slate-600 dark:text-slate-350 focus:outline-none px-2 select-all overflow-hidden text-ellipsis whitespace-nowrap"
              />
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-lg text-xs font-bold font-sans transition-colors flex items-center gap-1.5 shrink-0 ${
                  copied
                    ? "bg-green-600 text-white"
                    : "bg-[#F97316] hover:bg-[#EA580C] text-white"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>सहेजा गया</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-3.5 h-3.5" />
                    <span>कॉपी करें</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
