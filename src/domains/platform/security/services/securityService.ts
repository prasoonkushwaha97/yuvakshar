import { EventBus } from "../../events/eventBus";
import { ActiveSession, APIKey, SecurityAlert } from "../types/security";
import { globalSecurityPolicyEngine } from "./securityPolicyEngine";

import { getSecurityRepository } from "@/lib/repositoryService";
import { FEATURES } from "@/config/features";

/**
 * Security Service
 * Handles identity lifecycle, session management, and API keys.
 * Correlates events and publishes findings to the EventBus.
 */
export class SecurityService {
  
  constructor() {
    this.initializeSubscriptions();
  }

  private initializeSubscriptions() {
    // Listen for login events to track failed logins and correlate them
    EventBus.subscribe("FailedLogin", async (event) => {
      // In production, fetch recent failed logins for this user/IP from DB
      const fallbackHistory = [event, event, event]; // Simulate 3 failures
      
      const riskLevel = globalSecurityPolicyEngine.calculateRiskLevel(fallbackHistory);
      
      if (riskLevel === "High" || riskLevel === "Critical") {
        await this.createSecurityAlert({
          title: "Multiple Failed Logins",
          description: "Detected multiple failed login attempts from the same IP.",
          riskLevel,
          triggerEvents: fallbackHistory.map(e => e.id)
        });
      }
    });
  }

  /**
   * Generates a security alert (Incident) and publishes it.
   */
  public async createSecurityAlert(data: Partial<SecurityAlert>) {
    const alert: SecurityAlert = {
      id: `sec-alert-${Date.now()}`,
      title: data.title || "Security Incident",
      description: data.description || "",
      riskLevel: data.riskLevel || "Medium",
      triggerEvents: data.triggerEvents || [],
      status: "Open",
      createdAt: new Date().toISOString()
    };

    if (FEATURES.USE_SUPABASE_PLATFORM) {
      const repo = getSecurityRepository();
      await repo.appendEvent({
        event_type: "SecurityAlert",
        severity: alert.riskLevel as "Low" | "Medium" | "High" | "Critical",
        metadata: {
          title: alert.title,
          description: alert.description,
          triggerEvents: alert.triggerEvents,
          status: alert.status
        }
      });
    }

    // Publish event
    await EventBus.publish({
      id: crypto.randomUUID(),
      type: "SecurityAlertCreated",
      timestamp: new Date().toISOString(),
      actorId: 'system',
      payload: { alertId: alert.id, riskLevel: alert.riskLevel }
    });

    return alert;
  }

  /**
   * Revoke a specific session
   */
  public async revokeSession(sessionId: string, adminId: string) {
    // 1. Update session status in DB to "Revoked"
    
    // 2. Publish event
    await EventBus.publish({
      id: crypto.randomUUID(),
      type: "SessionRevoked",
      timestamp: new Date().toISOString(),
      actorId: adminId,
      payload: { sessionId }
    });
  }

  /**
   * fallback data for the UI
   */
  public async getActiveSessions(): Promise<ActiveSession[]> {
    return [
      {
        id: "sess-1",
        userId: "admin-1",
        device: "MacBook Pro",
        browser: "Chrome",
        os: "macOS",
        ipAddress: "192.168.1.1",
        country: "India",
        loginTime: new Date(Date.now() - 3600000).toISOString(),
        lastActivity: new Date().toISOString(),
        status: "Active"
      },
      {
        id: "sess-2",
        userId: "admin-1",
        device: "iPhone 14",
        browser: "Safari",
        os: "iOS",
        ipAddress: "117.99.1.5",
        country: "India",
        loginTime: new Date(Date.now() - 86400000).toISOString(),
        lastActivity: new Date(Date.now() - 4000000).toISOString(),
        status: "Active"
      }
    ];
  }

  public async getAPIKeys(): Promise<APIKey[]> {
    if (FEATURES.USE_SUPABASE_PLATFORM) {
      const repo = getSecurityRepository();
      const keys = await repo.getApiKeys();
      return keys.map(k => ({
        id: k.id,
        name: k.name,
        tokenPrefix: k.key_hash.substring(0, 8) + "...",
        type: "Service",
        ownerId: k.created_by,
        isServiceAccount: true,
        createdAt: k.created_at,
        lastUsedAt: k.last_used_at,
        status: k.is_active ? "Active" : "Revoked"
      }));
    }

    return [
      {
        id: "key-1",
        name: "Mobile App Prod",
        tokenPrefix: "yuv_pk_aB3...",
        type: "Service",
        ownerId: "system",
        isServiceAccount: true,
        createdAt: new Date(Date.now() - 2592000000).toISOString(),
        lastUsedAt: new Date().toISOString(),
        status: "Active"
      }
    ];
  }
}

export const globalSecurityService = new SecurityService();
