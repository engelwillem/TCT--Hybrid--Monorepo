import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';

type Channel = {
    id: number;
    slug: string;
    title: string;
    members_count?: number;
    is_joined?: boolean;
};

type Post = {
    title: string;
    content?: string | null;
    publish_at: string;
};

type MemberPost = {
    id: number;
    type: string;
    text?: string | null;
    author?: string | null;
    created_at?: string | null;
};

export default function WeeklyShow({
    channel,
    post,
    memberPosts,
}: {
    channel: Channel;
    post: Post;
    memberPosts: MemberPost[];
}) {
    const page = usePage();
    const isAuthenticated = Boolean((page.props as any)?.auth?.user);
    const [isJoined, setIsJoined] = useState(Boolean(channel.is_joined));
    const [memberCount, setMemberCount] = useState(Number(channel.members_count ?? 0));
    const date = post.publish_at.slice(0, 10);

    const toggleMembership = () => {
        const wasJoined = isJoined;
        setIsJoined(!wasJoined);
        setMemberCount((prev) => Math.max(0, prev + (wasJoined ? -1 : 1)));

        if (!isAuthenticated) return;

        router.post(`/channels/${channel.id}/membership`, {}, {
            preserveScroll: true,
            onError: () => {
                setIsJoined(wasJoined);
                setMemberCount((prev) => Math.max(0, prev + (wasJoined ? 1 : -1)));
            },
        });
    };

    return (
        <MobileAppLayout
            title={channel.title}
            activeNavId="channels"
            backHref={`/channels/${channel.slug}`}
        >
            <div className="mb-4 flex items-center justify-between rounded-2xl bg-surface-muted/50 p-3">
                <p className="text-xs font-medium text-muted-foreground">
                    {memberCount} members
                </p>
                <button
                    type="button"
                    onClick={toggleMembership}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${isJoined ? 'bg-slate-900 text-white' : 'bg-surface text-foreground'}`}
                >
                    {isJoined ? 'Joined' : 'Join Channel'}
                </button>
            </div>

            <article className="rounded-3xl bg-surface p-5 shadow-soft">
                <p className="text-xs text-muted-foreground">{date}</p>
                <h2 className="mt-2 text-lg font-semibold">{post.title}</h2>

                {post.content ? (
                    <div
                        className="reader-prose mt-4 max-w-none"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                ) : (
                    <p className="mt-4 text-sm text-muted-foreground">
                        Content belum diisi.
                    </p>
                )}
            </article>

            {memberPosts.length ? (
                <section className="mt-6 space-y-3">
                    <h3 className="text-sm font-semibold">Community posts on this date</h3>
                    {memberPosts.map((item) => (
                        <article key={item.id} className="rounded-2xl bg-surface-muted/40 p-3">
                            <p className="text-xs text-muted-foreground">{item.author ?? 'Member'}</p>
                            {item.text ? <p className="mt-1 text-sm text-foreground/90">{item.text}</p> : null}
                        </article>
                    ))}
                </section>
            ) : null}
        </MobileAppLayout>
    );
}
