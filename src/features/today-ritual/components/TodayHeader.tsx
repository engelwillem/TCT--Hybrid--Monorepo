'use client';

import { motion } from 'framer-motion';
import { useMotionConfig } from '../hooks/useMotionConfig';

interface TodayHeaderProps {
  greeting: string;
  audienceName?: string;
  dateLabel: string;
  isAuthRestoring?: boolean;
}

export default function TodayHeader({
  greeting,
  audienceName,
  dateLabel,
  isAuthRestoring = false,
}: TodayHeaderProps) {
  const m = useMotionConfig();
  const headline = isAuthRestoring ? `${greeting}.` : `${greeting}, ${audienceName ?? 'Chosen People'}.`;

  return (
    <header className="sticky top-0 z-50 w-full pt-[env(safe-area-inset-top,0px)] mix-blend-multiply">
      <div className="mx-auto w-full px-6 h-[78px] flex items-end pb-4">
        <motion.div
          variants={m.v.fade}
          initial="hidden"
          animate="visible"
          // Header uses calm pace — establishes presence without drama
          transition={m.tx.calm}
          className="flex flex-col"
        >
          <span className="text-[10px] font-bold tracking-[0.15em] text-foreground/40 uppercase mb-0.5">
            {dateLabel}
          </span>
          <h1 className="text-[18px] font-semibold tracking-tight text-foreground/90">
            {headline}
          </h1>
        </motion.div>
      </div>
    </header>
  );
}
