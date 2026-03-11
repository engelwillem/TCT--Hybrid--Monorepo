'use client';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

// Mock icons for placeholder (until AppIcons are ported)
const IconChevronLeft = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m15 18-6-6 6-6"/>
  </svg>
);

type MobileAppLayoutProps = {
    title: string;
    activeNavId?: string;
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
    const router = useRouter();
    const [isVisible, setIsVisible] = useState(true);
    const lastScrollY = useRef(0);

    const handleBack = () => {
        if (window.history.length > 1) {
            window.history.back();
            return;
        }
        router.push(backHref);
    };

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY < lastScrollY.current || currentScrollY < 50) {
                setIsVisible(true);
            } else if (currentScrollY > 100 && currentScrollY > lastScrollY.current) {
                setIsVisible(false);
            }
            lastScrollY.current = currentScrollY;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="relative min-h-screen bg-[#fafafa] dark:bg-[#050505]">
            {/* Ambient Background Layers - 100% Parity */}
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
                    {/* Placeholder for DesktopSidebarNav (to be migrated) */}
                    {activeNavId && (
                        <div className="hidden md:flex md:w-72 md:flex-col md:gap-4 sticky top-8 h-fit self-start">
                            <div className="bg-surface p-4 rounded-3xl shadow-soft">
                                <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-4">Menu</p>
                                {/* Sidebar items will go here */}
                            </div>
                            {desktopSidebarExtra}
                        </div>
                    )}

                    <div
                        className={cn(
                            'w-full md:flex-1',
                            'mx-auto max-w-[420px] md:mx-0 md:max-w-none',
                            className,
                        )}
                        style={{
                            paddingBottom: 'calc(120px + env(safe-area-inset-bottom))',
                        }}
                    >
                        {header ? (
                            <motion.div
                                initial={false}
                                animate={{ y: isVisible ? 0 : -100, opacity: isVisible ? 1 : 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="sticky top-0 z-40 bg-surface-muted/80 backdrop-blur-sm md:static md:bg-transparent md:backdrop-blur-none"
                            >
                                {header}
                            </motion.div>
                        ) : title ? (
                            <motion.header
                                initial={false}
                                animate={{ y: isVisible ? 0 : -80, opacity: isVisible ? 1 : 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="sticky top-0 z-40 flex items-center justify-between bg-surface-muted/80 py-2 backdrop-blur-sm md:static md:bg-transparent md:backdrop-blur-none"
                            >
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="flex h-12 w-12 items-center justify-center rounded-full bg-surface shadow-soft tertiary"
                                    aria-label="Back"
                                >
                                    <IconChevronLeft className="h-5 w-5" />
                                </button>
                                <h1 className="tct-brand-gradient text-lg font-semibold">{title}</h1>
                                <div className="flex h-12 w-12 items-center justify-center">{rightAction}</div>
                            </motion.header>
                        ) : null}

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

            {/* Placeholder for FloatingBottomNav (to be migrated) */}
            {activeNavId && (
                <div className="fixed inset-x-0 z-50 flex justify-center md:hidden bottom-[calc(24px+env(safe-area-inset-bottom))]">
                   {/* Bottom Nav will go here */}
                </div>
            )}
        </div>
    );
}
