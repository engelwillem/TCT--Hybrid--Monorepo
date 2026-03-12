import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X,
    Copy,
    Check,
    Send,
    Share2,
    MessageCircle,
    Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

type SharePanelProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: string;
    url: string;
    ogImageUrl: string;
    lang: string;
};

export default function SharePanel({
    isOpen,
    onClose,
    title,
    subtitle,
    url,
    ogImageUrl,
    lang
}: SharePanelProps) {
    const [copied, setCopied] = useState(false);
    const isId = lang === 'id';

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareOptions = [
        {
            name: 'WhatsApp',
            icon: <MessageCircle className="h-5 w-5" />,
            color: 'bg-[#25D366]',
            action: () => window.open(`https://wa.me/?text=${encodeURIComponent(title + " " + url)}`, '_blank'),
        },
        {
            name: 'Telegram',
            icon: <Send className="h-5 w-5" />,
            color: 'bg-[#0088cc]',
            action: () => window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_blank'),
        },
        {
            name: isId ? 'Salin Link' : 'Copy Link',
            icon: copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />,
            color: 'bg-slate-600',
            action: handleCopy,
        },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-x-0 bottom-0 z-[70] mx-auto max-w-lg overflow-hidden rounded-t-[32px] bg-surface p-6 shadow-2xl ring-1 ring-white/10"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-foreground">
                                {isId ? 'Bagikan' : 'Share'}
                            </h3>
                            <button
                                onClick={onClose}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted transition-colors hover:bg-surface-accent"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* OG Preview Card */}
                        <div className="relative mb-8 overflow-hidden rounded-2xl bg-black/20 shadow-inner group">
                            <div className="aspect-[1200/630] w-full overflow-hidden bg-slate-900/50">
                                <img
                                    src={ogImageUrl}
                                    alt="Preview"
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100 flex items-end p-4">
                                    <span className="text-xs text-white/80 font-medium">Premium Share Preview</span>
                                </div>
                            </div>
                            <div className="p-4 border-t border-white/5 bg-surface-accent/30 backdrop-blur-md">
                                <h4 className="font-bold text-foreground line-clamp-1">{title}</h4>
                                {subtitle && <p className="text-sm text-foreground-muted line-clamp-2 mt-1">{subtitle}</p>}
                                <p className="text-[10px] text-amber-500/80 uppercase tracking-widest mt-2 font-bold">thechoosentalks.org</p>
                            </div>
                        </div>

                        {/* Share Actions */}
                        <div className="grid grid-cols-3 gap-4">
                            {shareOptions.map((opt) => (
                                <button
                                    key={opt.name}
                                    onClick={opt.action}
                                    className="flex flex-col items-center gap-2 group"
                                >
                                    <div className={cn(
                                        "flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg transition-all duration-300 group-hover:-translate-y-1 group-active:scale-95",
                                        opt.color
                                    )}>
                                        {opt.icon}
                                    </div>
                                    <span className="text-xs font-semibold text-foreground-muted group-hover:text-foreground">
                                        {opt.name}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Footer Disclaimer */}
                        <div className="mt-8 text-center">
                            <p className="text-[10px] text-foreground-muted/60 uppercase tracking-widest font-medium">
                                VerseHub Premium Share System
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
