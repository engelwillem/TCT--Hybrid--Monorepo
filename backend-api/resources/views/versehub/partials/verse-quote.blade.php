{{-- Shared verse quote block (used by verse detail page + VerseHub card) --}}
<blockquote class="relative">
    <!-- left quote rail -->
    <div class="absolute left-0 top-1 bottom-1 w-px bg-border/60" aria-hidden></div>

    <!-- quote mark -->
    <div class="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 text-muted-foreground/60" aria-hidden>
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 11H6V7a4 4 0 0 1 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            <path d="M18 11h-4V7a4 4 0 0 1 4-4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            <path d="M10 11v6H6v-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M18 11v6h-4v-6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    </div>

    <div class="pl-6 pr-1">
        <div class="text-[16px] leading-7 tracking-[-0.01em] md:text-[18px] md:leading-8">
            {!! nl2br(e(trim((string) $text))) !!}
        </div>
    </div>
</blockquote>
