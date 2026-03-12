import { getUiNavItems } from '@/lib/ui-nav';
import { uiRoutes, type UiNavId } from '@/lib/ui-routes';
import { cn } from '@/lib/utils';
import AppIcon from '@/Components/system/AppIcon';
import { Link, usePage } from '@inertiajs/react';

type DesktopSidebarNavProps = {
    activeId?: UiNavId;
    className?: string;
};

export default function DesktopSidebarNav({
    activeId,
    className,
}: DesktopSidebarNavProps) {
    const { ui, auth } = usePage().props;
    const isAuthenticated = Boolean(auth?.user);

    const userName = auth?.user?.name ?? '';
    const userEmail = auth?.user?.email ?? '';
    const initials = (auth?.user?.avatarInitials ?? userName?.slice(0, 1) ?? 'U').toUpperCase();
    const isTodaySidebar = activeId === 'home';
    const navItems = getUiNavItems(isAuthenticated);

    return (
        <aside
            className={cn(
                'flex flex-col gap-4 rounded-3xl bg-surface p-6 shadow-soft',
                className,
            )}
            style={{ position: 'sticky', top: '2rem', alignSelf: 'start' }}
        >
            <div>
                <p
                    className={cn(
                        isTodaySidebar
                            ? 'tct-brand-gradient text-base font-bold tracking-tight'
                            : 'text-xs font-medium uppercase tracking-wide text-muted-foreground',
                    )}
                >
                    {isTodaySidebar ? 'Choose n Talks' : ui.appName}
                </p>
                {!isTodaySidebar ? (
                    <p className="tct-brand-gradient mt-1 text-lg font-semibold">{ui.communityName}</p>
                ) : null}
            </div>

            <nav className="mt-2 space-y-1">
                {navItems.map((item) => {
                    const isActive = item.id === activeId;

                    const href = uiRoutes[item.id];

                    const baseClass = cn(
                        'group flex items-center gap-3 rounded-full px-4 py-3 text-sm font-medium transition-all duration-200',
                        isActive
                            ? 'bg-surface/70 text-foreground ring-1 ring-black/5 dark:ring-white/10'
                            : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                    );

                    const inner = (
                        <>
                            <AppIcon
                                icon={item.icon}
                                variant="nav"
                                active={isActive}
                                className={cn(
                                    isActive
                                        ? 'text-foreground'
                                        : 'text-muted-foreground group-hover:text-foreground',
                                )}
                            />
                            <span className="flex-1">{item.label}</span>
                        </>
                    );

                    // VerseHub is a Blade page; use full navigation (not Inertia).
                    if (item.id === 'bible') {
                        return (
                            <a key={item.id} href={href} className={baseClass}>
                                {inner}
                            </a>
                        );
                    }

                    return (
                        <Link
                            key={item.id}
                            href={href}
                            prefetch="hover"
                            cacheFor="1m"
                            className={baseClass}
                        >
                            {inner}
                        </Link>
                    );
                })}            </nav>

            {isAuthenticated ? (
                <div className="mt-auto flex items-center gap-3 rounded-2xl bg-surface-muted p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated text-sm font-semibold">
                        {initials}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">
                            {userName}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                            {userEmail}
                        </p>
                    </div>
                </div>
            ) : null}
        </aside>
    );
}
