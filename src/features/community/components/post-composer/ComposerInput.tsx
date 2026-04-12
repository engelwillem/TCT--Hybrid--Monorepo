import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type ComposerInputProps = {
  value: string;
  isExpanded: boolean;
  placeholder?: string;
  helperText?: string;
  disabled?: boolean;
  onFocus: () => void;
  onChange: (value: string) => void;
};

export function ComposerInput({
  value,
  isExpanded,
  placeholder = "Mulai menulis...",
  helperText,
  disabled = false,
  onFocus,
  onChange,
}: ComposerInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.max(textarea.scrollHeight, isExpanded ? 160 : 80)}px`;
    }
  }, [value, isExpanded]);

  return (
    <div className="relative px-6">
      <textarea
        ref={textareaRef}
        className={cn(
          "w-full resize-none bg-transparent py-4 text-[17px] font-medium leading-[1.65] tracking-[-0.01em] text-foreground outline-none transition-all placeholder:text-foreground/35",
          !isExpanded ? "min-h-[80px]" : "min-h-[160px]"
        )}
        placeholder={placeholder}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
      />
      {helperText ? (
        <p className="pointer-events-none absolute bottom-1 right-6 text-[11px] font-bold tracking-wide text-foreground/25">
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
