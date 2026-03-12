import FloatingBottomNav from '@/Components/core/FloatingBottomNav';
import DesktopSidebarNav from '@/Components/core/DesktopSidebarNav';
import {
    IconChevronRight,
} from '@/Components/icons/AppIcons';
import { getUiNavItems } from '@/lib/ui-nav';
import { uiRoutes, type UiNavId } from '@/lib/ui-routes';
import { cn } from '@/lib/utils';
import { Head, router, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { useAuthPing } from '@/hooks/useAuthPing';
import { motion } from 'framer-motion';

type MobileAppLayoutProps = {
    title: string;
    activeNavId?: UiNavId;
    backHref?: string;
    header?: React.ReactNode;
    rightAction?: React.ReactNode;
    desktopSidebarExtra?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
    density?: 'default' | 'reader';
    bottomNavVariant?: 'ultra-subtle' | 'high-contrast';
};

export default function MobileAppLayout({
    title,
    activeNavId,
    backHref = '/today',
    header,
    rightAction,
    desktopSidebarExtra,
    children,
    className,
    density = 'default',
    bottomNavVariant = 'ultra-subtle',
}: MobileAppLayoutProps) {
    const { auth } = usePage().props;
    const notifications = (usePage().props as any).notifications;
    const inbox = (usePage().props as any).inbox;
    const isAuthenticated = Boolean(auth?.user);
    const navItems = getUiNavItems(isAuthenticated);
    const [notifToast, setNotifToast] = useState<string | null>(null);
    const lastUnreadRef = useRef<number>(notifications?.unreadCount ?? 0);
    const lastInboxUnreadRef = useRef<number>(Number(inbox?.unreadCount ?? 0));

    // Multi-device logout detection (singleton interval; runs only while tab is visible).
    // Keep this in ONE global layout to avoid duplicate intervals across pages.
    useAuthPing({ intervalMs: 60_000 });

    // PERFORMANCE NOTE:
    // Prefetch is nice when everything is fast, but on slower DB / shared hosting it can
    // create hidden bottlenecks by generating multiple parallel requests on every page.
    // Keep it OFF by default until we confirm navigation is consistently snappy.
    const ENABLE_NAV_PREFETCH = false;

    const handleBack = () => {
        if (typeof window === 'undefined') {
            router.visit(backHref, { preserveScroll: true });
            return;
        }

        if (window.history.length > 1) {
            window.history.back();
            return;
        }

        router.visit(backHref, { preserveScroll: true });
    };

    // Warm up the next navigations so switching tabs feels instant.
    // This uses Inertia's prefetch cache (won't update URL).
    useEffect(() => {
        if (!ENABLE_NAV_PREFETCH) return;
        if (!activeNavId) return;

        const candidates = navItems
            .map((item) => uiRoutes[item.id])
            .filter(Boolean) as string[];

        candidates
            .filter((href) => href !== (uiRoutes[activeNavId] ?? '/today'))
            .forEach((href) => {
                try {
                    router.prefetch(href, { preserveScroll: true, preserveState: true }, { cacheFor: 60_000 });
                } catch {
                    // ignore
                }
            });
    }, [activeNavId, navItems]);

    useEffect(() => {
        const nextUnread = Number(notifications?.unreadCount ?? 0);
        const prevUnread = lastUnreadRef.current;
        lastUnreadRef.current = nextUnread;

        if (nextUnread <= prevUnread) return;

        const items = Array.isArray(notifications?.items) ? notifications.items : [];
        const topUnread = items.find((n: any) => !n?.readAt);
        const title = topUnread?.data?.title;

        if (typeof title === 'string' && title.trim()) {
            setNotifToast(title.trim());
            const tid = window.setTimeout(() => setNotifToast(null), 2600);
            return () => window.clearTimeout(tid);
        }
    }, [notifications?.unreadCount, notifications?.items]);

    useEffect(() => {
        const nextUnread = Number(inbox?.unreadCount ?? 0);
        const prevUnread = lastInboxUnreadRef.current;
        lastInboxUnreadRef.current = nextUnread;

        if (nextUnread <= prevUnread) return;

        setNotifToast('Pesan baru masuk');
        const tid = window.setTimeout(() => setNotifToast(null), 2400);
        return () => window.clearTimeout(tid);
    }, [inbox?.unreadCount]);

    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Show header if scrolling up or at the very top
            if (currentScrollY < lastScrollY.current || currentScrollY < 50) {
                setIsVisible(true);
            }
            // Hide header if scrolling down and passed a threshold
            else if (currentScrollY > 100 && currentScrollY > lastScrollY.current) {
                setIsVisible(false);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;

        const intervalId = window.setInterval(() => {
            if (document.visibilityState !== 'visible') return;
            router.reload({
                only: ['notifications', 'inbox'],
            });
        }, 20_000);

        return () => window.clearInterval(intervalId);
    }, [isAuthenticated]);

    return (
        <>
            <Head title={title} />

            <div className="relative min-h-screen bg-[#fafafa] dark:bg-[#050505]">
                {/* Ambient Background Layers */}
                <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                    <div className="absolute -left-[10%] -top-[10%] h-[60%] w-[60%] rounded-full bg-indigo-200/20 blur-[120px] dark:bg-indigo-900/10" />
                    <div className="absolute -right-[5%] top-[10%] h-[50%] w-[50%] rounded-full bg-sky-200/20 blur-[100px] dark:bg-sky-900/10" />
                    <div className="absolute bottom-[10%] left-[20%] h-[40%] w-[40%] rounded-full bg-rose-200/10 blur-[110px] dark:bg-rose-900/5" />
                </div>

                <div
                    className={cn(
                        'relative z-10 mx-auto w-full max-w-6xl px-4',
                        density === 'reader' ? 'py-4 md:py-6' : 'py-8',
                    )}
                >
                    <div className="flex items-start gap-8">
                        {activeNavId ? (
                            <div
                                className="hidden md:flex md:w-72 md:flex-col md:gap-4"
                                style={{ position: 'sticky', top: '2rem', height: 'fit-content', alignSelf: 'start' }}
                            >
                                <DesktopSidebarNav activeId={activeNavId} />
                                {desktopSidebarExtra ?? null}
                            </div>
                        ) : null}

                        <div
                            className={cn(
                                'w-full md:flex-1',
                                // Keep mobile look centered; on md+ let it fill the content column.
                                'mx-auto max-w-[420px] md:mx-0 md:max-w-none',
                                className,
                            )}
                            style={{
                                paddingBottom:
                                    'calc(120px + env(safe-area-inset-bottom))',
                            }}
                        >
                            {header ? (
                                <motion.div
                                    initial={false}
                                    animate={{
                                        y: isVisible ? 0 : -100,
                                        opacity: isVisible ? 1 : 0
                                    }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="sticky top-0 z-40 bg-surface-muted/80 backdrop-blur-sm md:static md:bg-transparent md:backdrop-blur-none"
                                >
                                    {header}
                                </motion.div>
                            ) : (
                                <motion.header
                                    initial={false}
                                    animate={{
                                        y: isVisible ? 0 : -80,
                                        opacity: isVisible ? 1 : 0
                                    }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="sticky top-0 z-40 flex items-center justify-between bg-surface-muted/80 py-2 backdrop-blur-sm md:static md:bg-transparent md:backdrop-blur-none"
                                >
                                    <button
                                        type="button"
                                        onClick={handleBack}
                                        className="flex h-12 w-12 items-center justify-center rounded-full bg-surface shadow-soft"
                                        aria-label="Back"
                                    >
                                        <IconChevronRight className="h-5 w-5 rotate-180" />
                                    </button>

                                    <h1 className="tct-brand-gradient text-lg font-semibold">
                                        {title}
                                    </h1>

                                    <div className="flex h-12 w-12 items-center justify-center">{rightAction ?? null}</div>
                                </motion.header>
                            )}

                            <main className={cn(density === 'reader' ? 'mt-4' : 'mt-6')}>
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                    className="relative z-20"
                                >
                                    {children}
                                </motion.div>
                            </main>
                        </div>
                    </div>
                </div>

                {activeNavId ? (
                    <div
                        className="fixed inset-x-0 z-50 flex justify-center md:hidden"
                        style={{
                            bottom: 'calc(24px + env(safe-area-inset-bottom))',
                        }}
                    >
                        <FloatingBottomNav
                            items={navItems}
                            activeId={activeNavId as string}
                            variant={bottomNavVariant}
                            onPrefetch={(id) => {
                                if (!ENABLE_NAV_PREFETCH) return;

                                const raw = uiRoutes[id as UiNavId] ?? '/today';
                                const href =
                                    !isAuthenticated && id === 'settings'
                                        ? '/'
                                        : raw;

                                router.prefetch(
                                    href,
                                    { preserveScroll: true, preserveState: true },
                                    { cacheFor: 60_000 },
                                );
                            }}
                            onChange={(id) => {
                                const raw = uiRoutes[id as UiNavId] ?? '/today';
                                const href =
                                    !isAuthenticated && id === 'settings'
                                        ? '/'
                                        : raw;

                                router.visit(href, { preserveScroll: true });
                            }}
                        />
                    </div>
                ) : null}

                {notifToast ? (
                    <div className="pointer-events-none fixed left-1/2 top-6 z-[70] -translate-x-1/2 rounded-full bg-black/75 px-4 py-2 text-xs text-white ring-1 ring-white/10 backdrop-blur">
                        {notifToast}
                    </div>
                ) : null}
            </div>
        </>
    );
}
