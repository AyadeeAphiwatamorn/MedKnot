"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { type UserSession, DEFAULT_ADMIN } from "@/lib/auth";
import { NotificationPanel } from "@/components/dashboard/notifications/NotificationPanel";
import { NotificationService } from "@/lib/notifications/notification-service";
import { NotificationItem } from "@/lib/notifications/types";
import { FacilitySelector } from "@/components/dashboard/facility/FacilitySelector";
import { useSidebar } from "@/components/dashboard/SidebarContext";
import { Menu } from "lucide-react";

interface DashboardHeaderProps {
  user?: UserSession;
}

export default function DashboardHeader({ user = DEFAULT_ADMIN }: DashboardHeaderProps) {
  const { toggleMobile } = useSidebar();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const bellContainerRef = useRef<HTMLDivElement>(null);

  const refreshNotifications = useCallback(() => {
    const list = NotificationService.getNotifications();
    setNotifications(list);
    setUnreadCount(list.filter((n) => !n.read).length);
  }, []);

  // Initialize and subscribe to notification changes
  useEffect(() => {
    refreshNotifications();

    const handleNotificationsChanged = () => {
      refreshNotifications();
    };

    window.addEventListener("medknot:notifications-changed", handleNotificationsChanged);
    window.addEventListener("storage", handleNotificationsChanged);

    return () => {
      window.removeEventListener("medknot:notifications-changed", handleNotificationsChanged);
      window.removeEventListener("storage", handleNotificationsChanged);
    };
  }, [refreshNotifications]);

  // Click outside listener and Escape key dismissal
  useEffect(() => {
    if (!isNotificationOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (bellContainerRef.current && !bellContainerRef.current.contains(e.target as Node)) {
        setIsNotificationOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isNotificationOpen]);

  return (
    <header className="sticky top-0 z-30 h-16 w-full bg-[#F3F6F0]/90 backdrop-blur-xl border-b border-[#DDE6DA] shadow-[0_1px_8px_rgba(0,0,0,0.04)] flex items-center justify-between px-4 md:px-8 gap-2">
      {/* Left: Mobile Drawer Trigger + Functional Facility & Campus Selector */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          type="button"
          onClick={toggleMobile}
          aria-label="Open navigation menu"
          title="Open navigation menu"
          className="md:hidden p-2 rounded-xl text-[#424751] hover:bg-[#E2E8DE] hover:text-[#1F2B46] transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0055A4]"
        >
          <Menu className="w-5 h-5" />
        </button>
        <FacilitySelector />
      </div>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center gap-space-lg shrink-0">
        {/* Functional Notification Center Dropdown */}
        <div className="relative" ref={bellContainerRef}>
          <button
            onClick={() => setIsNotificationOpen((prev) => !prev)}
            className={`relative p-2.5 rounded-xl transition-all flex items-center justify-center cursor-pointer ${
              isNotificationOpen
                ? "bg-[#0055A4] text-white shadow-xs"
                : "text-[#424751] hover:bg-[#E2E8DE] hover:text-[#1F2B46]"
            }`}
            type="button"
            aria-label="Notifications"
            aria-expanded={isNotificationOpen}
            aria-haspopup="true"
          >
            <span className="material-symbols-outlined text-xl">
              notifications
            </span>

            {/* Unread Badge Count */}
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-[#BA1A1A] text-[10px] font-bold text-white shadow-xs ring-2 ring-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown Panel */}
          {isNotificationOpen && (
            <NotificationPanel
              notifications={notifications}
              onClose={() => setIsNotificationOpen(false)}
              onRefresh={refreshNotifications}
            />
          )}
        </div>

        <div className="flex items-center gap-space-md pl-space-md">
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-space-sm bg-white border border-[#D5DFD2] py-1 px-space-md rounded-full shadow-sm hover:bg-[#F3F6F0] transition-colors cursor-pointer"
            title="View My Profile"
          >
            <div className="w-8 h-8 rounded-full bg-white border border-[#D5DFD2] flex items-center justify-center p-0.5 shrink-0 shadow-xs">
              <Image
                src="/logo.png"
                alt="Profile"
                width={20}
                height={20}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col text-right mr-1 hidden sm:flex min-w-0">
              <span className="font-body-md text-body-md text-[#1F2B46] font-semibold leading-tight truncate">
                {user.name}
              </span>
              <span className="font-supporting text-supporting text-[#5A6372] truncate">
                {user.department}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
