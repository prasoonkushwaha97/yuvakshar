"use client";

import React, { useEffect } from "react";
import YuvaksharErrorState from "@/components/shared/YuvaksharErrorState";

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Yuvakshar Workspace Error]:", error);
  }, [error]);

  return (
    <div className="p-4 md:p-6 w-full h-full flex items-center justify-center">
      <YuvaksharErrorState
        type="runtime"
        title="लेखक वर्कस्पेस में त्रुटि"
        description="आपकी ड्राफ्ट या प्रकाशन सामग्री लोड करते समय त्रुटि हुई। कृपया पुनः प्रयास करें।"
        onRetry={reset}
        showHomeButton={true}
        showBackButton={true}
        fullScreen={false}
      />
    </div>
  );
}
