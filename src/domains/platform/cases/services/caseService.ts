import { BaseCase, CaseStatus, CaseNote } from "../types/case";
import { EventBus } from "../../events/eventBus";

/**
 * Base Case Service
 * 
 * Provides common operational functions for all Case types. 
 * This should be extended by domain-specific services like ModerationService.
 */
export class CaseService {
  
  /**
   * Helper to trigger a base CaseEvent which will flow through the EventBus
   * and automatically get logged by the AuditService.
   */
  protected async emitCaseEvent(action: string, caseEntity: BaseCase, actorId: string, details?: Record<string, any>) {
    
    // Add to internal case timeline
    caseEntity.timeline.push({
      id: crypto.randomUUID(),
      action,
      actorId,
      timestamp: new Date().toISOString(),
      details
    });

    caseEntity.updatedAt = new Date().toISOString();

    // Map Case action to a specific DomainEvent for the global EventBus
    let domainEventType: any = "CaseUpdated";
    if (action === "CREATED") domainEventType = "CaseCreated";
    else if (action === "ASSIGNED") domainEventType = "CaseAssigned";
    else if (action === "RESOLVED") domainEventType = "CaseResolved";
    else if (action === "CLOSED") domainEventType = "CaseClosed";
    else if (action === "ARCHIVED") domainEventType = "CaseArchived";

    await EventBus.publish({
      id: crypto.randomUUID(),
      type: domainEventType,
      timestamp: new Date().toISOString(),
      actorId: actorId,
      payload: {
        caseId: caseEntity.id,
        caseType: caseEntity.caseType,
        action,
        details
      }
    });
  }

  public async updateStatus(caseEntity: BaseCase, newStatus: CaseStatus, actorId: string): Promise<BaseCase> {
    const oldStatus = caseEntity.status;
    caseEntity.status = newStatus;
    
    if (newStatus === "Closed" || newStatus === "Archived") {
      caseEntity.closedAt = new Date().toISOString();
    }

    await this.emitCaseEvent(newStatus === "Closed" ? "CLOSED" : (newStatus === "Resolved" ? "RESOLVED" : "STATUS_CHANGED"), caseEntity, actorId, { oldStatus, newStatus });
    return caseEntity;
  }

  public async assignCase(caseEntity: BaseCase, assigneeId: string, actorId: string): Promise<BaseCase> {
    caseEntity.assigneeId = assigneeId;
    if (caseEntity.status === "New") {
      caseEntity.status = "Assigned";
    }
    await this.emitCaseEvent("ASSIGNED", caseEntity, actorId, { assigneeId });
    return caseEntity;
  }

  public async addNote(caseEntity: BaseCase, content: string, actorId: string): Promise<BaseCase> {
    const note: CaseNote = {
      id: crypto.randomUUID(),
      authorId: actorId,
      content,
      createdAt: new Date().toISOString()
    };
    caseEntity.notes.push(note);
    await this.emitCaseEvent("NOTE_ADDED", caseEntity, actorId);
    return caseEntity;
  }
}
