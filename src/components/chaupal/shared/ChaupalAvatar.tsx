import React from "react";
import Image from "next/image";

interface ChaupalAvatarProps {
  src?: string | null;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function ChaupalAvatar({ src, name, size = "md", className = "" }: ChaupalAvatarProps) {
  const sizeMap = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-24 h-24 text-3xl",
  };

  const initial = name ? name.charAt(0).toUpperCase() : "?";

  return (
    <div className={`${sizeMap[size]} rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 relative shadow-sm border border-slate-200 dark:border-slate-700 ${className}`}>
      {src ? (
        <Image src={src} alt={name} fill className="object-cover" sizes="96px" />
      ) : (
        <span className="font-bold text-slate-500 dark:text-slate-400 font-sans">{initial}</span>
      )}
    </div>
  );
}
