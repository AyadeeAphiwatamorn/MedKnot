"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  Users,
  FileText,
  CheckSquare,
  Check,
  CheckCheck,
  X,
  Bell,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { NotificationItem, NotificationCategory } from "@/lib/notifications/types";
import { NotificationService } from "@/lib/notifications/notification-service";

interface NotificationPanelProps {
  notifications: NotificationItem[];
  onClose: () => void;
  onRefresh: () => void;
}

export function NotificationPanel({
  notifications,
  onClose,
  onRefresh,
}: NotificationPanelProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (activeTab === "unread") {
      return notifications.filter((n) => !n.read);
    }
    return notifications;
  }, [notifications, activeTab]);

  const handleMarkAsRead = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    NotificationService.markAsRead(id);
    onRefresh();
  };

  const handleDismiss = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    NotificationService.dismissNotification(id);
    onRefresh();
  };

  const handleMarkAllAsRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    NotificationService.markAllAsRead();
    onRefresh();
  };

  const handleNotificationClick = (item: NotificationItem) => {
    if (!item.read) {
      NotificationService.markAsRead(item.id);
      onRefresh();
    }
    onClose();
    router.push(item.linkUrl);
  };

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case "appointments":
        return <Calendar className="w-4 h-4 text-[#0055A4]" />;
      case "queue":
        return <Clock className="w-4 h-4 text-[#B76E00]" />;
      case "patients":
        return <Users className="w-4 h-4 text-[#2D6A28]" />;
      case "records":
        return <FileText className="w-4 h-4 text-[#6B21A8]" />;
      case "tasks":
        return <CheckSquare className="w-4 h-4 text-[#0369A1]" />;
      default:
        return <Bell className="w-4 h-4 text-[#5A6372]" />;
    }
  };

  const getCategoryBadgeClass = (category: NotificationCategory) => {
    switch (category) {
      case "appointments":
        return "bg-[#E7F0FF] text-[#0055A4] border-[#C7DCFF]";
      case "queue":
        return "bg-[#FFF4E5] text-[#B76E00] border-[#FFE0B2]";
      case "patients":
        return "bg-[#EAF5E2] text-[#2D6A28] border-[#C5E4BA]";
      case "records":
        return "bg-[#F3E8FF] text-[#6B21A8] border-[#E9D5FF]";
      case "tasks":
        return "bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD]";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getCategoryLabel = (category: NotificationCategory) => {
    switch (category) {
      case "appointments":
        return "Appointments";
      case "queue":
        return "Queue";
      case "patients":
        return "Patients";
      case "records":
        return "Medical Records";
      case "tasks":
        return "Staff Tasks";
      default:
        return "System";
    }
  };

  return (
    <div
      className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-2rem)] sm:w-[420px] bg-white rounded-2xl border border-[#C5D2C0] shadow-[0_12px_36px_rgba(31,43,70,0.20)] z-50 overflow-hidden animate-in fade-in zoom-in-95"
      role="region"
      aria-label="Notification Center"
    >
      {/* Header */}
      <div className="p-4 border-b border-[#C5D2C0] bg-[#E6EDE2]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#1F2B46] tracking-tight">Notifications</h2>
            {unreadCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#0055A4] text-white">
                {unreadCount} New
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#D5E0D2] text-[#1F2B46] border border-[#C8D6C3]">
                All Caught Up
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#0055A4] hover:text-[#003b73] hover:underline cursor-pointer transition-colors"
                title="Mark all notifications as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#5A6372] hover:bg-[#D5E0D2] hover:text-[#1F2B46] transition-colors cursor-pointer"
              aria-label="Close notification panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-3 flex items-center gap-2 border-t border-[#C8D6C3] pt-2.5">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "all"
                ? "bg-[#0055A4] text-white shadow-2xs"
                : "text-[#5A6372] hover:bg-[#D5E0D2] hover:text-[#1F2B46]"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab("unread")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === "unread"
                ? "bg-[#0055A4] text-white shadow-2xs"
                : "text-[#5A6372] hover:bg-[#D5E0D2] hover:text-[#1F2B46]"
            }`}
          >
            <span>Unread</span>
            {unreadCount > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === "unread" ? "bg-white/20 text-white" : "bg-[#BA1A1A] text-white"
                }`}
              >
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[420px] overflow-y-auto divide-y divide-[#C8D6C3]">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-[#E3EBDD] border border-[#C8D6C3] flex items-center justify-center text-[#5A6372] mb-3">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#1F2B46]">No notifications found</h3>
            <p className="text-xs text-[#667085] mt-1 max-w-xs">
              {activeTab === "unread"
                ? "You have addressed all pending clinical and operational alerts."
                : "There are currently no notifications logged for this hospital portal."}
            </p>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => handleNotificationClick(item)}
              className={`p-3.5 transition-colors cursor-pointer group flex items-start gap-3 relative ${
                item.read ? "bg-white hover:bg-[#E6EDE2]" : "bg-[#E3EBDD] hover:bg-[#D5E0D2]"
              }`}
            >
              {/* Category Icon */}
              <div className="mt-0.5 w-8 h-8 rounded-xl bg-white border border-[#C8D6C3] flex items-center justify-center shrink-0 shadow-2xs">
                {getCategoryIcon(item.category)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className={`px-1.5 py-0.2 text-[10px] font-bold rounded-md border uppercase tracking-wider ${getCategoryBadgeClass(
                      item.category
                    )}`}
                  >
                    {getCategoryLabel(item.category)}
                  </span>
                  <span className="text-[11px] text-[#5A6372] font-medium">{item.timestamp}</span>
                </div>

                <h4
                  className={`text-xs leading-snug truncate ${
                    item.read ? "font-semibold text-[#1F2B46]" : "font-bold text-[#1F2B46]"
                  }`}
                >
                  {item.title}
                </h4>

                <p className="text-[11.5px] text-[#5A6372] leading-relaxed line-clamp-2 mt-0.5">
                  {item.description}
                </p>
              </div>

              {/* Unread Indicator & Actions */}
              <div className="absolute right-3 top-3.5 flex items-center gap-1">
                {!item.read ? (
                  <span
                    className="w-2.5 h-2.5 rounded-full bg-[#0055A4] ring-2 ring-white"
                    title="Unread"
                  />
                ) : (
                  <button
                    onClick={(e) => handleDismiss(e, item.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-[#667085] hover:text-[#BA1A1A] hover:bg-[#D5E0D2] rounded-md transition-all"
                    title="Dismiss notification"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#C5D2C0] bg-[#E6EDE2] flex items-center justify-between text-xs">
        <Link
          href="/dashboard/tasks"
          onClick={onClose}
          className="text-[#0055A4] font-semibold hover:underline flex items-center gap-1"
        >
          <span>View assigned staff tasks</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
        <span className="text-[11px] text-[#5A6372]">Facility live alerts</span>
      </div>
    </div>
  );
}
