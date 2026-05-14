import MobileAppLayout from '@/Layouts/MobileAppLayout';
import ListItemWithChips from '@/Components/core/ListItemWithChips';
import SegmentedTabs from '@/Components/core/SegmentedTabs';
import { IconSearch } from '@/Components/icons/AppIcons';

export default function Library() {
    return (
        <MobileAppLayout title="Community" activeNavId="library" backHref="/today">
            <div className="flex items-center gap-3 rounded-full bg-surface px-5 py-3 shadow-soft">
                <IconSearch className="h-5 w-5 text-muted-foreground" />
                <input
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    placeholder="Search Community"
                />
            </div>

            <div className="mt-6">
                <SegmentedTabs
                    options={[
                        { id: 'upcoming', label: 'Upcoming' },
                        { id: 'history', label: 'History' },
                    ]}
                    activeId="upcoming"
                />
                {/*
                    IMPORTANT:
                    VerseHub is served as a normal Blade page (not an Inertia page).
                    Using Inertia <Link> would intercept the request and expect an Inertia response.
                    So we use a plain <a> to force a full-page navigation.
                */}
                <a href="/versehub/id" className="block">
                    <ListItemWithChips
                        title="VerseHub Library"
                        subtitle="Browse & search Bible Verses"
                        chip="Bible"
                        status="Open"
                        meta="ID / EN"
                    />
                </a>

                <ListItemWithChips
                    avatarUrl="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop"
                    title="Scheduled Post"
                    subtitle="Will be published"
                    chip="Upcoming"
                    status="Planned"
                    meta="Tomorrow"
                />

                <ListItemWithChips
                    avatarUrl="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&auto=format&fit=crop"
                    title="Published Post"
                    subtitle="Already posted"
                    chip="History"
                    status="Done"
                    meta="Yesterday"
                />
            </div>
        </MobileAppLayout>
    );
}
