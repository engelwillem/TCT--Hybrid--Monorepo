import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { Link } from '@inertiajs/react';

type InboxItem = {
    message_id: number;
    preview: string;
    is_unread: boolean;
    created_at?: string | null;
    partner: {
        id: number;
        name: string;
        online?: boolean;
    };
};

type InboxPayload = {
    tabs?: {
        primary?: InboxItem[];
        general?: InboxItem[];
        requests?: InboxItem[];
    };
    counts?: {
        primary?: number;
        general?: number;
        requests?: number;
    };
};

function formatWhen(iso?: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function InboxIndex({ inbox }: { inbox?: InboxPayload }) {
    const primary = Array.isArray(inbox?.tabs?.primary) ? inbox!.tabs!.primary! : [];
    const general = Array.isArray(inbox?.tabs?.general) ? inbox!.tabs!.general! : [];
    const requests = Array.isArray(inbox?.tabs?.requests) ? inbox!.tabs!.requests! : [];
    const merged = [...primary, ...general, ...requests];

    return (
        <MobileAppLayout title="Inbox" activeNavId="home" backHref="/today">
            <div className="mx-auto w-full max-w-[840px] space-y-4">
                <div className="rounded-3xl bg-surface p-4 shadow-soft">
                    <p className="text-sm font-semibold text-foreground">Pesan Masuk</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                        Primary: {Number(inbox?.counts?.primary ?? primary.length)} · General: {Number(inbox?.counts?.general ?? general.length)} · Requests: {Number(inbox?.counts?.requests ?? requests.length)}
                    </p>
                </div>

                <div className="space-y-2">
                    {merged.length === 0 ? (
                        <div className="rounded-3xl bg-surface p-6 text-center text-sm text-muted-foreground shadow-soft">
                            Belum ada percakapan.
                        </div>
                    ) : (
                        merged.map((item) => (
                            <Link
                                key={item.message_id}
                                href={`/inbox/${item.partner.id}`}
                                className="block rounded-2xl bg-surface p-4 shadow-soft ring-1 ring-black/5 transition hover:bg-surface-muted/80 dark:ring-white/10"
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-sm font-semibold text-foreground">{item.partner.name}</p>
                                    <p className="text-[11px] text-muted-foreground">{formatWhen(item.created_at)}</p>
                                </div>
                                <p className={`mt-1 text-sm ${item.is_unread ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                                    {item.preview || '...'}
                                </p>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </MobileAppLayout>
    );
}
