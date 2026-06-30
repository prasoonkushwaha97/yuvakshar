import React from "react";
import { CheckCircle2 } from "lucide-react";

interface ChaupalBadgeProps {
  type: "verified" | "role" | "new" | "count";
  label?: string | number;
}

export default function ChaupalBadge({ type, label }: ChaupalBadgeProps) {
  if (type === "verified") {
    return <CheckCircle2 className="w-4 h-4 text-[#1DA1F2] fill-[#1DA1F2]/10" />;
  }

  if (type === "count") {
    return (
      <span className="inline-flex items-center justify-center px-1.5 min-w-[1.25rem] h-5 text-[10px] font-bold text-white bg-[#F97316] rounded-full">
        {label}
      </span>
    );
  }

  if (type === "role") {
    return (
      <span className="inline-flex items-center text-[10px] font-bold font-sans uppercase tracking-wider rounded-md px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        {label}
      </span>
    );
  }

  if (type === "new") {
    return (
      <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider rounded-md px-1.5 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20">
        नया
      </span>
    );
  }

  return null;
}
