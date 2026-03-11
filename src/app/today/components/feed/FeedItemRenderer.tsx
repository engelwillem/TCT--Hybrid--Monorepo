'use client';

import UserPostCard from './UserPostCard';
import PrayerRequestCard from './PrayerRequestCard';
import SystemReflectionCard from './SystemReflectionCard';
import ThrowingCard from '../ThrowingCard';

const components: Record<string, any> = {
    member_post: UserPostCard,
    user_post: UserPostCard,
    prayer_request: PrayerRequestCard,
    prayer: PrayerRequestCard,
    reflection: SystemReflectionCard,
    system_reflection: SystemReflectionCard,
    testimony: UserPostCard,
};

export default function FeedItemRenderer({
    item,
    index,
}: {
    item: any;
    index: number;
}) {
    const Component = components[item.type];

    if (!Component) return null;

    return (
        <ThrowingCard index={index}>
            <Component
                id={item.id}
                payload={item.payload ?? item}
                interactions={item.interactions}
                can_moderate={item.can_moderate}
            />
        </ThrowingCard>
    );
}
