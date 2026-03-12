import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { useEffect, useMemo, useRef, useState } from 'react';

type ThreadMessage = {
    id: number;
    body: string;
    is_mine: boolean;
    approved: boolean;
    read_at: string | null;
    created_at: string | null;
};

type Partner = {
    id: number;
    name: string;
    online?: boolean;
    last_seen_at?: string | null;
};

type Paging = {
    has_more: boolean;
    next_before_id: number | null;
};

function formatTime(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatLastSeen(iso: string | null | undefined): string {
    if (!iso) return 'offline';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return 'offline';
    return `last seen ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function getCsrfToken(): string {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
}

export default function InboxShow({
    partner,
    messages,
    paging,
}: {
    partner: Partner;
    messages: ThreadMessage[];
    paging: Paging;
}) {
    const [rows, setRows] = useState<ThreadMessage[]>(messages ?? []);
    const [threadPartner, setThreadPartner] = useState<Partner>(partner);
    const [threadPaging, setThreadPaging] = useState<Paging>(paging ?? { has_more: false, next_before_id: null });
    const [text, setText] = useState('');
    const [busy, setBusy] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [toast, setToast] = useState<string | null>(null);
    const scrollBoxRef = useRef<HTMLDivElement | null>(null);

    const title = useMemo(() => `Chat • ${threadPartner?.name ?? 'Inbox'}`, [threadPartner?.name]);

    const showToast = (message: string) => {
        setToast(message);
        window.setTimeout(() => setToast(null), 1400);
    };

    const mergeWithoutDuplicates = (a: ThreadMessage[], b: ThreadMessage[]): ThreadMessage[] => {
        const map = new Map<number, ThreadMessage>();
        [...a, ...b].forEach((item) => map.set(item.id, item));
        return Array.from(map.values()).sort((x, y) => x.id - y.id);
    };

    const loadNewest = async () => {
        try {
            const res = await fetch(`/inbox/${threadPartner.id}/messages?limit=30`, {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });
            const json = await res.json();
            const nextRows = Array.isArray(json?.messages) ? (json.messages as ThreadMessage[]) : [];
            setRows((prev) => mergeWithoutDuplicates(prev, nextRows));
            setThreadPartner((prev) => ({
                ...prev,
                ...(json?.partner ?? {}),
            }));
        } catch {
            // no-op
        }
    };

    const loadOlder = async () => {
        if (loadingMore || !threadPaging?.has_more || !threadPaging?.next_before_id) return;
        setLoadingMore(true);

        const box = scrollBoxRef.current;
        const prevHeight = box?.scrollHeight ?? 0;

        try {
            const res = await fetch(`/inbox/${threadPartner.id}/messages?before_id=${threadPaging.next_before_id}&limit=30`, {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });
            const json = await res.json();
            const older = Array.isArray(json?.messages) ? (json.messages as ThreadMessage[]) : [];
            setRows((prev) => mergeWithoutDuplicates(older, prev));
            setThreadPaging((json?.paging ?? { has_more: false, next_before_id: null }) as Paging);

            window.requestAnimationFrame(() => {
                if (!box) return;
                const newHeight = box.scrollHeight;
                box.scrollTop = newHeight - prevHeight + box.scrollTop;
            });
        } catch {
            // no-op
        } finally {
            setLoadingMore(false);
        }
    };

    useEffect(() => {
        const id = window.setInterval(() => {
            void loadNewest();
        }, 7000);
        return () => window.clearInterval(id);
    }, [threadPartner.id]);

    useEffect(() => {
        const box = scrollBoxRef.current;
        if (!box) return;

        const onScroll = () => {
            if (box.scrollTop <= 40) {
                void loadOlder();
            }
        };

        box.addEventListener('scroll', onScroll);
        return () => box.removeEventListener('scroll', onScroll);
    }, [threadPaging, loadingMore, threadPartner.id]);

    useEffect(() => {
        const box = scrollBoxRef.current;
        if (!box) return;
        box.scrollTop = box.scrollHeight;
    }, []);

    const send = async () => {
        const body = text.trim();
        if (!body || busy) return;

        setBusy(true);
        try {
            const res = await fetch('/inbox/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                credentials: 'same-origin',
                body: JSON.stringify({
                    recipient_id: threadPartner.id,
                    body,
                }),
            });

            const json = await res.json();
            if (!res.ok || json?.ok !== true) {
                showToast('Gagal kirim pesan');
                return;
            }

            setText('');
            await loadNewest();
            window.requestAnimationFrame(() => {
                const box = scrollBoxRef.current;
                if (box) box.scrollTop = box.scrollHeight;
            });
        } catch {
            showToast('Gagal kirim pesan');
        } finally {
            setBusy(false);
        }
    };

    return (
        <MobileAppLayout title={title} activeNavId="home" backHref="/today">
            <div className="mx-auto w-full max-w-[840px] space-y-3">
                <div className="rounded-3xl bg-surface p-4 shadow-soft">
                    <p className="text-sm font-semibold text-foreground">{threadPartner.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        {threadPartner.online ? 'online' : formatLastSeen(threadPartner.last_seen_at)}
                    </p>
                </div>

                <div className="rounded-3xl bg-surface p-3 shadow-soft">
                    <div ref={scrollBoxRef} className="max-h-[60vh] space-y-2 overflow-y-auto pr-1">
                        {loadingMore ? (
                            <p className="py-1 text-center text-xs text-muted-foreground">Loading older messages...</p>
                        ) : null}

                        {rows.length === 0 ? (
                            <p className="px-2 py-5 text-center text-sm text-muted-foreground">
                                Belum ada pesan.
                            </p>
                        ) : (
                            rows.map((item) => (
                                <div
                                    key={item.id}
                                    className={`flex ${item.is_mine ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-6 ${
                                            item.is_mine
                                                ? 'bg-foreground text-background'
                                                : 'bg-surface-muted text-foreground'
                                        }`}
                                    >
                                        <p>{item.body}</p>
                                        <p
                                            className={`mt-1 text-[11px] ${
                                                item.is_mine ? 'text-background/70' : 'text-muted-foreground'
                                            }`}
                                        >
                                            {formatTime(item.created_at)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="mt-3 flex items-center gap-2 border-t border-border/60 pt-3">
                        <input
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    void send();
                                }
                            }}
                            placeholder="Tulis pesan..."
                            className="h-10 w-full rounded-xl border border-border/70 bg-background px-3 text-sm outline-none focus:border-foreground/20"
                        />
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => void send()}
                            className="rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background disabled:opacity-60"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>

            {toast ? (
                <div className="fixed left-1/2 top-6 z-[80] -translate-x-1/2 rounded-full bg-black/75 px-4 py-2 text-xs text-white ring-1 ring-white/10 backdrop-blur">
                    {toast}
                </div>
            ) : null}
        </MobileAppLayout>
    );
}

