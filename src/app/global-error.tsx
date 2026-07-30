"use client";

import React, { useEffect } from "react";
import YuvaksharErrorState from "@/components/shared/YuvaksharErrorState";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log fatal root layout error safely for developer debugging
    console.error("[Yuvakshar Global Fatal Error]:", error);
  }, [error]);

  return (
    <html lang="hi">
      <body className="bg-slate-50 dark:bg-[#0c0f17] font-sans antialiased">
        <YuvaksharErrorState
          type="500"
          title="गंभीर प्रणाली त्रुटि"
          description="सिस्टम का यह हिस्सा अस्थायी रूप से अनुपलब्ध है। हमारी तकनीकी टीम कार्य कर रही है।"
          onRetry={reset}
          showHomeButton={true}
          showBackButton={true}
        />
      </body>
    </html>
  );
}
