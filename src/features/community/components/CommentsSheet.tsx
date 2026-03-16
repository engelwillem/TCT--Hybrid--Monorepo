"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CommunityComment } from "../types";
import { CommunityService } from "@/services/community.service";
import { Send, Loader2, X, Reply, AlertTriangle } from "lucide-react";

interface CommentsSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string | null;
  onCommentsUpdated?: (postId: string, count: number) => void;
}

export function CommentsSheet({ isOpen, onOpenChange, postId, onCommentsUpdated }: CommentsSheetProps) {
  const [comments, setComments] = useState<CommunityComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const fetchComments = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const fetched = await CommunityService.getComments(id);
      setComments(fetched);
    } catch (e) {
      console.error(e);
      showToast("Gagal memuat komentar", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isOpen && postId) {
      setComments([]);
      fetchComments(postId);
    } else {
      setReplyTo(null);
      setNewComment("");
    }
  }, [isOpen, postId, fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !postId || isSubmitting) return;

    setIsSubmitting(true);
    const content = newComment.trim();
    
    try {
      const added = await CommunityService.createComment(postId, content, replyTo?.id);
      
      setComments((prev) => {
        const updated = [...prev, added];
        onCommentsUpdated?.(postId, updated.length);
        return updated;
      });
      
      setNewComment("");
      setReplyTo(null);
    } catch (e: any) {
      console.error(e);
      showToast(e.message || "Gagal mengirim komentar", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReplyClick = (commentId: string, authorName: string) => {
    setReplyTo({ id: commentId, name: authorName });
    inputRef.current?.focus();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-[32px] p-0 sm:max-w-md mx-auto outline-none border-none bg-surface/95 backdrop-blur-xl shadow-2xl flex flex-col">
        <div className="w-12 h-1.5 bg-border/60 rounded-full mx-auto my-3 shrink-0" />
        <SheetHeader className="px-6 pb-2 shrink-0">
          <SheetTitle className="text-xl font-black text-brand tracking-tight">
            Komentar {comments.length > 0 ? `(${comments.length})` : ""}
          </SheetTitle>
        </SheetHeader>
        
        <ScrollArea className="flex-1 p-6 pt-2 h-full">
          <div className="space-y-6 pb-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="animate-spin mb-4 text-brand" size={32} />
                <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Memuat...</p>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <p className="text-[14px] font-bold text-muted-foreground">Belum ada komentar.</p>
                <p className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/60">
                  Mulai diskusi
                </p>
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3 group animate-in slide-in-from-bottom-2 fade-in">
                  <Avatar className="w-9 h-9 shrink-0 ring-1 ring-border/50">
                    <AvatarImage src={comment.author.avatarUrl} />
                    <AvatarFallback className="bg-brand/10 text-brand text-xs font-black uppercase">
                      {comment.author.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 w-full">
                    <div className="bg-surface-muted rounded-[20px] rounded-tl-sm px-4 py-3 ring-1 ring-border/40 shadow-sm">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-[12px] font-black text-brand line-clamp-1">{comment.author.name}</p>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground shrink-0">{comment.createdAt}</p>
                      </div>
                      
                      {comment.replyToAuthor && (
                        <div className="mb-1.5 pl-2 border-l-2 border-brand/30">
                          <p className="text-[10px] text-muted-foreground font-bold italic">
                            Membalas <span className="text-foreground/80">{comment.replyToAuthor}</span>
                          </p>
                        </div>
                      )}
                      
                      <p className="text-[14px] font-medium leading-relaxed text-foreground/90">{comment.text}</p>
                    </div>
                    
                    <button 
                      type="button"
                      onClick={() => handleReplyClick(comment.id, comment.author.name)}
                      className="ml-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-brand transition-colors flex items-center gap-1 opacity-0 group-hover:opacity-100"
                    >
                      <Reply size={10} /> Balas
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-lg pb-safe shrink-0">
          {replyTo && (
            <div className="flex items-center justify-between bg-brand/5 px-4 py-2 rounded-t-xl text-[11px] font-bold text-brand animate-in fade-in slide-in-from-bottom-2 -mb-2 z-0 relative pb-4">
              <span className="flex items-center gap-1"><Reply size={12} /> Membalas {replyTo.name}</span>
              <button type="button" onClick={() => setReplyTo(null)} className="hover:text-foreground">
                <X size={14} />
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex gap-2 relative z-10 w-full mb-4">
            <Input 
              ref={inputRef}
              placeholder="Tulis komentar..." 
              className="rounded-full bg-surface shadow-inner border border-border/60 h-12 px-5 focus-visible:ring-brand"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isSubmitting}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="rounded-full h-12 w-12 shrink-0 bg-brand hover:bg-brand/90 hover:scale-105 transition-all shadow-md active:scale-95 text-white" 
              disabled={!newComment.trim() || isSubmitting}
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </Button>
          </form>
        </div>
        {toast && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-red-600/95 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white shadow-xl backdrop-blur-md animate-in slide-in-from-top-4 fade-in">
            <AlertTriangle size={14} />
            {toast.message}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
