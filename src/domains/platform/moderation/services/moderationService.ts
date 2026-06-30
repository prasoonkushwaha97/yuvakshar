import { CaseService } from "../../cases/services/caseService";
import { ModerationCase, ModeratorAction } from "../types/moderation";
import { EventBus } from "../../events/eventBus";

export class ModerationService extends CaseService {
  
  public async createReport(
    reporterId: string, 
    reportedUserId: string, 
    category: ModerationCase["reportCategory"], 
    description: string,
    relatedEntityId: string
  ): Promise<ModerationCase> {
    
    const modCase: ModerationCase = {
      id: crypto.randomUUID(),
      caseType: "Moderation",
      status: "New",
      priority: "Medium",
      title: `Report: ${category} on ${relatedEntityId}`,
      description,
      reporterId,
      reportedUserId,
      relatedEntityId,
      reportCategory: category,
      reportCount: 1,
      notes: [],
      attachments: [],
      evidence: [],
      timeline: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Use base class logic to emit CaseCreated
    await this.emitCaseEvent("CREATED", modCase, reporterId);
    
    // Also emit Moderation-specific event
    await EventBus.publish({
      id: crypto.randomUUID(),
      type: "ReportCreated",
      timestamp: new Date().toISOString(),
      actorId: reporterId,
      payload: {
        caseId: modCase.id,
        category
      }
    });

    return modCase;
  }

  public async executeAction(modCase: ModerationCase, action: ModeratorAction, actorId: string, noteStr?: string): Promise<ModerationCase> {
    modCase.finalDecision = action;
    
    // Add internal note if provided
    if (noteStr) {
      await this.addNote(modCase, noteStr, actorId);
    }
    
    // Resolve case based on action
    await this.updateStatus(modCase, "Resolved", actorId);

    // Map specific actions to Moderation domain events
    let eventType: any = null;
    if (action === "Hide Content") eventType = "ContentHidden";
    else if (action === "Restore Content") eventType = "ContentRestored";
    else if (action === "Warn User") eventType = "UserWarned";
    else if (action === "Suspend User") eventType = "UserSuspended";
    else if (action === "Escalate") eventType = "CaseEscalated";

    if (eventType) {
      await EventBus.publish({
        id: crypto.randomUUID(),
        type: eventType,
        timestamp: new Date().toISOString(),
        actorId,
        payload: {
          caseId: modCase.id,
          targetUserId: modCase.reportedUserId,
          targetContentId: modCase.relatedEntityId,
          action
        }
      });
    }

    return modCase;
  }

  /**
   * fallback data retrieval for UI building
   */
  public async getDashboardCases(): Promise<ModerationCase[]> {
    return [
      {
        id: "mod-1",
        caseType: "Moderation",
        status: "New",
        priority: "High",
        title: "Hate Speech in Comments",
        description: "User posted abusive language in the recent election article.",
        reporterId: "user-reader-1",
        reportedUserId: "user-spammer-2",
        relatedEntityId: "comment-99",
        reportCategory: "Hate Speech",
        reportCount: 3,
        notes: [],
        attachments: [],
        evidence: [{ id: "ev-1", type: "Text", url: "", description: "Copy of the text" }],
        timeline: [],
        sla: { dueDate: new Date(Date.now() + 86400000).toISOString(), isOverdue: false },
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: "mod-2",
        caseType: "Moderation",
        status: "In Progress",
        priority: "Critical",
        title: "Copyright Infringement",
        description: "Plagiarized content from another news portal.",
        reporterId: "user-author-4",
        assigneeId: "moderator-1",
        relatedEntityId: "article-88",
        reportCategory: "Copyright",
        reportCount: 1,
        notes: [
          { id: "note-1", authorId: "moderator-1", content: "Contacting the original publisher for verification.", createdAt: new Date().toISOString() }
        ],
        attachments: [],
        evidence: [{ id: "ev-2", type: "Link", url: "https://example.com/original-article" }],
        timeline: [],
        sla: { dueDate: new Date(Date.now() - 3600000).toISOString(), isOverdue: true },
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];
  }
}

export const globalModerationService = new ModerationService();
