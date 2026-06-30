export type NotificationPriority = "Low" | "Normal" | "Urgent";
export type NotificationCategory = "Editorial" | "Community" | "Security" | "System" | "Marketing" | "AI";
export type NotificationStatus = "Pending" | "Sent" | "Delivered" | "Failed";

export interface NotificationPayload {
  id: string;
  type: string; // e.g., 'ArticlePublished'
  priority: NotificationPriority;
  category: NotificationCategory;
  
  title: string;
  message: string;
  
  recipientId: string;
  triggerEventId?: string;
  
  deliveryChannels: string[]; // ['InApp', 'Email']
  status: NotificationStatus;
  isRead: boolean;
  
  createdAt: string;
  deliveredAt?: string;
}

export interface NotificationPreference {
  userId: string;
  enabledChannels: string[]; // ['InApp', 'Email']
  digestMode: "None" | "Daily" | "Weekly";
  quietHoursStart?: string; // '22:00'
  quietHoursEnd?: string; // '08:00'
  categoryPreferences: Record<NotificationCategory, boolean>;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  category: NotificationCategory;
  subjectTemplate: string;
  bodyTemplate: string;
  version: number;
  authorId: string;
  updatedAt: string;
}

/**
 * Universal interface for all delivery channels (InApp, Email, SMS, Slack, Discord)
 */
export interface IDeliveryChannel {
  name: string;
  isAvailable(): boolean;
  send(notification: NotificationPayload): Promise<boolean>;
}
