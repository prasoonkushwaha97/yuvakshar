"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RotatingHeadlinesProps {
  headlines: string[];
  intervalMs?: number;
}

export default function RotatingHeadlines({ 
  headlines, 
  intervalMs = 3500 
}: RotatingHeadlinesProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % headlines.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [headlines.length, intervalMs]);

  return (
    <div className="h-16 md:h-20 flex items-center justify-center overflow-hidden py-2 select-none">
      <AnimatePresence mode="wait">
        <motion.h3
          key={index}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -30, opacity: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className="text-lg md:text-3xl lg:text-4xl font-serif text-yuvakshar-gray font-hindi tracking-wide text-center uppercase"
        >
          {headlines[index]}
        </motion.h3>
      </AnimatePresence>
    </div>
  );
}
