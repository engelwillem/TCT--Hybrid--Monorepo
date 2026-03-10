"use client";

import React from 'react';
import { motion } from 'framer-motion';

export function ThrowingCard({ children, index = 0 }: { children: React.ReactNode; index?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-5%" }}
            transition={{
                duration: 0.8,
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1]
            }}
            className="w-full"
        >
            {children}
        </motion.div>
    );
}
