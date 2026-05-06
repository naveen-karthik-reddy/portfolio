import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export default function usePageTracking() {
  const location = useLocation();
  const prev = useRef(null);

  useEffect(() => {
    if (typeof window.gtag !== "function") return;
    const current = location.pathname + location.search;
    if (prev.current === current) return;
    prev.current = current;

    window.gtag("event", "page_view", {
      page_path: current,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location]);
}
