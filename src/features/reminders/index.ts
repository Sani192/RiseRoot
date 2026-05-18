import type { FeatureBoundary } from "@/types";

export type ReminderPermission =
  | "default"
  | "denied"
  | "granted"
  | "unsupported";

export interface ReminderNotificationOptions {
  body: string;
  tag?: string;
}

export interface ReminderResult {
  delivered: boolean;
  permission: ReminderPermission;
  reason?: string;
}

function getNotificationConstructor(): typeof Notification | null {
  return typeof window === "undefined" || !("Notification" in window)
    ? null
    : window.Notification;
}

export function getReminderPermission(): ReminderPermission {
  const notificationConstructor = getNotificationConstructor();

  return notificationConstructor?.permission ?? "unsupported";
}

export async function requestReminderPermission(): Promise<ReminderPermission> {
  const notificationConstructor = getNotificationConstructor();

  if (!notificationConstructor) {
    return "unsupported";
  }

  return notificationConstructor.requestPermission();
}

export async function sendReminderNotification(
  title: string,
  options: ReminderNotificationOptions,
): Promise<ReminderResult> {
  const notificationConstructor = getNotificationConstructor();

  if (!notificationConstructor) {
    return {
      delivered: false,
      permission: "unsupported",
      reason: "This browser does not support notifications.",
    };
  }

  const permission =
    notificationConstructor.permission === "default"
      ? await notificationConstructor.requestPermission()
      : notificationConstructor.permission;

  if (permission !== "granted") {
    return {
      delivered: false,
      permission,
      reason: "Notifications are not permitted.",
    };
  }

  new notificationConstructor(title, options);

  return {
    delivered: true,
    permission,
  };
}

export const remindersFeature: FeatureBoundary = {
  name: "Reminders",
  phase: "phase-1",
  status: "ready",
};
