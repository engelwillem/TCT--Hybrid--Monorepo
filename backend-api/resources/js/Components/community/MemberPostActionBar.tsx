import ActionBar, { type ActionBarProps } from '@/Components/ActionBar';

// Community/Today feed uses global ActionBar visuals with split-save layout.
export default function MemberPostActionBar(props: ActionBarProps) {
    return <ActionBar {...props} splitSave className={props.className} />;
}

export type { ActionBarProps as MemberPostActionBarProps };
