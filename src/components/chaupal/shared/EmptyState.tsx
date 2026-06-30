import React from "react";
import { LucideIcon } from "lucide-react";
import { CH_CLASS } from "./design";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${CH_CLASS.card}`}>
      <div className="w-16 h-16 mb-4 rounded-full bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center text-slate-400 dark:text-slate-500">
        <Icon className="w-8 h-8" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-serif font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm font-sans text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <button onClick={onAction} className={CH_CLASS.buttonPrimary}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
