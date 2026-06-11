"use client";

import React from "react";
import Link from "next/link";
import { Globe, BookOpen, Compass, Award, ShieldAlert, ArrowRight } from "lucide-react";
import GlassCard from "@/components/yuvakshar/GlassCard";

export default function CategoriesPage() {
  const categoryList = [
    {
      name: "Nation Building",
      icon: Compass,
      description: "Digital public infrastructure stacks, institutional structures, developmental economics, and structural policy outlines for Indian expansion.",
      articlesCount: 2,
      glow: "gold" as const
    },
    {
      name: "Global Strategy",
      icon: Globe,
      description: "Indo-Pacific maritime alignments, regional trade corridors, multipolar finance rails, and diplomatic balances in the 21st century.",
      articlesCount: 2,
      glow: "blue" as const
    },
    {
      name: "Active Civics",
      icon: ShieldAlert,
      description: "Empowering Panchayats, decentralized block budgeting, citizen-led registries, and digital reforms in local municipal administrations.",
      articlesCount: 1,
      glow: "saffron" as const
    },
    {
      name: "Youth Awareness",
      icon: Award,
      description: "Cognitive sovereignty manifestations, slow reading manifestos, structured knowledge models, and youth leadership initiatives.",
      articlesCount: 1,
      glow: "gold" as const
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 min-h-screen space-y-12">
      
      {/* Header */}
      <div className="border-b border-yuvakshar-gold/15 pb-6">
        <h1 className="font-serif text-3xl md:text-5xl text-gradient-gold font-bold">Editorial Categories</h1>
        <p className="text-xs text-yuvakshar-gray uppercase tracking-wider mt-2">
          Structured syllabus blocks relating strategic development indexes
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categoryList.map((cat, idx) => {
          const Icon = cat.icon;
          return (
            <GlassCard key={idx} glow={cat.glow} className="p-8 h-[280px] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="p-2.5 rounded-xl bg-yuvakshar-card border border-yuvakshar-gold/15 text-yuvakshar-gold">
                    <Icon className="w-5 h-5 animate-pulse" />
                  </div>
                  <span className="text-[10px] text-yuvakshar-gray font-mono bg-yuvakshar-card border border-yuvakshar-gold/5 px-2.5 py-0.5 rounded-full">
                    {cat.articlesCount} लेख
                  </span>
                </div>

                <h3 className="font-serif text-xl font-bold text-yuvakshar-text">{cat.name}</h3>
                <p className="text-xs text-yuvakshar-gray leading-relaxed font-light line-clamp-3">
                  {cat.description}
                </p>
              </div>

              <div className="pt-4 border-t border-yuvakshar-gold/10">
                <Link
                  href={`/current-affairs?category=${encodeURIComponent(cat.name)}`}
                  className="flex items-center space-x-1.5 text-xs text-yuvakshar-gold hover:text-white uppercase tracking-widest font-bold transition-colors cursor-pointer"
                >
                  <span>Explore Index</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </GlassCard>
          );
        })}
      </div>

    </div>
  );
}
