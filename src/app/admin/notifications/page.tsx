import React from "react";
import { getAdminNotifications } from "@/lib/actions/notificationActions";
import NotificationsManager from "@/components/founder/notifications/NotificationsManager";
import { redirect } from "next/navigation";
import { hasPermission } from "@/domains/users/permissions";
import { getCurrentUser, getCurrentUserRoles } from "@/lib/rbacService";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/admin/login");
  }

  const roles = await getCurrentUserRoles();
  const roleName = roles.length > 0 ? roles[0].name : "Reader";

  if (!hasPermission(roleName, "review_article")) {
    redirect("/admin"); // Redirect if not authorized
  }

  const { data: notifications, error } = await getAdminNotifications();

  return (
    <div className="min-h-screen bg-[#FDFCF7] dark:bg-[#0B0F19]">
      <NotificationsManager initialNotifications={notifications || []} />
    </div>
  );
}
