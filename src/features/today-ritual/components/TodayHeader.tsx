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

interface TodayHeaderProps {
  greeting: string;
  dateLabel: string;
  memberName?: string | null;
  isAuthenticated?: boolean;
  isAuthRestoring?: boolean;
}

function buildTodayDateLabel(fallback: string): string {
  try {
    const formatted = new Intl.DateTimeFormat('id-ID', {
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

export default function TodayHeader({
  greeting,
  dateLabel,
  memberName = null,
  isAuthenticated = false,
  isAuthRestoring = false,
}: TodayHeaderProps) {
  const router = useRouter();
  const m = useMotionConfig();
  const primaryGreeting = String(greeting || 'Selamat datang kembali,').trim() || 'Selamat datang kembali,';
  const [liveDateLabel, setLiveDateLabel] = useState(() => buildTodayDateLabel(dateLabel));
  const [guestAccessGate, setGuestAccessGate] = useState<null | 'notification' | 'inbox'>(null);
  const [inboxUnreadDot, setInboxUnreadDot] = useState(false);
  const normalizedMemberName = String(memberName || '').trim();

  useEffect(() => {
    setLiveDateLabel(buildTodayDateLabel(dateLabel));
  }, [dateLabel]);

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
              {primaryGreeting}
            </h1>
            {!isAuthRestoring && (
              <>
                {normalizedMemberName ? (
                  <p className="mt-1 text-[16px] leading-[1.35] font-semibold tracking-[-0.01em] text-foreground/80 md:text-[18px]">
                    {normalizedMemberName}
                  </p>
                ) : null}
                <p className="mt-1 text-[13px] leading-[1.45] font-medium tracking-[0.01em] text-foreground/60 md:text-[14px]">
                  Chosen People
                </p>
              </>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2 self-start">
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
                aria-label="Masuk untuk membuka notifikasi"
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
              aria-label={isAuthenticated ? 'Buka inbox' : 'Masuk untuk membuka inbox'}
            >
              <Inbox className={iconClassName} />
              {isAuthenticated && inboxUnreadDot ? <span className={guestBadgeClassName} aria-hidden="true" /> : null}
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
                {guestAccessGate === 'notification' ? <Bell className="h-5 w-5" /> : <Inbox className="h-5 w-5" />}
              </div>

              <DialogHeader className="space-y-2 text-left">
                <DialogTitle className="tct-serif text-[29px] leading-tight tracking-tight text-slate-900">
                  Login atau Daftar
                  <br />
                  untuk buka notifikasi dan inbox
                </DialogTitle>
                <DialogDescription className="max-w-sm text-[14px] leading-relaxed text-slate-600">
                  Masuk untuk melihat welcome greeting dari admin, membuka inbox, dan menerima update interaksi pada kontenmu.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-6 flex flex-col gap-3">
                <Button asChild className="h-12 rounded-full bg-slate-950 text-white font-semibold shadow-[0_16px_36px_-20px_rgba(15,23,42,0.55)]">
                  <Link href={guestAccessGate === 'inbox' ? '/login?next=/inbox' : '/login?next=/renungan'}>
                    Login
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="h-12 rounded-full border border-slate-200 bg-white/88 font-semibold text-slate-800 shadow-none">
                  <Link href={guestAccessGate === 'inbox' ? '/login?intent=signup&next=/inbox' : '/login?intent=signup&next=/renungan'}>
                    Daftar
                  </Link>
                </Button>
                <button
                  type="button"
                  onClick={() => setGuestAccessGate(null)}
                  className="mt-1 text-center text-[12px] font-medium text-slate-500 transition-colors hover:text-slate-800"
                >
                  Nanti saja
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
