import { motion } from 'framer-motion';
import { MessageSquareQuote, ChevronRight, Sparkles } from 'lucide-react';

interface SuggestedPath {
    slug: string;
    title: string;
    description?: string;
}

interface EndOfChapterPromptProps {
    onReflect: () => void;
    onPathSelect?: (path: SuggestedPath) => void;
    questionText: string;
    lang: string;
    suggestedPaths?: SuggestedPath[];
}

export default function EndOfChapterPrompt({
    onReflect,
    onPathSelect,
    questionText,
    lang,
    suggestedPaths = [],
}: EndOfChapterPromptProps) {
    const isId = lang === 'id';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-12 overflow-hidden rounded-[32px] bg-gradient-to-br from-amber-500 to-amber-600 p-1 text-white shadow-xl"
        >
            <div className="rounded-[30px] bg-slate-900/10 p-8 backdrop-blur-sm">
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                        <MessageSquareQuote className="h-6 w-6" />
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                        <Sparkles className="h-3 w-3" />
                        Scripture Guide
                    </div>
                </div>

                <h3 className="mb-4 text-2xl font-bold leading-tight md:text-3xl">
                    {isId ? 'Selesai membaca? Mari berhenti sejenak.' : 'Finished reading? Let’s pause.'}
                </h3>

                <p className="mb-8 font-serif text-lg italic leading-relaxed opacity-90 md:text-xl">
                    "{questionText}"
                </p>

                <button
                    onClick={onReflect}
                    className="group flex w-full items-center justify-between rounded-2xl bg-white px-6 py-4 text-sm font-bold text-amber-600 shadow-lg transition-all hover:bg-amber-50 active:scale-[0.98]"
                >
                    {isId ? 'Tulis Refleksimu' : 'Write Your Reflection'}
                    <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </button>

                {suggestedPaths.length > 0 && (
                    <div className="mt-8 space-y-4">
                        <p className="px-1 text-[10px] font-bold uppercase tracking-[0.2em] opacity-70">
                            {isId ? 'Lanjutkan Perjalanan' : 'Continue the Journey'}
                        </p>
                        <div className="grid gap-3 md:grid-cols-2">
                            {suggestedPaths.map((path) => (
                                <button
                                    key={path.slug}
                                    onClick={() => onPathSelect?.(path)}
                                    className="flex items-start gap-4 rounded-2xl bg-white/10 p-4 text-left backdrop-blur-md transition-all hover:bg-white/20 active:scale-[0.98] ring-1 ring-white/10"
                                >
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                                        <Sparkles className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold leading-snug">{path.title}</p>
                                        <p className="mt-1 text-[11px] opacity-70 line-clamp-2">{path.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
