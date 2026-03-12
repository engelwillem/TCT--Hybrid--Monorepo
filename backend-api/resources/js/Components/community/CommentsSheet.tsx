import { cn } from '@/lib/utils';
import { Send, MessageSquare } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export type SheetComment = {
    id: string | number;
    author: string;
    body: string;
    created_at?: string | null;
    reply_to_id?: string | number | null;
    reply_to_author?: string | null;
};

type ThreadNode = {
    comment: SheetComment;
    children: ThreadNode[];
};

export default function CommentsSheet({
    open,
    onClose,
    title = 'Comments',
    comments,
    canWrite = true,
    onSubmit,
    onReply,
    replyingToAuthor,
    onCancelReply,
    className,
}: {
    open: boolean;
    onClose: () => void;
    title?: string;
    comments?: SheetComment[] | null;
    canWrite?: boolean;
    onSubmit?: (text: string) => void;
    onReply?: (comment: SheetComment) => void;
    replyingToAuthor?: string | null;
    onCancelReply?: () => void;
    className?: string;
}) {
    const [commentText, setCommentText] = useState('');

    const hasSubmit = Boolean(onSubmit);
    const inputDisabled = !hasSubmit || !canWrite;

    const safeComments = useMemo(() => {
        return Array.isArray(comments) ? comments : [];
    }, [comments]);

    const showEmptyState = safeComments != null && safeComments.length === 0;

    const threadedComments = useMemo(() => {
        const source = safeComments;
        const nodes = new Map<string, ThreadNode>();
        const roots: ThreadNode[] = [];

        source.forEach((comment) => {
            nodes.set(String(comment.id), { comment, children: [] });
        });

        source.forEach((comment) => {
            const node = nodes.get(String(comment.id));
            if (!node) return;
            const parentId = comment.reply_to_id == null ? null : String(comment.reply_to_id);
            if (!parentId) {
                roots.push(node);
                return;
            }
            const parent = nodes.get(parentId);
            if (!parent) {
                roots.push(node);
                return;
            }
            parent.children.push(node);
        });

        return roots;
    }, [safeComments]);

    const renderNode = (node: ThreadNode, depth = 0): JSX.Element => {
        const c = node.comment;
        return (
            <div key={c.id} className="relative">
                <div className={cn('flex gap-3 py-3', depth > 0 ? 'ml-8' : '')}>
                    {/* Compact circular avatar */}
                    <div className="relative flex-none">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-400 border border-black/5 dark:border-white/5 shadow-sm">
                            {(c.author || 'U').slice(0, 1).toUpperCase()}
                        </div>
                        {/* Vertical thread line for children */}
                        {node.children.length > 0 && (
                            <div className="absolute left-[15px] top-9 bottom-4 w-[1.5px] bg-slate-200 dark:bg-slate-800" />
                        )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-slate-900 dark:text-slate-100">{c.author || 'Unknown'}</span>
                            {c.created_at && (
                                <span className="text-[11px] text-slate-400 font-medium">{c.created_at}</span>
                            )}
                        </div>

                        <div className="text-[14px] leading-relaxed text-slate-700 dark:text-slate-300">
                            {c.body}
                        </div>

                        <div className="flex items-center gap-4 pt-1">
                            {onReply && (
                                <button
                                    type="button"
                                    className="text-[11px] font-extrabold text-slate-400 hover:text-brand transition-colors uppercase tracking-wider"
                                    onClick={() => onReply(c)}
                                >
                                    Reply
                                </button>
                            )}
                        </div>

                        {node.children.length > 0 && (
                            <div className="mt-2 space-y-1">
                                {node.children.map((child) => renderNode(child, depth + 1))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true">
            <button
                type="button"
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                aria-label="Close"
                onClick={onClose}
            />

            <div
                className={cn(
                    'absolute inset-x-0 bottom-0 max-h-[85vh] flex flex-col rounded-t-[32px] bg-white dark:bg-[#0f172a] shadow-[0_-8px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_-8px_40px_rgba(0,0,0,0.4)] animate-in slide-in-from-bottom transition-transform duration-500',
                    className,
                )}
            >
                {/* Visual drag handle */}
                <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-800" onClick={onClose} />

                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
                    <h3 className="text-[16px] font-extrabold tracking-tight text-slate-900 dark:text-white">{title}</h3>
                    <button
                        type="button"
                        className="text-[14px] font-bold text-brand hover:opacity-70 transition-opacity"
                        onClick={onClose}
                    >
                        Selesai
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-2 scroll-smooth scrollbar-hide">
                    <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                        {safeComments.length > 0
                            ? threadedComments.map((node) => renderNode(node))
                            : null}

                        {showEmptyState && (
                            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                                <div className="h-16 w-16 rounded-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                                    <MessageSquare className="h-8 w-8 text-slate-200 dark:text-slate-700" />
                                </div>
                                <div>
                                    <p className="text-[15px] font-bold text-slate-900 dark:text-slate-100">Belum ada diskusi</p>
                                    <p className="text-[13px] text-slate-400">Jadilah yang pertama berbagi berkat!</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Floating Input area with Glassmorphism */}
                <div
                    className="p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800"
                    style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}
                >
                    {replyingToAuthor && (
                        <div className="mb-3 flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800 px-4 py-2 animate-in fade-in slide-in-from-bottom-2">
                            <p className="text-[12px] font-medium text-slate-500">
                                Membalas <span className="font-bold text-brand">{replyingToAuthor}</span>
                            </p>
                            <button
                                type="button"
                                className="text-[12px] font-bold text-slate-400 hover:text-slate-600"
                                onClick={onCancelReply}
                            >
                                Batal
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <textarea
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                rows={1}
                                placeholder="Tambahkan komentar..."
                                disabled={inputDisabled}
                                className="w-full min-h-[44px] max-h-[120px] resize-none rounded-2xl bg-slate-100 dark:bg-slate-800/80 px-4 py-3 text-[14px] font-medium text-slate-800 dark:text-slate-100 outline-none ring-1 ring-black/5 dark:ring-white/5 focus:ring-2 focus:ring-brand/30 transition-all placeholder:text-slate-400"
                            />
                        </div>
                        <button
                            type="button"
                            className={cn(
                                "flex h-11 w-11 items-center justify-center rounded-full transition-all duration-300 shadow-lg",
                                commentText.trim()
                                    ? "bg-brand text-white scale-100 shadow-brand/30"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 scale-95"
                            )}
                            aria-label="Send"
                            disabled={inputDisabled || !commentText.trim()}
                            onClick={() => {
                                if (inputDisabled) return;
                                const text = commentText.trim();
                                if (!text) return;
                                onSubmit?.(text);
                                setCommentText('');
                            }}
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
