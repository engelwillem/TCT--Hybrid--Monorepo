'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Bell, Inbox } from 'lucide-react';
import ChatPopover from '@/components/core/ChatPopover';
import { buildAppAuthHeaders, fetchWithAppAuth } from '@/lib/app-auth-fetch';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { useMotionConfig } from '../hooks/useMotionConfig';
import { useCurrentUserAvatarStyle } from '@/lib/avatar-presentation';
import { resolveApiOrigin } from '@/lib/origin';

interface TodayHeaderProps {
  greeting: string;
  dateLabel: string;
  memberName?: string | null;
  memberId?: string | null;
  avatarUrl?: string | null;
  isAuthenticated?: boolean;
  isAuthRestoring?: boolean;
}

function extractKnownAvatarPath(pathname: string): string | null {
  if (!pathname) return null;
  const normalizedPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  if (normalizedPath.startsWith('/storage/') || normalizedPath.startsWith('/api/v1/avatar/')) {
    return normalizedPath;
  }

  const storageMarker = normalizedPath.indexOf('/storage/');
  if (storageMarker >= 0) {
    return normalizedPath.slice(storageMarker);
  }

  const avatarMarker = normalizedPath.indexOf('/api/v1/avatar/');
  if (avatarMarker >= 0) {
    return normalizedPath.slice(avatarMarker);
  }

  return null;
}

function normalizeHeaderAvatarUrl(value?: string | null): string | null {
  const raw = String(value || '').trim();
  if (!raw) return null;
  if (raw.startsWith('blob:') || raw.startsWith('data:image/')) return raw;

  const apiOrigin = resolveApiOrigin();

  try {
    const parsed = new URL(raw);
    const knownPath = extractKnownAvatarPath(parsed.pathname);
    if (knownPath) {
      return `${apiOrigin}${knownPath}${parsed.search}${parsed.hash}`;
    }
    return parsed.toString();
  } catch {
    const normalized = raw.startsWith('/') ? raw : `/${raw.replace(/^\/+/, '')}`;
    const knownPath = extractKnownAvatarPath(normalized);
    if (knownPath) {
      return `${apiOrigin}${knownPath}`;
    }
    return normalized;
  }
}

function getProfileInitials(name?: string | null): string {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

function buildTodayDateLabel(fallback: string): string {
  try {
    const formatted = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Jakarta',
    }).format(new Date());
    return formatted.toUpperCase();
  } catch {
    return String(fallback || '').trim().toUpperCase();
  }
}

function buildTimeGreeting(fallback: string): string {
  try {
    const now = new Date();
    const hourText = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Jakarta",
    }).format(now);
    const hour = Number(hourText);
    if (Number.isNaN(hour)) return fallback;
    if (hour < 11) return "Good morning,";
    if (hour < 15) return "Good afternoon,";
    if (hour < 19) return "Good evening,";
    return "Good evening,";
  } catch {
    return fallback;
  }
}

export default function TodayHeader({
  greeting,
  dateLabel,
  memberName = null,
  memberId = null,
  avatarUrl = null,
  isAuthenticated = false,
  isAuthRestoring = false,
}: TodayHeaderProps) {
  const router = useRouter();
  const m = useMotionConfig();
  const fallbackGreeting = String(greeting || 'Welcome back,').trim() || 'Welcome back,';
  const [timeGreeting, setTimeGreeting] = useState(() => buildTimeGreeting(fallbackGreeting));
  const [liveDateLabel, setLiveDateLabel] = useState(() => buildTodayDateLabel(dateLabel));
  const [guestAccessGate, setGuestAccessGate] = useState<null | 'notification' | 'inbox' | 'profile'>(null);
  const [inboxUnreadDot, setInboxUnreadDot] = useState(false);
  const normalizedMemberName = String(memberName || '').trim();
  const normalizedAvatarUrl = normalizeHeaderAvatarUrl(avatarUrl);
  const avatarPresentation = useCurrentUserAvatarStyle(
    normalizedAvatarUrl,
    { id: memberId, name: normalizedMemberName },
    44,
  );
  const profileInitials = getProfileInitials(normalizedMemberName || 'Member');

  useEffect(() => {
    setLiveDateLabel(buildTodayDateLabel(dateLabel));
    setTimeGreeting(buildTimeGreeting(fallbackGreeting));
  }, [dateLabel, fallbackGreeting]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setTimeGreeting(buildTimeGreeting(fallbackGreeting));
    }, 60000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [fallbackGreeting]);

  useEffect(() => {
    if (isAuthRestoring) {
      return;
    }

    if (!isAuthenticated) {
      setInboxUnreadDot(false);
      return;
    }

    let cancelled = false;

    const refreshInboxSignal = async () => {
      try {
        const response = await fetchWithAppAuth('/api/inbox', {
          headers: buildAppAuthHeaders(),
        });
        if (!response.ok) {
          if (!cancelled) setInboxUnreadDot(false);
          return;
        }
        const json = await response.json();
        const unreadCount = Number(json?.inbox?.unreadCount ?? 0);
        if (!cancelled) setInboxUnreadDot(unreadCount > 0);
      } catch {
        if (!cancelled) setInboxUnreadDot(false);
      }
    };

    void refreshInboxSignal();
    const intervalId = window.setInterval(() => {
      void refreshInboxSignal();
    }, 12000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [isAuthenticated, isAuthRestoring]);

  const iconButtonClassName =
    'group relative flex h-11 w-11 items-center justify-center rounded-full bg-transparent text-sky-600 ring-1 ring-sky-200/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.42)] backdrop-blur-[10px] transition-all duration-300 hover:bg-slate-900/12 hover:ring-slate-900/8 hover:shadow-[0_14px_34px_-24px_rgba(15,23,42,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white/70';
  const iconClassName = 'h-[18px] w-[18px] text-sky-600/95 transition-colors duration-300 group-hover:text-sky-700';
  const guestBadgeClassName = 'absolute right-2.5 top-2.5 inline-flex h-2.5 w-2.5 rounded-full bg-rose-500 ring-[3px] ring-white/92';

  return (
    <header className="sticky top-0 z-50 w-full pt-[env(safe-area-inset-top,0px)] mix-blend-multiply">
      <div className="mx-auto w-full px-6 pt-5 pb-4">
        <motion.div
          variants={m.v.fade}
          initial="hidden"
          animate="visible"
          // Header uses calm pace — establishes presence without drama
          transition={m.tx.calm}
          className="flex max-w-[34rem] items-start justify-between gap-4 sm:flex-row"
        >
          <div className="flex max-w-[24rem] flex-col">
            <span className="mb-1 text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase">
              {liveDateLabel}
            </span>
            <h1 className="text-[22px] leading-[1.22] font-semibold tracking-[-0.01em] text-foreground/95 md:text-[25px]">
              {timeGreeting}
            </h1>
            {!isAuthRestoring && (
              <>
                {normalizedMemberName ? (
                  <p className="mt-1 text-[16px] leading-[1.35] font-semibold tracking-[-0.01em] text-foreground/80 md:text-[18px]">
                    {normalizedMemberName}
                  </p>
                ) : null}
                <p className="mt-1 text-[13px] leading-[1.45] font-medium tracking-[0.01em] text-foreground/60 md:text-[14px]">
                  Your quiet space today
                </p>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2.5 self-start">
            {isAuthenticated ? (
              <ChatPopover
                triggerMode="notification"
                className={cn(
                  iconButtonClassName,
                  'bg-transparent dark:bg-transparent dark:ring-sky-200/55 dark:hover:bg-slate-900/14'
                )}
                iconClassName={iconClassName}
                iconStrokeWidth={1.9}
                badgeMode="dot"
              />
            ) : (
              <button
                type="button"
                onClick={() => setGuestAccessGate('notification')}
                className={iconButtonClassName}
                aria-label="Sign in to open notifications"
              >
                <Bell className={iconClassName} />
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                if (isAuthenticated) {
                  router.push('/inbox');
                  return;
                }
                setGuestAccessGate('inbox');
              }}
              className={cn(iconButtonClassName, 'shrink-0 ring-transparent')}
              aria-label={isAuthenticated ? 'Open inbox' : 'Sign in to open inbox'}
            >
              <Inbox className={iconClassName} />
              {isAuthenticated && inboxUnreadDot ? <span className={guestBadgeClassName} aria-hidden="true" /> : null}
            </button>

            <button
              type="button"
              onClick={() => {
                if (isAuthenticated) {
                  router.push('/profile');
                  return;
                }
                setGuestAccessGate('profile');
              }}
              className={cn(
                'group relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/88 text-[11px] font-semibold text-sky-700 ring-1 ring-sky-200/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.48)] backdrop-blur-[10px] transition-all duration-300 hover:bg-white hover:ring-sky-300/80 hover:shadow-[0_14px_34px_-24px_rgba(15,23,42,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300/70 focus-visible:ring-offset-2 focus-visible:ring-offset-white/70',
              )}
              aria-label={isAuthenticated ? 'Open profile' : 'Sign in to open profile'}
            >
              {isAuthenticated && normalizedAvatarUrl ? (
                <img
                  src={normalizedAvatarUrl}
                  alt={normalizedMemberName || 'Profile'}
                  className={cn('h-full w-full object-cover', avatarPresentation.className)}
                  style={avatarPresentation.style}
                />
              ) : (
                <span className="tracking-[0.04em]">{profileInitials}</span>
              )}
            </button>
          </div>
        </motion.div>
      </div>

      <Dialog open={guestAccessGate !== null} onOpenChange={(open) => (!open ? setGuestAccessGate(null) : null)}>
        <DialogContent className="w-[92vw] max-w-[430px] overflow-hidden rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.97),rgba(245,249,255,0.95))] p-0 shadow-[0_32px_100px_-48px_rgba(15,23,42,0.45)] backdrop-blur-2xl">
          <div className="relative p-7 sm:p-8">
            <div className="pointer-events-none absolute -right-10 top-0 h-28 w-28 rounded-full bg-sky-100/85 blur-2xl" />
            <div className="pointer-events-none absolute left-6 top-6 h-12 w-12 rounded-full border border-sky-100/80 bg-white/70" />

            <div className="relative">
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-[20px] border border-sky-100/90 bg-white/85 text-sky-600 shadow-[0_18px_38px_-24px_rgba(14,165,233,0.55)]">
                {guestAccessGate === 'notification' ? <Bell className="h-5 w-5" /> : guestAccessGate === 'inbox' ? <Inbox className="h-5 w-5" /> : <span className="text-sm font-semibold">Me</span>}
              </div>

              <DialogHeader className="space-y-2 text-left">
                <DialogTitle className="tct-serif text-[29px] leading-tight tracking-tight text-slate-900">
                  Log in or Sign up
                  <br />
                  to access {guestAccessGate === 'profile' ? 'your profile' : 'notifications and inbox'}
                </DialogTitle>
                <DialogDescription className="max-w-sm text-[14px] leading-relaxed text-slate-600">
                  Sign in to view admin greetings, open your inbox, manage your profile, and receive interaction updates.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 flex flex-col gap-3">
                <Button asChild className="h-12 rounded-full bg-slate-950 text-white font-semibold shadow-[0_16px_36px_-20px_rgba(15,23,42,0.55)]">
                  <Link href={guestAccessGate === 'inbox' ? '/login?next=/inbox' : '/login?next=/renungan'}>
                    Log in
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="h-12 rounded-full border border-slate-200 bg-white/88 font-semibold text-slate-800 shadow-none">
                  <Link href={guestAccessGate === 'inbox' ? '/login?intent=signup&next=/inbox' : '/login?intent=signup&next=/renungan'}>
                    Sign up
                  </Link>
                </Button>
                <button
                  type="button"
                  onClick={() => setGuestAccessGate(null)}
                  className="mt-1 text-center text-[12px] font-medium text-slate-500 transition-colors hover:text-slate-800"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
