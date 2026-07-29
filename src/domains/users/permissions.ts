export type CmsRole = 
  | "Founder" 
  | "Editor-in-Chief" 
  | "Managing Editor" 
  | "Editor" 
  | "Normal User";

export interface RolePermissions {
  create_article: boolean;
  review_article: boolean;
  publish_article: boolean;
  delete_article: boolean;
  manage_workflow: boolean;
  assign_articles: boolean;
  manage_users: boolean;
  manage_settings: boolean;
  manage_contact_messages: boolean;
}

// Default strict RBAC implementation
export const DEFAULT_ROLE_PERMISSIONS: Record<CmsRole, RolePermissions> = {
  "Founder": {
    create_article: true,
    review_article: true,
    publish_article: true,
    delete_article: true,
    manage_workflow: true,
    assign_articles: true,
    manage_users: true,
    manage_settings: true,
    manage_contact_messages: true,
  },
  "Editor-in-Chief": {
    create_article: true,
    review_article: true,
    publish_article: true,
    delete_article: true,
    manage_workflow: true,
    assign_articles: true,
    manage_users: false,
    manage_settings: false,
    manage_contact_messages: false,
  },
  "Managing Editor": {
    create_article: true,
    review_article: true,
    publish_article: false, // EIC or Founder publishes
    delete_article: false,
    manage_workflow: true,
    assign_articles: true,
    manage_users: false,
    manage_settings: false,
    manage_contact_messages: false,
  },
  "Editor": {
    create_article: true,
    review_article: true,
    publish_article: false,
    delete_article: false,
    manage_workflow: false,
    assign_articles: false,
    manage_users: false,
    manage_settings: false,
    manage_contact_messages: false,
  },
  "Normal User": {
    create_article: true,
    review_article: false,
    publish_article: false,
    delete_article: false,
    manage_workflow: false,
    assign_articles: false,
    manage_users: false,
    manage_settings: false,
    manage_contact_messages: false,
  },
};

export const hasPermission = (role: string | null | undefined, permission: keyof RolePermissions): boolean => {
  if (!role) return false;
  
  let normalizedRole = role;
  // Normalize previous admin roles to Founder
  if (role === "Administrator" || role === "????????" || role === "???????") normalizedRole = "Founder";
  // Fallback for any unknown user
  if (!(normalizedRole in DEFAULT_ROLE_PERMISSIONS)) {
    normalizedRole = "Normal User";
  }

  return DEFAULT_ROLE_PERMISSIONS[normalizedRole as CmsRole][permission];
};
