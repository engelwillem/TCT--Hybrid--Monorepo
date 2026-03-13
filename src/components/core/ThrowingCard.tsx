"use client";

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export function ThrowingCard({ children, index = 0, className }: { children: React.ReactNode; index?: number; className?: string }) {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"]
    });

    const isEven = index % 2 === 0;
    const direction = isEven ? 1 : -1;

    // x moves from 0 to 400 (or -400) as the card moves from center-top to off-screen
    const x = useTransform(scrollYProgress, [0, 0.8], [0, direction * 400]);
    // opacity fades from 1 to 0
    const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
    // subtle rotation as it gets "thrown"
    const rotate = useTransform(scrollYProgress, [0, 0.8], [0, direction * 15]);
    // slight scale down
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);

    return (
        <motion.div
            ref={ref}
            style={{ x, opacity, rotate, scale }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
