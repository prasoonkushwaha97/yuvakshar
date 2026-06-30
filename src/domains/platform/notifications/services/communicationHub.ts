import { EventBus, DomainEvent } from "../../events/eventBus";
import { IDeliveryChannel, NotificationPayload, NotificationPreference } from "../types/notifications";
import { InAppChannel } from "./channels/inAppChannel";

/**
 * Notification Policy Engine
 * Evaluates whether an event should trigger a notification for a user based on preferences.
 */
class NotificationPolicyEngine {
  public async shouldNotify(event: DomainEvent, preference: NotificationPreference): Promise<boolean> {
    
    // Map event types to categories
    let category: keyof NotificationPreference['categoryPreferences'] = "System";
    if (["ArticlePublished", "SubmissionAccepted"].includes(event.type)) category = "Editorial";
    if (["CaseCreated", "ReportCreated", "CaseAssigned"].includes(event.type)) category = "Community";
    if (["SystemAlert"].includes(event.type)) category = "System";

    // 1. Check Category Preferences
    if (preference.categoryPreferences[category] === false) {
      return false; // User disabled this category
    }

    // 2. Check Digest Mode
    if (preference.digestMode !== "None") {
      // In a real system, we'd route this to a Digest Queue instead of sending instantly
      return false;
    }

    // 3. Check Quiet Hours (Simplified)
    if (preference.quietHoursStart && preference.quietHoursEnd) {
      const nowHour = new Date().getHours();
      // Logic for quiet hours would go here
    }

    return true;
  }
}

/**
 * Communication Hub Service
 * The orchestrator that listens to the EventBus, applies policies, routes to channels, 
 * and handles the Delivery Queue.
 */
export class CommunicationHubService {
  private channels: IDeliveryChannel[] = [];
  private policyEngine = new NotificationPolicyEngine();

  constructor() {
    // Register available channels
    this.registerChannel(new InAppChannel());
    
    this.initializeSubscriptions();
  }

  public registerChannel(channel: IDeliveryChannel) {
    this.channels.push(channel);
  }

  private initializeSubscriptions() {
    // Listen to ALL events dynamically or specific ones
    const eventsToListen: any[] = ["ArticlePublished", "CaseAssigned", "SystemAlert", "UserWarned"];
    
    eventsToListen.forEach(eventType => {
      EventBus.subscribe(eventType, async (event) => {
        await this.processEvent(event);
      });
    });
  }

  /**
   * Process an incoming domain event
   */
  private async processEvent(event: DomainEvent) {
    // 1. Determine recipients (fallbacked: usually requires DB lookup based on event payload)
    const recipientId = "user-123"; 

    // 2. Fetch User Preferences (fallbacked)
    const prefs: NotificationPreference = {
      userId: recipientId,
      enabledChannels: ["InApp"],
      digestMode: "None",
      categoryPreferences: {
        Editorial: true,
        Community: true,
        Security: true,
        System: true,
        Marketing: false,
        AI: true
      }
    };

    // 3. Evaluate Policy
    const shouldNotify = await this.policyEngine.shouldNotify(event, prefs);
    if (!shouldNotify) return;

    // 4. Render Template (Simplified)
    const payload: NotificationPayload = {
      id: crypto.randomUUID(),
      type: event.type,
      priority: event.type === "SystemAlert" ? "Urgent" : "Normal",
      category: "System",
      title: `New Alert: ${event.type}`,
      message: `An event of type ${event.type} occurred.`,
      recipientId,
      triggerEventId: event.id,
      deliveryChannels: prefs.enabledChannels,
      status: "Pending",
      isRead: false,
      createdAt: new Date().toISOString()
    };

    // 5. Enqueue for Delivery
    await this.dispatchToQueue(payload);
  }

  /**
   * Simulates an Async Delivery Queue
   */
  private async dispatchToQueue(notification: NotificationPayload) {
    // Find active channels for this notification
    const activeChannels = this.channels.filter(ch => 
      notification.deliveryChannels.includes(ch.name) && ch.isAvailable()
    );

    let successCount = 0;
    
    for (const channel of activeChannels) {
      const delivered = await channel.send(notification);
      if (delivered) successCount++;
    }

    if (successCount > 0) {
      notification.status = "Delivered";
      notification.deliveredAt = new Date().toISOString();
      
      // Emit audit event
      await EventBus.publish({
        id: crypto.randomUUID(),
        type: "NotificationSent",
        timestamp: new Date().toISOString(),
        actorId: 'system',
        payload: { notificationId: notification.id }
      });
    } else {
      notification.status = "Failed";
      // Handle retry logic via Dead Letter Queue here
    }
  }

  /**
   * UI helper to get fallbacked notifications
   */
  public async getInbox(userId: string): Promise<NotificationPayload[]> {
    return [
      {
        id: "notif-1",
        type: "ArticlePublished",
        priority: "Normal",
        category: "Editorial",
        title: "Article Published Successfully",
        message: "Your article 'Election Results 2026' is now live.",
        recipientId: userId,
        deliveryChannels: ["InApp"],
        status: "Delivered",
        isRead: false,
        createdAt: new Date().toISOString()
      },
      {
        id: "notif-2",
        type: "SystemAlert",
        priority: "Urgent",
        category: "System",
        title: "Database Backup Completed",
        message: "Automated backup finished at 3:00 AM.",
        recipientId: userId,
        deliveryChannels: ["InApp", "Email"],
        status: "Delivered",
        isRead: true,
        createdAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];
  }
}

export const globalCommunicationHub = new CommunicationHubService();
