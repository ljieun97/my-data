"use client";

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import type { MouseEvent } from "react";

const MOBILE_DETAIL_MEDIA_QUERY = "(max-width: 639px)";

export function shouldUsePageDetailNavigation() {
  return typeof window !== "undefined" && window.matchMedia(MOBILE_DETAIL_MEDIA_QUERY).matches;
}

export function navigateToDetail(href: string, router?: AppRouterInstance) {
  if (typeof window === "undefined") {
    router?.push(href);
    return;
  }

  if (shouldUsePageDetailNavigation()) {
    window.location.assign(href);
    return;
  }

  router?.push(href);
}

export function handleDetailLinkClick(event: MouseEvent<HTMLElement>, href?: string | null) {
  if (!href) {
    event.preventDefault();
    return;
  }

  if (!shouldUsePageDetailNavigation()) {
    return;
  }

  event.preventDefault();
  window.location.assign(href);
}
