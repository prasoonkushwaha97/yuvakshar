export type SecurityRiskLevel = "Low" | "Medium" | "High" | "Critical";
export type APIKeyType = "Personal" | "Service" | "ReadOnly";
export type SessionStatus = "Active" | "Revoked" | "Expired";

export interface ActiveSession {
  id: string;
  userId: string;
  device: string;
  browser: string;
  os: string;
  ipAddress: string;
  country?: string;
  loginTime: string;
  lastActivity: string;
  status: SessionStatus;
}

export interface APIKey {
  id: string;
  name: string;
  tokenPrefix: string; // e.g., 'yuv_pk_***'
  type: APIKeyType;
  ownerId: string;
  isServiceAccount: boolean;
  expiresAt?: string;
  lastUsedAt?: string;
  createdAt: string;
  status: "Active" | "Revoked";
}

export interface ServiceAccount {
  id: string;
  name: string;
  description: string;
  roles: string[];
  createdAt: string;
}

export interface SecurityAlert {
  id: string;
  title: string;
  description: string;
  riskLevel: SecurityRiskLevel;
  relatedUserId?: string;
  triggerEvents: string[]; // Event IDs that correlated into this alert
  createdAt: string;
  status: "Open" | "Investigating" | "Resolved";
}

export interface AccessReview {
  id: string;
  targetId: string; // UserId or ServiceAccountId
  targetType: "User" | "ServiceAccount" | "APIKey";
  reviewerId: string;
  decision: "Approved" | "Revoked" | "Modified";
  reason: string;
  timestamp: string;
}
