import { NotificationItem, NotificationCategory } from "./types";
import { INITIAL_NOTIFICATIONS } from "./mock-data";

const STORAGE_KEY_NOTIFICATIONS = "medknot_hospital_notifications_store";

function getStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore quota issues
  }
}

function notifySubscribers() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("medknot:notifications-changed"));
  }
}

export const NotificationService = {
  /**
   * Retrieves all notifications sorted by createdAt desc
   */
  getNotifications(): NotificationItem[] {
    const list = getStored<NotificationItem[]>(STORAGE_KEY_NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  /**
   * Counts total unread notifications
   */
  getUnreadCount(): number {
    const all = this.getNotifications();
    return all.filter((n) => !n.read).length;
  },

  /**
   * Marks a single notification as read
   */
  markAsRead(id: string): void {
    const all = this.getNotifications();
    const updated = all.map((item) => {
      if (item.id === id) {
        return { ...item, read: true };
      }
      return item;
    });
    setStored(STORAGE_KEY_NOTIFICATIONS, updated);
    notifySubscribers();
  },

  /**
   * Marks all notifications as read
   */
  markAllAsRead(): void {
    const all = this.getNotifications();
    const updated = all.map((item) => ({ ...item, read: true }));
    setStored(STORAGE_KEY_NOTIFICATIONS, updated);
    notifySubscribers();
  },

  /**
   * Dismisses / deletes a single notification
   */
  dismissNotification(id: string): void {
    const all = this.getNotifications();
    const updated = all.filter((item) => item.id !== id);
    setStored(STORAGE_KEY_NOTIFICATIONS, updated);
    notifySubscribers();
  },

  /**
   * Appends a new notification (supports synthetic runtime triggers or future WebSockets/SSE)
   */
  addNotification(item: Omit<NotificationItem, "id" | "createdAt">): NotificationItem {
    const all = this.getNotifications();
    const newId = `NOTIF-${String(all.length + 1).padStart(3, "0")}`;
    const newRecord: NotificationItem = {
      ...item,
      id: newId,
      createdAt: new Date().toISOString(),
    };
    all.unshift(newRecord);
    setStored(STORAGE_KEY_NOTIFICATIONS, all);
    notifySubscribers();
    return newRecord;
  },
};
