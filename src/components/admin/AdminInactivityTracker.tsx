"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// 15 minutes in milliseconds = 15 * 60 * 1000 = 900,000 ms
const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;
const STORAGE_KEY = "admin_last_activity_timestamp";
const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export default function AdminInactivityTracker() {
  const router = useRouter();
  const lastUpdateRef = useRef<number>(Date.now());
  const lastRefreshRef = useRef<number>(Date.now());

  useEffect(() => {
    // 1. Check existing activity timestamp on initial mount
    const checkTimeout = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const now = Date.now();

        if (stored) {
          const lastActive = parseInt(stored, 10);
          if (!isNaN(lastActive) && now - lastActive >= INACTIVITY_TIMEOUT_MS) {
            // AFK timeout exceeded (inactive for 15+ minutes)
            await handleLogout("afk");
            return;
          }
        }

        // Initialize or renew current activity
        localStorage.setItem(STORAGE_KEY, now.toString());
        lastUpdateRef.current = now;
      } catch (err) {
        console.error("Inactivity check error:", err);
      }
    };

    const handleLogout = async (reason: "afk" | "expired") => {
      try {
        localStorage.removeItem(STORAGE_KEY);
        await fetch("/api/admin/logout", { method: "POST" });
      } catch (e) {
        console.error("Auto logout failed:", e);
      } finally {
        window.location.href = `/admin/login?reason=${reason}`;
      }
    };

    // 2. Activity listener (throttled)
    const onUserActivity = () => {
      const now = Date.now();

      // Throttle localStorage updates to at most once every 15 seconds
      if (now - lastUpdateRef.current >= 15 * 1000) {
        lastUpdateRef.current = now;
        try {
          localStorage.setItem(STORAGE_KEY, now.toString());
        } catch {}

        // If active for 15+ minutes since last cookie refresh, refresh session in background
        if (now - lastRefreshRef.current >= REFRESH_INTERVAL_MS) {
          lastRefreshRef.current = now;
          fetch("/api/admin/refresh-session", { method: "POST" }).catch(() => {});
        }
      }
    };

    // Check timeout right away
    checkTimeout();

    // Attach user activity listeners
    const activityEvents = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "wheel",
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, onUserActivity, { passive: true });
    });

    // Check every 10 seconds for idle expiration
    const intervalId = setInterval(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const now = Date.now();
        if (stored) {
          const lastActive = parseInt(stored, 10);
          if (!isNaN(lastActive) && now - lastActive >= INACTIVITY_TIMEOUT_MS) {
            handleLogout("afk");
          }
        }
      } catch {}
    }, 10 * 1000);

    // Also check when tab becomes active again
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          const now = Date.now();
          if (stored) {
            const lastActive = parseInt(stored, 10);
            if (!isNaN(lastActive) && now - lastActive >= INACTIVITY_TIMEOUT_MS) {
              handleLogout("afk");
            } else {
              // Update timestamp to now when user switches back to the tab
              localStorage.setItem(STORAGE_KEY, now.toString());
              lastUpdateRef.current = now;
            }
          }
        } catch {}
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      activityEvents.forEach((event) => {
        window.removeEventListener(event, onUserActivity);
      });
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [router]);

  return null;
}
