import MobileAppLayout from '@/Layouts/MobileAppLayout';
import SegmentedTabs from '@/Components/core/SegmentedTabs';

const visitors = [
    {
        title: 'Delivery - Dominos',
        subtitle: 'Candace Friesen',
        status: 'Pre-Approved by Chris',
        date: '23 Nov 2025',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=300&auto=format&fit=crop',
    },
    {
        title: 'Car, Uber',
        subtitle: 'Ruben Dias',
        status: 'Pre-Approved by Anderson',
        date: '23 Nov 2025',
        image: 'https://images.unsplash.com/photo-1502877338535-766e1452684a?q=80&w=300&auto=format&fit=crop',
    },
];

export default function GateUpdates() {
    return (
        <MobileAppLayout title="Gate Updates" activeNavId="home" backHref="/ui">
            <SegmentedTabs
                options={[
                    { id: 'visitors', label: 'Visitors' },
                    { id: 'parcel', label: 'Parcel' },
                    { id: 'helpers', label: 'Helpers' },
                ]}
                activeId="visitors"
            />

            <div className="mt-6 rounded-3xl bg-surface p-6 shadow-soft">
                <h2 className="text-sm font-semibold">Expected Visitors</h2>
                <div className="mt-4 flex flex-col items-start gap-4 rounded-2xl bg-surface-muted p-4">
                    <div>
                        <p className="text-sm font-semibold">
                            Streamline Visitor Entry at the Gate
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Pre-Approve Entry
                        </p>
                    </div>
                    <button className="rounded-full bg-surface-dark px-4 py-2 text-xs text-white">
                        Pre-Approve Entry
                    </button>
                </div>
            </div>

            <div className="mt-6 rounded-3xl bg-surface p-6 shadow-soft">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">My Visitors</h2>
                    <span className="rounded-full bg-surface-muted px-3 py-1 text-xs">
                        23 Nov 2025
                    </span>
                </div>
                <div className="mt-4 space-y-4">
                    {visitors.map((visitor) => (
                        <div
                            key={visitor.title}
                            className="flex items-center gap-4 rounded-2xl bg-surface-muted p-4"
                        >
                            <img
                                src={visitor.image}
                                alt={visitor.title}
                                className="h-14 w-14 rounded-2xl object-cover"
                            />
                            <div>
                                <p className="text-sm font-semibold">
                                    {visitor.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {visitor.subtitle}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {visitor.status}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </MobileAppLayout>
    );
}