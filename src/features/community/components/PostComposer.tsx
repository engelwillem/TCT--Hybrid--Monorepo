"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ImagePlus, MessageSquare, Hand, Sparkles, Send, X } from "lucide-react";
import { CommunityUser } from "../types";

type PostType = "user_post" | "prayer_request" | "reflection" | "testimony";

interface PostComposerProps {
  onPost: (text: string, type: PostType, images?: File[]) => void;
  currentUser?: CommunityUser;
  className?: string;
  channels?: Array<{ id: string; slug: string; title: string }>;
}

export function PostComposer({
  onPost,
  currentUser,
  className,
  channels = [],
}: PostComposerProps) {
  const [text, setText] = useState("");
  const [type, setType] = useState<PostType>("user_post");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [layoutVariant, setLayoutVariant] = useState<"standard" | "twitter" | "quote">("standard");

  useEffect(() => {
    const next: Record<string, string> = {};
    images.forEach((file) => {
      const key = `${file.name}-${file.size}-${file.lastModified}`;
      next[key] = URL.createObjectURL(file);
    });
    setPreviewUrls(next);

    return () => {
      Object.values(next).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  const types: { value: PostType; label: string; icon: any; color: string }[] = [
    { value: "reflection", label: "Refleksi", icon: Sparkles, color: "text-amber-500 bg-amber-50" },
    { value: "prayer_request", label: "Permohonan Doa", icon: Hand, color: "text-rose-500 bg-rose-50" },
    { value: "testimony", label: "Kesaksian", icon: MessageSquare, color: "text-emerald-500 bg-emerald-50" },
    { value: "user_post", label: "Pikiran", icon: MessageSquare, color: "text-sky-400 bg-sky-400/5" },
  ];

  const handleSubmit = () => {
    if (!text.trim() && images.length === 0) return;
    setIsSubmitting(true);
    onPost(text, type, images);
    setText("");
    setImages([]);
    setIsExpanded(false);
    setIsSubmitting(false);
  };

  const removeImage = (targetKey: string) => {
    setImages((prev) =>
      prev.filter((file) => `${file.name}-${file.size}-${file.lastModified}` !== targetKey)
    );
  };

  const hasImages = Object.keys(previewUrls).length > 0;
  const initials = (currentUser?.name?.[0] || "Saya").toUpperCase();

  return (
    <Card
      className={cn(
        "rounded-[32px] bg-white/70 dark:bg-slate-900/70 shadow-2xl backdrop-blur-3xl border border-white/40 dark:border-white/5 overflow-hidden transition-all duration-500",
        isExpanded ? "ring-2 ring-sky-400/10 shadow-premium" : "",
        className
      )}
    >
      <CardContent className="p-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-5 px-6 pt-8 pb-3">
            <div className="relative group">
              <div className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-sky-400 via-cyan-400 to-emerald-400 opacity-30 blur-md transition duration-500 group-hover:opacity-60" />
              <div className="relative h-14 w-14 shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shadow-inner border border-white/30">
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt={currentUser.name} className="h-full w-full object-cover" />
                ) : (
                  <>
                    <div className="bg-gradient-to-br from-sky-400/20 to-sky-400/40 absolute inset-0" />
                    <div className="relative text-sky-400 text-[13px] font-black tracking-[0.15em] uppercase select-none">
                      {initials}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-[22px] font-black tracking-tight leading-loose bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-sky-400 to-slate-900 dark:from-white dark:via-sky-400 dark:to-white">
                  Berbagi Berkat
                </h2>
                <div className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse shadow-[0_0_10px_rgba(56,189,248,1)]" />
              </div>
              <p className="text-[14px] text-slate-500 dark:text-slate-400 font-bold mt-0.5 opacity-70 tracking-tight">
                Bagikan terang yang Anda terima hari ini
              </p>
            </div>
            <Sparkles className="h-6 w-6 text-sky-400/20 animate-pulse" />
          </div>

          <div className="px-6">
            <textarea
              className={cn(
                "w-full bg-transparent border-none focus:ring-0 px-0 py-4 leading-relaxed text-slate-700 dark:text-slate-200 placeholder:text-slate-300 dark:placeholder:text-slate-600 resize-none transition-all duration-500 outline-none",
                layoutVariant === "twitter" ? "text-[22px] font-black italic md:text-[24px]" : "text-[17px] font-medium"
              )}
              placeholder={layoutVariant === "quote" ? "Tulis ayat atau kutipan..." : "Apa yang Tuhan taruh di hati Anda?"}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              rows={isExpanded ? 4 : 1}
            />
          </div>

          {hasImages && (
            <div className="px-6 pb-4 flex flex-col gap-3">
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {Object.entries(previewUrls).map(([key, url]) => (
                  <div
                    key={key}
                    className={cn(
                      "relative shrink-0 overflow-hidden rounded-2xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 transition-all duration-300 w-32 aspect-[4/5]"
                    )}
                  >
                    <img src={url} alt="preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md shadow-md hover:bg-black/80 transition-colors"
                      onClick={() => removeImage(key)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isExpanded && (
            <div className="flex flex-col border-t border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/40 backdrop-blur-xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4">
              {!hasImages && (
                <div className="flex items-center gap-2 px-6 py-3 border-b border-black/5 dark:border-white/5">
                  <button
                    onClick={() => setLayoutVariant("standard")}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                      layoutVariant === "standard"
                        ? "bg-sky-400 text-white shadow-md"
                        : "bg-white dark:bg-slate-800 text-slate-400"
                    )}
                  >
                    Standard
                  </button>
                  <button
                    onClick={() => setLayoutVariant("twitter")}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                      layoutVariant === "twitter"
                        ? "bg-sky-400/10 text-sky-400 ring-1 ring-sky-400/20"
                        : "bg-white dark:bg-slate-800 text-slate-400"
                    )}
                  >
                    Twitter Style
                  </button>
                  <button
                    onClick={() => {
                      setLayoutVariant("quote");
                      setType("reflection");
                    }}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                      layoutVariant === "quote"
                        ? "bg-sky-400/10 text-sky-400 ring-1 ring-sky-400/20"
                        : "bg-white dark:bg-slate-800 text-slate-400"
                    )}
                  >
                    Classy Quote
                  </button>
                </div>
              )}

              <div className="relative group flex items-center px-4 py-4 border-b border-black/5 dark:border-white/5 overflow-hidden">
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-2">
                  {types.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => setType(t.value)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-full text-[12px] font-bold transition-all whitespace-nowrap shrink-0 tct-pressable shadow-sm border border-transparent",
                        type === t.value
                          ? "bg-sky-400 text-white ring-2 ring-sky-400/20 ring-offset-2 dark:ring-offset-slate-900 shadow-lg scale-105"
                          : "text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border-black/5 dark:border-white/5"
                      )}
                    >
                      <t.icon size={14} className="opacity-100" />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4">
                <div className="flex items-center gap-3">
                  <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-2xl bg-white px-4 text-[12px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-[0_4px_12px_rgba(0,0,0,0.05)] hover:scale-105 transition-transform active:scale-95">
                    <ImagePlus className="h-5 w-5 text-sky-400" />
                    <span>Media</span>
                    <input
                      type="file"
                      multiple
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files ?? []);
                        if (!files.length) return;
                        setIsExpanded(true);
                        setImages((prev) => [...prev, ...files].slice(0, 10));
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full px-5 h-11 font-bold text-slate-500"
                    onClick={() => setIsExpanded(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-2xl px-8 h-11 font-bold bg-sky-400 text-white shadow-[0_8px_20px_rgba(56,189,248,0.3)] hover:scale-[1.05] active:scale-[0.95] transition-all"
                    onClick={handleSubmit}
                    disabled={(!text.trim() && images.length === 0) || isSubmitting}
                  >
                    {isSubmitting ? "..." : (
                      <div className="flex items-center gap-2">
                        <span>Bagikan</span>
                        <Send size={15} />
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
