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
  return (
    <div className="px-6 pb-5">
      <div className="rounded-[24px] border border-white/80 bg-white/80 px-4 py-3.5 shadow-[0_16px_42px_-34px_rgba(15,23,42,0.36)]">
        <textarea
          className="min-h-[124px] w-full resize-none border-none bg-transparent px-0 py-1 text-[16px] font-medium leading-8 tracking-[0.01em] text-foreground placeholder:text-foreground/30 outline-none focus:ring-0"
          placeholder={placeholder}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          onFocus={onFocus}
          rows={isExpanded ? 6 : 4}
        />
        {helperText ? (
          <p className="mt-2 text-[12px] font-medium leading-relaxed text-foreground/45">{helperText}</p>
        ) : null}
      </div>
    </div>
  );
}
