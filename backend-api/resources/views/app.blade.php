<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    @php
        $appName = config('app.name', 'TheChosenTalks');
        $tagline = config('ui.tagline', 'The Chosen People');
        $defaultTitle = $appName . ' - ' . $tagline;
        $defaultDescription = 'Komunitas web app untuk Chosen People: ayat harian, komunitas iman, dan perjalanan rohani bertumbuh bersama.';
        $favicon = '/brand/favicon-premium.svg';
        $defaultOgImage = \App\Support\AppSettings::get('site.og_image_url', url('/og/versehub-bg.png'));
        $path = '/' . trim(request()->path(), '/');
        if ($path === '//') {
            $path = '/';
        }

        $ogTitle = $defaultTitle;
        $ogDescription = $defaultDescription;
        $ogImage = $defaultOgImage;

        if ($path === '/') {
            $ogTitle = "{$appName} - {$tagline}";
            $ogDescription = 'Selamat datang di TheChosenTalks, komunitas chosen people untuk ngobrol iman, bertumbuh, dan saling menguatkan.';
            $ogImage = \App\Support\AppSettings::get('site.og_home_image_url', $defaultOgImage);
        } elseif ($path === '/today') {
            $ogTitle = "Today — {$appName}";
            $ogDescription = 'Daily verse, refleksi, dan update komunitas hari ini. Mulai hari dengan firman dan percakapan yang menguatkan.';
            $ogImage = \App\Support\AppSettings::get('site.og_today_image_url', $defaultOgImage);
        } elseif ($path === '/community') {
            $ogTitle = "Community — {$appName}";
            $ogDescription = 'Lihat cerita, kesaksian, dan percakapan chosen people. Bangun iman bersama komunitas yang hidup.';
            $ogImage = \App\Support\AppSettings::get('site.og_community_image_url', $defaultOgImage);
        } elseif (str_starts_with($path, '/channels')) {
            $segments = array_values(array_filter(explode('/', trim($path, '/'))));
            $channelSlug = $segments[1] ?? null;

            if ($channelSlug === 'sabbath-school') {
                $ogTitle = "Sabbath School - {$appName}";
                $ogDescription = 'Pelajaran Sabbath School yang terstruktur, relevan, dan mudah diikuti setiap hari.';
                $ogImage = \App\Support\AppSettings::get('site.og_channels_sabbath_image_url', $defaultOgImage);
            } elseif ($channelSlug === 'god-first') {
                $ogTitle = "God First - {$appName}";
                $ogDescription = 'Memprioritaskan Tuhan dalam keputusan, pekerjaan, dan relasi sehari-hari.';
                $ogImage = \App\Support\AppSettings::get('site.og_channels_god_first_image_url', $defaultOgImage);
            } elseif ($channelSlug === 'faith-journey') {
                $ogTitle = "Faith Journey - {$appName}";
                $ogDescription = 'Perjalanan iman yang jujur: bertumbuh, pulih, dan tetap berjalan bersama Tuhan.';
                $ogImage = \App\Support\AppSettings::get('site.og_channels_faith_journey_image_url', $defaultOgImage);
            } elseif ($channelSlug === 'family') {
                $ogTitle = "Family - {$appName}";
                $ogDescription = 'Bangun keluarga yang sehat secara rohani, emosional, dan sosial dalam kasih Kristus.';
                $ogImage = \App\Support\AppSettings::get('site.og_channels_family_image_url', $defaultOgImage);
            } else {
                $ogTitle = "Channels - {$appName}";
                $ogDescription = 'Eksplor channel pembinaan iman: Sabbath School, Faith Journey, Family, dan God First.';
                $ogImage = \App\Support\AppSettings::get('site.og_channels_image_url', $defaultOgImage);
            }
        } elseif ($path === '/profile') {
            $ogTitle = "Profile — {$appName}";
            $ogDescription = 'Kelola profil, perjalanan rohani, dan pengaturan akun Anda di TheChosenTalks.';
            $ogImage = \App\Support\AppSettings::get('site.og_profile_image_url', $defaultOgImage);
        } elseif ($path === '/inbox') {
            $ogTitle = "Inbox — {$appName}";
            $ogDescription = 'Terhubung lewat percakapan pribadi dengan komunitas chosen people.';
            $ogImage = \App\Support\AppSettings::get('site.og_inbox_image_url', $defaultOgImage);
        }
    @endphp

    <meta name="app-name" content="{{ $appName }}">
    <link rel="icon" type="image/svg+xml" href="{{ $favicon }}">
    <link rel="shortcut icon" href="{{ $favicon }}">
    <link rel="apple-touch-icon" href="{{ $favicon }}">
    <meta name="theme-color" content="#0f172a">

    <!-- Primary Meta Tags -->
    <title inertia>{{ $ogTitle }}</title>
    <meta name="title" content="{{ $ogTitle }}">
    <meta name="description" content="{{ $ogDescription }}">

    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="{{ $appName }}">
    <meta property="og:locale" content="id_ID">
    <meta property="og:url" content="{{ url()->current() }}">
    <meta property="og:title" content="{{ $ogTitle }}">
    <meta property="og:description" content="{{ $ogDescription }}">
    <meta property="og:image" content="{{ $ogImage }}">
    <meta property="og:image:secure_url" content="{{ $ogImage }}">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="{{ $ogTitle }}">

    <!-- WhatsApp specific optimizations -->
    <meta property="og:image:width" content="300">
    <meta property="og:image:height" content="300">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $ogTitle }}">
    <meta name="twitter:description" content="{{ $ogDescription }}">
    <meta name="twitter:image" content="{{ $ogImage }}">

    <!-- Fonts (Inter is closer to the reference UI) -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=inter:400,500,600,700|dm-serif-display:400&display=swap"
        rel="stylesheet" />

    <!-- Scripts -->
    @routes
    @php
        $hasViteHot = file_exists(public_path('hot'));
        $hasViteManifest = file_exists(public_path('build/manifest.json'));
    @endphp
    @if ($hasViteHot)
        @viteReactRefresh
    @endif
    {{--
    Inertia pages are resolved via dynamic imports in `resources/js/app.tsx`.
    Including the page component as a separate Vite entry will break the
    production manifest lookup (ViteException: Unable to locate file...).
    --}}
    @if ($hasViteHot || $hasViteManifest)
        @vite(['resources/js/app.tsx'])
    @endif
    @inertiaHead

    <!-- Runtime UI tokens (so per-client branding can be changed via .env/config cache) -->
    <style>
        :root {
            --brand:
                {{ e(config('ui.brand_hsl')) }}
            ;
            --brand-foreground:
                {{ e(config('ui.brand_foreground_hsl')) }}
            ;
        }
    </style>
</head>

<body class="font-sans antialiased text-[15px] leading-[1.6] md:text-[16px]">
    @if (!($hasViteHot || $hasViteManifest))
        <div
            style="max-width:720px;margin:40px auto;padding:16px;border:1px solid #e5e7eb;border-radius:12px;background:#fff;color:#111827;font-family:Inter,system-ui,sans-serif;">
            <p style="margin:0 0 8px;font-weight:600;">Asset front-end belum tersedia.</p>
            <p style="margin:0;color:#4b5563;font-size:14px;">Jalankan <code>npm run build</code> atau
                <code>npm run dev</code> lalu reload halaman.
            </p>
        </div>
    @endif
    @inertia
</body>

</html>