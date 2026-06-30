import { IDeliveryChannel, NotificationPayload } from "../../types/notifications";

/**
 * Standard In-App Delivery Channel
 */
export class InAppChannel implements IDeliveryChannel {
  name = "InApp";

  public isAvailable(): boolean {
    return true; // Always available
  }

  public async send(notification: NotificationPayload): Promise<boolean> {
    try {
      // In production, this would save to the database's `in_app_notifications` table
      // which would instantly sync to the user's client via Supabase Realtime/WebSockets
      
      console.log(`[InAppChannel] Delivered to ${notification.recipientId}: ${notification.title}`);
      
      return true;
    } catch (error) {
      console.error("[InAppChannel] Failed to deliver:", error);
      return false;
    }
  }
}
