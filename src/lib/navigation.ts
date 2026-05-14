import { BookOpenText, House, Settings, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type UiNavId = 'today' | 'versehub' | 'community' | 'profile';

export type UiNavItem = {
    id: UiNavId;
    label: string;
    icon: LucideIcon;
    href: string;
};

export const uiNavItems: UiNavItem[] = [
    { id: 'today', label: 'Today', icon: House, href: '/renungan' },
    { id: 'versehub', label: 'VerseHub', icon: BookOpenText, href: '/versehub/id' },
    { id: 'community', label: 'Community', icon: Users, href: '/community' },
    { id: 'profile', label: 'Profile', icon: Settings, href: '/profile' },
];

export function getUiNavItems(isAuthenticated: boolean): UiNavItem[] {
    // Unhidden: returning all items for frontend demonstration
    return uiNavItems;
}
