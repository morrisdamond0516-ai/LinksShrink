import { useEffect, useRef } from "react";
import { apiRequest } from "@/lib/queryClient";

function getFunnelSessionId(): string {
  let sid = sessionStorage.getItem("funnel_session_id");
  if (!sid) {
    sid = Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem("funnel_session_id", sid);
  }
  return sid;
}

export function trackFunnelEvent(eventType: string, page?: string, metadata?: any) {
  const sessionId = getFunnelSessionId();
  const body = JSON.stringify({ eventType, page, metadata, sessionId });
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    const blob = new Blob([body], { type: "application/json" });
    navigator.sendBeacon("/api/funnel/track", blob);
  } else {
    apiRequest("POST", "/api/funnel/track", { eventType, page, metadata, sessionId }).catch(() => {});
  }
}

export function usePageView(page: string) {
  const tracked = useRef(false);
  useEffect(() => {
    if (!tracked.current) {
      tracked.current = true;
      trackFunnelEvent("page_view", page);
    }
  }, [page]);
}
