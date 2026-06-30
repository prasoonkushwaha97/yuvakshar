export type CmsRole = 
  | "Reader" 
  | "Contributor" 
  | "Author" 
  | "Sub Editor" 
  | "Editor" 
  | "Managing Editor" 
  | "Administrator" 
  | "Founder";

export interface RolePermissions {
  create_article: boolean;
  review_article: boolean;
  publish_article: boolean;
  delete_article: boolean;
  manage_homepage: boolean;
  manage_users: boolean;
  manage_settings: boolean;
}

// provisional in-memory fallback until DB migration is complete for dynamic permissions
export const DEFAULT_ROLE_PERMISSIONS: Record<CmsRole, RolePermissions> = {
  "Reader": {
    create_article: false,
    review_article: false,
    publish_article: false,
    delete_article: false,
    manage_homepage: false,
    manage_users: false,
    manage_settings: false,
  },
  "Contributor": {
    create_article: true,
    review_article: false,
    publish_article: false,
    delete_article: false,
    manage_homepage: false,
    manage_users: false,
    manage_settings: false,
  },
  "Author": {
    create_article: true,
    review_article: false,
    publish_article: false,
    delete_article: false,
    manage_homepage: false,
    manage_users: false,
    manage_settings: false,
  },
  "Sub Editor": {
    create_article: true,
    review_article: true,
    publish_article: false,
    delete_article: false,
    manage_homepage: false,
    manage_users: false,
    manage_settings: false,
  },
  "Editor": {
    create_article: true,
    review_article: true,
    publish_article: true,
    delete_article: false,
    manage_homepage: false,
    manage_users: false,
    manage_settings: false,
  },
  "Managing Editor": {
    create_article: true,
    review_article: true,
    publish_article: true,
    delete_article: true,
    manage_homepage: true,
    manage_users: false,
    manage_settings: false,
  },
  "Administrator": {
    create_article: true,
    review_article: true,
    publish_article: true,
    delete_article: true,
    manage_homepage: true,
    manage_users: true,
    manage_settings: true,
  },
  "Founder": {
    create_article: true,
    review_article: true,
    publish_article: true,
    delete_article: true,
    manage_homepage: true,
    manage_users: true,
    manage_settings: true,
  },
};

export const hasPermission = (role: string | null | undefined, permission: keyof RolePermissions): boolean => {
  if (!role) return false;
  // If the role exists in our matrix, check it
  if (role in DEFAULT_ROLE_PERMISSIONS) {
    return DEFAULT_ROLE_PERMISSIONS[role as CmsRole][permission];
  }
  return false;
};
