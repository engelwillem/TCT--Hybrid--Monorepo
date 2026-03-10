import MobileAppLayout from '@/Layouts/MobileAppLayout';
import ListItemWithChips from '@/Components/core/ListItemWithChips';
import PrimaryCTA from '@/Components/core/PrimaryCTA';
import SegmentedTabs from '@/Components/core/SegmentedTabs';
import {
    IconSearch,
} from '@/Components/icons/AppIcons';

export default function Visitors() {
    return (
        <MobileAppLayout title="Visitors" activeNavId="library" backHref="/today">
            <div className="flex items-center gap-3 rounded-full bg-surface px-5 py-3 shadow-soft">
                <IconSearch className="h-5 w-5 text-muted-foreground" />
                <input
                    className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                    placeholder="Search Visitors"
                />
                <button className="rounded-full bg-surface-dark px-4 py-2 text-xs text-white">
                    Filter
                </button>
            </div>

            <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Trending</h2>
                    <span className="text-xs text-muted-foreground">View all</span>
                </div>
                <SegmentedTabs
                    options={[
                        { id: 'general', label: 'General' },
                        { id: 'event', label: 'Event' },
                        { id: 'classified', label: 'Classifieds' },
                    ]}
                    activeId="general"
                />
            </div>

            <div className="mt-6 rounded-3xl bg-surface p-5 shadow-soft">
                <ListItemWithChips
                    avatarUrl="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop"
                    title="Alex Johnson"
                    subtitle="+91 98765 43210"
                    chip="Request"
                    status="2h ago"
                    meta=""
                />
                <p className="mt-4 text-sm text-muted-foreground">
                    Looking for someone who can teach piano to my 8-year-old
                    daughter. Preferably within the community. Please DM if
                    interested!
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>25 Likes</span>
                    <span>10 Comments</span>
                    <span>Share</span>
                </div>
            </div>

            <div className="mt-8">
                <PrimaryCTA label="Create Post" icon={<span>+</span>} />
            </div>
        </MobileAppLayout>
    );
}