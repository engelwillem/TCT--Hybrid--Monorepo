"use client";

import { KeyboardEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";

type AutocompleteInputProps<T> = {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (item: T) => void;
  placeholder?: string;
  searchFn: (query: string) => Promise<T[]>;
  getOptionLabel: (item: T) => string;
  renderOption?: (item: T) => ReactNode;
  minChars?: number;
  disabled?: boolean;
  error?: string;
  onManualEdit?: () => void;
};

export function AutocompleteInput<T>({
  value,
  onChange,
  onSelect,
  placeholder,
  searchFn,
  getOptionLabel,
  renderOption,
  minChars = 2,
  disabled,
  error,
  onManualEdit,
}: AutocompleteInputProps<T>) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<T[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const shouldSearch = value.trim().length >= minChars;

  useEffect(() => {
    if (!shouldSearch || disabled) {
      setItems([]);
      setOpen(false);
      setLoading(false);
      setHasSearched(false);
      setActiveIndex(-1);
      return;
    }

    let alive = true;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const results = await searchFn(value.trim());
        if (!alive) return;
        setItems(results);
        setOpen(true);
        setHasSearched(true);
        setActiveIndex(results.length > 0 ? 0 : -1);
      } catch {
        if (!alive) return;
        setItems([]);
        setOpen(false);
        setHasSearched(false);
      } finally {
        if (alive) setLoading(false);
      }
    }, 300);

    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [disabled, searchFn, shouldSearch, value]);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const emptyState = useMemo(() => {
    return hasSearched && !loading && items.length === 0 && shouldSearch;
  }, [hasSearched, items.length, loading, shouldSearch]);

  const pick = (item: T) => {
    onChange(getOptionLabel(item));
    onSelect?.(item);
    setOpen(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!open || items.length === 0) {
      if (e.key === "Escape") setOpen(false);
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1 >= items.length ? 0 : prev + 1));
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 < 0 ? items.length - 1 : prev - 1));
      return;
    }

    if (e.key === "Enter" && activeIndex >= 0 && activeIndex < items.length) {
      e.preventDefault();
      pick(items[activeIndex]);
      return;
    }

    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div className="stack autocomplete-box" ref={boxRef}>
      <div style={{ position: "relative" }}>
        <input
          className="input"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => {
            onChange(e.target.value);
            onManualEdit?.();
            if (!open && e.target.value.trim().length >= minChars) setOpen(true);
          }}
          onFocus={() => {
            if (items.length > 0) setOpen(true);
          }}
          onKeyDown={onKeyDown}
          autoComplete="off"
        />
        {loading ? <span className="autocomplete-loading">Searching...</span> : null}
      </div>

      {open && (items.length > 0 || emptyState) ? (
        <div className="autocomplete-panel">
          {items.map((item, index) => (
            <button
              key={index}
              type="button"
              className={`autocomplete-option${index === activeIndex ? " active" : ""}`}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => pick(item)}
            >
              {renderOption ? renderOption(item) : getOptionLabel(item)}
            </button>
          ))}
          {emptyState ? (
            <div className="autocomplete-empty">No matching data found. Continue typing manually.</div>
          ) : null}
        </div>
      ) : null}

      {error ? <div className="error">{error}</div> : null}
    </div>
  );
}
