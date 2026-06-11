"use client";

import React from "react";
import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: "gold" | "blue" | "saffron" | "none";
  hoverEffect?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export default function GlassCard({
  children,
  className = "",
  glow = "none",
  hoverEffect = true,
  onClick,
  style
}: GlassCardProps) {
  const glowStyles = {
    gold: "shadow-[0_0_15px_rgba(212,175,55,0.05)] border-yuvakshar-gold/15 hover:border-yuvakshar-gold/40 hover:shadow-[0_0_25px_rgba(212,175,55,0.15)]",
    blue: "shadow-[0_0_15px_rgba(59,130,246,0.05)] border-yuvakshar-blue/15 hover:border-yuvakshar-blue/40 hover:shadow-[0_0_25px_rgba(59,130,246,0.15)]",
    saffron: "shadow-[0_0_15px_rgba(217,119,6,0.05)] border-yuvakshar-saffron/15 hover:border-yuvakshar-saffron/40 hover:shadow-[0_0_25px_rgba(217,119,6,0.15)]",
    none: "border-yuvakshar-gold/10 hover:border-yuvakshar-gold/25"
  };

  const cardBase = "glass-panel rounded-2xl overflow-hidden p-6 relative group transition-all duration-300";
  const glowStyle = glowStyles[glow];

  if (!hoverEffect) {
    return (
      <div 
        onClick={onClick}
        style={style}
        className={`${cardBase} ${glowStyle} ${className} ${onClick ? "cursor-pointer" : ""}`}
      >
        {/* Subtle interior lighting */}
        <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.01] to-white/[0.03] pointer-events-none" />
        {children}
      </div>
    );
  }

  return (
    <motion.div
      onClick={onClick}
      style={style}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`${cardBase} ${glowStyle} ${className} ${onClick ? "cursor-pointer" : ""}`}
    >
      {/* Dynamic light refraction reflection card flare */}
      <div className="absolute -inset-px bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      {/* Background radial gradient glow overlay */}
      {glow !== "none" && (
        <div className={`absolute -right-20 -top-20 w-40 h-40 rounded-full blur-[80px] pointer-events-none opacity-20 transition-opacity group-hover:opacity-30 ${
          glow === "gold" ? "bg-yuvakshar-gold" : glow === "blue" ? "bg-yuvakshar-blue" : "bg-yuvakshar-saffron"
        }`} />
      )}
      
      <div className="relative z-10 h-full flex flex-col justify-between">
        {children}
      </div>
    </motion.div>
  );
}
