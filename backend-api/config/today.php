<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Today Content Source (File-based Bridge Before CMS)
    |--------------------------------------------------------------------------
    |
    | Content is selected by date key from a local file directory:
    |   content/today/{YYYY-MM-DD}.php
    |
    | If the dated file does not exist, it falls back to:
    |   content/today/default.php
    |
    | TODAY_CONTENT_DATE is optional for local QA forcing a specific date.
    |
    | Query preview (`?previewDate=YYYY-MM-DD`) is allowed by default only in
    | local/testing runtime. Set TODAY_ALLOW_PREVIEW_QUERY=true only if you
    | explicitly need this behavior in a non-local environment.
    |
    */
    'content_path' => env('TODAY_CONTENT_PATH', 'content/today'),
    'timezone' => env('TODAY_CONTENT_TIMEZONE', 'Asia/Jakarta'),
    'default_file' => env('TODAY_CONTENT_DEFAULT_FILE', 'default.php'),
    'date_override' => env('TODAY_CONTENT_DATE'),
    'allow_preview_query' => env('TODAY_ALLOW_PREVIEW_QUERY', false),
];

