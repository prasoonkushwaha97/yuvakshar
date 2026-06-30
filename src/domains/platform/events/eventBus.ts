export type DomainEventType = 
  | "ArticlePublished"
  | "SubmissionAccepted"
  | "HomepagePublished"
  | "MediaUploaded"
  | "UserRoleChanged"
  | "UserVerified"
  | "CommentReported"
  | "SystemAlert"
  | "CaseCreated"
  | "CaseAssigned"
  | "CaseUpdated"
  | "CaseResolved"
  | "CaseClosed"
  | "CaseArchived"
  | "ReportCreated"
  | "CaseEscalated"
  | "ContentHidden"
  | "ContentRestored"
  | "UserWarned"
  | "UserSuspended"
  | "NotificationCreated"
  | "NotificationSent"
  | "NotificationOpened"
  | "NotificationFailed"
  | "NotificationArchived"
  | "UserLoggedIn"
  | "UserLoggedOut"
  | "FailedLogin"
  | "PasswordChanged"
  | "RoleChanged"
  | "PermissionUpdated"
  | "SessionRevoked"
  | "APIKeyCreated"
  | "APIKeyRevoked"
  | "SecurityAlertCreated";

export interface DomainEvent<T = any> {
  id: string;
  type: DomainEventType;
  timestamp: string;
  actorId?: string; // Who triggered the event
  payload: T;
}

type EventCallback<T = any> = (event: DomainEvent<T>) => void | Promise<void>;

/**
 * Global Event Bus
 * 
 * Central nervous system of the platform. Modules emit events here without needing 
 * to know who is listening. Other modules (e.g., Audit, Analytics, Notifications) 
 * subscribe to these events.
 */
class EventBusService {
  private subscribers: Map<DomainEventType, EventCallback[]> = new Map();

  /**
   * Subscribe to a specific domain event.
   */
  public subscribe<T>(eventType: DomainEventType, callback: EventCallback<T>): () => void {
    const callbacks = this.subscribers.get(eventType) || [];
    callbacks.push(callback);
    this.subscribers.set(eventType, callbacks);

    // Return an unsubscribe function
    return () => {
      const current = this.subscribers.get(eventType) || [];
      this.subscribers.set(eventType, current.filter(cb => cb !== callback));
    };
  }

  /**
   * Publish a domain event to all subscribers.
   */
  public async publish<T>(event: DomainEvent<T>): Promise<void> {
    const callbacks = this.subscribers.get(event.type) || [];
    
    // Execute all callbacks asynchronously
    const promises = callbacks.map(cb => {
      try {
        return cb(event);
      } catch (error) {
        console.error(`Error processing event ${event.type}:`, error);
        return Promise.resolve();
      }
    });

    await Promise.all(promises);
  }
}

// Export a singleton instance
export const EventBus = new EventBusService();
