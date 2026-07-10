"use client";

import React, { useState, useEffect } from "react";
import CreateBottomSheet from "./CreateBottomSheet";

export function openCreateSheet() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("open-create-sheet"));
  }
}

export default function GlobalCreateSheet() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener("open-create-sheet", handleOpen);
    return () => window.removeEventListener("open-create-sheet", handleOpen);
  }, []);

  return <CreateBottomSheet isOpen={isOpen} onClose={() => setIsOpen(false)} />;
}
