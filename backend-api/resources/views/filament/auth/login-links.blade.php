@php
    $forgotUrl = filament()->getRequestPasswordResetUrl();
@endphp

<div class="tct-auth-links-row">
    {{-- 
    @if (Route::has('register'))
        <a
            href="{{ route('register') }}"
            class="tct-auth-link"
        >
            Buat akun
        </a>
    @endif
    --}}

    @if ($forgotUrl)
        <a
            href="{{ $forgotUrl }}"
            class="tct-auth-link"
        >
            Lupa password?
        </a>
    @endif
</div>
