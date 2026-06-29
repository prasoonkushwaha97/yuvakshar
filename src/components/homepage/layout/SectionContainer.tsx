"use client";

import React from "react";

interface SectionContainerProps {
  children: React.ReactNode;
  className?: string;
  bgClassName?: string;
  id?: string;
}

export default function SectionContainer({
  children,
  className = "",
  bgClassName = "",
  id
}: SectionContainerProps) {
  return (
    <section 
      id={id}
      className={`w-full py-6 border-b border-gray-100 dark:border-gray-850 last:border-b-0 transition-colors duration-300 ${bgClassName}`}
    >
      <div className={`max-w-[1400px] mx-auto px-4 md:px-8 w-full ${className}`}>
        {children}
      </div>
    </section>
  );
}
