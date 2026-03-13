"use client";

import { ActionBar } from './ActionBar';
import type { ComponentProps } from 'react';

type MemberPostActionBarProps = ComponentProps<typeof ActionBar>;

export function MemberPostActionBar(props: MemberPostActionBarProps) {
    return <ActionBar {...props} splitSave className={props.className} />;
}
