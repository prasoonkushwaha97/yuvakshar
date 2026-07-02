"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { cn } from "@/lib/utils";

interface ContentRendererProps {
  content?: string | null;
  className?: string;
  emptyPlaceholder?: string;
}

export function ContentRenderer({ 
  content, 
  className,
  emptyPlaceholder = "कोई सामग्री उपलब्ध नहीं है (No content available)" 
}: ContentRendererProps) {
  
  if (!content || content.trim() === "") {
    return (
      <div className={cn("text-slate-500 italic text-sm py-4", className)}>
        {emptyPlaceholder}
      </div>
    );
  }

  return (
    <div 
      className={cn(
        // Base prose styling
        "prose prose-slate dark:prose-invert max-w-none",
        
        // Hindi typography bindings
        "prose-headings:font-serif prose-headings:font-semibold prose-headings:tracking-tight",
        "prose-p:font-sans prose-p:leading-relaxed prose-p:text-slate-700 dark:prose-p:text-slate-300",
        
        // Hierarchy rules — mobile defaults
        "prose-h1:text-3xl prose-h1:mb-6 prose-h1:mt-8 prose-h1:text-slate-900 dark:prose-h1:text-white",
        "prose-h2:text-2xl prose-h2:mb-4 prose-h2:mt-6 prose-h2:border-b prose-h2:border-slate-200 dark:prose-h2:border-slate-800 prose-h2:pb-2",
        "prose-h3:text-xl prose-h3:mb-3 prose-h3:mt-5",

        // Desktop typography scaling (md: prefix — mobile remains unchanged)
        "md:prose-p:text-xl md:prose-p:leading-[2.0] md:prose-p:mb-8",
        "md:prose-h1:text-4xl md:prose-h1:mb-8 md:prose-h1:mt-12",
        "md:prose-h2:text-[36px] md:prose-h2:mb-6 md:prose-h2:mt-12 md:prose-h2:pb-3",
        "md:prose-h3:text-[28px] md:prose-h3:mb-5 md:prose-h3:mt-10",
        
        // Lists & Blockquotes
        "prose-li:my-1 prose-ul:my-4 prose-ol:my-4",
        "md:prose-li:my-2 md:prose-ul:my-6 md:prose-ol:my-6",
        "prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-600 dark:prose-blockquote:text-slate-400 prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-slate-800/50 prose-blockquote:py-2 prose-blockquote:pr-4 prose-blockquote:rounded-r",
        "md:prose-blockquote:pl-6 md:prose-blockquote:text-lg md:prose-blockquote:py-3 md:prose-blockquote:my-8",
        
        // Interactive Elements
        "prose-a:text-primary hover:prose-a:text-primary/80 prose-a:underline-offset-4",
        "prose-strong:font-bold prose-strong:text-slate-900 dark:prose-strong:text-white",
        
        // Mobile Hardening & Tables
        "prose-table:w-full prose-table:overflow-x-auto prose-table:block md:prose-table:table",
        "prose-th:bg-slate-100 dark:prose-th:bg-slate-800 prose-th:px-4 prose-th:py-2",
        "prose-td:px-4 prose-td:py-2 prose-td:border-b prose-td:border-slate-200 dark:prose-td:border-slate-800",
        
        // Prevent overflow, protect ligatures
        "break-words",
        
        // Merge custom classnames
        className
      )}
      style={{ overflowWrap: "break-word" }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
