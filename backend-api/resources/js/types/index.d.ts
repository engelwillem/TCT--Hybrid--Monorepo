export interface User {
    id: number;
    name: string;
    email: string;
    is_admin?: boolean;
    is_it?: boolean;
    email_verified_at?: string | null;
    avatarUrl?: string | null;
    avatarInitials?: string;
}

export type NotificationItem = {
    id: string;
    type: string;
    data: Record<string, unknown>;
    readAt?: string | null;
    createdAt?: string | null;
};

export type NotificationsShared = {
    unreadCount: number;
    items: NotificationItem[];
} | null;

export type UiConfig = {
    appName: string;
    communityName: string;
    brand: {
        hsl: string;
        foregroundHsl: string;
    };
    announcements?: Array<{
        id: string;
        title: string;
        body: string;
        created_at?: string;
    }>;
};

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User | null;
    };
    notifications?: NotificationsShared;
    ui: UiConfig;
};
