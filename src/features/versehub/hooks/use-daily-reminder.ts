"use client";

import { useState, useEffect, useCallback } from 'react';

export default function useDailyReminder() {
    const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
    const [isRegistered, setIsRegistered] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || !('Notification' in window)) return;
        setPermissionStatus(Notification.permission);
        const saved = localStorage.getItem('vh_reminder_registered');
        if (saved === 'true') setIsRegistered(true);
    }, []);

    const askPermission = useCallback(async () => {
        if (typeof window === 'undefined' || !('Notification' in window)) return false;
        
        try {
            const status = await Notification.requestPermission();
            setPermissionStatus(status);
            if (status === 'granted') {
                localStorage.setItem('vh_reminder_registered', 'true');
                setIsRegistered(true);
                return true;
            }
            return false;
        } catch (e) {
            console.error("VerseHub: Notification request error", e);
            return false;
        }
    }, []);

    const scheduleNotification = useCallback((title: string, body: string, href: string) => {
        if (typeof window === 'undefined' || !('Notification' in window)) return;
        if (Notification.permission !== 'granted') return;

        // Simple Local Scheduler (if the tab is open)
        // We set up a check for 07:00 AM local time
        const check0700 = () => {
            const now = new Date();
            const tomorrow0700 = new Date(now);
            tomorrow0700.setHours(7, 0, 0, 0);

            if (now >= tomorrow0700) {
                tomorrow0700.setDate(tomorrow0700.getDate() + 1);
            }

            const diff = tomorrow0700.getTime() - now.getTime();
            
            // Log for dev
            console.log(`[VerseHub] Next Daily Mana reminder in ${Math.round(diff / 1000 / 60 / 60)} hours.`);

            const timer = setTimeout(() => {
                const n = new Notification(title, {
                    body: body,
                    icon: '/favicon.ico', // Default icon
                    badge: '/favicon.ico',
                    tag: 'daily-mana-ritual'
                });

                n.onclick = (e) => {
                    e.preventDefault();
                    window.focus();
                    window.location.href = href;
                };

                // Re-schedule for next day
                check0700();
            }, diff);

            return () => clearTimeout(timer);
        };

        return check0700();
    }, []);

    return {
        permissionStatus,
        isRegistered,
        askPermission,
        scheduleNotification
    };
}
