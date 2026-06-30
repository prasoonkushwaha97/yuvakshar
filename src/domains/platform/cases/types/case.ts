export type CaseStatus = "New" | "Assigned" | "In Progress" | "Waiting" | "Resolved" | "Closed" | "Archived";
export type CasePriority = "Low" | "Medium" | "High" | "Critical";

export interface CaseNote {
  id: string;
  authorId: string;
  content: string; // Supports Rich Text / Mentions
  createdAt: string;
}

export interface CaseAttachment {
  id: string;
  filename: string;
  url: string;
  type: string;
}

export interface CaseTimelineEvent {
  id: string;
  action: string;
  actorId: string;
  timestamp: string;
  details?: Record<string, any>;
}

export interface SLA {
  dueDate: string;
  isOverdue: boolean;
}

/**
 * BaseCase Domain Entity
 * 
 * The foundation for every operational workflow in the platform (Moderation, Copyright, Support, Editorial).
 * BaseCase manages the lifecycle of a Case, remaining agnostic to the specific domain.
 */
export interface BaseCase {
  id: string;
  caseType: "Moderation" | "Copyright" | "Support" | "Editorial" | "Security" | "Legal";
  status: CaseStatus;
  priority: CasePriority;
  
  title: string;
  description: string;
  
  reporterId?: string; // Who opened the case (can be system)
  assigneeId?: string; // Which operator is handling it
  relatedEntityId?: string; // e.g., articleId, commentId, userId
  relatedEntityType?: string;
  
  sla?: SLA;
  
  // Shared capabilities
  notes: CaseNote[];
  attachments: CaseAttachment[];
  timeline: CaseTimelineEvent[];
  
  createdAt: string;
  updatedAt: string;
  closedAt?: string;
}
