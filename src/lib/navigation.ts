import { BookOpenText, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type UiNavId = 'today' | 'community';

export type UiNavItem = {
    id: UiNavId;
    label: string;
    icon: LucideIcon;
    href: string;
};

const UI_NAV_ITEMS: readonly UiNavItem[] = [
    { id: 'today', label: 'Reflection', icon: BookOpenText, href: '/renungan' },
    { id: 'community', label: 'Community', icon: Users, href: '/community' },
];

export function getUiNavItems(_isAuthenticated: boolean): UiNavItem[] {
    // Return a cloned array so callers cannot mutate global nav state.
    return UI_NAV_ITEMS.map((item) => ({ ...item }));
}
