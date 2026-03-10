import ActionBar, { type ActionBarProps } from '@/components/ActionBar';

export default function MemberPostActionBar(props: ActionBarProps) {
    return <ActionBar {...props} splitSave className={props.className} />;
}
