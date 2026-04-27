'use client';

import { motion } from 'framer-motion';
import { useMotionConfig } from '../hooks/useMotionConfig';

interface ReceiveVerseProps {
  verseText: string;
  verseReference: string;
}

export default function ReceiveVerse({ verseText, verseReference }: ReceiveVerseProps) {
  const m = useMotionConfig();

  return (
    // section provides a landmark for screen readers to navigate to this reading
    <motion.section
      aria-label="Ayat Hari Ini"
      variants={m.v.verse}
      initial="hidden"
      animate="visible"
      transition={m.tx.slow}
      className="flex flex-col px-6 mt-6 md:mt-8"
    >
      <div className="mb-4 flex flex-col gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700/75">Ayat Hari Ini</p>
        <p className="text-[14px] leading-7 text-foreground/58">
          Terimalah firman yang menuntun langkahmu hari ini.
        </p>
      </div>
      <div className="flex flex-col items-start text-left mb-8">
        {/* blockquote is the correct semantic element for a scripture citation */}
        <blockquote
          className="tct-serif text-[26px] md:text-[28px] leading-[1.5] text-foreground/90 tracking-tight"
          cite="#"
        >
          “{verseText}”
        </blockquote>

        <motion.footer
          variants={m.v.fade}
          initial="hidden"
          animate="visible"
          transition={m.reduce ? m.tx.calm : { ...m.tx.calm, delay: 0.4 }}
          className="mt-6 flex flex-col items-start gap-4"
        >
          <div className="h-px w-6 bg-foreground/20" aria-hidden="true" />
          <cite className="text-[12px] font-medium tracking-wide text-foreground/40 not-italic">
            {verseReference}
          </cite>
        </motion.footer>
      </div>
    </motion.section>
  );
}
