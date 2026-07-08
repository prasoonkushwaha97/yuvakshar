"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCms } from "@/store/CmsContext";
import { getCanonicalProfileUrl } from "@/utils/username";

export default function ProfileRedirectPage() {
  const { currentUser, authLoading } = useCms();
  const router = useRouter();

  useEffect(() => {
    // Wait until auth is fully loaded
    if (authLoading) return;

    if (currentUser) {
      // Redirect to their canonical profile
      const profileUrl = getCanonicalProfileUrl(currentUser);
      router.replace(profileUrl ?? `/u/${currentUser.id}`);
    } else {
      // Not logged in, redirect to login
      router.replace("/login");
    }
  }, [currentUser, authLoading, router]);

  // Show a blank loading state while determining where to redirect
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}
