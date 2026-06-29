"use client";

import React from "react";

interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
  bgClassName?: string;
  id?: string;
  noTopPadding?: boolean;
}

export default function SectionContainer({
  children,
  className = "",
  bgClassName = "",
  id,
  noTopPadding = false
}: SectionContainerProps) {
  return (
    <section 
      id={id}
      className={`w-full ${noTopPadding ? "pt-4 lg:pt-6 pb-10 lg:py-14" : "py-10 lg:py-14"} border-b border-gray-105/70 dark:border-gray-850/70 last:border-b-0 transition-colors duration-300 ${bgClassName}`}
    >
      <div className={`max-w-[1400px] mx-auto px-4 md:px-8 w-full ${className}`}>
        {children}
      </div>
    </section>
  );
}
