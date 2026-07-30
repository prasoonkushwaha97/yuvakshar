"use client";

import React, { useEffect } from "react";
import YuvaksharErrorState from "@/components/shared/YuvaksharErrorState";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error details for developers safely without exposing to UI
    console.error("[Yuvakshar Application Error]:", error);
  }, [error]);

  return (
    <YuvaksharErrorState
      type="runtime"
      title="कुछ गड़बड़ हो गई"
      description="जिस पृष्ठ को आप खोलना चाहते हैं उसे अभी प्रदर्शित नहीं किया जा सका। कृपया कुछ समय बाद पुनः प्रयास करें।"
      onRetry={reset}
      showHomeButton={true}
      showBackButton={true}
    />
  );
}
