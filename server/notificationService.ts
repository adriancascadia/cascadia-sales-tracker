/**
 * Notification Service
 * Handles SMS and push notifications for route alerts
 */

import { notifyOwner } from "./_core/notification";

export interface NotificationPayload {
  type: "arrival" | "deviation" | "completion" | "alert";
  title: string;
  message: string;
  repId: number;
  repName: string;
  customerId?: number;
  customerName?: string;
  routeId?: number;
  routeName?: string;
  severity?: "info" | "warning" | "critical";
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationPreferences {
  userId: number;
  smsEnabled: boolean;
  pushEnabled: boolean;
  emailEnabled: boolean;
  phoneNumber?: string;
  notificationTypes: {
    arrivals: boolean;
    deviations: boolean;
    completions: boolean;
    alerts: boolean;
  };
}

/**
 * Send notification to manager
 */
export async function sendNotification(
  payload: NotificationPayload
): Promise<boolean> {
  try {
    // Send push notification via Manus built-in notification API
    const notificationSent = await notifyOwner({
      title: payload.title,
      content: payload.message,
    });

    if (!notificationSent) {
      console.warn("[Notification] Failed to send notification:", payload);
      return false;
    }

    // Log notification for analytics
    console.log("[Notification] Sent:", {
      type: payload.type,
      rep: payload.repName,
      customer: payload.customerName,
      timestamp: new Date().toISOString(),
    });

    return true;
  } catch (error) {
    console.error("[Notification] Error sending notification:", error);
    return false;
  }
}

/**
 * Send arrival notification
 */
export async function sendArrivalNotification(
  repId: number,
  repName: string,
  customerId: number,
  customerName: string,
  routeId: number,
  routeName: string
): Promise<boolean> {
  return sendNotification({
    type: "arrival",
    title: `${repName} Arrived at ${customerName}`,
    message: `Rep ${repName} has arrived at ${customerName} on route ${routeName}. Time: ${new Date().toLocaleTimeString()}`,
    repId,
    repName,
    customerId,
    customerName,
    routeId,
    routeName,
    severity: "info",
    actionUrl: `/routes/${routeId}`,
  });
}

/**
 * Send deviation notification
 */
export async function sendDeviationNotification(
  repId: number,
  repName: string,
  routeId: number,
  routeName: string,
  deviationDistance: number
): Promise<boolean> {
  return sendNotification({
    type: "deviation",
    title: `⚠️ Route Deviation - ${repName}`,
    message: `Rep ${repName} has deviated ${Math.round(deviationDistance)}m from planned route on ${routeName}. Review and reassign if needed.`,
    repId,
    repName,
    routeId,
    routeName,
    severity: deviationDistance > 1000 ? "critical" : "warning",
    actionUrl: `/routes/${routeId}`,
    metadata: { deviationDistance },
  });
}

/**
 * Send route completion notification
 */
export async function sendRouteCompletionNotification(
  repId: number,
  repName: string,
  routeId: number,
  routeName: string,
  stopsCompleted: number,
  totalStops: number,
  efficiencyScore: number
): Promise<boolean> {
  return sendNotification({
    type: "completion",
    title: `✓ Route Completed - ${repName}`,
    message: `${repName} completed ${stopsCompleted}/${totalStops} stops on ${routeName}. Efficiency Score: ${efficiencyScore}/100`,
    repId,
    repName,
    routeId,
    routeName,
    severity: "info",
    actionUrl: `/routes/${routeId}`,
    metadata: { stopsCompleted, totalStops, efficiencyScore },
  });
}

/**
 * Send critical alert notification
 */
export async function sendCriticalAlertNotification(
  title: string,
  message: string,
  repId: number,
  repName: string,
  routeId?: number
): Promise<boolean> {
  return sendNotification({
    type: "alert",
    title,
    message,
    repId,
    repName,
    routeId,
    routeName: "",
    severity: "critical",
    actionUrl: routeId ? `/routes/${routeId}` : undefined,
  });
}

/**
 * Format notification for SMS (character limit: 160)
 */
export function formatSmsNotification(payload: NotificationPayload): string {
  const prefix = payload.severity === "critical" ? "🚨 " : "ℹ️ ";
  const message = `${prefix}${payload.title}: ${payload.message}`;
  return message.substring(0, 160);
}

/**
 * Format notification for push
 */
export function formatPushNotification(payload: NotificationPayload): {
  title: string;
  body: string;
  icon: string;
  badge: string;
  tag: string;
} {
  const iconMap: Record<string, string> = {
    arrival: "✓",
    deviation: "⚠️",
    completion: "✓",
    alert: "🚨",
  };

  return {
    title: payload.title,
    body: payload.message,
    icon: iconMap[payload.type] || "ℹ️",
    badge: payload.severity === "critical" ? "critical" : "normal",
    tag: `${payload.type}-${payload.repId}-${Date.now()}`,
  };
}

/**
 * Get notification preferences for user
 */
export async function getNotificationPreferences(
  userId: number
): Promise<NotificationPreferences> {
  // TODO: Fetch from database
  return {
    userId,
    smsEnabled: true,
    pushEnabled: true,
    emailEnabled: true,
    phoneNumber: "+1234567890",
    notificationTypes: {
      arrivals: true,
      deviations: true,
      completions: true,
      alerts: true,
    },
  };
}

/**
 * Update notification preferences
 */
export async function updateNotificationPreferences(
  userId: number,
  preferences: Partial<NotificationPreferences>
): Promise<boolean> {
  // TODO: Save to database
  console.log("[Notification] Updated preferences for user:", userId, preferences);
  return true;
}

/**
 * Check if notification should be sent based on preferences
 */
export async function shouldSendNotification(
  userId: number,
  notificationType: "arrivals" | "deviations" | "completions" | "alerts"
): Promise<boolean> {
  const prefs = await getNotificationPreferences(userId);
  return prefs.notificationTypes[notificationType];
}
