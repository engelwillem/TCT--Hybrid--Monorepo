"use client";

import Link from "next/link";
import type { LinkProps } from "next/link";
import type { MouseEventHandler, ReactNode } from "react";
import { trackFunnelEvent } from "@/lib/funnel-analytics";

type TrackedLinkProps = LinkProps & {
  className?: string;
  children: ReactNode;
  eventName:
    | "landing_cta_click"
    | "signup_start"
    | "signup_success"
    | "login_success"
    | "renungan_start"
    | "renungan_complete"
    | "continue_to_versehub"
    | "reflection_bookmark";
  surface?: string;
  meta?: Record<string, unknown>;
};

export function TrackedLink({
  eventName,
  surface,
  meta,
  onClick,
  children,
  ...props
}: TrackedLinkProps & {
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        onClick?.(event);
        void trackFunnelEvent(eventName, { surface, meta });
      }}
    >
      {children}
    </Link>
  );
}
