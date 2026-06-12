"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, CheckCircle2, Sparkles, ArrowRight, Crown, Gem, LogIn, Award } from "lucide-react";
import { useCms } from "@/store/CmsContext";
import GlassCard from "./GlassCard";

interface PaywallGateProps {
  accessLevel?: "Free" | "Premium" | "Patron" | "Founding";
  children: React.ReactNode;
}

export default function PaywallGate({ accessLevel = "Free", children }: PaywallGateProps) {
  return <>{children}</>;
}

