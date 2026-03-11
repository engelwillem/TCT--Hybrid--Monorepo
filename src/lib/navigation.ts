import { BookOpenText, Grid2x2, House, Settings, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type UiNavId = 'home' | 'channels' | 'community' | 'bible' | 'profile';

export type UiNavItem = {
    id: UiNavId;
    label: string;
    icon: LucideIcon;
    href: string;
};

export const uiNavItems: UiNavItem[] = [
    { id: 'home', label: 'Home', icon: House, href: '/today' },
    { id: 'channels', label: 'Channels', icon: Grid2x2, href: '/channels' },
    { id: 'community', label: 'Community', icon: Users, href: '/community' },
    { id: 'bible', label: 'Bible', icon: BookOpenText, href: '/versehub/id' },
    { id: 'profile', label: 'Profile', icon: Settings, href: '/profile' },
];

export function getUiNavItems(isAuthenticated: boolean): UiNavItem[] {
    // Unhidden: returning all items for frontend demonstration
    return uiNavItems;
}
