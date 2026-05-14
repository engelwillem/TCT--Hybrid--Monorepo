export type UiNavId = 'home' | 'channels' | 'library' | 'bible' | 'settings';

export const uiRoutes: Record<UiNavId, string> = {
    home: '/today',
    channels: '/channels',
    // `/library` was renamed to `/community` (we keep the nav id for backward compatibility).
    library: '/community',
    // VerseHub reader (Inertia page).
    bible: '/versehub/id',
    settings: '/profile',
};
