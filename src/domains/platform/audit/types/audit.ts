export type AuditAction = "CREATE" | "UPDATE" | "DELETE" | "PUBLISH" | "ARCHIVE" | "RESTORE" | "LOGIN" | "LOGOUT" | "FAILED_LOGIN";
export type AuditSeverity = "info" | "warning" | "critical";

export interface AuditRecord {
  id: string;
  timestamp: string;
  
  // Actor info
  actorId: string; // User ID who performed the action, or 'system'
  actorRole: string;
  ipAddress?: string;
  userAgent?: string;
  
  // Action info
  action: AuditAction;
  module: string; // e.g., 'articles', 'media', 'auth', 'homepage'
  entityId?: string; // The ID of the thing being changed
  
  // Data tracking
  previousValue?: Record<string, any>; // Used for diffs and rollbacks
  newValue?: Record<string, any>;
  
  // Metadata
  description: string; // Human readable summary e.g., "Published article 'Election Results'"
  severity: AuditSeverity;
}
