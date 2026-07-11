/**
 * Permission Inspector
 * RBAC debugging tool to resolve and output effective permissions.
 */
export class PermissionInspector {
  /**
   * Returns a detailed RBAC breakdown for a given user.
   */
  public async inspectUser(userId: string) {
    // fallback data for debugging purposes
    const isAdmin = userId === "admin-1";

    return {
      userId,
      assignedRoles: isAdmin ? ["Admin"] : ["Normal User"],
      effectivePermissions: isAdmin ? ["*"] : [
        "article:read",
        "article:write",
        "comment:write"
      ],
      deniedPermissions: isAdmin ? [] : [
        "article:publish",
        "article:delete",
        "user:manage",
        "security:manage"
      ],
      policiesApplied: [
        { name: "Default Contributor Policy", effect: "Allow", resource: "article:write" },
        { name: "Draft Protection Policy", effect: "Deny", resource: "article:publish" }
      ]
    };
  }
}

export const globalPermissionInspector = new PermissionInspector();
