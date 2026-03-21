<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Today V2 Content Source (File-based Bridge Before CMS)
    |--------------------------------------------------------------------------
    |
    | Content is selected by date key from a local file directory:
    |   content/today-v2/{YYYY-MM-DD}.php
    |
    | If the dated file does not exist, it falls back to:
    |   content/today-v2/default.php
    |
    | TODAY_V2_CONTENT_DATE is optional for local QA forcing a specific date.
    |
    | Query preview (`?previewDate=YYYY-MM-DD`) is allowed by default only in
    | local/testing runtime. Set TODAY_V2_ALLOW_PREVIEW_QUERY=true only if you
    | explicitly need this behavior in a non-local environment.
    |
    */
    'content_path' => env('TODAY_V2_CONTENT_PATH', 'content/today-v2'),
    'timezone' => env('TODAY_V2_CONTENT_TIMEZONE', 'Asia/Jakarta'),
    'default_file' => env('TODAY_V2_CONTENT_DEFAULT_FILE', 'default.php'),
    'date_override' => env('TODAY_V2_CONTENT_DATE'),
    'allow_preview_query' => env('TODAY_V2_ALLOW_PREVIEW_QUERY', false),
];
