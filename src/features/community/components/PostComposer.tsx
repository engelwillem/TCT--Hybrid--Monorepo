"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ImagePlus, MessageSquare, Hand, X } from "lucide-react";
import { CommunityUser } from "../types";
import { ActionBarButton } from "@/components/actions/ActionBarButton";

type PostType = "user_post" | "prayer_request" | "reflection" | "testimony";

interface PostComposerProps {
  onPost: (text: string, type: PostType, images?: File[]) => Promise<boolean | void> | boolean | void;
  currentUser?: CommunityUser;
  className?: string;
  channels?: Array<{ id: string; slug: string; title: string }>;
  initialText?: string;
  initialType?: PostType;
  initialExpanded?: boolean;
}

export function PostComposer({
  onPost,
  currentUser,
  className,
  channels = [],
  initialText = "",
  initialType = "user_post",
  initialExpanded = false,
}: PostComposerProps) {
  const [text, setText] = useState(initialText);
  const [type, setType] = useState<PostType>(initialType);
  const [isExpanded, setIsExpanded] = useState(initialExpanded);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const types: { value: PostType; label: string }[] = [
    { value: "reflection", label: "Refleksi" },
    { value: "prayer_request", label: "Permohonan Doa" },
    { value: "testimony", label: "Kesaksian" },
    { value: "user_post", label: "Curahan Hati" },
  ];

  const handleSubmit = async () => {
    if (!text.trim() && images.length === 0) return;
    try {
      setIsSubmitting(true);
      const result = await onPost(text, type, images);
      const shouldReset = result !== false;
      if (shouldReset) {
        setText("");
        setImages([]);
        setIsExpanded(false);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = (targetKey: string) => {
    setImages((prev) =>
      prev.filter((file) => `${file.name}-${file.size}-${file.lastModified}` !== targetKey)
    );
  };

  const hasImages = Object.keys(previewUrls).length > 0;

  const handlePickImages = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (fileList: FileList | null) => {
    const files = Array.from(fileList ?? []);
    if (!files.length) return;
    setImages((prev) => [...prev, ...files].slice(0, 10));
  };

  return (
    <Card
      className={cn(
        "rounded-[32px] bg-surface/80 shadow-premium backdrop-blur-3xl border border-border/60 overflow-hidden transition-all duration-500",
        isExpanded ? "ring-2 ring-brand/20 shadow-premium" : "",
        className
      )}
    >
      <CardContent className="p-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-5 px-6 pt-8 pb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="tct-serif text-[22px] tracking-tight leading-tight text-foreground/90">
                  Ruang Berbagi
                </h2>
              </div>
              <p className="mt-1 text-[13px] font-medium tracking-wide text-foreground/50">
                Apa yang Tuhan taruh di hati Anda?
              </p>
            </div>
          </div>

          <div className="px-6">
            <textarea
              className="w-full bg-transparent border-none focus:ring-0 px-0 py-2 leading-relaxed text-[16px] font-medium text-foreground placeholder:text-foreground/30 resize-none transition-all duration-500 outline-none"
              placeholder="Mulai menulis..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setIsExpanded(true)}
              rows={isExpanded ? 4 : 1}
            />
          </div>

          {hasImages && (
            <div className="px-6 pb-4 flex flex-col gap-3">
              <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide">
                {Object.entries(previewUrls).map(([key, url]) => (
                  <div
                    key={key}
                    className={cn(
                      "relative shrink-0 snap-start overflow-hidden rounded-2xl ring-1 ring-border/60 bg-surface-muted transition-all duration-300 w-32 aspect-[4/5]"
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
            <div className="flex flex-col animate-in fade-in duration-500">
              <div className="px-6 py-4">
                
                {/* Left: Quiet Secondary Options */}
                <div className="flex items-center gap-2 sm:gap-3 mb-3">
                  <div className="relative">
                    <select 
                      value={type} 
                      onChange={(e) => setType(e.target.value as PostType)}
                      className="appearance-none bg-transparent hover:bg-surface-muted text-[13px] font-medium text-foreground/60 rounded-full pl-2 pr-7 py-1.5 outline-none focus:ring-2 focus:ring-foreground/10 transition-all cursor-pointer"
                    >
                      {types.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-foreground/40">
                      <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>

                </div>

                <div className="w-full rounded-[22px] bg-background/86 p-2 ring-1 ring-border/60 backdrop-blur-xl flex items-center gap-2">
                  <ActionBarButton
                    icon={ImagePlus}
                    label="Upload"
                    variant="secondary"
                    onClick={handlePickImages}
                    type="button"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      handleFilesSelected(e.target.files);
                      e.currentTarget.value = "";
                    }}
                  />
                  <ActionBarButton
                    label="Batal"
                    variant="ghost"
                    className="ml-auto"
                    onClick={() => {
                      setIsExpanded(false);
                      setText("");
                      setImages([]);
                    }}
                  />
                  <ActionBarButton
                    label={isSubmitting ? "..." : "Bagikan"}
                    variant="primary"
                    onClick={handleSubmit}
                    disabled={(!text.trim() && images.length === 0) || isSubmitting}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
