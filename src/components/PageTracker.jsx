'use client';
import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function PageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prev = useRef(null);

  useEffect(() => {
    if (typeof window.gtag !== 'function') return;
    const current = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
    if (prev.current === current) return;
    prev.current = current;
    window.gtag('event', 'page_view', {
      page_path: current,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  return null;
}
