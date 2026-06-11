"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface IntroLoaderProps {
  onComplete: () => void;
}

const words = [
  "विचार",
  "अभिव्यक्ति",
  "पत्रकारिता",
  "ज्ञान",
  "युवा",
  "युवाक्षर"
];

export default function IntroLoader({ onComplete }: IntroLoaderProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [isDone, setIsDone] = useState(false);

  // Cycle through words character by character to simulate handwriting
  useEffect(() => {
    if (wordIndex >= words.length) {
      // Fade out screen
      const fadeOutTimer = setTimeout(() => {
        setIsDone(true);
        setTimeout(onComplete, 800); // Trigger completion callback
      }, 1500);
      return () => clearTimeout(fadeOutTimer);
    }

    const currentWord = words[wordIndex];
    let charIdx = 0;
    setTypedText("");

    const typingInterval = setInterval(() => {
      if (charIdx < currentWord.length) {
        setTypedText(prev => prev + currentWord[charIdx]);
        charIdx++;
      } else {
        clearInterval(typingInterval);
        
        // Wait and go to next word
        setTimeout(() => {
          setWordIndex(prev => prev + 1);
        }, wordIndex === words.length - 1 ? 1200 : 700); // display final logo longer
      }
    }, 120);

    return () => clearInterval(typingInterval);
  }, [wordIndex, onComplete]);

  if (isDone) return null;

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex flex-col justify-center items-center bg-[#F8F5EE] dark:bg-[#0A0A0A] select-none"
    >
      <div className="relative max-w-lg mx-auto flex flex-col items-center justify-center p-6 text-center h-[200px]">
        {/* Animated Feather Pen */}
        <AnimatePresence>
          {wordIndex < words.length && (
            <motion.div
              // Animate pen tip moving horizontally to mimic character-by-character typing
              animate={{ 
                x: typedText.length * 12 - (words[wordIndex].length * 6),
                y: [0, -4, 0] 
              }}
              transition={{ 
                x: { type: "tween", ease: "linear", duration: 0.1 },
                y: { repeat: Infinity, duration: 0.25, ease: "easeInOut" }
              }}
              className="absolute -top-12 z-20 text-primary"
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-10 h-10 drop-shadow-[0_0_12px_rgba(245,124,0,0.5)] rotate-[20deg]"
              >
                {/* Detailed Quill Feather SVG */}
                <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
                <line x1="16" y1="8" x2="2" y2="22" />
                <line x1="17.5" y1="15" x2="9" y2="15" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Written word display */}
        <motion.div
          key={wordIndex}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center"
        >
          <h1 className={`font-serif tracking-wide font-extrabold ${
            wordIndex === words.length - 1 
              ? "text-4xl md:text-7xl text-primary drop-shadow-[0_0_15px_rgba(245,124,0,0.3)] animate-pulse" 
              : "text-3xl md:text-5xl text-foreground/90"
          }`}>
            {typedText}
          </h1>
        </motion.div>

        {/* Ink splash effect for final logo */}
        {wordIndex === words.length - 1 && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0.15 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute w-24 h-24 rounded-full bg-primary blur-md pointer-events-none"
          />
        )}
      </div>

      <div className="absolute bottom-12 flex flex-col items-center">
        <span className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase font-bold animate-pulse">
          पत्रिका सहकार्यात्मक
        </span>
      </div>
    </motion.div>
  );
}
