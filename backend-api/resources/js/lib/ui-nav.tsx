import type { LucideIcon } from 'lucide-react';
import { BookOpenText, Grid2x2, House, Settings, Users } from 'lucide-react';
import type { UiNavId } from '@/lib/ui-routes';

export type UiNavItem = {
    id: UiNavId;
    label: string;
    icon: LucideIcon;
};

export const uiNavItems: UiNavItem[] = [
    { id: 'home', label: 'Home', icon: House },
    { id: 'channels', label: 'Channels', icon: Grid2x2 },
    { id: 'library', label: 'Community', icon: Users },
    { id: 'bible', label: 'Bible', icon: BookOpenText },
    { id: 'settings', label: 'Settings', icon: Settings },
];

export function getUiNavItems(isAuthenticated: boolean): UiNavItem[] {
    if (isAuthenticated) return uiNavItems;

    return uiNavItems.filter((item) => item.id === 'channels' || item.id === 'bible');
}
