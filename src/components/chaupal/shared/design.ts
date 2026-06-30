/**
 * Chaupal Design System Tokens
 * This file centralizes the Tailwind classes that form the Chaupal Design Language.
 * 
 * Philosophy: Premium, Elegant, Minimal, Fast, Editorial, Content First.
 * Colors: White, Light Gray, Dark Gray, Orange Accent.
 */

export const CH_COLORS = {
  // Accent
  primary: "bg-[#F97316] text-white",
  primaryHover: "hover:bg-[#EA580C]",
  primaryLight: "bg-[#F97316]/10 text-[#F97316]",
  
  // Backgrounds
  appBg: "bg-[#F8FAFC] dark:bg-[#090D16]", // Light grayish blue
  cardBg: "bg-white dark:bg-[#0F172A]", // Pure white cards
  
  // Text
  textHeading: "text-slate-900 dark:text-white font-serif font-extrabold",
  textBody: "text-slate-700 dark:text-slate-300 font-sans",
  textMuted: "text-slate-500 dark:text-slate-400 font-sans",
  
  // Borders
  borderSubtle: "border-slate-100 dark:border-slate-800",
  borderHover: "hover:border-slate-300 dark:hover:border-slate-700 transition-colors",
};

export const CH_SPACING = {
  // Padding & Margins following the 4/8px grid
  cardPadding: "p-4 sm:p-6",
  gapSm: "gap-2",
  gapMd: "gap-4",
  gapLg: "gap-6",
};

export const CH_RADIUS = {
  // 16px is rounded-2xl in Tailwind
  card: "rounded-2xl",
  button: "rounded-xl",
  full: "rounded-full",
};

export const CH_SHADOWS = {
  // Soft, premium shadows
  soft: "shadow-sm shadow-slate-200/50 dark:shadow-black/20",
  elevated: "shadow-lg shadow-slate-200/50 dark:shadow-black/40",
};

export const CH_ANIMATIONS = {
  // Subtle, fast transitions
  transition: "transition-all duration-200 ease-out",
  hoverScale: "hover:scale-[1.02]",
  hoverLift: "hover:-translate-y-1 hover:shadow-md",
  activePress: "active:scale-95",
};

// Pre-assembled complex classes
export const CH_CLASS = {
  card: `${CH_COLORS.cardBg} ${CH_RADIUS.card} ${CH_SHADOWS.soft} border ${CH_COLORS.borderSubtle}`,
  buttonPrimary: `flex items-center justify-center gap-2 ${CH_COLORS.primary} ${CH_COLORS.primaryHover} ${CH_RADIUS.button} px-4 py-2 font-bold text-sm ${CH_ANIMATIONS.transition} ${CH_ANIMATIONS.activePress}`,
  buttonSecondary: `flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 ${CH_RADIUS.button} px-4 py-2 font-bold text-sm ${CH_ANIMATIONS.transition} ${CH_ANIMATIONS.activePress}`,
  buttonGhost: `flex items-center justify-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white ${CH_RADIUS.button} px-3 py-1.5 font-semibold text-sm ${CH_ANIMATIONS.transition}`,
};
