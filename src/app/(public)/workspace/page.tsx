"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCms } from "@/store/CmsContext";

export default function WorkspaceDashboardRedirect() {
  const { currentUser } = useCms();
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      router.replace(`/u/${currentUser.username}`);
    } else {
      router.replace("/");
    }
  }, [currentUser, router]);

  return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
  );
}
