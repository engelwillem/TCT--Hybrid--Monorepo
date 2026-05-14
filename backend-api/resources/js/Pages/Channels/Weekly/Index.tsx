import MobileAppLayout from '@/Layouts/MobileAppLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';


type Channel = {
    id: number;
    slug: string;
    title: string;
    description?: string | null;
    members_count?: number;
    is_joined?: boolean;
};

type Post = {
    id: number;
    title: string;
    publish_at: string;
};

type MemberPost = {
    id: number;
    type: string;
    title?: string | null;
    text?: string | null;
    author?: string | null;
    created_at?: string | null;
};

export default function WeeklyIndex({
    channel,
    posts,
    memberPosts,
}: {
    channel: Channel;
    posts: Post[];
    memberPosts: MemberPost[];
}) {
    const page = usePage();
    const isAuthenticated = Boolean((page.props as any)?.auth?.user);
    const [isJoined, setIsJoined] = useState(Boolean(channel.is_joined));
    const [memberCount, setMemberCount] = useState(Number(channel.members_count ?? 0));

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
            backHref="/channels"
        >
            {channel.description ? (
                <p className="mb-4 text-sm text-muted-foreground">
                    {channel.description}
                </p>
            ) : null}

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



            <div className="space-y-3">
                {posts.length ? (
                    posts.map((post) => {
                        const date = post.publish_at.slice(0, 10);
                        return (
                            <Link
                                key={post.id}
                                href={`/channels/${channel.slug}/${date}`}
                                className="block rounded-3xl bg-surface p-4 shadow-soft"
                            >
                                <p className="text-sm font-semibold">
                                    {post.title}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {date}
                                </p>
                            </Link>
                        );
                    })
                ) : (
                    <p className="text-sm text-muted-foreground">
                        Belum ada post yang published.
                    </p>
                )}
            </div>

            {memberPosts.length ? (
                <section className="mt-6 space-y-3">
                    <h3 className="text-sm font-semibold">Community posts in this channel</h3>
                    {memberPosts.map((item) => (
                        <article key={item.id} className="rounded-2xl bg-surface-muted/40 p-3">
                            <p className="text-xs text-muted-foreground">{item.author ?? 'Member'}</p>
                            {item.title ? <p className="mt-1 text-sm font-semibold">{item.title}</p> : null}
                            {item.text ? <p className="mt-1 text-sm text-foreground/90">{item.text}</p> : null}
                        </article>
                    ))}
                </section>
            ) : null}
        </MobileAppLayout>
    );
}
