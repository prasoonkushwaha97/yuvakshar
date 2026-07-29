import React from "react";
import { getAdminNotifications } from "@/lib/actions/notificationActions";
import NotificationsManager from "@/components/founder/notifications/NotificationsManager";
import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentUserRoles } from "@/lib/rbacService";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "सूचनाएँ – Yuvakshar Admin",
  description: "CMS सूचना केंद्र — सभी महत्वपूर्ण गतिविधियों की जानकारी एक स्थान पर।",
};

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/admin/login");
  }

  const roles = await getCurrentUserRoles();
  const roleSlug = roles.length > 0 ? roles[0].slug : "editor";

  // Allow founder, admin, editor
  if (!["founder", "admin", "editor"].includes(roleSlug)) {
    redirect("/admin");
  }

  const { data: notifications, count } = await getAdminNotifications({
    limit: 20,
    sort: "newest",
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <NotificationsManager
        initialNotifications={notifications || []}
        userRole={roleSlug}
        totalCount={count ?? 0}
      />
    </div>
  );
}
