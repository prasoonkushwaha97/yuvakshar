import { BaseCase } from "../../cases/types/case";

export type ReportCategory = 
  | "Spam" 
  | "Abuse" 
  | "Harassment" 
  | "Hate Speech" 
  | "Misinformation" 
  | "Copyright" 
  | "Impersonation" 
  | "NSFW" 
  | "Violence" 
  | "Other";

export type ModeratorAction = 
  | "Approve" 
  | "Reject Report" 
  | "Hide Content" 
  | "Restore Content" 
  | "Warn User" 
  | "Suspend User" 
  | "Permanent Ban" 
  | "Escalate" 
  | "Merge Cases";

export interface ReportEvidence {
  id: string;
  type: "Screenshot" | "Link" | "Text" | "File";
  url: string;
  description?: string;
}

/**
 * Moderation Case
 * Extends the BaseCase to include moderation-specific fields.
 */
export interface ModerationCase extends BaseCase {
  caseType: "Moderation";
  
  // Specific to Moderation
  reportCategory: ReportCategory;
  reportCount: number;
  evidence: ReportEvidence[];
  
  reportedUserId?: string;
  
  // To track the final decision taken on the case
  finalDecision?: ModeratorAction;
}
