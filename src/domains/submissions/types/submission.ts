import { ContentDocument } from "@/domains/editorial/types/schema";

export type SubmissionStatus = 
  | "draft" 
  | "submitted" 
  | "under_review" 
  | "revision_requested" 
  | "accepted" 
  | "published" 
  | "rejected";

export type DeclarationType = 
  | "original_author"
  | "permission_to_publish"
  | "translation_with_consent";

export interface SubmissionDeclaration {
  type: DeclarationType;
  agreedToPolicy: boolean;
  timestamp: string;
  ipAddress?: string; // Captured securely on the server
}

export interface Submission {
  id: string; // Submission UUID
  authorId?: string; // Null if guest (unless linked later)
  guestInfo?: {
    name: string;
    email: string;
    city: string;
    phone?: string;
  };
  
  // The actual structured content using the Universal Engine
  content: ContentDocument;
  
  status: SubmissionStatus;
  declaration: SubmissionDeclaration;
  
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  
  // Editorial working copy (kept strictly separate from original content)
  // This is where editors make changes before accepting. The original remains immutable.
  editorialWorkingCopy?: ContentDocument;
  assignedEditorId?: string;
}

export interface EditorialThreadMessage {
  id: string;
  submissionId: string;
  senderId: string; // Author or Editor
  senderRole: "contributor" | "editor";
  message: string;
  attachments?: string[];
  createdAt: string;
}
