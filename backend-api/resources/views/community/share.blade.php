<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{{ $title }}</title>
    <link rel="canonical" href="{{ $share_url }}" />

    <meta name="description" content="{{ $description }}" />

    <meta property="og:type" content="article" />
    <meta property="og:site_name" content="{{ config('app.name', 'TheChosenTalks') }}" />
    <meta property="og:locale" content="id_ID" />
    <meta property="og:url" content="{{ $share_url }}" />
    <meta property="og:title" content="{{ $title }}" />
    <meta property="og:description" content="{{ $description }}" />
    <meta property="og:image" content="{{ $image_url }}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="{{ $title }}" />
    <meta name="twitter:description" content="{{ $description }}" />
    <meta name="twitter:image" content="{{ $image_url }}" />
</head>
<body style="font-family: Inter, system-ui, sans-serif; margin: 0; padding: 24px; background: #0f172a; color: #f8fafc;">
    <main style="max-width: 720px; margin: 0 auto;">
        <h1 style="font-size: 20px; margin: 0 0 10px;">{{ $title }}</h1>
        <p style="line-height: 1.6; opacity: .9; margin: 0 0 16px;">{{ $description }}</p>
        <a
            href="{{ $open_url }}"
            style="display: inline-block; padding: 10px 14px; border-radius: 999px; background: #111827; color: #ffffff; text-decoration: none; font-weight: 600;"
        >
            Buka Community
        </a>
    </main>
</body>
</html>
