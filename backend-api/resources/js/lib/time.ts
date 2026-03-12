export function timeAgo(iso: string | null): string {
    if (!iso) return '';

    try {
        const d = new Date(iso);
        const t = d.getTime();
        if (!Number.isFinite(t)) return '';

        const now = Date.now();
        const diffSec = Math.max(0, Math.floor((now - t) / 1000));

        if (diffSec < 10) return 'now';
        if (diffSec < 60) return `${diffSec}s`;

        const diffMin = Math.floor(diffSec / 60);
        if (diffMin < 60) return `${diffMin}m`;

        const diffHr = Math.floor(diffMin / 60);
        if (diffHr < 24) return `${diffHr}h`;

        const diffDay = Math.floor(diffHr / 24);
        if (diffDay < 7) return `${diffDay}d`;

        return d.toLocaleDateString('id-ID');
    } catch {
        return '';
    }
}
