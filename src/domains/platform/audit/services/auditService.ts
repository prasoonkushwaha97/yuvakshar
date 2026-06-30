import { EventBus } from "../../events/eventBus";
import { AuditRecord } from "../types/audit";

import { getAuditRepository } from "@/lib/repositoryService";
import { FEATURES } from "@/config/features";

/**
 * Audit Service
 * 
 * Responsible for recording all platform activity. It listens to the global EventBus 
 * to automatically log domain events without tightly coupling modules together.
 */
export class AuditService {
  
  constructor() {
    this.initializeSubscriptions();
  }

  private initializeSubscriptions() {
    // Automatically log when an article is published
    EventBus.subscribe("ArticlePublished", async (event) => {
      const payload = event.payload as { articleId: string; title: string };
      await this.logEvent({
        id: crypto.randomUUID(),
        timestamp: event.timestamp,
        actorId: event.actorId || 'system',
        actorRole: 'Editor',
        action: 'PUBLISH',
        module: 'articles',
        entityId: payload.articleId,
        description: `Published article: ${payload.title}`,
        severity: 'info'
      });
    });

    // Automatically log when media is uploaded
    EventBus.subscribe("MediaUploaded", async (event) => {
      const payload = event.payload as { assetId: string; filename: string };
      await this.logEvent({
        id: crypto.randomUUID(),
        timestamp: event.timestamp,
        actorId: event.actorId || 'system',
        actorRole: 'User',
        action: 'CREATE',
        module: 'media',
        entityId: payload.assetId,
        description: `Uploaded media: ${payload.filename}`,
        severity: 'info'
      });
    });
    
    // Subscribe to Security/System alerts
    EventBus.subscribe("SystemAlert", async (event) => {
      const payload = event.payload as { message: string; severity?: "info" | "warning" | "critical" };
      await this.logEvent({
        id: crypto.randomUUID(),
        timestamp: event.timestamp,
        actorId: 'system',
        actorRole: 'system',
        action: 'UPDATE',
        module: 'system',
        description: payload.message,
        severity: payload.severity || 'warning'
      });
    });
  }

  /**
   * Directly log an audit event.
   */
  public async logEvent(record: AuditRecord): Promise<void> {
    if (FEATURES.USE_SUPABASE_PLATFORM) {
      const repo = getAuditRepository();
      await repo.appendLog({
        event_type: "Audit",
        entity_type: record.module,
        entity_id: record.entityId || "N/A",
        actor_id: record.actorId === "system" ? undefined : record.actorId,
        actor_name: record.actorRole,
        action: record.action,
        timestamp: record.timestamp,
        metadata: {
          description: record.description,
          severity: record.severity,
          previousValue: record.previousValue,
          newValue: record.newValue
        },
        ip_address: record.ipAddress,
        user_agent: record.userAgent
      });
    } else {
      console.log(`[AUDIT] ${record.action} on ${record.module}: ${record.description}`);
    }
  }

  /**
   * Retrieve audit logs
   */
  public async getLogs(_filters?: { module?: string, actorId?: string, action?: string }): Promise<AuditRecord[]> {
    if (FEATURES.USE_SUPABASE_PLATFORM) {
      const repo = getAuditRepository();
      const logs = await repo.getLogs(100);
      return logs.map(log => ({
        id: log.id,
        timestamp: log.timestamp,
        actorId: log.actor_id || "system",
        actorRole: log.actor_name || "Unknown",
        action: log.action as any,
        module: log.entity_type,
        entityId: log.entity_id,
        description: log.metadata.description,
        severity: log.metadata.severity,
        ipAddress: log.ip_address,
        userAgent: log.user_agent,
        previousValue: log.metadata.previousValue,
        newValue: log.metadata.newValue
      }));
    }

    return [];
  }
}

// Export singleton instance so it starts listening immediately when imported in the server/app initialization
export const globalAuditService = new AuditService();
