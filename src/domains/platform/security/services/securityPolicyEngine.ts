import { ActiveSession, SecurityRiskLevel } from "../types/security";

export interface AccessContext {
  userId: string;
  action: string;
  resource: string;
  session?: ActiveSession;
  ipAddress?: string;
}

/**
 * Security Policy Engine
 * Evaluates authorization rules, session validity, and calculates risk levels.
 */
export class SecurityPolicyEngine {
  
  /**
   * Evaluate if a user is permitted to perform an action on a resource.
   */
  public async evaluateAccess(context: AccessContext): Promise<boolean> {
    // 1. Validate Session
    if (context.session && context.session.status !== "Active") {
      return false; // Session is revoked or expired
    }

    // 2. Validate Risk Level constraints
    // e.g., if IP is blacklisted or user is locked out, deny access.

    // 3. Evaluate RBAC
    // Normally we'd fetch the user's role and check permissions against the action
    // For now, fallback a basic check
    if (context.action.startsWith("admin:") && context.userId.startsWith("guest-")) {
      return false;
    }

    return true;
  }

  /**
   * Correlate events to determine risk.
   * e.g., "3 failed logins in 5 minutes" -> High Risk
   */
  public calculateRiskLevel(eventHistory: any[]): SecurityRiskLevel {
    const failedLogins = eventHistory.filter(e => e.type === "FailedLogin").length;
    
    if (failedLogins >= 5) return "Critical";
    if (failedLogins >= 3) return "High";
    if (eventHistory.some(e => e.type === "NewDeviceLogin")) return "Medium";
    
    return "Low";
  }
}

export const globalSecurityPolicyEngine = new SecurityPolicyEngine();
