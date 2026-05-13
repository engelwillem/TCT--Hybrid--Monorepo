"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase/auth/use-user';
import { useAuthSession } from '@/auth/use-auth-session';
import {
    ShieldCheck,
    LogOut,
    Camera,
    ChevronRight,
    CheckCircle2,
    Trash2,
    Grid,
    Sparkles,
    Loader2,
    AlertTriangle,
    RefreshCw,
    X,
    BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import MobileAppLayout from '@/layouts/MobileAppLayout';
import AccordionCard from '@/components/core/AccordionCard';
import PrimaryCTA from '@/components/core/PrimaryCTA';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { fetchWithAppAuth } from '@/lib/app-auth-fetch';
import { clearAppAccessToken, setAppAccessToken, setAppAuthUser } from '@/services/app-auth-token';
import { DEFAULT_SAVED_AVATAR_TRANSFORM, loadSavedAvatarTransform, saveAvatarTransform } from '@/lib/avatar-presentation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AVATAR_EDITOR_LIMIT,
    AVATAR_EDITOR_VIEWPORT,
    AVATAR_TRANSFORM_LIMIT,
    buildAvatarCandidates,
    clampEditorTransform,
    clampTransform,
    cropAvatarFile,
    DEFAULT_AVATAR_TRANSFORM,
    dedupeCandidates,
    getInitials,
    loadImageDimensions,
    pickRenderableAvatarCandidate,
    readFileAsDataUrl,
    type AvatarImageSize,
    type AvatarTransform,
} from '@/features/profile/avatar-utils';

type OpsGatewayData = {
    status: 'Healthy' | 'Needs Attention' | 'High Risk' | string;
    riskScore: number;
    topAction: string;
    statusHref?: string;
};

type SpiritualHighlightsData = {
    window_days?: number;
    session_count?: number;
    has_data?: boolean;
    summary?: string | null;
    latest_session_at?: string | null;
    top_emotion?: string | null;
    top_theme?: string | null;
    top_verse_reference?: string | null;
};

type ApiProfilePayload = {
    data?: {
        user?: {
            id?: string | number;
            name?: string;
            email?: string;
            birth_date?: string | null;
            is_admin?: boolean;
            email_verified_at?: string | null;
            avatar_url?: string | null;
        };
        opsGateway?: OpsGatewayData;
        spiritualHighlights?: SpiritualHighlightsData | null;
        twoFactor?: {
            enabled?: boolean;
            recoveryCodesRemaining?: number;
        };
    };
};

type FirebaseSyncPayload = {
    data?: {
        token?: string;
        user?: {
            id?: string | number;
            name?: string;
            email?: string;
            avatarUrl?: string | null;
            avatar_url?: string | null;
        };
    };
};

type NotificationPreferenceData = {
    email: boolean;
    in_app: boolean;
    whatsapp: boolean;
    timezone: string;
    quiet_hours_start: string;
    quiet_hours_end: string;
    reminder_worship_enabled: boolean;
    reminder_worship_time: string;
    reminder_class_enabled: boolean;
    reminder_class_time: string;
    reminder_visit_enabled: boolean;
    reminder_visit_time: string;
};

type WhatsappVerificationStatusData = {
    status: string;
    verified: boolean;
    verified_at?: string | null;
    phone?: string | null;
    normalized_phone?: string | null;
};

const PROFILE_CACHE_TTL_MS = 30_000;

export default function ProfilePage() {
    const router = useRouter();
    const { user: authUser } = useUser();
    const {
        status: authStatus,
        isAuthenticated,
        profileName,
        profileEmail,
        avatarUrl: sessionAvatarUrl,
    } = useAuthSession();
    
    // UI States
    const [loading, setLoading] = useState(true);
    const [submittingAvatar, setSubmittingAvatar] = useState(false);
    const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const avatarPreviewBlobRef = useRef<string | null>(null);
    const avatarEditorDragRef = useRef<{ pointerId: number; startX: number; startY: number; origin: AvatarTransform } | null>(null);
    const [avatarTransform, setAvatarTransform] = useState<AvatarTransform>(DEFAULT_AVATAR_TRANSFORM);
    const [avatarEditorOpen, setAvatarEditorOpen] = useState(false);
    const [avatarEditorBusy, setAvatarEditorBusy] = useState(false);
    const [avatarEditorSource, setAvatarEditorSource] = useState<string | null>(null);
    const [avatarEditorFile, setAvatarEditorFile] = useState<File | null>(null);
    const [avatarEditorImageSize, setAvatarEditorImageSize] = useState<AvatarImageSize | null>(null);
    const [avatarEditorTransform, setAvatarEditorTransform] = useState<AvatarTransform>(DEFAULT_AVATAR_TRANSFORM);
    const [avatarControlsOpen, setAvatarControlsOpen] = useState(false);
    const [avatarTransformDirty, setAvatarTransformDirty] = useState(false);

    // Profile States
    const [user, setUser] = useState({
        name: profileName || authUser?.displayName || '',
        email: profileEmail || authUser?.email || '',
        birth_date: '',
        avatarUrl: sessionAvatarUrl || null,
        avatarCandidates: buildAvatarCandidates(sessionAvatarUrl || authUser?.photoURL || null),
        is_admin: false,
        email_verified_at: null as string | null,
    });

    const [opsGateway, setOpsGateway] = useState<OpsGatewayData | null>(null);
    const [spiritualHighlights, setSpiritualHighlights] = useState<SpiritualHighlightsData | null>(null);
    const [journeyBadge, setJourneyBadge] = useState(0);
    const [profileData, setProfileData] = useState({
        name: user.name,
        email: user.email,
        birth_date: user.birth_date,
    });
    const [profileErrors, setProfileErrors] = useState<Record<string, string[]>>({});
    const [profileBusy, setProfileBusy] = useState(false);
    const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferenceData>({
        email: true,
        in_app: true,
        whatsapp: false,
        timezone: 'Asia/Makassar',
        quiet_hours_start: '',
        quiet_hours_end: '',
        reminder_worship_enabled: false,
        reminder_worship_time: '07:00',
        reminder_class_enabled: false,
        reminder_class_time: '18:00',
        reminder_visit_enabled: false,
        reminder_visit_time: '09:00',
    });
    const [notificationBusy, setNotificationBusy] = useState(false);
    const [whatsappPhone, setWhatsappPhone] = useState('');
    const [whatsappCode, setWhatsappCode] = useState('');
    const [whatsappVerification, setWhatsappVerification] = useState<WhatsappVerificationStatusData>({
        status: 'pending',
        verified: false,
    });
    const [whatsappBusy, setWhatsappBusy] = useState(false);
    const hasLoadedProfileRef = useRef(false);
    const hasLoadedNotificationSectionRef = useRef(false);

    const readSessionCache = <T,>(key: string): T | null => {
        if (typeof window === 'undefined') return null;
        try {
            const raw = window.sessionStorage.getItem(key);
            if (!raw) return null;
            const parsed = JSON.parse(raw) as { ts?: number; data?: T };
            if (!parsed?.ts || Date.now() - parsed.ts > PROFILE_CACHE_TTL_MS) {
                window.sessionStorage.removeItem(key);
                return null;
            }
            return (parsed.data ?? null) as T | null;
        } catch {
            return null;
        }
    };

    const writeSessionCache = <T,>(key: string, data: T): void => {
        if (typeof window === 'undefined') return;
        try {
            window.sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), data }));
        } catch {
            // ignore cache write errors
        }
    };

    // Password States
    const [passwordData, setPasswordData] = useState({
        current: '',
        new: '',
        confirm: ''
    });
    const [passwordErrors, setPasswordErrors] = useState<Record<string, string[]>>({});
    const [passwordBusy, setPasswordBusy] = useState(false);

    // 2FA States
    const [twoFactor, setTwoFactor] = useState({
        enabled: false,
        recoveryCodesRemaining: 0
    });
    const [twoFactorStep, setTwoFactorStep] = useState<'idle' | 'password' | 'setup' | 'disable' | 'recovery'>('idle');
    const [twoFactorPassword, setTwoFactorPassword] = useState('');
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [twoFactorSetupData, setTwoFactorSetupData] = useState<{
        secret: string;
        qrCodeDataUri: string;
        recoveryCodes: string[];
    } | null>(null);
    const [newRecoveryCodes, setNewRecoveryCodes] = useState<string[] | null>(null);
    const [twoFactorError, setTwoFactorError] = useState<string | null>(null);
    const [twoFactorBusy, setTwoFactorBusy] = useState(false);

    const [deleteBusy, setDeleteBusy] = useState(false);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const currentAvatarSrc = user.avatarUrl || user.avatarCandidates[0] || null;
    const transformStorageKey = `tct.profile.avatarTransform:${user.email || 'guest'}`;

    const updateAvatarTransform = (updater: (prev: AvatarTransform) => AvatarTransform) => {
        setAvatarTransform((prev) => {
            const next = clampTransform(updater(prev));
            setAvatarTransformDirty(true);
            return next;
        });
    };

    const updateAvatarEditorTransform = (updater: (prev: AvatarTransform) => AvatarTransform) => {
        setAvatarEditorTransform((prev) => clampEditorTransform(updater(prev)));
    };

    const handleAvatarEditorPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
        if (!avatarEditorSource || avatarEditorBusy) return;
        avatarEditorDragRef.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            origin: avatarEditorTransform,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handleAvatarEditorPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
        const activeDrag = avatarEditorDragRef.current;
        if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
        const deltaX = event.clientX - activeDrag.startX;
        const deltaY = event.clientY - activeDrag.startY;
        setAvatarEditorTransform(clampEditorTransform({
            ...activeDrag.origin,
            x: activeDrag.origin.x + deltaX,
            y: activeDrag.origin.y + deltaY,
        }));
    };

    const handleAvatarEditorPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
        const activeDrag = avatarEditorDragRef.current;
        if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
        avatarEditorDragRef.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    };

    const syncFirebaseAccessToken = async (forceRefresh = false): Promise<string | null> => {
        if (!authUser || authUser.isAnonymous || typeof authUser.getIdToken !== 'function') {
            return null;
        }

        try {
            const idToken = await authUser.getIdToken(forceRefresh);
            const response = await fetch('/api/auth/firebase/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ idToken }),
            });

            if (!response.ok) {
                return null;
            }

            const payload = (await response.json().catch(() => null)) as FirebaseSyncPayload | null;
            const token = typeof payload?.data?.token === 'string' ? payload.data.token.trim() : '';
            if (!token) {
                return null;
            }

            setAppAccessToken(token, 'firebase');
            const syncedUser = payload?.data?.user;
            if (syncedUser) {
                setAppAuthUser({
                    id: syncedUser.id != null ? String(syncedUser.id) : undefined,
                    name: syncedUser.name || undefined,
                    email: syncedUser.email || undefined,
                    avatarUrl: typeof syncedUser.avatarUrl === 'string'
                        ? syncedUser.avatarUrl
                        : typeof syncedUser.avatar_url === 'string'
                            ? syncedUser.avatar_url
                            : null,
                });
            }

            return token;
        } catch {
            return null;
        }
    };

    const fetchWithApiAuth = async (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response | null> => {
        let response = await fetchWithAppAuth(input, init, {
            includeBearerFallback: false,
            clearLocalSessionOnUnauthorized: false,
        });
        if (response.status !== 401) {
            return response;
        }

        if (authUser && !authUser.isAnonymous) {
            await syncFirebaseAccessToken(true);
            response = await fetchWithAppAuth(input, init, {
                includeBearerFallback: false,
                clearLocalSessionOnUnauthorized: false,
            });
            if (response.status !== 401) {
                return response;
            }
        }

        response = await fetchWithAppAuth(input, init, {
            includeBearerFallback: true,
            clearLocalSessionOnUnauthorized: false,
        });
        if (response.status === 401) {
            clearAppAccessToken();
        }
        return response;
    };

    const loadNotificationPreferences = async (force = false) => {
        const cacheKey = 'tct.profile.notificationPrefs';
        if (!force) {
            const cached = readSessionCache<NotificationPreferenceData>(cacheKey);
            if (cached) {
                setNotificationPrefs((prev) => ({ ...prev, ...cached }));
                return;
            }
        }

        const response = await fetchWithApiAuth('/api/profile/notification-preferences', {
            method: 'GET',
            cache: 'no-store',
        });
        if (!response?.ok) return;

        const payload = await response.json().catch(() => null);
        const data = payload?.data || {};
        const nextPrefs: NotificationPreferenceData = {
            email: Boolean(data.email),
            in_app: Boolean(data.in_app),
            whatsapp: Boolean(data.whatsapp),
            timezone: typeof data.timezone === 'string' && data.timezone.trim() !== '' ? data.timezone : notificationPrefs.timezone,
            quiet_hours_start: typeof data.quiet_hours_start === 'string' ? data.quiet_hours_start.slice(0, 5) : '',
            quiet_hours_end: typeof data.quiet_hours_end === 'string' ? data.quiet_hours_end.slice(0, 5) : '',
            reminder_worship_enabled: Boolean(data.reminder_worship_enabled),
            reminder_worship_time: typeof data.reminder_worship_time === 'string' && data.reminder_worship_time.trim() !== '' ? data.reminder_worship_time.slice(0, 5) : '07:00',
            reminder_class_enabled: Boolean(data.reminder_class_enabled),
            reminder_class_time: typeof data.reminder_class_time === 'string' && data.reminder_class_time.trim() !== '' ? data.reminder_class_time.slice(0, 5) : '18:00',
            reminder_visit_enabled: Boolean(data.reminder_visit_enabled),
            reminder_visit_time: typeof data.reminder_visit_time === 'string' && data.reminder_visit_time.trim() !== '' ? data.reminder_visit_time.slice(0, 5) : '09:00',
        };
        setNotificationPrefs((prev) => ({
            ...prev,
            ...nextPrefs,
        }));
        writeSessionCache(cacheKey, nextPrefs);
    };

    const loadWhatsappVerificationStatus = async (force = false) => {
        const cacheKey = 'tct.profile.whatsappVerification';
        if (!force) {
            const cached = readSessionCache<WhatsappVerificationStatusData>(cacheKey);
            if (cached) {
                setWhatsappVerification(cached);
                if (typeof cached.phone === 'string' && cached.phone.trim() !== '') {
                    setWhatsappPhone(cached.phone);
                }
                return;
            }
        }

        const response = await fetchWithApiAuth('/api/profile/whatsapp-verification/status', {
            method: 'GET',
            cache: 'no-store',
        });
        if (!response?.ok) return;

        const payload = await response.json().catch(() => null);
        const data = payload?.data || {};
        const nextStatus: WhatsappVerificationStatusData = {
            status: typeof data.status === 'string' ? data.status : 'pending',
            verified: Boolean(data.verified),
            verified_at: data.verified_at || null,
            phone: data.phone || null,
            normalized_phone: data.normalized_phone || null,
        };
        setWhatsappVerification(nextStatus);
        if (typeof data.phone === 'string' && data.phone.trim() !== '') {
            setWhatsappPhone(data.phone);
        }
        writeSessionCache(cacheKey, nextStatus);
    };

    useEffect(() => {
        if (authStatus === 'restoring') return;
        if (!isAuthenticated) {
            router.replace('/login?next=/profile');
        }
    }, [authStatus, isAuthenticated, router]);

    useEffect(() => {
        if (authStatus === 'restoring') return;

        if (!isAuthenticated) {
            hasLoadedProfileRef.current = false;
            hasLoadedNotificationSectionRef.current = false;
            setLoading(false);
            return;
        }

        const authAvatarCandidates = dedupeCandidates([
            ...buildAvatarCandidates(sessionAvatarUrl || null),
            ...buildAvatarCandidates(authUser?.photoURL || null),
        ]);
        if (authAvatarCandidates.length > 0) {
            setUser((prev) => ({
                ...prev,
                avatarCandidates: prev.avatarCandidates.length > 0 ? prev.avatarCandidates : authAvatarCandidates,
                avatarUrl: prev.avatarUrl || authAvatarCandidates[0] || null,
            }));
        }

        let isActive = true;
        const loadProfile = async () => {
            const cacheKey = 'tct.profile.main';
            if (!hasLoadedProfileRef.current) {
                const cached = readSessionCache<ApiProfilePayload>(cacheKey);
                const cachedUser = cached?.data?.user;
                if (cachedUser) {
                    const avatarCandidates = dedupeCandidates([
                        ...buildAvatarCandidates(sessionAvatarUrl || null),
                        ...buildAvatarCandidates(authUser?.photoURL || null),
                        ...buildAvatarCandidates(cachedUser.avatar_url || null),
                    ]);
                    const nextUser = {
                        name: cachedUser.name || profileName || authUser?.displayName || '',
                        email: cachedUser.email || profileEmail || authUser?.email || '',
                        birth_date: cachedUser.birth_date || '',
                        avatarUrl: avatarCandidates[0] || null,
                        avatarCandidates,
                        is_admin: Boolean(cachedUser.is_admin),
                        email_verified_at: cachedUser.email_verified_at || null,
                    };
                    setUser(nextUser);
                    setProfileData({
                        name: nextUser.name,
                        email: nextUser.email,
                        birth_date: nextUser.birth_date,
                    });
                    setTwoFactor({
                        enabled: Boolean(cached?.data?.twoFactor?.enabled),
                        recoveryCodesRemaining: cached?.data?.twoFactor?.recoveryCodesRemaining || 0,
                    });
                    setOpsGateway(cached?.data?.opsGateway || null);
                    setSpiritualHighlights(cached?.data?.spiritualHighlights || null);
                    setLoading(false);
                }
            }

            try {
                const response = await fetchWithApiAuth('/api/profile', {
                    method: 'GET',
                    cache: 'no-store',
                });
                if (!response?.ok) return;

                const payload = (await response.json()) as ApiProfilePayload;
                const apiUser = payload?.data?.user;
                if (!isActive || !apiUser) return;
                const avatarCandidates = dedupeCandidates([
                    ...buildAvatarCandidates(sessionAvatarUrl || null),
                    ...buildAvatarCandidates(authUser?.photoURL || null),
                    ...buildAvatarCandidates(apiUser.avatar_url || null),
                ]);
                if (!isActive) return;

                const nextUser = {
                    name: apiUser.name || profileName || authUser?.displayName || '',
                    email: apiUser.email || profileEmail || authUser?.email || '',
                    birth_date: apiUser.birth_date || '',
                    avatarUrl: avatarCandidates[0] || null,
                    avatarCandidates,
                    is_admin: Boolean(apiUser.is_admin),
                    email_verified_at: apiUser.email_verified_at || null,
                };
                const normalizedUserId = apiUser.id != null ? String(apiUser.id) : undefined;

                setUser(nextUser);
                setAppAuthUser({
                    id: normalizedUserId,
                    name: nextUser.name,
                    email: nextUser.email,
                    avatarUrl: nextUser.avatarUrl,
                });
                if (payload?.data && 'opsGateway' in payload.data) {
                    setOpsGateway(payload.data.opsGateway || null);
                }
                if (payload?.data && 'spiritualHighlights' in payload.data) {
                    setSpiritualHighlights(payload.data.spiritualHighlights || null);
                }
                setProfileData({
                    name: nextUser.name,
                    email: nextUser.email,
                    birth_date: nextUser.birth_date,
                });
                setTwoFactor({
                    enabled: Boolean(payload?.data?.twoFactor?.enabled),
                    recoveryCodesRemaining: payload?.data?.twoFactor?.recoveryCodesRemaining || 0
                });
                writeSessionCache(cacheKey, payload);
                hasLoadedProfileRef.current = true;
            } catch {
                // ignore
            } finally {
                if (isActive) setLoading(false);
            }
        };

        loadProfile();
        return () => { isActive = false; };
    }, [authStatus, isAuthenticated, authUser?.displayName, authUser?.email, authUser?.photoURL, profileEmail, profileName, sessionAvatarUrl]);

    useEffect(() => {
        return () => {
            if (avatarPreviewBlobRef.current) {
                URL.revokeObjectURL(avatarPreviewBlobRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const saved = loadSavedAvatarTransform(user.email || 'guest');
            setAvatarTransform(clampTransform(saved));
            setAvatarTransformDirty(false);
        } catch {
            setAvatarTransform(DEFAULT_AVATAR_TRANSFORM);
            setAvatarTransformDirty(false);
        }
    }, [transformStorageKey]);

    useEffect(() => {
        let isActive = true;
        const fetchSummary = async () => {
            const response = await fetchWithApiAuth('/api/versehub/id/actions/summary?limit=3&sort=recent', {
                method: 'GET',
            });
            if (!response?.ok) {
                if (isActive) setJourneyBadge(0);
                return;
            }
            try {
                const json = await response.json();
                const counts = json?.counts || {};
                const total = Number(counts.favorites || 0) + Number(counts.bookmarks || 0) + Number(counts.notes || 0);
                if (isActive) setJourneyBadge(total);
            } catch { /* ignore */ }
        };
        const timer = setTimeout(() => {
            if (isActive) {
                void fetchSummary();
            }
        }, 250);
        return () => {
            isActive = false;
            clearTimeout(timer);
        };
    }, []);

    useEffect(() => {
        if (!isAuthenticated || authStatus === 'restoring') return;
        if (hasLoadedNotificationSectionRef.current) return;
        hasLoadedNotificationSectionRef.current = true;
        void Promise.allSettled([
            loadNotificationPreferences(),
            loadWhatsappVerificationStatus(),
        ]);
    }, [isAuthenticated, authStatus]);

    const logout = async () => {
        try {
            await fetchWithAppAuth('/api/auth/logout', {
                method: 'POST',
            });
        } catch {
            // ignore backend logout failure, still clear local session
        }

        clearAppAccessToken();
        router.push('/login');
    };

    const handleNotificationPreferenceSave = async (event: React.FormEvent) => {
        event.preventDefault();
        setNotificationBusy(true);
        try {
            const response = await fetchWithApiAuth('/api/profile/notification-preferences', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(notificationPrefs),
            });

            if (!response) {
                showToast('Your account session needs to be refreshed. Please sign in again.', 'error');
                return;
            }

            const payload = await response.json().catch(() => null);
            if (!response.ok) {
                showToast(payload?.message || 'Failed to save notification preferences.', 'error');
                return;
            }

            showToast('Notification preferences saved.');
            await loadNotificationPreferences(true);
        } catch {
            showToast('A system issue occurred.', 'error');
        } finally {
            setNotificationBusy(false);
        }
    };

    const handleRequestWhatsappOtp = async () => {
        if (!whatsappPhone.trim()) {
            showToast('Please enter your WhatsApp number first.', 'error');
            return;
        }

        setWhatsappBusy(true);
        try {
            const response = await fetchWithApiAuth('/api/profile/whatsapp-verification/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ phone: whatsappPhone }),
            });

            if (!response) {
                showToast('Your account session needs to be refreshed. Please sign in again.', 'error');
                return;
            }

            const payload = await response.json().catch(() => null);
            if (!response.ok) {
                showToast(payload?.message || 'Failed to send OTP.', 'error');
                return;
            }

            showToast('WhatsApp OTP has been sent.');
            await loadWhatsappVerificationStatus(true);
        } catch {
            showToast('A system issue occurred.', 'error');
        } finally {
            setWhatsappBusy(false);
        }
    };

    const handleVerifyWhatsappOtp = async () => {
        if (!whatsappPhone.trim() || !whatsappCode.trim()) {
            showToast('WhatsApp number and OTP are required.', 'error');
            return;
        }

        setWhatsappBusy(true);
        try {
            const response = await fetchWithApiAuth('/api/profile/whatsapp-verification/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    phone: whatsappPhone,
                    code: whatsappCode,
                }),
            });

            if (!response) {
                showToast('Your account session needs to be refreshed. Please sign in again.', 'error');
                return;
            }

            const payload = await response.json().catch(() => null);
            if (!response.ok) {
                showToast(payload?.message || 'Invalid OTP.', 'error');
                return;
            }

            showToast('WhatsApp verified successfully.');
            setWhatsappCode('');
            await loadWhatsappVerificationStatus(true);
        } catch {
            showToast('A system issue occurred.', 'error');
        } finally {
            setWhatsappBusy(false);
        }
    };

    const uploadAvatarFile = async (file: File) => {
        const previousAvatarUrl = user.avatarUrl;
        const previousAvatarCandidates = user.avatarCandidates;

        const rollbackAvatar = () => {
            setUser((prev) => ({
                ...prev,
                avatarUrl: previousAvatarUrl,
                avatarCandidates: previousAvatarCandidates,
            }));
        };

        setSubmittingAvatar(true);
        if (avatarPreviewBlobRef.current) {
            URL.revokeObjectURL(avatarPreviewBlobRef.current);
            avatarPreviewBlobRef.current = null;
        }
        const localPreview = URL.createObjectURL(file);
        avatarPreviewBlobRef.current = localPreview;
        setUser((prev) => ({
            ...prev,
            avatarCandidates: dedupeCandidates([localPreview, ...prev.avatarCandidates]),
            avatarUrl: localPreview,
        }));

        const formData = new FormData();
        formData.append('avatar', file);
        formData.append('_method', 'PATCH');

        try {
            const response = await fetchWithApiAuth('/api/profile', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                },
                body: formData,
            });
            if (!response) {
                rollbackAvatar();
                showToast('Your account session needs to be refreshed. Please sign in again.', 'error');
                return;
            }

            const payload = await response.json().catch(() => null);

            if (response.ok) {
                const persistedAvatarRaw = String(payload?.data?.avatar_url || '').trim();
                if (!persistedAvatarRaw) {
                    rollbackAvatar();
                    showToast('Upload was accepted, but avatar URL is not ready yet. Please try again.', 'error');
                } else {
                    const persistedCandidates = buildAvatarCandidates(persistedAvatarRaw);
                    const mergedCandidates = dedupeCandidates([
                        ...persistedCandidates,
                        localPreview,
                        ...previousAvatarCandidates,
                    ]);
                    const renderableAvatar = await pickRenderableAvatarCandidate(persistedCandidates);

                    if (!renderableAvatar) {
                        rollbackAvatar();
                        showToast('Photo was saved, but cannot be displayed yet. Please check storage/public avatar URL.', 'error');
                    } else {
                        setUser(prev => ({
                            ...prev,
                            avatarUrl: renderableAvatar,
                            avatarCandidates: dedupeCandidates([renderableAvatar, ...mergedCandidates]),
                        }));
                        setAppAuthUser({
                            name: user.name,
                            email: user.email,
                            avatarUrl: renderableAvatar,
                        });
                        if (avatarPreviewBlobRef.current) {
                            URL.revokeObjectURL(avatarPreviewBlobRef.current);
                            avatarPreviewBlobRef.current = null;
                        }
                        showToast('Profile photo updated.');
                    }
                }
            } else {
                rollbackAvatar();
                if (payload?.errors?.avatar?.[0]) {
                    showToast(payload.errors.avatar[0], 'error');
                } else {
                    showToast(payload?.message || 'Failed to upload profile photo.', 'error');
                }
            }
        } catch {
            rollbackAvatar();
            showToast('A system issue occurred during upload.', 'error');
        } finally {
            setSubmittingAvatar(false);
            if (avatarInputRef.current) {
                avatarInputRef.current.value = '';
            }
        }
    };

    const handleAvatarSelection = async (file: File) => {
        try {
            const source = await readFileAsDataUrl(file);
            const dimensions = await loadImageDimensions(source);
            setAvatarEditorFile(file);
            setAvatarEditorSource(source);
            setAvatarEditorImageSize(dimensions);
            setAvatarEditorTransform(DEFAULT_AVATAR_TRANSFORM);
            setAvatarEditorOpen(true);
        } catch {
            showToast('Failed to read image file.', 'error');
            if (avatarInputRef.current) {
                avatarInputRef.current.value = '';
            }
        }
    };

    const closeAvatarEditor = () => {
        setAvatarEditorOpen(false);
        setAvatarEditorBusy(false);
        setAvatarEditorFile(null);
        setAvatarEditorSource(null);
        setAvatarEditorImageSize(null);
        setAvatarEditorTransform(DEFAULT_AVATAR_TRANSFORM);
        avatarEditorDragRef.current = null;
        if (avatarInputRef.current) {
            avatarInputRef.current.value = '';
        }
    };

    const commitAvatarCrop = async () => {
        if (!avatarEditorSource || !avatarEditorFile) return;

        setAvatarEditorBusy(true);
        try {
            const croppedFile = await cropAvatarFile(
                avatarEditorSource,
                avatarEditorFile.name,
                avatarEditorTransform,
                avatarEditorImageSize,
            );
            closeAvatarEditor();
            setAvatarTransform(DEFAULT_AVATAR_TRANSFORM);
            saveAvatarTransform(user.email || 'guest', DEFAULT_SAVED_AVATAR_TRANSFORM);
            setAvatarTransformDirty(false);
            await uploadAvatarFile(croppedFile);
        } catch {
            setAvatarEditorBusy(false);
            showToast('Failed to process avatar crop.', 'error');
        }
    };

    const handleSaveAvatarTransform = () => {
        saveAvatarTransform(user.email || 'guest', clampTransform(avatarTransform));
        setAvatarTransformDirty(false);
        showToast('Photo position saved.');
    };

    const handleProfileSave = async (event: React.FormEvent) => {
        event.preventDefault();
        setProfileBusy(true);
        setProfileErrors({});
        try {
            const response = await fetchWithApiAuth('/api/profile', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify(profileData),
            });
            if (!response) {
                showToast('Your account session needs to be refreshed. Please sign in again.', 'error');
                return;
            }

            if (!response.ok) {
                const payload = await response.json().catch(() => ({}));
                if (payload.errors) {
                    setProfileErrors(payload.errors);
                } else {
                    showToast(payload.message || 'Failed to save profile.', 'error');
                }
                return;
            }

            const payload = await response.json();
            const nextAvatarCandidates = buildAvatarCandidates(payload?.data?.avatar_url || user.avatarUrl);
            showToast('Profile saved successfully.');
            const nextName = payload?.data?.name ?? user.name;
            const nextEmail = payload?.data?.email ?? user.email;
            const nextBirthDate = payload?.data?.birth_date ?? user.birth_date ?? '';
            const nextAvatarUrl = nextAvatarCandidates[0] || user.avatarUrl;
            setUser(prev => ({
                ...prev,
                name: nextName,
                email: nextEmail,
                birth_date: nextBirthDate,
                email_verified_at: payload?.data?.email_verified_at ?? prev.email_verified_at,
                avatarUrl: nextAvatarUrl,
                avatarCandidates: nextAvatarCandidates.length > 0 ? nextAvatarCandidates : prev.avatarCandidates,
            }));
            setProfileData({
                name: nextName,
                email: nextEmail,
                birth_date: nextBirthDate,
            });
            setAppAuthUser({
                name: nextName,
                email: nextEmail,
                avatarUrl: nextAvatarUrl,
            });
        } catch {
            showToast('A system issue occurred.', 'error');
        } finally {
            setProfileBusy(false);
        }
    };

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordBusy(true);
        setPasswordErrors({});
        try {
            const response = await fetchWithApiAuth('/api/profile/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    current_password: passwordData.current,
                    password: passwordData.new,
                    password_confirmation: passwordData.confirm,
                }),
            });
            if (!response) {
                showToast('Your account session needs to be refreshed. Please sign in again.', 'error');
                return;
            }

            if (response.ok) {
                setPasswordData({ current: '', new: '', confirm: '' });
                showToast('Password updated successfully.');
            } else {
                const payload = await response.json().catch(() => ({}));
                if (payload.errors) {
                    setPasswordErrors(payload.errors);
                } else {
                    showToast(payload.message || 'Failed to update password.', 'error');
                }
            }
        } catch {
            showToast('A system issue occurred.', 'error');
        } finally {
            setPasswordBusy(false);
        }
    };

    const handleTwoFactorSetup = async () => {
        if (!twoFactorPassword) return;

        setTwoFactorBusy(true);
        setTwoFactorError(null);
        try {
            const response = await fetchWithApiAuth('/api/profile/two-factor/setup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ current_password: twoFactorPassword }),
            });
            if (!response) {
                setTwoFactorError('Your account session needs to be refreshed. Please sign in again.');
                return;
            }

            if (response.ok) {
                const payload = await response.json();
                setTwoFactorSetupData(payload);
                setTwoFactorStep('setup');
            } else {
                const error = await response.json().catch(() => ({}));
                setTwoFactorError(
                    response.status === 401
                        ? 'Your account session needs to be refreshed. Please sign in again.'
                        : error?.errors?.current_password?.[0] || error.message || 'Invalid password.'
                );
            }
        } catch {
            setTwoFactorError('A system issue occurred.');
        } finally {
            setTwoFactorBusy(false);
        }
    };

    const handleTwoFactorConfirm = async () => {
        if (!twoFactorCode) return;

        setTwoFactorBusy(true);
        setTwoFactorError(null);
        try {
            const response = await fetchWithApiAuth('/api/profile/two-factor/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ 
                    current_password: twoFactorPassword,
                    code: twoFactorCode 
                }),
            });
            if (!response) {
                setTwoFactorError('Your account session needs to be refreshed. Please sign in again.');
                return;
            }

            if (response.ok) {
                setTwoFactor({ enabled: true, recoveryCodesRemaining: 8 });
                setTwoFactorStep('idle');
                setTwoFactorSetupData(null);
                setTwoFactorPassword('');
                setTwoFactorCode('');
                showToast('2FA enabled successfully.');
            } else {
                const error = await response.json().catch(() => ({}));
                setTwoFactorError(
                    response.status === 401
                        ? 'Your account session needs to be refreshed. Please sign in again.'
                        : error?.errors?.code?.[0] || error?.errors?.current_password?.[0] || error.message || 'Invalid OTP code.'
                );
            }
        } catch {
            setTwoFactorError('A system issue occurred.');
        } finally {
            setTwoFactorBusy(false);
        }
    };

    const handleTwoFactorDisable = async () => {
        if (!twoFactorCode) return;

        setTwoFactorBusy(true);
        try {
            const response = await fetchWithApiAuth('/api/profile/two-factor', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ 
                    current_password: twoFactorPassword,
                    code: twoFactorCode 
                }),
            });
            if (!response) {
                setTwoFactorError('Your account session needs to be refreshed. Please sign in again.');
                return;
            }

            if (response.ok) {
                setTwoFactor({ enabled: false, recoveryCodesRemaining: 0 });
                setTwoFactorStep('idle');
                setTwoFactorPassword('');
                setTwoFactorCode('');
                showToast('2FA disabled.');
            } else {
                const error = await response.json().catch(() => ({}));
                setTwoFactorError(
                    response.status === 401
                        ? 'Your account session needs to be refreshed. Please sign in again.'
                        : error?.errors?.code?.[0] || error?.errors?.current_password?.[0] || error.message || 'Invalid code.'
                );
            }
        } catch {
            setTwoFactorError('Failed to disable 2FA.');
        } finally {
            setTwoFactorBusy(false);
        }
    };

    const handleRegenerateCodes = async () => {
        if (!twoFactorPassword || !twoFactorCode) return;

        setTwoFactorBusy(true);
        setTwoFactorError(null);
        try {
            const response = await fetchWithApiAuth('/api/profile/two-factor/recovery-codes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ 
                    current_password: twoFactorPassword,
                    code: twoFactorCode 
                }),
            });
            if (!response) {
                setTwoFactorError('Your account session needs to be refreshed. Please sign in again.');
                return;
            }

            if (response.ok) {
                const payload = await response.json();
                setNewRecoveryCodes(payload.recoveryCodes);
                setTwoFactorStep('idle');
                setTwoFactorPassword('');
                setTwoFactorCode('');
                showToast('New recovery codes generated.');
            } else {
                const error = await response.json().catch(() => ({}));
                setTwoFactorError(
                    response.status === 401
                        ? 'Your account session needs to be refreshed. Please sign in again.'
                        : error?.errors?.code?.[0] || error?.errors?.current_password?.[0] || error.message || 'Failed to reset codes.'
                );
            }
        } catch {
            setTwoFactorError('A system issue occurred.');
        } finally {
            setTwoFactorBusy(false);
        }
    };

    const handleDeleteAccount = async () => {
        const password = window.prompt('PERMANENT ACCOUNT DELETION\n\nThis action cannot be undone!\nEnter your password to continue:');
        if (!password) return;

        setDeleteBusy(true);
        try {
            const response = await fetchWithApiAuth('/api/profile', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({ password }), // Using method spooling proxy logic for current_password mapping if required by backend.
            });
            if (!response) {
                showToast('Your account session needs to be refreshed. Please sign in again.', 'error');
                return;
            }
            if (response.ok) {
                logout(); // Initiates redirect
            } else {
                const error = await response.json().catch(() => ({}));
                showToast(error?.errors?.password?.[0] || error?.message || 'Wrong password or process failed.', 'error');
            }
        } catch { 
            showToast('A system issue occurred. Failed to reach server.', 'error');
        } finally {
            setDeleteBusy(false);
        }
    };

    const firstName = user.name.split(' ')[0];
    const canAccessMainAppsKpi = user.is_admin && user.email.trim().toLowerCase() === 'engel.willem@gmail.com';
    const openSection = (sectionId: string) => {
        if (typeof document === 'undefined') return;
        const target = document.getElementById(sectionId);
        if (!target) return;
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (loading) {
        return (
            <MobileAppLayout title="Profile" activeNavId="profile" backHref="/renungan">
                <div className="mx-auto max-w-[640px] px-4 py-10">
                    <div className="rounded-[2rem] border border-border/50 bg-surface/70 p-8 flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-brand" />
                        <p className="text-sm font-medium text-foreground/80">Restoring account session...</p>
                    </div>
                </div>
            </MobileAppLayout>
        );
    }

    if (!isAuthenticated) {
        return (
            <MobileAppLayout title="Profile" activeNavId="profile" backHref="/renungan">
                <div className="mx-auto max-w-[640px] px-4 py-10">
                    <div className="rounded-[2rem] border border-border/50 bg-surface/70 p-8 flex items-center gap-3">
                        <Loader2 className="h-5 w-5 animate-spin text-brand" />
                        <p className="text-sm font-medium text-foreground/80">Mengalihkan ke login...</p>
                    </div>
                </div>
            </MobileAppLayout>
        );
    }

    return (
        <MobileAppLayout
            title="Profile"
            activeNavId="profile"
            backHref="/renungan"
            rightAction={
                <Popover>
                    <PopoverTrigger asChild>
                        <button className="h-12 w-12 flex items-center justify-center rounded-full bg-surface shadow-soft hover:bg-surface-elevated transition-all ring-1 ring-black/[0.03]">
                            <Grid className="h-5 w-5 text-muted-foreground" />
                        </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-56 p-2 bg-surface rounded-[24px] shadow-soft border border-border/50">
                        <button
                            onClick={logout}
                            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-elevated transition-colors text-rose-500"
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="text-sm font-bold">Log out</span>
                        </button>
                    </PopoverContent>
                </Popover>
            }
        >
            <div className="mx-auto max-w-[640px] px-4 py-4 space-y-6">
                <div className="relative overflow-hidden rounded-[2.5rem] bg-surface border border-border/50 p-8 shadow-soft group/profile-card">
                    <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-brand/5 blur-3xl" />
                    
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="relative">
                            <div className="absolute -inset-2 rounded-[2.2rem] bg-brand/10 opacity-40 blur-lg" />
                            <div className="relative h-[7.5rem] w-[7.5rem] rounded-[2.2rem] bg-surface-muted flex items-center justify-center overflow-hidden ring-1 ring-white/60 shadow-sm border border-border/60">
                                {submittingAvatar && (
                                    <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center z-20">
                                        <Loader2 className="h-6 w-6 text-brand animate-spin" />
                                    </div>
                                )}
                                {currentAvatarSrc ? (
                                    <img
                                        src={currentAvatarSrc}
                                        alt={user.name}
                                        className="h-full w-full object-cover transition-transform duration-200"
                                        style={{
                                            transform: `translate(${avatarTransform.x}px, ${avatarTransform.y}px) scale(${avatarTransform.scale})`,
                                            transformOrigin: 'center center',
                                        }}
                                        onError={() =>
                                            setUser((prev) => {
                                                const [, ...rest] = prev.avatarCandidates;
                                                return {
                                                    ...prev,
                                                    avatarCandidates: rest,
                                                    avatarUrl: rest[0] || null,
                                                };
                                            })
                                        }
                                    />
                                ) : (
                                    <div className="flex h-full w-full flex-col items-center justify-center bg-surface-muted">
                                        <span className="text-3xl font-bold text-foreground/50 tracking-tight">
                                            {getInitials(user.name)}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <button 
                                onClick={() => avatarInputRef.current?.click()}
                                className="absolute -bottom-1 -right-1 h-11 w-11 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg ring-4 ring-background transform transition-all hover:scale-105 active:scale-95"
                            >
                                <Camera className="h-4 w-4" />
                            </button>
                            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleAvatarSelection(e.target.files[0])} />
                        </div>

                        {currentAvatarSrc && (
                            <div className="mt-5 w-full max-w-[340px] rounded-[2rem] border border-border/50 bg-surface-muted/40 text-left overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setAvatarControlsOpen((prev) => !prev)}
                                    className="flex w-full items-center justify-between gap-3 px-4 py-4"
                                >
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">
                                        Photo Position
                                    </p>
                                    <ChevronRight
                                        className={cn(
                                            "h-4 w-4 text-muted-foreground transition-transform",
                                            avatarControlsOpen ? "rotate-90" : "rotate-0"
                                        )}
                                    />
                                </button>

                                {avatarControlsOpen && (
                                    <div className="border-t border-border/50 p-4">
                                        <div className="grid gap-4 sm:grid-cols-[1fr_1.15fr]">
                                            <div className="rounded-[1.5rem] border border-border/50 bg-background/70 p-3">
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div />
                                                    <button
                                                        type="button"
                                                        onClick={() => updateAvatarTransform((prev) => ({ ...prev, y: prev.y - 6 }))}
                                                        className="rounded-xl border border-border/60 bg-surface py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground/80 hover:bg-surface-elevated"
                                                    >
                                                        Up
                                                    </button>
                                                    <div />
                                                    <button
                                                        type="button"
                                                        onClick={() => updateAvatarTransform((prev) => ({ ...prev, x: prev.x - 6 }))}
                                                        className="rounded-xl border border-border/60 bg-surface py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground/80 hover:bg-surface-elevated"
                                                    >
                                                        Left
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setAvatarTransform(DEFAULT_AVATAR_TRANSFORM)}
                                                        className="rounded-xl border border-border/60 bg-surface py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground/80 hover:bg-surface-elevated"
                                                    >
                                                        Reset
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => updateAvatarTransform((prev) => ({ ...prev, x: prev.x + 6 }))}
                                                        className="rounded-xl border border-border/60 bg-surface py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground/80 hover:bg-surface-elevated"
                                                    >
                                                        Right
                                                    </button>
                                                    <div />
                                                    <button
                                                        type="button"
                                                        onClick={() => updateAvatarTransform((prev) => ({ ...prev, y: prev.y + 6 }))}
                                                        className="rounded-xl border border-border/60 bg-surface py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-foreground/80 hover:bg-surface-elevated"
                                                    >
                                                        Down
                                                    </button>
                                                    <div />
                                                </div>
                                            </div>

                                            <div className="rounded-[1.5rem] border border-border/50 bg-background/70 p-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground/70">Zoom</p>
                                                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-brand">
                                                        {Math.round(avatarTransform.scale * 100)}%
                                                    </span>
                                                </div>
                                                <div className="mt-4 flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => updateAvatarTransform((prev) => ({ ...prev, scale: prev.scale - 0.04 }))}
                                                        className="h-10 w-10 rounded-xl border border-border/60 bg-surface text-sm font-black text-foreground/80 hover:bg-surface-elevated"
                                                    >
                                                        -
                                                    </button>
                                                    <Slider
                                                        value={[avatarTransform.scale]}
                                                        min={AVATAR_TRANSFORM_LIMIT.minScale}
                                                        max={AVATAR_TRANSFORM_LIMIT.maxScale}
                                                        step={0.01}
                                                        onValueChange={([value]) => setAvatarTransform((prev) => clampTransform({ ...prev, scale: value }))}
                                                        className="flex-1"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => updateAvatarTransform((prev) => ({ ...prev, scale: prev.scale + 0.04 }))}
                                                        className="h-10 w-10 rounded-xl border border-border/60 bg-surface text-sm font-black text-foreground/80 hover:bg-surface-elevated"
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between gap-3">
                                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                                                {avatarTransformDirty ? 'Changes not saved yet' : 'Photo position saved'}
                                            </p>
                                            <Button
                                                type="button"
                                                onClick={handleSaveAvatarTransform}
                                                disabled={!avatarTransformDirty}
                                                className="rounded-full px-5 text-[10px] font-black uppercase tracking-[0.16em]"
                                            >
                                                Save
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="mt-8 space-y-1">
                            <h2 className="text-2xl font-bold tracking-tight text-foreground leading-tight">{user.name}</h2>
                            <p className="text-muted-foreground font-medium tracking-wide text-sm">{user.email}</p>
                        </div>

                        <div className="mt-6">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] border bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Verified</span>
                            </div>
                            {user.is_admin ? (
                                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-brand">
                                    <ShieldCheck className="h-3.5 w-3.5" />
                                    <span>Admin Access</span>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    {user.is_admin && opsGateway && (
                        <AccordionCard title="Gateway Operasional" className="border-brand/20 bg-brand/5">
                            <div className="space-y-4 pt-2">
                                <div className="rounded-3xl border border-border/60 bg-surface-muted p-5 backdrop-blur-md">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                                        <div>
                                            <p className="text-sm font-black text-foreground">Welcome back, {firstName}.</p>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">Control Center Access</p>
                                        </div>
                                        <div className={cn(
                                            "px-4 py-2 rounded-2xl text-[10px] font-black border uppercase tracking-widest text-center shadow-soft",
                                            opsGateway.status === 'High Risk' ? "bg-rose-500/10 text-rose-500 border-rose-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                        )}>
                                            Status: {opsGateway.status}
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-surface border border-border/50 mb-6">
                                        <p className="text-[10px] font-black text-brand uppercase tracking-[0.2em] mb-2 px-1">Aksi Prioritas</p>
                                        <p className="text-sm text-muted-foreground leading-relaxed font-medium">{opsGateway.topAction}</p>
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <Button onClick={() => router.push('/settings/ops-visibility')} className="w-full h-12 bg-foreground text-background font-black text-[11px] uppercase tracking-widest rounded-2xl">Open Ops Triage</Button>
                                        {canAccessMainAppsKpi ? (
                                            <Button variant="outline" onClick={() => router.push('/profile/kpi')} className="w-full h-12 border-border/50 bg-surface-muted text-foreground font-black text-[11px] uppercase tracking-widest rounded-2xl">KPI Dashboard</Button>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        </AccordionCard>
                    )}

                    <div id="profile-journey">
                    <AccordionCard title="Your Spiritual Journey">
                        <div className="pt-2 space-y-4">
                            <button 
                                onClick={() => router.push('/versehub/id/my-spiritual-journey')} 
                                className="flex items-center justify-between w-full p-6 rounded-[28px] bg-surface border border-border/50 hover:bg-surface-elevated transition-all group shadow-soft"
                            >
                                <div className="text-left space-y-1">
                                    <p className="text-lg font-black text-foreground tracking-tight">Growth Monitoring</p>
                                    <p className="text-[11px] text-brand/80 font-bold uppercase tracking-widest leading-relaxed">View your full trails, memorization, and inner notes</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    {journeyBadge > 0 && (
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
                                            <Sparkles className="h-3 w-3 text-rose-500" />
                                            <span className="text-[10px] font-black text-rose-500">{journeyBadge}</span>
                                        </div>
                                    )}
                                    <div className="h-10 w-10 rounded-2xl bg-surface-muted flex items-center justify-center group-hover:bg-brand group-hover:text-brand-foreground transition-all">
                                        <ChevronRight className="h-5 w-5" />
                                    </div>
                                </div>
                            </button>
                            
                            <p className="text-[10px] px-4 font-medium text-muted-foreground leading-relaxed italic">
                                * Journey page provides deep visualization of your progress and Bible interaction history.
                            </p>
                        </div>
                    </AccordionCard>
                    </div>

                    <div id="profile-spiritual-highlights">
                    <AccordionCard title="Spiritual Highlights">
                        <div className="pt-2">
                            {spiritualHighlights?.has_data ? (
                                <div className="rounded-[24px] border border-border/60 bg-surface px-5 py-5 shadow-soft">
                                    <p className="text-[15px] leading-7 text-foreground/85">
                                        {spiritualHighlights.summary}
                                    </p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className="rounded-full border border-sky-200/70 bg-sky-50/70 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-sky-700/90">
                                            {spiritualHighlights.window_days ?? 7} days recent
                                        </span>
                                        <span className="rounded-full border border-border/60 bg-background px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-foreground/60">
                                            {spiritualHighlights.session_count ?? 0} reflection sessions
                                        </span>
                                        {spiritualHighlights.top_verse_reference ? (
                                            <span className="rounded-full border border-emerald-200/70 bg-emerald-50/70 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-emerald-700/90">
                                                Verse: {spiritualHighlights.top_verse_reference}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-[24px] border border-border/60 bg-surface px-5 py-5 shadow-soft">
                                    <p className="text-[14px] leading-7 text-muted-foreground">
                                        There is not enough data from the last 7 days yet. Keep reflecting and your spiritual highlights will appear here gradually.
                                    </p>
                                </div>
                            )}
                        </div>
                    </AccordionCard>
                    </div>

                    {canAccessMainAppsKpi ? (
                    <div id="profile-kpi-dashboard">
                    <AccordionCard title="Main Apps KPI Dashboard">
                        <div className="pt-2 space-y-4">
                            <div className="rounded-[24px] border border-border/60 bg-surface px-5 py-5 shadow-soft">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-lg font-black text-foreground tracking-tight">Your Main Apps KPI</p>
                                        <p className="mt-1 text-[11px] text-muted-foreground font-bold uppercase tracking-widest leading-relaxed">
                                            Track spiritual activity, engagement, and account readiness in one dashboard
                                        </p>
                                    </div>
                                    <div className="h-10 w-10 rounded-2xl bg-surface-muted flex items-center justify-center text-brand">
                                        <BarChart3 className="h-5 w-5" />
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-2">
                                    <span className="rounded-full border border-border/60 bg-background px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-foreground/70">
                                        Journey: {journeyBadge}
                                    </span>
                                    <span className="rounded-full border border-sky-200/70 bg-sky-50/70 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-sky-700/90">
                                        Reflection: {spiritualHighlights?.session_count ?? 0}
                                    </span>
                                </div>

                                <Button
                                    onClick={() => router.push('/profile/kpi')}
                                    className="mt-5 w-full h-12 bg-foreground text-background font-black text-[11px] uppercase tracking-widest rounded-2xl"
                                >
                                    Open KPI Dashboard
                                </Button>
                            </div>
                        </div>
                    </AccordionCard>
                    </div>
                    ) : null}

                    <div id="profile-personal">
                    <AccordionCard title="Personal Information">
                        <form className="space-y-6 pt-2" onSubmit={handleProfileSave}>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-foreground/70 uppercase tracking-[0.25em] ml-2">Full Name</label>
                                <Input value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} className="h-13 bg-surface-muted border-border/50 rounded-2xl text-[16px] font-bold px-5 text-foreground" disabled={profileBusy} />
                                {profileErrors.name && profileErrors.name.map((err, i) => <p key={`name-${i}`} className="text-rose-400 text-[10px] font-bold uppercase ml-2">{err}</p>)}
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-foreground/70 uppercase tracking-[0.25em] ml-2">Email Address</label>
                                <Input type="email" value={profileData.email} onChange={(e) => setProfileData({ ...profileData, email: e.target.value })} className="h-13 bg-surface-muted border-border/50 rounded-2xl text-[16px] font-bold px-5 text-foreground" disabled={profileBusy} />
                                {profileErrors.email && profileErrors.email.map((err, i) => <p key={`email-${i}`} className="text-rose-400 text-[10px] font-bold uppercase ml-2">{err}</p>)}
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-foreground/70 uppercase tracking-[0.25em] ml-2">Birth Date</label>
                                <Input type="date" value={profileData.birth_date} onChange={(e) => setProfileData({ ...profileData, birth_date: e.target.value })} className="h-13 bg-surface-muted border-border/50 rounded-2xl text-[16px] font-bold px-5 text-foreground" disabled={profileBusy} />
                                <p className="text-[10px] ml-2 text-muted-foreground">Dipakai untuk reminder dan ucapan ulang tahun via WhatsApp.</p>
                                {profileErrors.birth_date && profileErrors.birth_date.map((err, i) => <p key={`birth-date-${i}`} className="text-rose-400 text-[10px] font-bold uppercase ml-2">{err}</p>)}
                            </div>
                            <div className="pt-2">
                                <PrimaryCTA 
                                    label={profileBusy ? 'Saving...' : 'Save Changes'} 
                                    icon={profileBusy ? <Loader2 className="animate-spin h-4 w-4" /> : undefined}
                                    size="md" 
                                    disabled={profileBusy} 
                                />
                            </div>
                        </form>
                    </AccordionCard>
                    </div>

                    <div id="profile-notifications">
                    <AccordionCard title="Notifications & WhatsApp">
                        <div className="space-y-6 pt-2">
                            <form className="space-y-4" onSubmit={handleNotificationPreferenceSave}>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <label className="flex items-center gap-2 rounded-xl border border-border/50 bg-surface-muted px-3 py-2 text-xs font-bold text-foreground">
                                        <input type="checkbox" checked={notificationPrefs.email} onChange={(e) => setNotificationPrefs((prev) => ({ ...prev, email: e.target.checked }))} disabled={notificationBusy} />
                                        Email
                                    </label>
                                    <label className="flex items-center gap-2 rounded-xl border border-border/50 bg-surface-muted px-3 py-2 text-xs font-bold text-foreground">
                                        <input type="checkbox" checked={notificationPrefs.in_app} onChange={(e) => setNotificationPrefs((prev) => ({ ...prev, in_app: e.target.checked }))} disabled={notificationBusy} />
                                        In-App
                                    </label>
                                    <label className="flex items-center gap-2 rounded-xl border border-border/50 bg-surface-muted px-3 py-2 text-xs font-bold text-foreground">
                                        <input type="checkbox" checked={notificationPrefs.whatsapp} onChange={(e) => setNotificationPrefs((prev) => ({ ...prev, whatsapp: e.target.checked }))} disabled={notificationBusy} />
                                        WhatsApp
                                    </label>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3">
                                    <Input value={notificationPrefs.timezone} onChange={(e) => setNotificationPrefs((prev) => ({ ...prev, timezone: e.target.value }))} placeholder="Timezone (contoh: Asia/Makassar)" disabled={notificationBusy} />
                                    <Input type="time" value={notificationPrefs.quiet_hours_start} onChange={(e) => setNotificationPrefs((prev) => ({ ...prev, quiet_hours_start: e.target.value }))} disabled={notificationBusy} />
                                    <Input type="time" value={notificationPrefs.quiet_hours_end} onChange={(e) => setNotificationPrefs((prev) => ({ ...prev, quiet_hours_end: e.target.value }))} disabled={notificationBusy} />
                                </div>

                                <div className="rounded-xl border border-border/50 bg-surface-muted p-3 space-y-3">
                                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Routine Reminders</p>
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        <label className="flex items-center gap-2 rounded-xl border border-border/50 bg-background px-3 py-2 text-xs font-bold text-foreground">
                                            <input type="checkbox" checked={notificationPrefs.reminder_worship_enabled} onChange={(e) => setNotificationPrefs((prev) => ({ ...prev, reminder_worship_enabled: e.target.checked }))} disabled={notificationBusy} />
                                            Worship
                                        </label>
                                        <label className="flex items-center gap-2 rounded-xl border border-border/50 bg-background px-3 py-2 text-xs font-bold text-foreground">
                                            <input type="checkbox" checked={notificationPrefs.reminder_class_enabled} onChange={(e) => setNotificationPrefs((prev) => ({ ...prev, reminder_class_enabled: e.target.checked }))} disabled={notificationBusy} />
                                            Class
                                        </label>
                                        <label className="flex items-center gap-2 rounded-xl border border-border/50 bg-background px-3 py-2 text-xs font-bold text-foreground">
                                            <input type="checkbox" checked={notificationPrefs.reminder_visit_enabled} onChange={(e) => setNotificationPrefs((prev) => ({ ...prev, reminder_visit_enabled: e.target.checked }))} disabled={notificationBusy} />
                                            Visit
                                        </label>
                                    </div>
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        <Input type="time" value={notificationPrefs.reminder_worship_time} onChange={(e) => setNotificationPrefs((prev) => ({ ...prev, reminder_worship_time: e.target.value }))} disabled={notificationBusy} />
                                        <Input type="time" value={notificationPrefs.reminder_class_time} onChange={(e) => setNotificationPrefs((prev) => ({ ...prev, reminder_class_time: e.target.value }))} disabled={notificationBusy} />
                                        <Input type="time" value={notificationPrefs.reminder_visit_time} onChange={(e) => setNotificationPrefs((prev) => ({ ...prev, reminder_visit_time: e.target.value }))} disabled={notificationBusy} />
                                    </div>
                                </div>

                                <Button type="submit" disabled={notificationBusy} className="w-full bg-surface-muted hover:bg-surface-elevated text-foreground border border-border/50 h-11 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-soft transition-all active:scale-[0.98]">
                                    {notificationBusy ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : 'Save Notification Preferences'}
                                </Button>
                            </form>

                            <div className="rounded-2xl border border-border/50 bg-surface p-4 space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">WhatsApp Verification</p>
                                <p className="text-xs font-medium text-foreground/80">
                                    Status: {whatsappVerification.verified ? 'Verified' : 'Not verified'}
                                    {whatsappVerification.verified_at ? ` (${new Date(whatsappVerification.verified_at).toLocaleString()})` : ''}
                                </p>

                                <Input value={whatsappPhone} onChange={(e) => setWhatsappPhone(e.target.value)} placeholder="WhatsApp number (example: 0812xxxxxx)" disabled={whatsappBusy} />
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <Button type="button" onClick={handleRequestWhatsappOtp} disabled={whatsappBusy || !whatsappPhone.trim()} className="h-11 rounded-xl font-black text-[11px] uppercase tracking-widest">
                                        {whatsappBusy ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : 'Request OTP'}
                                    </Button>
                                    <Input value={whatsappCode} onChange={(e) => setWhatsappCode(e.target.value)} placeholder="Enter OTP" disabled={whatsappBusy} />
                                </div>
                                <Button type="button" variant="outline" onClick={handleVerifyWhatsappOtp} disabled={whatsappBusy || !whatsappPhone.trim() || !whatsappCode.trim()} className="w-full h-11 rounded-xl font-black text-[11px] uppercase tracking-widest">
                                    Verify OTP
                                </Button>
                            </div>
                        </div>
                    </AccordionCard>
                    </div>

                    <div id="profile-password">
                    <AccordionCard title="Security & Password">
                        <form className="space-y-6 pt-2" onSubmit={handlePasswordUpdate}>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-foreground/70 uppercase tracking-[0.25em] ml-2">Current Password</label>
                                <Input type="password" value={passwordData.current} onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })} className="h-13 bg-surface-muted border-border/50 rounded-2xl px-5 font-bold text-foreground" disabled={passwordBusy} />
                                {passwordErrors.current_password && passwordErrors.current_password.map((err, i) => <p key={`curr-${i}`} className="text-rose-400 text-[10px] font-bold uppercase ml-2">{err}</p>)}
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-foreground/70 uppercase tracking-[0.25em] ml-2">New Password</label>
                                    <Input type="password" value={passwordData.new} onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })} className="h-13 bg-surface-muted border-border/50 rounded-2xl px-5 font-bold text-foreground" disabled={passwordBusy} />
                                    {passwordErrors.password && passwordErrors.password.map((err, i) => <p key={`new-${i}`} className="text-rose-400 text-[10px] font-bold uppercase ml-2">{err}</p>)}
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-foreground/70 uppercase tracking-[0.25em] ml-2">Konfirmasi</label>
                                    <Input type="password" value={passwordData.confirm} onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })} className="h-13 bg-surface-muted border-border/50 rounded-2xl px-5 font-bold text-foreground" disabled={passwordBusy} />
                                </div>
                            </div>
                            <Button type="submit" disabled={passwordBusy} className="w-full bg-surface-muted hover:bg-surface-elevated text-foreground border border-border/50 h-13 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-soft transition-all active:scale-[0.98]">
                                {passwordBusy ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : 'Update Password'}
                            </Button>
                        </form>
                    </AccordionCard>
                    </div>

                    <div id="profile-2fa">
                    <AccordionCard title="Two-Factor Authentication">
                        <div className="space-y-6 pt-2">
                            <div className="p-5 rounded-[28px] bg-surface border border-border/50 shadow-soft backdrop-blur-md flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center shadow-inner", twoFactor.enabled ? "bg-emerald-500/10 text-emerald-500" : "bg-brand/10 text-brand")}>
                                        <ShieldCheck className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-base font-black text-foreground tracking-tight">2FA Status</p>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                                            {twoFactor.enabled ? `${twoFactor.recoveryCodesRemaining} Codes Left` : 'Proteksi Tambahan'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setTwoFactorError(null);
                                        setTwoFactorStep(twoFactor.enabled ? 'disable' : 'password');
                                    }}
                                    className={cn(
                                        "h-10 px-6 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all",
                                        twoFactor.enabled ? "bg-rose-500/10 text-rose-500 border border-rose-500/20" : "bg-brand text-brand-foreground shadow-sm"
                                    )}
                                >
                                    {twoFactor.enabled ? 'Disable' : 'Enable'}
                                </button>
                            </div>

                            {twoFactorStep !== 'idle' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 rounded-[28px] bg-surface-muted border border-border/50 space-y-5">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[11px] font-black text-brand uppercase tracking-[0.2em]">
                                            {twoFactorStep === 'disable'
                                                ? 'Disable Security'
                                                : twoFactorStep === 'recovery'
                                                    ? 'New Recovery Codes'
                                                    : '2FA Setup'}
                                        </h4>
                                        <button onClick={() => setTwoFactorStep('idle')} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
                                    </div>

                                    {twoFactorStep === 'password' && (
                                        <div className="space-y-4">
                                            <p className="text-xs text-muted-foreground leading-relaxed font-medium">Step 1: Verify your identity to create a new secret key.</p>
                                            <Input type="password" value={twoFactorPassword} onChange={(e) => setTwoFactorPassword(e.target.value)} placeholder="Enter your password" className="bg-surface border-border/50 rounded-xl text-foreground" disabled={twoFactorBusy} />
                                            <Button onClick={handleTwoFactorSetup} disabled={twoFactorBusy || !twoFactorPassword} className="w-full h-11 bg-foreground text-background font-bold text-xs rounded-xl">
                                                {twoFactorBusy ? <Loader2 className="animate-spin h-4 w-4" /> : 'Generate QR Code'}
                                            </Button>
                                        </div>
                                    )}

                                    {twoFactorStep === 'setup' && twoFactorSetupData && (
                                        <div className="space-y-6">
                                            <div className="flex flex-col items-center gap-4 text-center">
                                                <div className="p-3 bg-white rounded-2xl shadow-soft ring-4 ring-black/5">
                                                    <img src={twoFactorSetupData.qrCodeDataUri} alt="QR Code" className="w-40 h-40" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Or Enter Manually</p>
                                                    <code className="text-xs font-mono bg-surface border border-border/50 px-3 py-1 rounded-lg text-brand select-all">{twoFactorSetupData.secret}</code>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <p className="text-[10px] font-bold text-brand uppercase tracking-widest text-center">Save Recovery Codes (Important!)</p>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {twoFactorSetupData.recoveryCodes.map(code => (
                                                        <code key={code} className="text-[9px] font-mono bg-surface p-2 rounded-lg text-muted-foreground border border-border/50">{code}</code>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-3 pt-2">
                                                <Input value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} placeholder="Enter 6-digit OTP" className="bg-surface border-border/50 rounded-xl text-center tracking-[0.5em] font-black h-12 text-foreground" maxLength={6} disabled={twoFactorBusy} />
                                                <Button onClick={handleTwoFactorConfirm} disabled={twoFactorBusy || twoFactorCode.length < 6} className="w-full h-12 bg-brand text-brand-foreground font-black text-[11px] uppercase tracking-widest rounded-xl">
                                                    {twoFactorBusy ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : 'Enable Now'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {twoFactorStep === 'disable' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
                                                <AlertTriangle size={16} className="shrink-0" />
                                                <p className="text-[10px] font-bold uppercase tracking-wider leading-relaxed">Disabling 2FA will significantly reduce your account security.</p>
                                            </div>
                                            <Input type="password" value={twoFactorPassword} onChange={(e) => setTwoFactorPassword(e.target.value)} placeholder="Current password" className="bg-surface border-border/50 rounded-xl text-foreground" disabled={twoFactorBusy} />
                                            <Input value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} placeholder="OTP / Recovery Code" className="bg-surface border-border/50 rounded-xl text-foreground" disabled={twoFactorBusy} />
                                            <Button onClick={handleTwoFactorDisable} disabled={twoFactorBusy || !twoFactorPassword || !twoFactorCode} className="w-full h-11 bg-rose-500 text-white font-bold text-xs rounded-xl">
                                                {twoFactorBusy ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : 'Confirm Disable'}
                                            </Button>
                                        </div>
                                    )}

                                    {twoFactorStep === 'recovery' && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-3 rounded-xl bg-brand/10 border border-brand/20 text-brand">
                                                <RefreshCw size={16} className="shrink-0" />
                                                <p className="text-[10px] font-bold uppercase tracking-wider leading-relaxed">Enter your current password and active OTP or recovery code to generate a new recovery code pack.</p>
                                            </div>
                                            <Input type="password" value={twoFactorPassword} onChange={(e) => setTwoFactorPassword(e.target.value)} placeholder="Current password" className="bg-surface border-border/50 rounded-xl text-foreground" disabled={twoFactorBusy} />
                                            <Input value={twoFactorCode} onChange={(e) => setTwoFactorCode(e.target.value)} placeholder="OTP / Active Recovery Code" className="bg-surface border-border/50 rounded-xl text-foreground" disabled={twoFactorBusy} />
                                            <Button onClick={handleRegenerateCodes} disabled={twoFactorBusy || !twoFactorPassword || !twoFactorCode} className="w-full h-11 bg-brand text-brand-foreground font-bold text-xs rounded-xl">
                                                {twoFactorBusy ? <Loader2 className="animate-spin h-4 w-4 mx-auto" /> : 'Generate New Recovery Codes'}
                                            </Button>
                                        </div>
                                    )}

                                    {twoFactorError && <p className="text-rose-500 text-[10px] font-black uppercase text-center">{twoFactorError}</p>}
                                </motion.div>
                            )}

                            {twoFactor.enabled && (
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] ml-2">Key Management</label>
                                    <div className="grid gap-2">
                                        <button
                                            onClick={() => {
                                                setTwoFactorError(null);
                                                setTwoFactorStep('recovery');
                                            }}
                                            className="w-full flex items-center justify-between p-4 rounded-2xl bg-surface border border-border/50 hover:bg-surface-elevated transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <RefreshCw size={16} className="text-muted-foreground group-hover:rotate-180 transition-transform duration-700" />
                                                <span className="text-xs font-bold text-foreground/80">Regenerate Recovery Codes</span>
                                            </div>
                                            <ChevronRight size={14} className="text-muted-foreground" />
                                        </button>
                                    </div>
                                    {newRecoveryCodes && (
                                        <div className="p-5 rounded-3xl bg-brand/5 border border-brand/20 animate-in zoom-in-95">
                                            <p className="text-[10px] font-black text-brand uppercase tracking-widest mb-3">Your New Recovery Codes</p>
                                            <div className="grid grid-cols-2 gap-2">
                                                {newRecoveryCodes.map(code => <code key={code} className="text-[9px] font-mono bg-surface p-2 rounded-lg text-brand/80">{code}</code>)}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </AccordionCard>
                    </div>

                    <div className="pt-12 text-center space-y-10">
                        <button 
                            onClick={handleDeleteAccount} 
                            disabled={deleteBusy}
                            className="group mx-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl border border-rose-500/10 text-rose-500 hover:text-rose-600 transition-all duration-500 disabled:opacity-50 disabled:grayscale hover:bg-rose-500/5"
                        >
                            {deleteBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 transition-transform group-hover:scale-110" />}
                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">{deleteBusy ? 'Deleting...' : 'Delete Account Permanently'}</span>
                        </button>
                        
                    </div>
                    </div>
            </div>

            <Dialog open={avatarEditorOpen} onOpenChange={(open) => (!open ? closeAvatarEditor() : null)}>
                <DialogContent className="max-w-[720px] rounded-[2rem] border-border/60 bg-background p-0 overflow-hidden">
                    <DialogHeader className="border-b border-border/50 px-6 py-5 text-left">
                        <DialogTitle className="text-xl font-black tracking-tight text-foreground">Adjust Avatar Crop</DialogTitle>
                        <DialogDescription className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            Move your photo to the area you want. This crop result will be saved as your avatar, so no automatic crop will cut important parts.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 px-6 py-6 md:grid-cols-[minmax(0,1fr)_240px]">
                        <div className="space-y-4">
                            {(() => {
                                const imageWidth = avatarEditorImageSize?.width || AVATAR_EDITOR_VIEWPORT;
                                const imageHeight = avatarEditorImageSize?.height || AVATAR_EDITOR_VIEWPORT;
                                const containScale = Math.min(
                                    AVATAR_EDITOR_VIEWPORT / imageWidth,
                                    AVATAR_EDITOR_VIEWPORT / imageHeight,
                                );
                                const previewWidth = imageWidth * containScale;
                                const previewHeight = imageHeight * containScale;

                                return (
                            <div
                                className={cn(
                                    "relative mx-auto h-[280px] w-[280px] overflow-hidden rounded-[2.5rem] border border-border/60 bg-surface shadow-soft",
                                    avatarEditorBusy ? "pointer-events-none opacity-70" : "cursor-grab active:cursor-grabbing",
                                )}
                                onPointerDown={handleAvatarEditorPointerDown}
                                onPointerMove={handleAvatarEditorPointerMove}
                                onPointerUp={handleAvatarEditorPointerUp}
                                onPointerCancel={handleAvatarEditorPointerUp}
                            >
                                <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_55%,rgba(15,23,42,0.08)_100%)]" />
                                <div className="pointer-events-none absolute inset-[18px] rounded-[2rem] border border-white/70 shadow-[inset_0_0_0_999px_rgba(255,255,255,0.05)]" />
                                {avatarEditorSource ? (
                                    <img
                                        src={avatarEditorSource}
                                        alt="Preview crop avatar"
                                        className="absolute left-1/2 top-1/2 select-none"
                                        draggable={false}
                                        style={{
                                            width: `${previewWidth}px`,
                                            height: `${previewHeight}px`,
                                            maxWidth: 'none',
                                            transform: `translate(calc(-50% + ${avatarEditorTransform.x}px), calc(-50% + ${avatarEditorTransform.y}px)) scale(${avatarEditorTransform.scale})`,
                                            transformOrigin: 'center center',
                                        }}
                                    />
                                ) : null}
                            </div>
                                );
                            })()}
                            <p className="text-center text-xs font-medium leading-relaxed text-muted-foreground">
                                The full photo is shown first. Drag or zoom only if you want to crop a specific area.
                            </p>
                        </div>

                        <div className="space-y-4 rounded-[1.75rem] border border-border/50 bg-surface-muted/40 p-4">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Zoom Crop</p>
                                <div className="mt-3 flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => updateAvatarEditorTransform((prev) => ({ ...prev, scale: prev.scale - 0.05 }))}
                                        className="h-10 w-10 rounded-xl border border-border/60 bg-background text-sm font-black text-foreground/80 hover:bg-surface"
                                        disabled={avatarEditorBusy}
                                    >
                                        -
                                    </button>
                                    <Slider
                                        value={[avatarEditorTransform.scale]}
                                        min={AVATAR_EDITOR_LIMIT.minScale}
                                        max={AVATAR_EDITOR_LIMIT.maxScale}
                                        step={0.01}
                                        onValueChange={([value]) => setAvatarEditorTransform((prev) => clampEditorTransform({ ...prev, scale: value }))}
                                        className="flex-1"
                                        disabled={avatarEditorBusy}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => updateAvatarEditorTransform((prev) => ({ ...prev, scale: prev.scale + 0.05 }))}
                                        className="h-10 w-10 rounded-xl border border-border/60 bg-background text-sm font-black text-foreground/80 hover:bg-surface"
                                        disabled={avatarEditorBusy}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/70">Precision Move</p>
                                <div className="mt-3 grid grid-cols-3 gap-2">
                                    <div />
                                    <button type="button" onClick={() => updateAvatarEditorTransform((prev) => ({ ...prev, y: prev.y - 8 }))} className="rounded-xl border border-border/60 bg-background py-2 text-[10px] font-bold uppercase tracking-[0.12em]" disabled={avatarEditorBusy}>Up</button>
                                    <div />
                                    <button type="button" onClick={() => updateAvatarEditorTransform((prev) => ({ ...prev, x: prev.x - 8 }))} className="rounded-xl border border-border/60 bg-background py-2 text-[10px] font-bold uppercase tracking-[0.12em]" disabled={avatarEditorBusy}>Left</button>
                                    <button type="button" onClick={() => setAvatarEditorTransform(DEFAULT_AVATAR_TRANSFORM)} className="rounded-xl border border-border/60 bg-background py-2 text-[10px] font-bold uppercase tracking-[0.12em]" disabled={avatarEditorBusy}>Reset</button>
                                    <button type="button" onClick={() => updateAvatarEditorTransform((prev) => ({ ...prev, x: prev.x + 8 }))} className="rounded-xl border border-border/60 bg-background py-2 text-[10px] font-bold uppercase tracking-[0.12em]" disabled={avatarEditorBusy}>Right</button>
                                    <div />
                                    <button type="button" onClick={() => updateAvatarEditorTransform((prev) => ({ ...prev, y: prev.y + 8 }))} className="rounded-xl border border-border/60 bg-background py-2 text-[10px] font-bold uppercase tracking-[0.12em]" disabled={avatarEditorBusy}>Down</button>
                                    <div />
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="border-t border-border/50 bg-background px-6 py-5">
                        <Button type="button" variant="outline" onClick={closeAvatarEditor} disabled={avatarEditorBusy} className="rounded-full">
                            Cancel
                        </Button>
                        <Button type="button" onClick={commitAvatarCrop} disabled={avatarEditorBusy || !avatarEditorSource} className="rounded-full">
                            {avatarEditorBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Save Avatar Crop
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Global Toast Parity */}
            <AnimatePresence>
                {toast && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                        className={cn(
                            "fixed bottom-28 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl flex items-center gap-3 ring-1",
                            toast.type === 'error' ? "bg-rose-500 text-white ring-rose-400" : "bg-foreground text-background ring-border/50"
                        )}
                    >
                        {toast.type === 'success' ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
                        <span>{toast.message}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </MobileAppLayout>
    );
}

