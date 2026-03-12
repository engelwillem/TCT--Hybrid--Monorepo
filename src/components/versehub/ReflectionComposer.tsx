"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Lock, Globe, MessageSquareQuote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getAppAccessToken } from '@/services/app-auth-token';

interface ReflectionComposerProps {
    isOpen: boolean;
    onClose: () => void;
    verseRef: string;
    questionText: string;
    lang: string;
}

export default function ReflectionComposer({
    isOpen,
    onClose,
    verseRef,
    questionText,
    lang,
}: ReflectionComposerProps) {
    const isId = lang === 'id';
    const [answerText, setAnswerText] = useState('');
    const [isPrivate, setIsPrivate] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<{ answer_text?: string }>({});

    useEffect(() => {
        if (isOpen) {
            setAnswerText('');
            setIsPrivate(true);
            setErrors({});
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        try {
            const token = getAppAccessToken();
            if (!token) {
                setErrors({ answer_text: 'Sesi login tidak ditemukan. Silakan login ulang.' });
                setProcessing(false);
                return;
            }

            const response = await fetch(`/api/versehub/${lang}/reflections`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    verse_ref: verseRef,
                    question_text: questionText,
                    answer_text: answerText,
                    is_private: isPrivate,
                }),
            });

            if (response.ok) {
                onClose();
            } else {
                const json = await response.json();
                setErrors(json.errors || { answer_text: 'Something went wrong' });
            }
        } catch (err) {
            setErrors({ answer_text: 'Failed to submit reflection' });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-x-4 bottom-4 z-[70] mx-auto max-w-lg overflow-hidden rounded-[32px] bg-white shadow-2xl md:bottom-auto md:top-1/2 md:-translate-y-1/2"
                    >
                        <div className="relative p-6 md:p-8">
                            <button
                                onClick={onClose}
                                className="absolute right-6 top-6 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                                    <MessageSquareQuote className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">
                                        {isId ? 'Tulis Refleksi' : 'Write Reflection'}
                                    </h3>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        {verseRef.toUpperCase()}
                                    </p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <p className="mb-4 font-serif text-lg italic leading-relaxed text-slate-700">
                                        "{questionText}"
                                    </p>
                                    <textarea
                                        value={answerText}
                                        onChange={(e) => setAnswerText(e.target.value)}
                                        placeholder={isId ? 'Tuliskan pemikiranmu di sini...' : 'Type your thoughts here...'}
                                        className="h-40 w-full resize-none rounded-2xl border-none bg-slate-50 p-4 text-slate-900 ring-0 transition-all focus:bg-white focus:ring-2 focus:ring-amber-500/20"
                                        required
                                        autoFocus
                                    />
                                    {errors.answer_text && (
                                        <p className="mt-1 text-xs text-red-500">{errors.answer_text}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsPrivate(!isPrivate)}
                                            className={cn(
                                                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all",
                                                isPrivate ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"
                                            )}
                                        >
                                            {isPrivate ? (
                                                <>
                                                    <Lock className="h-3 w-3" />
                                                    {isId ? 'Privat' : 'Private'}
                                                </>
                                            ) : (
                                                <>
                                                    <Globe className="h-3 w-3" />
                                                    {isId ? 'Publik' : 'Public'}
                                                </>
                                            )}
                                        </button>
                                        <p className="text-[10px] text-slate-400 max-w-[120px] leading-tight">
                                            {isPrivate
                                                ? (isId ? 'Hanya kamu yang bisa melihat ini.' : 'Only you can see this.')
                                                : (isId ? 'Akan muncul di profil publikmu.' : 'Visible on your public profile.')
                                            }
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing || !answerText.trim()}
                                        className="flex items-center gap-2 rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-slate-800 disabled:opacity-50"
                                    >
                                        <Save className="h-4 w-4" />
                                        {isId ? 'Simpan' : 'Save'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
