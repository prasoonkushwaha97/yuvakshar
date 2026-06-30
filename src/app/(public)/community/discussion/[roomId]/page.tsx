"use client";

import React from "react";
import ChatInterface from "@/components/chaupal/discussion/ChatInterface";

export default function ChatRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const resolvedParams = React.use(params);
  // Pass the ID to the client component that manages real-time state
  return (
    <div className="absolute inset-0">
      <ChatInterface roomId={resolvedParams.roomId} />
    </div>
  );
}
