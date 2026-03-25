"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationPermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAllow: () => void;
}

export default function NotificationPermissionModal({ isOpen, onClose, onAllow }: NotificationPermissionModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    {/* Modal */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative w-full max-w-[320px] bg-white rounded-[32px] p-8 shadow-2xl overflow-hidden"
                    >
                        {/* Decorative Background Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-[#0088CC]/10 blur-[40px] rounded-full -z-10" />

                        <div className="flex flex-col items-center text-center space-y-6">
                            <div className="h-16 w-16 rounded-3xl bg-[#0088CC]/10 flex items-center justify-center text-[#0088CC] mb-2">
                                <motion.div
                                    animate={{ rotate: [0, 15, -15, 0] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                >
                                    <Bell size={32} />
                                </motion.div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-[20px] font-black text-slate-900 tracking-tight leading-tight">
                                    Ingatkan Saya?
                                </h3>
                                <p className="text-[14px] text-slate-500 font-medium leading-relaxed px-2">
                                    Izinkan sapaan lembut setiap jam 7 pagi agar harimu dimulai dengan Firman.
                                </p>
                            </div>

                            <div className="w-full flex flex-col gap-3 pt-4">
                                <button 
                                    onClick={onAllow}
                                    className="w-full h-14 rounded-2xl bg-[#0088CC] text-white text-[15px] font-black shadow-lg shadow-[#0088CC]/20 active:scale-95 transition-all"
                                >
                                    Izinkan Notifikasi
                                </button>
                                <button 
                                    onClick={onClose}
                                    className="w-full h-14 rounded-2xl bg-slate-50 text-slate-400 text-[14px] font-bold active:scale-95 transition-all hover:bg-slate-100"
                                >
                                    Nanti Saja
                                </button>
                            </div>

                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300 uppercase tracking-widest pt-2">
                                <CheckCircle2 size={12} />
                                Safe & Personalized
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
